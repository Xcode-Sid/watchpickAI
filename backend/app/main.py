from fastapi import FastAPI, HTTPException, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
import asyncio

from app.core.config import settings
from app.core.exceptions import generic_exception_handler, http_exception_handler
from app.core.logging_config import setup_logging
from app.core.middleware import (
    RequestLoggingMiddleware,
    RequestSizeLimitMiddleware,
    SecurityHeadersMiddleware,
)
from app.routers import admin, auth, health, payments, picks, pricing, quiz, users

# Rate limiter (in-memory; swap to Redis for multi-process)
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit_default])


def create_app() -> FastAPI:
    setup_logging(debug=settings.debug)

    application = FastAPI(
        title="WatchPick API",
        version="1.0.0",
        description="FastAPI backend for WatchPick — Stripe payments, AI watch picks with fallback, Supabase integration.",
        docs_url="/docs",
        redoc_url="/redoc",
        debug=settings.debug,
    )

    # Rate limiter
    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Middleware (order matters — first added = outermost)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.add_middleware(SecurityHeadersMiddleware)
    application.add_middleware(RequestSizeLimitMiddleware)
    application.add_middleware(RequestLoggingMiddleware)

    # Exception handlers
    application.add_exception_handler(HTTPException, http_exception_handler)  # type: ignore
    application.add_exception_handler(Exception, generic_exception_handler)

    # Root → Swagger
    @application.get("/", include_in_schema=False)
    def root():
        return RedirectResponse(url="/docs")

    # v1 routes
    application.include_router(health.router,    prefix="/api/v1",          tags=["Health"])
    application.include_router(auth.router,     prefix="/api/v1/auth",      tags=["Auth"])
    application.include_router(users.router,     prefix="/api/v1/users",    tags=["Users"])
    application.include_router(picks.router,     prefix="/api/v1/picks",    tags=["Picks"])
    application.include_router(payments.router,  prefix="/api/v1/payments", tags=["Payments"])
    application.include_router(admin.router,     prefix="/api/v1/admin",    tags=["Admin"])
    application.include_router(pricing.router,   prefix="/api/v1/pricing",  tags=["Pricing"])
    application.include_router(quiz.router,       prefix="/api/v1/quiz",     tags=["Quiz"])

    # Backward-compat: /api/* still works (points to same routers)
    application.include_router(health.router,    prefix="/api", include_in_schema=False)
    application.include_router(auth.router,      prefix="/api/auth", include_in_schema=False)
    application.include_router(users.router,     prefix="/api/users", include_in_schema=False)
    application.include_router(picks.router,     prefix="/api/picks", include_in_schema=False)
    application.include_router(payments.router,  prefix="/api/payments", include_in_schema=False)
    application.include_router(pricing.router,  prefix="/api/pricing", include_in_schema=False)
    application.include_router(quiz.router,    prefix="/api/quiz", include_in_schema=False)

    @application.websocket("/ws/health")
    async def health_ws(websocket: WebSocket):
        """
        Lightweight health websocket.

        Frontend connects once and treats:
        - onclose/onerror as instant offline (clean crash, network error)
        - missing heartbeat for a few seconds as silent failure.
        """
        await websocket.accept()
        try:
            while True:
                await websocket.send_json({"status": "online"})
                await asyncio.sleep(3)
        except Exception:
            # Client disconnected or server shutting down — nothing to do.
            pass

    return application


app = create_app()

from __future__ import annotations

import logging
import time
import uuid

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings

logger = logging.getLogger("watchpick")


# ---------------------------------------------------------------------------
# Request ID + Structured Logging
# ---------------------------------------------------------------------------

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Attach a unique request ID and log every request with timing."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
        request.state.request_id = request_id

        start = time.perf_counter()
        response: Response = await call_next(request)
        elapsed_ms = round((time.perf_counter() - start) * 1000, 1)

        logger.info(
            "request",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration_ms": elapsed_ms,
                "client": request.client.host if request.client else "unknown",
            },
        )

        response.headers["X-Request-ID"] = request_id
        return response


# ---------------------------------------------------------------------------
# Security Headers
# ---------------------------------------------------------------------------

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if not settings.debug:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


# ---------------------------------------------------------------------------
# Request Body Size Limit
# ---------------------------------------------------------------------------

class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Reject requests with bodies larger than configured max."""

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        max_bytes = settings.max_request_body_mb * 1024 * 1024

        if content_length and int(content_length) > max_bytes:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=413,
                content={"success": False, "data": None, "error": f"Request body too large (max {settings.max_request_body_mb}MB)"},
            )

        return await call_next(request)

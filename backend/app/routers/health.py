from fastapi import APIRouter

from app.ai import ai_factory
from app.core.clients import supabase
from app.core.config import settings
from app.core.responses import ok

router = APIRouter()


@router.get("/health")
def health_check():
    """Reports status of every connected service + all AI providers."""
    services = {
        "supabase": _check_supabase(),
        "stripe": _check_stripe(),
    }

    ai_providers = ai_factory.health() if ai_factory.available else []

    all_services_ok = all(s["status"] == "connected" for s in services.values())
    any_ai_ok = any(p["status"] == "connected" for p in ai_providers) if ai_providers else False

    return ok({
        "status": "healthy" if (all_services_ok and any_ai_ok) else "degraded",
        "services": services,
        "ai_providers": ai_providers,
        "ai_fallback_order": [p.name for p in ai_factory.providers],
    })


def _check_supabase() -> dict:
    if not settings.supabase_configured:
        return {"status": "not_configured"}
    try:
        supabase.table("profiles").select("id").limit(1).execute()  # type: ignore
        return {"status": "connected"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


def _check_stripe() -> dict:
    if not settings.stripe_configured:
        return {"status": "not_configured"}
    try:
        import stripe
        stripe.Account.retrieve()
        return {"status": "connected"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

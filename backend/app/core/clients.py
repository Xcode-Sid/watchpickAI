from __future__ import annotations

from typing import TYPE_CHECKING

import stripe

from app.core.config import settings

if TYPE_CHECKING:
    from supabase import Client

# ---------------------------------------------------------------------------
# Stripe
# ---------------------------------------------------------------------------
if settings.stripe_configured:
    stripe.api_key = settings.stripe_secret_key

# ---------------------------------------------------------------------------
# Supabase
# ---------------------------------------------------------------------------
supabase: Client | None = None
if settings.supabase_configured:
    from supabase import create_client
    supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase() -> "Client":
    """Return the Supabase client or raise if not configured."""
    if supabase is None:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail="Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env",
        )
    return supabase

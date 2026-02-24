"""Public pricing API — no auth required."""

from fastapi import APIRouter, Query

from app.core.responses import ok
from app.services.pricing_service import get_pricing_plans

router = APIRouter()


@router.get("")
def list_pricing(locale: str = Query(default="en", description="Locale for pricing content")):
    """Get all pricing plans with features. Public endpoint."""
    plans = get_pricing_plans(locale=locale)
    return ok({"plans": plans})

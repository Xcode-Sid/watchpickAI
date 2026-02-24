import stripe
from fastapi import HTTPException

from app.core.config import settings
from app.repositories.profile_repository import ProfileRepository


def ensure_stripe_customer(user_id: str, email: str | None) -> str:
    """Get existing Stripe customer or create a new one, store ID in profiles."""
    repo = ProfileRepository()
    profile = repo.get_by_user_id(user_id, fields="stripe_customer_id")
    existing_id = profile.get("stripe_customer_id") if profile else None

    if existing_id:
        return existing_id

    customer = stripe.Customer.create(
        metadata={"supabase_user_id": user_id},
        email=email,
    )
    repo.update_by_user_id(user_id, {"stripe_customer_id": customer.id})
    return customer.id


def create_checkout_session(
    customer_id: str,
    user_id: str,
    plan: str,
) -> str:
    """Create a Stripe Checkout Session and return the URL."""
    from app.services.pricing_service import get_plan_by_plan_type

    db_plan = get_plan_by_plan_type(plan, locale="en")
    stripe_price_id = db_plan.get("stripe_price_id") if db_plan else None

    if plan == "pro":
        price_id = stripe_price_id or settings.stripe_pro_price_id
        mode = "subscription"
    else:
        price_id = stripe_price_id or settings.stripe_lifetime_price_id
        mode = "payment"

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode=mode,
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{settings.frontend_url}/account?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.frontend_url}/pricing",
        metadata={"supabase_user_id": user_id, "plan": plan},
    )

    if not session.url:
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

    return session.url


def create_portal_session(customer_id: str) -> str:
    """Create a Stripe Customer Portal session and return the URL."""
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{settings.frontend_url}/account",
    )
    return session.url


def verify_webhook(payload: bytes, signature: str) -> dict:
    """Verify and construct a Stripe webhook event."""
    try:
        return stripe.Webhook.construct_event(
            payload, signature, settings.stripe_webhook_secret
        )
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

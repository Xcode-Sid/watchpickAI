import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.dependencies import get_current_user_id
from app.core.responses import ok
from app.schemas.payments import CheckoutRequest
from app.services.stripe_service import (
    create_checkout_session,
    create_portal_session,
    ensure_stripe_customer,
    verify_webhook,
)
from app.services.profile_service import ProfileService
from app.services.email_service import send_payment_confirmation

logger = logging.getLogger("watchpick.payments")

router = APIRouter()

# In-memory idempotency cache (use Redis in production at scale)
_processed_events: set[str] = set()
_MAX_CACHE = 10_000


@router.post("/create-checkout")
def create_checkout(body: CheckoutRequest, user_id: str = Depends(get_current_user_id)):
    profile_svc = ProfileService()
    profile = profile_svc.get_profile(user_id, fields="email, stripe_customer_id")
    email = profile.get("email") if profile else None
    customer_id = ensure_stripe_customer(user_id, email)

    url = create_checkout_session(customer_id, user_id, body.plan)
    return ok({"url": url})


@router.post("/portal")
def customer_portal(user_id: str = Depends(get_current_user_id)):
    profile_svc = ProfileService()
    profile = profile_svc.get_profile(user_id, fields="stripe_customer_id")
    customer_id = profile.get("stripe_customer_id") if profile else None

    if not customer_id:
        raise HTTPException(status_code=400, detail="No billing account found. Subscribe to a plan first.")

    url = create_portal_session(customer_id)
    return ok({"url": url})


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")
    event = verify_webhook(payload, signature)

    event_id = event.get("id", "")
    event_type = event["type"]

    # Idempotency: skip already-processed events
    if event_id in _processed_events:
        logger.info("Skipping duplicate webhook event: %s", event_id)
        return ok({"received": True, "duplicate": True})

    if len(_processed_events) > _MAX_CACHE:
        _processed_events.clear()
    _processed_events.add(event_id)

    obj = event["data"]["object"]
    logger.info("Processing webhook: %s (event_id=%s)", event_type, event_id)

    try:
        if event_type == "checkout.session.completed":
            _handle_checkout_completed(obj)

        elif event_type == "customer.subscription.deleted":
            _handle_subscription_deleted(obj)

        elif event_type == "customer.subscription.updated":
            _handle_subscription_updated(obj)

        elif event_type == "invoice.payment_failed":
            _handle_payment_failed(obj)

    except Exception:
        logger.exception("Error processing webhook %s", event_type)
        _processed_events.discard(event_id)
        raise HTTPException(status_code=500, detail="Webhook processing failed")

    return ok({"received": True})


def _handle_checkout_completed(session: dict) -> None:
    user_id = session.get("metadata", {}).get("supabase_user_id")
    plan = session.get("metadata", {}).get("plan")
    customer_email = session.get("customer_details", {}).get("email")

    if user_id and plan in ("pro", "lifetime"):
        ProfileService().update_profile(user_id, {"subscription_status": plan})
        logger.info("Upgraded user %s to %s", user_id, plan)

        if customer_email:
            send_payment_confirmation(customer_email, plan)


def _handle_subscription_deleted(sub: dict) -> None:
    customer_id = sub.get("customer")
    if customer_id:
        ProfileService().update_profile_by_stripe_customer(customer_id, {"subscription_status": "free"})
        logger.info("Downgraded customer %s to free", customer_id)


def _handle_subscription_updated(sub: dict) -> None:
    status = sub.get("status")
    customer_id = sub.get("customer")
    if customer_id and status == "past_due":
        logger.warning("Subscription past_due for customer %s", customer_id)


def _handle_payment_failed(invoice: dict) -> None:
    customer_id = invoice.get("customer")
    logger.warning("Payment failed for customer %s", customer_id)

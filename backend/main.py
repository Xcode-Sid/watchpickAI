from __future__ import annotations

import json
import re
from typing import Optional

import stripe
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from supabase import Client, create_client


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    supabase_url: str
    supabase_service_role_key: str
    stripe_secret_key: str
    stripe_webhook_secret: str
    stripe_pro_price_id: str
    stripe_lifetime_price_id: str
    openai_api_key: str
    frontend_url: str = "http://localhost:8080"


settings = Settings()  # type: ignore[call-arg]

stripe.api_key = settings.stripe_secret_key
openai_client = OpenAI(api_key=settings.openai_api_key)
sb: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="WatchPick API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_user_id(authorization: str | None) -> str:
    """Extract user_id from Supabase JWT via Supabase auth."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid authorization header")
    token = authorization.split(" ", 1)[1]
    user = sb.auth.get_user(token)
    if not user or not user.user:
        raise HTTPException(401, "Invalid token")
    return user.user.id


def _ensure_stripe_customer(user_id: str, email: str | None) -> str:
    """Get or create a Stripe customer for the user, store in profiles."""
    profile = (
        sb.table("profiles")
        .select("stripe_customer_id")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    existing_id = profile.data.get("stripe_customer_id") if profile.data else None
    if existing_id:
        return existing_id

    customer = stripe.Customer.create(
        metadata={"supabase_user_id": user_id},
        email=email,
    )
    sb.table("profiles").update({"stripe_customer_id": customer.id}).eq(
        "user_id", user_id
    ).execute()
    return customer.id


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Picks – generate watch recommendations via OpenAI
# ---------------------------------------------------------------------------

class PickRequest(BaseModel):
    budget: str
    occasion: str
    style: str
    wristSize: str
    gender: str
    brandOpenness: str
    movementType: Optional[str] = "No preference"


@app.post("/api/picks/generate")
def generate_picks(body: PickRequest, authorization: str | None = Header(None)):
    user_id = _get_user_id(authorization)

    system_prompt = (
        "You are an expert watch advisor and horologist. Given a person's preferences, "
        "pick exactly 4 watches as a JSON array. The first 3 are main picks. The 4th is "
        'a "hidden gem" — a lesser-known but excellent alternative.\n\n'
        "Each watch object must have these exact fields:\n"
        '- "name": full model name (e.g. "Seiko Presage SPB167")\n'
        '- "brand": brand name\n'
        '- "price_range": price range string (e.g. "$400–$500")\n'
        '- "case_size": case diameter in mm (e.g. "40.8mm")\n'
        '- "reason": 2 sentences explaining why this watch matches the user\'s preferences\n'
        '- "chrono24_url": "https://www.chrono24.com/search/index.htm?query=" + URL-encoded watch name\n'
        '- "amazon_url": "https://www.amazon.com/s?k=" + URL-encoded watch name\n\n'
        "Return ONLY the JSON array, no markdown, no explanation, no code fences."
    )

    user_message = (
        f"Budget: {body.budget}\n"
        f"Occasion: {body.occasion}\n"
        f"Style preference: {body.style}\n"
        f"Wrist size: {body.wristSize}\n"
        f"Gender preference: {body.gender}\n"
        f"Brand openness: {body.brandOpenness}\n"
        f"Movement type: {body.movementType}"
    )

    try:
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
    except Exception as exc:
        raise HTTPException(502, f"OpenAI error: {exc}")

    content = completion.choices[0].message.content or "[]"
    match = re.search(r"\[[\s\S]*\]", content)
    watches = json.loads(match.group(0)) if match else []

    if not watches:
        raise HTTPException(500, "No picks generated")

    sb.table("picks").insert(
        {"user_id": user_id, "quiz_inputs": body.model_dump(), "results": watches}
    ).execute()

    return {"watches": watches}


# ---------------------------------------------------------------------------
# Payments – Stripe Checkout
# ---------------------------------------------------------------------------

class CheckoutRequest(BaseModel):
    plan: str  # "pro" or "lifetime"


@app.post("/api/payments/create-checkout")
def create_checkout(body: CheckoutRequest, authorization: str | None = Header(None)):
    user_id = _get_user_id(authorization)
    profile = (
        sb.table("profiles").select("email, stripe_customer_id").eq("user_id", user_id).single().execute()
    )
    email = profile.data.get("email") if profile.data else None
    customer_id = _ensure_stripe_customer(user_id, email)

    if body.plan == "pro":
        price_id = settings.stripe_pro_price_id
        mode = "subscription"
    elif body.plan == "lifetime":
        price_id = settings.stripe_lifetime_price_id
        mode = "payment"
    else:
        raise HTTPException(400, "Invalid plan. Must be 'pro' or 'lifetime'.")

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode=mode,
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{settings.frontend_url}/account?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.frontend_url}/pricing",
        metadata={"supabase_user_id": user_id, "plan": body.plan},
    )

    return {"url": session.url}


# ---------------------------------------------------------------------------
# Payments – Stripe Customer Portal
# ---------------------------------------------------------------------------

@app.post("/api/payments/portal")
def create_portal(authorization: str | None = Header(None)):
    user_id = _get_user_id(authorization)
    profile = (
        sb.table("profiles")
        .select("stripe_customer_id, email")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    customer_id = profile.data.get("stripe_customer_id") if profile.data else None
    if not customer_id:
        raise HTTPException(400, "No billing account found. Subscribe to a plan first.")

    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{settings.frontend_url}/account",
    )
    return {"url": session.url}


# ---------------------------------------------------------------------------
# Payments – Stripe Webhook
# ---------------------------------------------------------------------------

@app.post("/api/payments/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig, settings.stripe_webhook_secret
        )
    except stripe.SignatureVerificationError:
        raise HTTPException(400, "Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("metadata", {}).get("supabase_user_id")
        plan = session.get("metadata", {}).get("plan")
        if user_id and plan in ("pro", "lifetime"):
            sb.table("profiles").update({"subscription_status": plan}).eq(
                "user_id", user_id
            ).execute()

    if event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        customer_id = sub.get("customer")
        if customer_id:
            sb.table("profiles").update({"subscription_status": "free"}).eq(
                "stripe_customer_id", customer_id
            ).execute()

    return {"received": True}


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

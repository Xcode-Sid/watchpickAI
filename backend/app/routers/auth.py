from fastapi import APIRouter, HTTPException

from app.core.clients import get_supabase
from app.core.responses import ok
from app.schemas.auth import SignInRequest, SignUpRequest

router = APIRouter()


@router.post("/signup", response_model=None)
def signup(body: SignUpRequest):
    """Sign up with email/password. Returns session tokens for the frontend."""
    sb = get_supabase()
    try:
        resp = sb.auth.sign_up({"email": body.email, "password": body.password})
    except Exception as e:
        msg = str(e)
        if "invalid" in msg.lower():
            msg += " Supabase blocks common test emails like test@gmail.com — try testuser@gmail.com or your real email."
        raise HTTPException(status_code=400, detail=msg)

    if not resp.session:
        # Email confirmation required — user exists but no session yet
        return ok({
            "message": "Check your email for a confirmation link.",
            "user_id": resp.user.id if resp.user else None,
        })

    return ok(_session_to_dict(resp.session, resp.user))


@router.post("/signin", response_model=None)
def signin(body: SignInRequest):
    """Sign in with email/password. Returns session tokens for the frontend."""
    sb = get_supabase()
    try:
        resp = sb.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not resp.session or not resp.user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Block login if email is not confirmed
    email_confirmed_at = getattr(resp.user, "email_confirmed_at", None)
    if not email_confirmed_at:
        raise HTTPException(status_code=403, detail="Email is not activated")

    return ok(_session_to_dict(resp.session, resp.user))


def _session_to_dict(session, user) -> dict:
    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "expires_at": session.expires_at or 0,
        "user": {
            "id": user.id,
            "email": user.email,
        },
    }

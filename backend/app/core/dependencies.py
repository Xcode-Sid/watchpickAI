from fastapi import Header, HTTPException

from app.core.clients import get_supabase
from app.core.config import settings


def get_current_user_id(authorization: str | None = Header(None)) -> str:
    """Extract and verify user_id from Supabase JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.split(" ", 1)[1]
    sb = get_supabase()

    try:
        resp = sb.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not resp or not resp.user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return resp.user.id


def require_admin(x_admin_key: str | None = Header(None)) -> None:
    """Verify the request carries a valid admin API key."""
    if not settings.admin_api_key:
        raise HTTPException(status_code=503, detail="Admin endpoints not configured")
    if x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")

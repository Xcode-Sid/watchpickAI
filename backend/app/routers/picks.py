from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.dependencies import get_current_user_id
from app.core.responses import ok
from app.schemas.picks import PickRequest
from app.services.ai_service import generate_watch_picks
from app.services.profile_service import ProfileService
from app.services.picks_service import PicksService

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/generate")
@limiter.limit(settings.rate_limit_ai)
def generate(request: Request, body: PickRequest, user_id: str = Depends(get_current_user_id)):
    """Generate AI watch picks from quiz answers. Saves result to DB. Rate-limited."""
    watches, provider = generate_watch_picks(body)
    picks_svc = PicksService()
    record = picks_svc.save_picks(user_id, body.model_dump(), watches)
    return ok({"watches": watches, "provider": provider, "pick_id": record.get("id") if record else None})


@router.get("/history")
def pick_history(
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """Get paginated pick history for the current user."""
    profile_svc = ProfileService()
    picks_svc = PicksService()
    profile = profile_svc.get_profile(user_id, fields="subscription_status")
    status = profile.get("subscription_status", "free") if profile else "free"

    if status == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Pro to access pick history")

    picks = picks_svc.get_history(user_id, limit=limit, offset=offset)
    total = picks_svc.count_user_picks(user_id)

    return ok({"picks": picks, "total": total, "limit": limit, "offset": offset})


@router.get("/{pick_id}")
def get_pick(pick_id: str, user_id: str = Depends(get_current_user_id)):
    """Get a single pick by ID."""
    picks_svc = PicksService()
    pick = picks_svc.get_pick(user_id, pick_id)
    if not pick:
        raise HTTPException(status_code=404, detail="Pick not found")
    return ok(pick)

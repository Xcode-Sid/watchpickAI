from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.dependencies import get_current_user_id
from app.core.responses import ok
from app.schemas.users import UpdateProfileRequest
from app.services.profile_service import ProfileService
from app.services.picks_service import PicksService

router = APIRouter()


@router.get("/me")
def get_current_user(user_id: str = Depends(get_current_user_id)):
    """Get the current user's full profile."""
    svc = ProfileService()
    profile = svc.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ok(profile)


@router.patch("/me")
def update_current_user(
    body: UpdateProfileRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Update the current user's profile (email, etc.)."""
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    svc = ProfileService()
    updated = svc.update_profile(user_id, updates)
    return ok(updated)


@router.get("/me/stats")
def get_user_stats(user_id: str = Depends(get_current_user_id)):
    """Get user stats: total picks, member since, plan."""
    profile_svc = ProfileService()
    picks_svc = PicksService()
    profile = profile_svc.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    total_picks = picks_svc.count_user_picks(user_id)

    return ok({
        "total_picks": total_picks,
        "member_since": profile.get("created_at"),
        "subscription_status": profile.get("subscription_status", "free"),
        "stripe_customer_id": profile.get("stripe_customer_id"),
    })


@router.get("/me/picks")
def list_user_picks(
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """Get the current user's pick history (paginated, newest first)."""
    profile_svc = ProfileService()
    picks_svc = PicksService()
    profile = profile_svc.get_profile(user_id, fields="subscription_status")
    status = profile.get("subscription_status", "free") if profile else "free"

    if status == "free":
        raise HTTPException(status_code=403, detail="Upgrade to Pro to access pick history")

    picks = picks_svc.get_history(user_id, limit=limit, offset=offset)
    total = picks_svc.count_user_picks(user_id)

    return ok({
        "picks": picks,
        "total": total,
        "limit": limit,
        "offset": offset,
    })


@router.get("/me/picks/{pick_id}")
def get_single_pick(
    pick_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a single pick by ID (must belong to the current user)."""
    picks_svc = PicksService()
    pick = picks_svc.get_pick(user_id, pick_id)
    if not pick:
        raise HTTPException(status_code=404, detail="Pick not found")
    return ok(pick)

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Body

from app.core.dependencies import require_admin
from app.core.responses import ok
from app.schemas.pricing import PricingFeatureCreate, PricingFeatureUpdate, PricingPlanCreate, PricingPlanUpdate
from app.schemas.quiz import QuizOptionContentUpdate, QuizStepContentUpdate
from app.services.profile_service import ProfileService
from app.services.picks_service import PicksService
from app.services.pricing_service import (
    create_feature,
    create_plan,
    delete_feature,
    delete_plan,
    get_pricing_plans,
    update_feature,
    update_plan,
)
from app.services.quiz_service import get_quiz_content, upsert_option_content, upsert_step_content

logger = logging.getLogger("watchpick.admin")

router = APIRouter(dependencies=[Depends(require_admin)])


# ---------------------------------------------------------------------------
# Pricing (admin)
# ---------------------------------------------------------------------------


@router.get("/pricing")
def admin_list_pricing(locale: str = Query(default="en")):
    """List all pricing plans with features for admin editing."""
    plans = get_pricing_plans(locale=locale)
    return ok({"plans": plans})


@router.post("/pricing/plans")
def admin_create_plan(body: PricingPlanCreate = Body(...)):
    """Create a pricing plan."""
    data = body.model_dump(exclude_unset=True)
    created = create_plan(body.plan, body.locale, data)
    if not created:
        raise HTTPException(status_code=400, detail="Failed to create plan")
    return ok(created)


@router.patch("/pricing/plans/{plan_id}")
def admin_update_plan(plan_id: str, locale: str = Query(default="en"), body: PricingPlanUpdate = Body(...)):
    """Update a pricing plan. Single values are merged into *_translations for the given locale."""
    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    updated = update_plan(plan_id, data, locale=locale)
    if not updated:
        raise HTTPException(status_code=404, detail="Plan not found")
    return ok(updated)


@router.post("/pricing/plans/{plan_id}/features")
def admin_create_feature(plan_id: str, body: PricingFeatureCreate):
    """Add a feature to a plan."""
    created = create_feature(plan_id, body.text, body.sort_order, body.name_translations)
    if not created:
        raise HTTPException(status_code=400, detail="Failed to create feature")
    return ok(created)


@router.patch("/pricing/features/{feature_id}")
def admin_update_feature(feature_id: str, body: PricingFeatureUpdate):
    """Update a pricing feature."""
    data = body.model_dump(exclude_unset=True)
    updated = update_feature(feature_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Feature not found")
    return ok(updated)


@router.delete("/pricing/plans/{plan_id}")
def admin_delete_plan(plan_id: str):
    """Soft delete a pricing plan."""
    delete_plan(plan_id)
    return ok({"deleted": True})


@router.delete("/pricing/features/{feature_id}")
def admin_delete_feature(feature_id: str):
    """Soft delete a pricing feature."""
    delete_feature(feature_id)
    return ok({"deleted": True})


# ---------------------------------------------------------------------------
# Quiz (admin)
# ---------------------------------------------------------------------------


@router.get("/quiz")
def admin_list_quiz(locale: str = Query(default="en")):
    """List all quiz steps with options for admin editing."""
    steps = get_quiz_content(locale=locale)
    return ok({"steps": steps})


@router.patch("/quiz/steps/{step_id}/content")
def admin_update_step_content(
    step_id: str,
    locale: str = Query(default="en"),
    body: QuizStepContentUpdate = Body(...),
):
    """Update quiz step content for a locale."""
    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No fields to update")
    updated = upsert_step_content(
        step_id,
        locale=locale,
        label=data.get("label"),
        min_label=data.get("min_label"),
        max_label=data.get("max_label"),
        name_translations=data.get("name_translations"),
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Step not found")
    return ok(updated)


@router.patch("/quiz/options/{option_id}/content")
def admin_update_option_content(
    option_id: str,
    locale: str = Query(default="en"),
    body: QuizOptionContentUpdate = Body(...),
):
    """Update quiz option content for a locale."""
    updated = upsert_option_content(
        option_id,
        locale=locale,
        text=body.text,
        name_translations=body.name_translations,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Option not found")
    return ok(updated)


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------


@router.get("/users")
def list_users(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    include_deleted: bool = Query(default=False),
):
    """List all users with their profile info."""
    svc = ProfileService()
    users, total = svc.list_users(limit=limit, offset=offset, include_deleted=include_deleted)
    return ok({
        "users": users,
        "total": total,
        "limit": limit,
        "offset": offset,
    })


@router.get("/users/{user_id}")
def get_user(user_id: str):
    """Get a single user's profile + their pick count."""
    profile_svc = ProfileService()
    picks_svc = PicksService()
    profile = profile_svc.get_user_with_pick_count(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")

    total_picks = picks_svc.count_user_picks(user_id)

    return ok({
        "profile": profile,
        "total_picks": total_picks,
    })


@router.get("/analytics")
def analytics():
    """Basic analytics: total users, total picks, plan distribution."""
    svc = ProfileService()
    data = svc.get_analytics()
    return ok(data)

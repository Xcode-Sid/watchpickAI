"""Service layer for pricing plans and features."""

from __future__ import annotations

import json

from app.core.clients import get_supabase


def _get_from_name_translations(nt: dict, locale: str, key: str | None = None) -> str:
    """Resolve from name_translations. If key, get nested obj[key]; else obj is the value."""
    if not nt or not isinstance(nt, dict):
        return ""
    val = nt.get(locale) or nt.get("en")
    if key and isinstance(val, dict):
        return val.get(key) or ""
    return val if isinstance(val, str) else ""


def get_pricing_plans(locale: str = "en") -> list[dict]:
    """Fetch all pricing plans with features. Uses name_translations. Excludes is_deleted."""
    sb = get_supabase()
    plans_resp = (
        sb.table("pricing_plans")
        .select("*")
        .eq("locale", locale)
        .eq("is_deleted", False)
        .order("sort_order")
        .execute()
    )
    plans = plans_resp.data or []
    if not plans:
        plans_resp = (
            sb.table("pricing_plans")
            .select("*")
            .eq("locale", "en")
            .eq("is_deleted", False)
            .order("sort_order")
            .execute()
        )
        plans = plans_resp.data or []

    result = []
    for p in plans:
        nt = p.get("name_translations") or {}
        if isinstance(nt, str):
            nt = json.loads(nt) if nt else {}
        loc_data = nt.get(locale) or nt.get("en") or {}
        if isinstance(loc_data, str):
            loc_data = {}
        resolved = {
            "id": p["id"],
            "plan": p["plan"],
            "name": loc_data.get("name") or p.get("name", ""),
            "price": loc_data.get("price") or p.get("price", ""),
            "period": loc_data.get("period") or p.get("period", ""),
            "cta": loc_data.get("cta") or p.get("cta", ""),
            "badge": loc_data.get("badge") or p.get("badge"),
            "highlighted": p.get("highlighted", False),
            "sort_order": p.get("sort_order", 0),
        }

        features_resp = (
            sb.table("pricing_features")
            .select("id, text, name_translations, sort_order")
            .eq("plan_id", p["id"])
            .eq("is_deleted", False)
            .order("sort_order")
            .execute()
        )
        features = []
        for f in (features_resp.data or []):
            f_nt = f.get("name_translations") or {}
            if isinstance(f_nt, str):
                f_nt = json.loads(f_nt) if f_nt else {}
            features.append({
                "id": f["id"],
                "text": f_nt.get(locale) or f_nt.get("en") or f.get("text", ""),
                "sort_order": f.get("sort_order", 0),
            })
        resolved["features"] = features
        result.append(resolved)
    return result


def get_plan_by_plan_type(plan: str, locale: str = "en") -> dict | None:
    """Get a single plan by plan type."""
    sb = get_supabase()
    resp = (
        sb.table("pricing_plans")
        .select("*")
        .eq("plan", plan)
        .eq("locale", locale)
        .eq("is_deleted", False)
        .limit(1)
        .execute()
    )
    if not resp.data:
        resp = (
            sb.table("pricing_plans")
            .select("*")
            .eq("plan", plan)
            .eq("locale", "en")
            .eq("is_deleted", False)
            .limit(1)
            .execute()
        )
    if not resp.data:
        return None
    p = resp.data[0]
    nt = p.get("name_translations") or {}
    if isinstance(nt, str):
        nt = json.loads(nt) if nt else {}
    loc_data = nt.get(locale) or nt.get("en") or {}
    return {
        "id": p["id"],
        "plan": p["plan"],
        "name": loc_data.get("name") or p.get("name", ""),
        "price": loc_data.get("price") or p.get("price", ""),
    }


def create_plan(plan: str, locale: str, data: dict) -> dict | None:
    """Create a pricing plan."""
    sb = get_supabase()
    name_translations = data.get("name_translations") or {
        locale: {
            "name": data.get("name", ""),
            "price": data.get("price", ""),
            "period": data.get("period", ""),
            "cta": data.get("cta", ""),
            "badge": data.get("badge"),
        }
    }
    payload = {
        "plan": plan,
        "locale": locale,
        "name": data.get("name", ""),
        "price": data.get("price", ""),
        "period": data.get("period", ""),
        "cta": data.get("cta", ""),
        "badge": data.get("badge"),
        "highlighted": data.get("highlighted", False),
        "sort_order": data.get("sort_order", 0),
        "name_translations": name_translations,
    }
    resp = sb.table("pricing_plans").insert(payload).execute()
    return resp.data[0] if resp.data else None


def update_plan(plan_id: str, data: dict, locale: str = "en") -> dict | None:
    """Update a pricing plan. Merges name_translations."""
    sb = get_supabase()
    row = sb.table("pricing_plans").select("*").eq("id", plan_id).single().execute()
    if not row.data:
        return None
    current = row.data
    update_payload = {}
    for key in ("highlighted", "sort_order", "stripe_price_id"):
        if key in data and data[key] is not None:
            update_payload[key] = data[key]
    if "name_translations" in data and data["name_translations"] is not None:
        existing = current.get("name_translations") or {}
        if isinstance(existing, str):
            existing = json.loads(existing) if existing else {}
        for loc, val in data["name_translations"].items():
            if loc not in existing:
                existing[loc] = {}
            if isinstance(val, dict):
                existing[loc] = {**existing.get(loc, {}), **val}
            else:
                existing[loc] = val
        update_payload["name_translations"] = existing
    elif any(k in data for k in ("name", "price", "period", "cta", "badge")):
        existing = current.get("name_translations") or {}
        if isinstance(existing, str):
            existing = json.loads(existing) if existing else {}
        loc_data = existing.get(locale, {})
        if not isinstance(loc_data, dict):
            loc_data = {}
        for col in ("name", "price", "period", "cta", "badge"):
            if col in data and data[col] is not None:
                loc_data[col] = data[col]
        existing[locale] = loc_data
        update_payload["name_translations"] = existing
    if not update_payload:
        return current
    resp = sb.table("pricing_plans").update(update_payload).eq("id", plan_id).execute()
    return resp.data[0] if resp.data else None


def delete_plan(plan_id: str) -> bool:
    """Soft delete a pricing plan."""
    from datetime import datetime, timezone
    sb = get_supabase()
    sb.table("pricing_plans").update({"is_deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat()}).eq("id", plan_id).execute()
    return True


def create_feature(plan_id: str, text: str, sort_order: int = 0, name_translations: dict | None = None) -> dict | None:
    """Create a pricing feature."""
    sb = get_supabase()
    payload = {"plan_id": plan_id, "text": text, "sort_order": sort_order}
    if name_translations is not None:
        payload["name_translations"] = name_translations
    resp = sb.table("pricing_features").insert(payload).execute()
    return resp.data[0] if resp.data else None


def update_feature(feature_id: str, data: dict) -> dict | None:
    """Update a pricing feature. Merges name_translations."""
    sb = get_supabase()
    row = sb.table("pricing_features").select("*").eq("id", feature_id).single().execute()
    if not row.data:
        return None
    current = row.data
    update_payload = {}
    if "text" in data and data["text"] is not None:
        update_payload["text"] = data["text"]
    if "sort_order" in data and data["sort_order"] is not None:
        update_payload["sort_order"] = data["sort_order"]
    if "name_translations" in data and data["name_translations"] is not None:
        existing = current.get("name_translations") or {}
        if isinstance(existing, str):
            existing = json.loads(existing) if existing else {}
        merged = {**existing, **data["name_translations"]}
        update_payload["name_translations"] = merged
    if not update_payload:
        return current
    resp = sb.table("pricing_features").update(update_payload).eq("id", feature_id).execute()
    return resp.data[0] if resp.data else None


def delete_feature(feature_id: str) -> bool:
    """Soft delete a pricing feature."""
    from datetime import datetime, timezone
    sb = get_supabase()
    sb.table("pricing_features").update({"is_deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat()}).eq("id", feature_id).execute()
    return True

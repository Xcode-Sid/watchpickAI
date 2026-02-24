"""Service layer for quiz steps and options."""

from __future__ import annotations

import json

from app.core.clients import get_supabase


def get_quiz_content(locale: str = "en") -> list[dict]:
    """Fetch all quiz steps with options. Uses name_translations. Excludes is_deleted."""
    sb = get_supabase()
    steps_resp = (
        sb.table("quiz_steps")
        .select("*")
        .eq("is_deleted", False)
        .order("sort_order")
        .execute()
    )
    steps = steps_resp.data or []

    result = []
    for s in steps:
        content_resp = (
            sb.table("quiz_step_content")
            .select("name_translations, label, min_label, max_label")
            .eq("step_id", s["id"])
            .eq("is_deleted", False)
            .limit(1)
            .execute()
        )
        content = content_resp.data[0] if content_resp.data else {}
        nt = content.get("name_translations") or {}
        if isinstance(nt, str):
            nt = json.loads(nt) if nt else {}
        loc_data = nt.get(locale) or nt.get("en") or {}
        if isinstance(loc_data, str):
            loc_data = {}
        label = loc_data.get("label") or content.get("label", "")
        min_label = loc_data.get("min_label") or content.get("min_label")
        max_label = loc_data.get("max_label") or content.get("max_label")

        opts_resp = (
            sb.table("quiz_options")
            .select("id, api_value, sort_order")
            .eq("step_id", s["id"])
            .eq("is_deleted", False)
            .order("sort_order")
            .execute()
        )
        options = opts_resp.data or []

        options_with_text = []
        for opt in options:
            opt_content_resp = (
                sb.table("quiz_option_content")
                .select("name_translations, text")
                .eq("option_id", opt["id"])
                .eq("is_deleted", False)
                .limit(1)
                .execute()
            )
            opt_content = opt_content_resp.data[0] if opt_content_resp.data else {}
            opt_nt = opt_content.get("name_translations") or {}
            if isinstance(opt_nt, str):
                opt_nt = json.loads(opt_nt) if opt_nt else {}
            text = opt_nt.get(locale) or opt_nt.get("en") or opt_content.get("text", opt["api_value"])

            options_with_text.append({
                "id": opt["id"],
                "api_value": opt["api_value"],
                "text": text,
                "sort_order": opt["sort_order"],
            })

        result.append({
            "id": s["id"],
            "key": s["key"],
            "type": s["type"],
            "sort_order": s["sort_order"],
            "label": label,
            "min_label": min_label,
            "max_label": max_label,
            "options": options_with_text,
        })

    return result


def upsert_step_content(
    step_id: str,
    locale: str | None = None,
    label: str | None = None,
    min_label: str | None = None,
    max_label: str | None = None,
    name_translations: dict | None = None,
    created_by: str | None = None,
    updated_by: str | None = None,
) -> dict | None:
    """Insert or update quiz step content. Uses name_translations: {locale: {label, min_label, max_label}}."""
    sb = get_supabase()
    if name_translations is None and locale is not None:
        name_translations = {locale: {"label": label or "", "min_label": min_label, "max_label": max_label}}

    existing = sb.table("quiz_step_content").select("*").eq("step_id", step_id).limit(1).execute()
    if existing.data and len(existing.data) > 0:
        row = existing.data[0]
        if name_translations:
            curr = row.get("name_translations") or {}
            if isinstance(curr, str):
                curr = json.loads(curr) if curr else {}
            for loc, val in name_translations.items():
                if loc not in curr:
                    curr[loc] = {}
                if isinstance(val, dict):
                    curr[loc] = {**curr.get(loc, {}), **val}
                else:
                    curr[loc] = val
            update_payload = {"name_translations": curr}
            if updated_by is not None:
                update_payload["updated_by"] = updated_by
            resp = sb.table("quiz_step_content").update(update_payload).eq("step_id", step_id).execute()
            return resp.data[0] if resp.data else row
        return row
    else:
        data = {
            "step_id": step_id,
            "locale": "en",
            "label": label or "",
            "min_label": min_label,
            "max_label": max_label,
            "name_translations": name_translations or {},
        }
        if created_by is not None:
            data["created_by"] = created_by
        resp = sb.table("quiz_step_content").insert(data).execute()
        return resp.data[0] if resp.data else None


def upsert_option_content(
    option_id: str,
    locale: str | None = None,
    text: str | None = None,
    name_translations: dict | None = None,
    created_by: str | None = None,
    updated_by: str | None = None,
) -> dict | None:
    """Insert or update quiz option content. Uses name_translations: {locale: text}."""
    if name_translations is None and locale is not None and text is not None:
        name_translations = {locale: text}

    sb = get_supabase()
    existing = sb.table("quiz_option_content").select("*").eq("option_id", option_id).limit(1).execute()
    if existing.data and len(existing.data) > 0:
        row = existing.data[0]
        if name_translations is not None:
            curr = row.get("name_translations") or {}
            if isinstance(curr, str):
                curr = json.loads(curr) if curr else {}
            merged = {**curr, **name_translations}
            update_payload = {"name_translations": merged}
            if updated_by is not None:
                update_payload["updated_by"] = updated_by
            resp = sb.table("quiz_option_content").update(update_payload).eq("option_id", option_id).execute()
            return resp.data[0] if resp.data else row
        return row
    else:
        data = {
            "option_id": option_id,
            "locale": "en",
            "text": text or "",
            "name_translations": name_translations or {},
        }
        if created_by is not None:
            data["created_by"] = created_by
        resp = sb.table("quiz_option_content").insert(data).execute()
        return resp.data[0] if resp.data else None

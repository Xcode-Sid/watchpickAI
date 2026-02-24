"""Repository layer: data access for profiles table."""

from __future__ import annotations

from app.core.clients import get_supabase


class ProfileRepository:
    """Handles all database operations for profiles."""

    @staticmethod
    def get_by_user_id(user_id: str, fields: str = "*") -> dict | None:
        """Fetch a profile by user_id."""
        sb = get_supabase()
        resp = sb.table("profiles").select(fields).eq("user_id", user_id).single().execute()
        return resp.data

    @staticmethod
    def update_by_user_id(user_id: str, data: dict) -> dict | None:
        """Update a profile by user_id. Returns updated profile."""
        sb = get_supabase()
        resp = sb.table("profiles").update(data).eq("user_id", user_id).execute()
        return resp.data[0] if resp.data else None

    @staticmethod
    def update_by_stripe_customer_id(stripe_customer_id: str, data: dict) -> None:
        """Update a profile by stripe_customer_id."""
        sb = get_supabase()
        sb.table("profiles").update(data).eq("stripe_customer_id", stripe_customer_id).execute()

    @staticmethod
    def list_all(limit: int = 50, offset: int = 0, include_deleted: bool = False) -> list[dict]:
        """List profiles, newest first. Optionally include soft-deleted."""
        sb = get_supabase()
        q = sb.table("profiles").select("*").order("created_at", desc=True)
        if not include_deleted:
            q = q.eq("is_deleted", False)
        resp = q.range(offset, offset + limit - 1).execute()
        return resp.data or []

    @staticmethod
    def count_all(include_deleted: bool = False) -> int:
        """Count total profiles."""
        sb = get_supabase()
        q = sb.table("profiles").select("id", count="exact")
        if not include_deleted:
            q = q.eq("is_deleted", False)
        resp = q.execute()
        return resp.count or 0

    @staticmethod
    def count_by_subscription_status(status: str, include_deleted: bool = False) -> int:
        """Count profiles by subscription_status."""
        sb = get_supabase()
        q = sb.table("profiles").select("id", count="exact").eq("subscription_status", status)
        if not include_deleted:
            q = q.eq("is_deleted", False)
        resp = q.execute()
        return resp.count or 0

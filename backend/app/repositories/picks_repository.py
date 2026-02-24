"""Repository layer: data access for picks table."""

from __future__ import annotations

from app.core.clients import get_supabase


class PicksRepository:
    """Handles all database operations for picks."""

    @staticmethod
    def create(user_id: str, quiz_inputs: dict, results: list[dict]) -> dict | None:
        """Insert a picks record. Returns the created record."""
        sb = get_supabase()
        payload = {
            "user_id": user_id,
            "quiz_inputs": quiz_inputs,
            "results": results,
            "created_by": user_id,
        }
        resp = sb.table("picks").insert(payload).execute()
        return resp.data[0] if resp.data else None

    @staticmethod
    def get_history_by_user(user_id: str, limit: int = 50, offset: int = 0) -> list[dict]:
        """Fetch paginated pick history for a user, newest first."""
        sb = get_supabase()
        resp = (
            sb.table("picks")
            .select("id, quiz_inputs, results, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return resp.data or []

    @staticmethod
    def get_by_id_and_user(pick_id: str, user_id: str) -> dict | None:
        """Fetch a single pick by ID, only if it belongs to the user."""
        sb = get_supabase()
        resp = (
            sb.table("picks")
            .select("*")
            .eq("id", pick_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        return resp.data

    @staticmethod
    def count_by_user(user_id: str) -> int:
        """Count total picks for a user."""
        sb = get_supabase()
        resp = sb.table("picks").select("id", count="exact").eq("user_id", user_id).execute()
        return resp.count or 0

    @staticmethod
    def count_all() -> int:
        """Count total picks across all users."""
        sb = get_supabase()
        resp = sb.table("picks").select("id", count="exact").execute()
        return resp.count or 0

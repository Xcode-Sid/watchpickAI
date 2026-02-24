"""Service layer: business logic for profiles. Uses ProfileRepository."""

from __future__ import annotations

from app.repositories.profile_repository import ProfileRepository


class ProfileService:
    """Profile business logic."""

    def __init__(self, repository: ProfileRepository | None = None):
        self._repo = repository or ProfileRepository()

    def get_profile(self, user_id: str, fields: str = "*") -> dict | None:
        """Get a user's profile by user_id."""
        return self._repo.get_by_user_id(user_id, fields)

    def update_profile(self, user_id: str, data: dict) -> dict | None:
        """Update a user's profile. Returns updated profile."""
        return self._repo.update_by_user_id(user_id, data)

    def update_profile_by_stripe_customer(self, stripe_customer_id: str, data: dict) -> None:
        """Update profile by Stripe customer ID (used by webhooks)."""
        self._repo.update_by_stripe_customer_id(stripe_customer_id, data)

    def list_users(self, limit: int = 50, offset: int = 0, include_deleted: bool = False) -> tuple[list[dict], int]:
        """List users with total count. Returns (users, total)."""
        users = self._repo.list_all(limit=limit, offset=offset, include_deleted=include_deleted)
        total = self._repo.count_all(include_deleted=include_deleted)
        return users, total

    def get_user_with_pick_count(self, user_id: str) -> dict | None:
        """Get a user's profile. Returns None if not found."""
        return self._repo.get_by_user_id(user_id)

    def get_analytics(self) -> dict:
        """Basic analytics: total users, total picks, plan distribution."""
        from app.repositories.picks_repository import PicksRepository

        picks_repo = PicksRepository()
        total_users = self._repo.count_all()
        total_picks = picks_repo.count_all()
        plans = {
            "free": self._repo.count_by_subscription_status("free"),
            "pro": self._repo.count_by_subscription_status("pro"),
            "lifetime": self._repo.count_by_subscription_status("lifetime"),
        }
        return {
            "total_users": total_users,
            "total_picks": total_picks,
            "plans": plans,
        }

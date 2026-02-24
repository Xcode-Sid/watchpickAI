"""Service layer: business logic for picks. Uses PicksRepository."""

from __future__ import annotations

from app.repositories.picks_repository import PicksRepository


class PicksService:
    """Picks business logic."""

    def __init__(self, repository: PicksRepository | None = None):
        self._repo = repository or PicksRepository()

    def save_picks(self, user_id: str, quiz_inputs: dict, results: list[dict]) -> dict | None:
        """Save a new pick. Returns created record."""
        return self._repo.create(user_id, quiz_inputs, results)

    def get_history(self, user_id: str, limit: int = 50, offset: int = 0) -> list[dict]:
        """Get paginated pick history for a user."""
        return self._repo.get_history_by_user(user_id, limit=limit, offset=offset)

    def get_pick(self, user_id: str, pick_id: str) -> dict | None:
        """Get a single pick by ID (must belong to user)."""
        return self._repo.get_by_id_and_user(pick_id, user_id)

    def count_user_picks(self, user_id: str) -> int:
        """Count picks for a user."""
        return self._repo.count_by_user(user_id)

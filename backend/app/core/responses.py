from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class ApiResponse(BaseModel):
    """Standard API response envelope."""
    success: bool
    data: Any = None
    error: str | None = None


def ok(data: Any = None) -> dict:
    """Return a success response."""
    return {"success": True, "data": data, "error": None}


def fail(error: str) -> dict:
    """Return an error response."""
    return {"success": False, "data": None, "error": error}

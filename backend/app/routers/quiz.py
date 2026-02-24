"""Public quiz content API — no auth required."""

from fastapi import APIRouter, Query

from app.core.responses import ok
from app.services.quiz_service import get_quiz_content

router = APIRouter()


@router.get("")
def list_quiz(locale: str = Query(default="en", description="Locale for quiz content")):
    """Get all quiz steps with options. Public endpoint."""
    steps = get_quiz_content(locale=locale)
    return ok({"steps": steps})

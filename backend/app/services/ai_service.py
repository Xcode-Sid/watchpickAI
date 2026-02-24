import json
import re

from fastapi import HTTPException

from app.ai import ai_factory
from app.schemas.picks import PickRequest

SYSTEM_PROMPT = (
    "You are an expert watch advisor and horologist. Given a person's preferences, "
    "pick exactly 4 watches as a JSON array. The first 3 are main picks. The 4th is "
    'a "hidden gem" — a lesser-known but excellent alternative.\n\n'
    "Each watch object must have these exact fields:\n"
    '- "name": full model name (e.g. "Seiko Presage SPB167")\n'
    '- "brand": brand name\n'
    '- "price_range": price range string (e.g. "$400–$500")\n'
    '- "case_size": case diameter in mm (e.g. "40.8mm")\n'
    '- "reason": 2 sentences explaining why this watch matches the user\'s preferences\n'
    '- "chrono24_url": "https://www.chrono24.com/search/index.htm?query=" + URL-encoded watch name\n'
    '- "amazon_url": "https://www.amazon.com/s?k=" + URL-encoded watch name\n\n'
    "Return ONLY the JSON array, no markdown, no explanation, no code fences."
)


def generate_watch_picks(body: PickRequest) -> tuple[list[dict], str]:
    """
    Generate watch picks using the AI factory (with automatic fallback).
    Returns (watches, provider_name).
    """
    user_message = (
        f"Budget: {body.budget}\n"
        f"Occasion: {body.occasion}\n"
        f"Style preference: {body.style}\n"
        f"Wrist size: {body.wristSize}\n"
        f"Gender preference: {body.gender}\n"
        f"Brand openness: {body.brandOpenness}\n"
        f"Movement type: {body.movementType}"
    )

    raw_text, provider_name = ai_factory.generate(SYSTEM_PROMPT, user_message)

    match = re.search(r"\[[\s\S]*\]", raw_text)
    if not match:
        raise HTTPException(status_code=500, detail="AI returned unparseable response")

    try:
        watches: list[dict] = json.loads(match.group(0))
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON")

    if not watches:
        raise HTTPException(status_code=500, detail="No picks generated")

    return watches, provider_name

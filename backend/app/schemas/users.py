from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class UserProfile(BaseModel):
    user_id: str
    email: Optional[str] = None
    subscription_status: str = "free"
    stripe_customer_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    email: Optional[str] = None


class UserStats(BaseModel):
    total_picks: int
    member_since: Optional[str] = None
    subscription_status: str


class PickHistoryItem(BaseModel):
    id: str
    quiz_inputs: dict
    results: list
    created_at: str


class PickDetail(BaseModel):
    id: str
    user_id: str
    quiz_inputs: dict
    results: list
    created_at: str

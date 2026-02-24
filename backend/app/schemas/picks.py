from typing import Optional

from pydantic import BaseModel


class PickRequest(BaseModel):
    budget: str
    occasion: str
    style: str
    wristSize: str
    gender: str
    brandOpenness: str
    movementType: Optional[str] = "No preference"


class WatchResult(BaseModel):
    name: str
    brand: str
    price_range: str
    case_size: str
    reason: str
    chrono24_url: str
    amazon_url: str


class PickResponse(BaseModel):
    watches: list[WatchResult]

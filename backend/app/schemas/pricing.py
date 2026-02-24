from typing import Literal

from pydantic import BaseModel


class PricingFeatureSchema(BaseModel):
    id: str
    text: str
    sort_order: int


class PricingPlanSchema(BaseModel):
    id: str
    plan: Literal["pro", "lifetime"]
    name: str
    price: str
    period: str
    cta: str
    badge: str | None
    highlighted: bool
    sort_order: int
    features: list[PricingFeatureSchema]


class PricingPlanCreate(BaseModel):
    plan: str
    locale: str = "en"
    name: str = ""
    price: str = ""
    period: str = ""
    cta: str = ""
    badge: str | None = None
    highlighted: bool = False
    sort_order: int = 0
    name_translations: dict | None = None


class PricingPlanUpdate(BaseModel):
    name: str | None = None
    price: str | None = None
    period: str | None = None
    cta: str | None = None
    badge: str | None = None
    highlighted: bool | None = None
    sort_order: int | None = None
    stripe_price_id: str | None = None
    name_translations: dict | None = None


class PricingFeatureCreate(BaseModel):
    text: str
    sort_order: int = 0
    name_translations: dict[str, str] | None = None


class PricingFeatureUpdate(BaseModel):
    text: str | None = None
    sort_order: int | None = None
    name_translations: dict[str, str] | None = None

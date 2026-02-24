from typing import Literal

from pydantic import BaseModel


class CheckoutRequest(BaseModel):
    plan: Literal["pro", "lifetime"]


class CheckoutResponse(BaseModel):
    url: str


class PortalResponse(BaseModel):
    url: str

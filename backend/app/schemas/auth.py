from pydantic import BaseModel, field_validator


class SignUpRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def trim_email(cls, v: str) -> str:
        return v.strip().lower() if v else v


class SignInRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def trim_email(cls, v: str) -> str:
        return v.strip().lower() if v else v


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_at: int
    user: dict

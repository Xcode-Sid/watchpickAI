from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load from project root .env first (same as frontend), then backend/.env
_ROOT = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE = _ROOT / ".env"
_BACKEND_ENV = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(ENV_FILE), str(_BACKEND_ENV)],
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Supabase — from root .env: SUPABASE_URL or VITE_SUPABASE_URL
    supabase_url: str = Field(default="", validation_alias=AliasChoices("SUPABASE_URL", "VITE_SUPABASE_URL"))
    # Service role: required for webhooks, admin, server auth — bypasses RLS (never expose to frontend)
    supabase_service_role_key: str = ""

    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_pro_price_id: str = ""
    stripe_lifetime_price_id: str = ""

    # AI Providers (fallback order: OpenAI → Anthropic → Gemini)
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-5-haiku-latest"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # Email (Resend)
    resend_api_key: str = ""
    email_from: str = "WatchPick <noreply@watchpick.com>"

    # App
    frontend_url: str = "http://localhost:8080"
    cors_origins: str = ""  # comma-separated, e.g. "https://watchpick.com,https://www.watchpick.com"
    debug: bool = True
    admin_api_key: str = ""  # key for admin endpoints
    max_request_body_mb: int = 2
    rate_limit_default: str = "60/minute"
    rate_limit_ai: str = "5/minute"

    @property
    def allowed_origins(self) -> list[str]:
        origins = [self.frontend_url]
        if self.cors_origins:
            origins.extend([o.strip() for o in self.cors_origins.split(",") if o.strip()])
        if self.debug:
            origins.extend(["http://localhost:8080", "http://localhost:5173", "http://localhost:3000"])
        return list(set(origins))

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key
                     and "placeholder" not in self.supabase_service_role_key)

    @property
    def stripe_configured(self) -> bool:
        return bool(self.stripe_secret_key and "placeholder" not in self.stripe_secret_key)

    @property
    def any_ai_configured(self) -> bool:
        keys = [self.openai_api_key, self.anthropic_api_key, self.gemini_api_key]
        return any(k and "placeholder" not in k for k in keys)

    @property
    def resend_configured(self) -> bool:
        return bool(self.resend_api_key and "placeholder" not in self.resend_api_key)


settings = Settings()

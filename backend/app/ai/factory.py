from __future__ import annotations

import logging
from typing import Optional

from fastapi import HTTPException

from app.ai.base import AIProvider
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIClientFactory:
    """
    Manages an ordered list of AI providers.
    On generate(), tries each provider in order — if one fails, falls back
    to the next. Logs every attempt so you know exactly what happened.
    """

    def __init__(self) -> None:
        self._providers: list[AIProvider] = []
        self._init_providers()

    def _init_providers(self) -> None:
        """Register all configured providers in priority order."""

        if settings.openai_api_key and "placeholder" not in settings.openai_api_key:
            try:
                from app.ai.providers.openai_provider import OpenAIProvider
                self._providers.append(OpenAIProvider(
                    api_key=settings.openai_api_key,
                    model=settings.openai_model,
                ))
                logger.info("Registered AI provider: OpenAI (%s)", settings.openai_model)
            except Exception as exc:
                logger.warning("Failed to init OpenAI provider: %s", exc)

        if settings.anthropic_api_key and "placeholder" not in settings.anthropic_api_key:
            try:
                from app.ai.providers.anthropic_provider import AnthropicProvider
                self._providers.append(AnthropicProvider(
                    api_key=settings.anthropic_api_key,
                    model=settings.anthropic_model,
                ))
                logger.info("Registered AI provider: Anthropic (%s)", settings.anthropic_model)
            except Exception as exc:
                logger.warning("Failed to init Anthropic provider: %s", exc)

        if settings.gemini_api_key and "placeholder" not in settings.gemini_api_key:
            try:
                from app.ai.providers.gemini_provider import GeminiProvider
                self._providers.append(GeminiProvider(
                    api_key=settings.gemini_api_key,
                    model=settings.gemini_model,
                ))
                logger.info("Registered AI provider: Gemini (%s)", settings.gemini_model)
            except Exception as exc:
                logger.warning("Failed to init Gemini provider: %s", exc)

        if not self._providers:
            logger.error("No AI providers configured! Set at least one API key in .env")

    @property
    def providers(self) -> list[AIProvider]:
        return list(self._providers)

    @property
    def available(self) -> bool:
        return len(self._providers) > 0

    def generate(self, system_prompt: str, user_message: str) -> tuple[str, str]:
        """
        Try each provider in order. Return (response_text, provider_name).
        If all fail, raise HTTP 502.
        """
        if not self._providers:
            raise HTTPException(
                status_code=503,
                detail="No AI providers configured. Add at least one API key to .env",
            )

        errors: list[str] = []

        for provider in self._providers:
            try:
                logger.info("Trying AI provider: %s", provider.name)
                result = provider.generate(system_prompt, user_message)
                if result.strip():
                    logger.info("Success with provider: %s", provider.name)
                    return result, provider.name
                else:
                    errors.append(f"{provider.name}: empty response")
                    logger.warning("Empty response from %s, trying next", provider.name)
            except Exception as exc:
                errors.append(f"{provider.name}: {exc}")
                logger.warning("Provider %s failed: %s — falling back", provider.name, exc)

        detail = "All AI providers failed:\n" + "\n".join(f"  - {e}" for e in errors)
        logger.error(detail)
        raise HTTPException(status_code=502, detail=detail)

    def health(self) -> list[dict]:
        """Return health status for every registered provider."""
        results = []
        for provider in self._providers:
            try:
                ok = provider.ping()
                results.append({"name": provider.name, "status": "connected" if ok else "error"})
            except Exception as exc:
                results.append({"name": provider.name, "status": "error", "detail": str(exc)})
        return results


# Singleton — created once at startup
ai_factory = AIClientFactory()

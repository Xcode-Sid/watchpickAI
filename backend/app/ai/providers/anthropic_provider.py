from __future__ import annotations

import logging

import anthropic

from app.ai.base import AIProvider

logger = logging.getLogger(__name__)


class AnthropicProvider(AIProvider):
    name = "anthropic"

    def __init__(self, api_key: str, model: str = "claude-3-5-haiku-latest"):
        self._client = anthropic.Anthropic(api_key=api_key)
        self._model = model

    def generate(self, system_prompt: str, user_message: str) -> str:
        message = self._client.messages.create(
            model=self._model,
            max_tokens=2048,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )
        return message.content[0].text if message.content else ""

    def ping(self) -> bool:
        try:
            self._client.messages.create(
                model=self._model,
                max_tokens=5,
                messages=[{"role": "user", "content": "hi"}],
            )
            return True
        except Exception as exc:
            logger.warning("Anthropic ping failed: %s", exc)
            return False

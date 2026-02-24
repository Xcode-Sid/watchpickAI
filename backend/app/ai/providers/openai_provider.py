from __future__ import annotations

import logging

from openai import OpenAI

from app.ai.base import AIProvider

logger = logging.getLogger(__name__)


class OpenAIProvider(AIProvider):
    name = "openai"

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self._client = OpenAI(api_key=api_key)
        self._model = model

    def generate(self, system_prompt: str, user_message: str) -> str:
        completion = self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
        return completion.choices[0].message.content or ""

    def ping(self) -> bool:
        try:
            self._client.models.retrieve(self._model)
            return True
        except Exception as exc:
            logger.warning("OpenAI ping failed: %s", exc)
            return False

from __future__ import annotations

import logging

import google.generativeai as genai

from app.ai.base import AIProvider

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):
    name = "gemini"

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        genai.configure(api_key=api_key)
        self._model_name = model

    def generate(self, system_prompt: str, user_message: str) -> str:
        model = genai.GenerativeModel(
            model_name=self._model_name,
            system_instruction=system_prompt,
        )
        response = model.generate_content(user_message)
        return response.text or ""

    def ping(self) -> bool:
        try:
            model = genai.GenerativeModel(model_name=self._model_name)
            model.generate_content("hi")
            return True
        except Exception as exc:
            logger.warning("Gemini ping failed: %s", exc)
            return False

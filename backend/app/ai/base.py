from __future__ import annotations

import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class AIProvider(ABC):
    """Abstract base class every AI provider must implement."""

    name: str

    @abstractmethod
    def generate(self, system_prompt: str, user_message: str) -> str:
        """Send a prompt and return the raw text response."""
        ...

    @abstractmethod
    def ping(self) -> bool:
        """Lightweight connectivity check (list models, etc.)."""
        ...

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} name={self.name!r}>"

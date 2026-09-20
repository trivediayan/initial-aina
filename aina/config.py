"""Application configuration loaded from environment variables."""

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


from typing import Any


@dataclass(frozen=True)
class Settings:
    environment: str
    log_level: str
    gemini_api_key: str | None
    gemini_model: str | None
    supabase_url: str | None
    supabase_key: str | None


def get_settings(env: Any = None) -> Settings:
    """Return application settings from Worker env or os.environ."""
    def _get(key: str, default: str | None = None) -> str | None:
        if env is not None:
            if isinstance(env, dict):
                val = env.get(key)
            else:
                val = getattr(env, key, None)
            if val is not None:
                return str(val)
        return os.getenv(key, default)

    return Settings(
        environment=_get("AINA_ENV", "development") or "development",
        log_level=_get("AINA_LOG_LEVEL", "info") or "info",
        gemini_api_key=_get("GEMINI_API_KEY") or None,
        gemini_model=_get("GEMINI_MODEL") or None,
        supabase_url=_get("SUPABASE_URL") or None,
        supabase_key=_get("SUPABASE_KEY") or None,
    )


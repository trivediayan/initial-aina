"""Application configuration loaded from environment variables."""

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    environment: str
    log_level: str
    gemini_api_key: str | None
    gemini_model: str | None
    supabase_url: str | None
    supabase_key: str | None


def get_settings() -> Settings:
    """Return the current application settings."""
    return Settings(
        environment=os.getenv("AINA_ENV", "development"),
        log_level=os.getenv("AINA_LOG_LEVEL", "info"),
        gemini_api_key=os.getenv("GEMINI_API_KEY") or None,
        gemini_model=os.getenv("GEMINI_MODEL") or None,
        supabase_url=os.getenv("SUPABASE_URL") or None,
        supabase_key=os.getenv("SUPABASE_KEY") or None,
    )

"""Minimal Gemini client over the generateContent REST API.

The client sends the system instruction, the conversation history, and the
place data supplied by the application, then returns Gemini's text. It makes
no decisions about what the user wants — Gemini does that.
"""

from typing import Any

import httpx

from aina.prompts import AINA_SYSTEM_PROMPT


class GeminiConfigurationError(RuntimeError):
    """Raised when Gemini configuration is incomplete."""


class GeminiAPIError(RuntimeError):
    """Raised when Gemini rejects or cannot complete a request."""


def _extract_text(payload: dict[str, Any]) -> str:
    parts: list[str] = []
    for candidate in payload.get("candidates", []):
        if not isinstance(candidate, dict):
            continue
        content = candidate.get("content", {})
        if not isinstance(content, dict):
            continue
        for part in content.get("parts", []):
            if isinstance(part, dict) and isinstance(part.get("text"), str):
                parts.append(part["text"])
    response = "".join(parts).strip()
    if not response:
        raise GeminiAPIError("Gemini returned no text response")
    return response


class GeminiClient:
    """Thin wrapper around Gemini generateContent."""

    def __init__(self, api_key: str | None, model: str | None) -> None:
        self.api_key = api_key
        self.model = model

    async def generate(
        self,
        user_message: str,
        *,
        history: list[dict[str, str]] | None = None,
        place_context: str | None = None,
    ) -> str:
        """Generate a reply for a user message.

        Args:
            user_message: The current user message.
            history: Earlier turns as [{"role": "user"|"assistant", "content": ...}].
            place_context: Vadodara place data text prepared by the application.
        """
        if not self.api_key:
            raise GeminiConfigurationError("GEMINI_API_KEY is not configured")
        if not self.model:
            raise GeminiConfigurationError("GEMINI_MODEL is not configured")

        contents: list[dict[str, Any]] = []
        for turn in history or []:
            role = "user" if turn.get("role") == "user" else "model"
            contents.append(
                {"role": role, "parts": [{"text": turn.get("content", "")}]}
            )

        message = user_message
        if place_context:
            message = (
                f"Vadodara place data available for this conversation:\n"
                f"{place_context}\n\n"
                f"User message: {user_message}"
            )
        contents.append({"role": "user", "parts": [{"text": message}]})

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent",
                    headers={
                        "x-goog-api-key": self.api_key,
                        "Content-Type": "application/json",
                    },
                    json={
                        "system_instruction": {"parts": [{"text": AINA_SYSTEM_PROMPT}]},
                        "contents": contents,
                    },
                )
                if response.status_code in (401, 403):
                    raise GeminiAPIError("Gemini authentication failed")
                response.raise_for_status()
                payload = response.json()
        except (httpx.TimeoutException, httpx.NetworkError) as exc:
            raise GeminiAPIError("Gemini request timed out or failed") from exc
        except httpx.HTTPStatusError as exc:
            raise GeminiAPIError("Gemini API request failed") from exc
        except ValueError as exc:
            raise GeminiAPIError("Gemini returned malformed JSON") from exc

        if not isinstance(payload, dict):
            raise GeminiAPIError("Gemini returned an unexpected response")
        return _extract_text(payload)

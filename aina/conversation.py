"""In-memory conversation history.

This module only stores and returns past turns so Gemini can understand
references like "that one", "why?", or "plan that". It interprets nothing.
"""

from uuid import uuid4

MAX_TURNS = 40


class ConversationStore:
    """Maps conversation IDs to ordered message lists."""

    def __init__(self) -> None:
        self._conversations: dict[str, list[dict[str, str]]] = {}

    def get_or_create(self, conversation_id: str | None) -> tuple[str, list[dict[str, str]]]:
        """Return (id, history) for an existing or brand-new conversation."""
        session_id = conversation_id or str(uuid4())
        history = self._conversations.setdefault(session_id, [])
        return session_id, history

    def add_turn(self, conversation_id: str, user_message: str, assistant_message: str) -> None:
        """Append a completed turn, keeping only the most recent history."""
        history = self._conversations.setdefault(conversation_id, [])
        history.append({"role": "user", "content": user_message})
        history.append({"role": "assistant", "content": assistant_message})
        del history[:-MAX_TURNS]

    def history(self, conversation_id: str) -> list[dict[str, str]]:
        return list(self._conversations.get(conversation_id, []))

"""Tests for Aina's thin conversational architecture.

Architecture under test (do not reintroduce old layers):

    User message
        -> ConversationStore history (storage only)
        -> SupabaseRepository retrieval only (catalog / detail / nearby / food)
        -> GeminiClient.generate(message, history, place_context)
        -> store turn, return {response, conversation_id}

There is no profile collector, recommendation engine, itinerary builder,
intent classifier, or guide/grounding layer. Gemini does all understanding.
"""

import pytest
from fastapi.testclient import TestClient

import aina.app as app_module
from aina.app import app
from aina.config import get_settings
from aina.conversation import MAX_TURNS, ConversationStore
from aina.gemini import (
    GeminiAPIError,
    GeminiClient,
    GeminiConfigurationError,
)
from aina.prompts import AINA_SYSTEM_PROMPT
from aina.supabase import (
    SupabaseConfigurationError,
    SupabaseDataError,
    SupabaseRepository,
    format_food_items,
    format_place_catalog,
    format_place_detail,
)


PALACE = {
    "id": "H001",
    "name": "Laxmi Vilas Palace",
    "city": "Vadodara",
    "category": "Palace",
    "description": "A magnificent palace",
    "architectural_style": "Indo-Saracenic",
    "visit_time_minutes": 120,
    "latitude": 22.2939,
    "longitude": 73.1933,
}

BAUG = {
    "id": "H002",
    "name": "Sayaji Baug",
    "city": "Vadodara",
    "category": "Garden",
    "description": "A large garden",
    "visit_time_minutes": 60,
    "latitude": 22.3030,
    "longitude": 73.1750,
}

FOOD = {
    "food_specialty": "Sev Usal",
    "specific_place": "Mahakali Sev Usal",
    "short_description": "Spicy sev usal",
    "city": "Vadodara",
}


class FakeRepository:
    """Minimal retrieval-only fake matching SupabaseRepository's surface."""

    def __init__(self, places=None, food=None):
        self._places = places if places is not None else [PALACE, BAUG]
        self._food = food if food is not None else [FOOD]

    def list_places(self, *, city=None):
        if city is None:
            return list(self._places)
        return [r for r in self._places if city.lower() in str(r.get("city", "")).lower()]

    def get_place_by_id(self, place_id):
        for row in self._places:
            if row.get("id") == place_id:
                return row
        return None

    def find_places_by_name(self, text, *, city=None):
        needle = text.strip().lower()
        if not needle:
            return []
        rows = self.list_places(city=city if city is not None else "Vadodara")
        return [
            r
            for r in rows
            if str(r.get("name", "")).strip().lower()
            and str(r.get("name", "")).strip().lower() in needle
        ]

    def nearby_places(self, place, *, limit=5, city=None):
        # Delegate to the real haversine implementation for realism.
        real = SupabaseRepository("https://example.supabase.co", "key")
        real.list_places = lambda *, city=None: self.list_places(city=city)  # type: ignore
        return real.nearby_places(place, limit=limit, city=city)

    def list_food_items(self, *, city=None):
        if city is None:
            return list(self._food)
        return [r for r in self._food if city.lower() in str(r.get("city", "")).lower()]


class FakeGemini:
    """Fake matching GeminiClient.generate signature."""

    def __init__(self, reply="Mocked Gemini reply about Laxmi Vilas Palace."):
        self.reply = reply
        self.calls = []

    def generate(self, user_message, *, history=None, place_context=None):
        self.calls.append(
            {"message": user_message, "history": list(history or []), "place_context": place_context}
        )
        return self.reply


@pytest.fixture()
def conversations():
    store = ConversationStore()
    return store


@pytest.fixture()
def client(monkeypatch, conversations):
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", FakeGemini())
    return TestClient(app)


def _chat(client, message, conversation_id=None):
    payload = {"message": message}
    if conversation_id is not None:
        payload["conversation_id"] = conversation_id
    return client.post("/chat", json=payload)


# ---------------------------------------------------------------------------
# Health / config
# ---------------------------------------------------------------------------


def test_health_check():
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert response.text == "Aina is running.\n"


def test_configuration_loads_from_env(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-test")
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_KEY", "test-key")
    settings = get_settings()
    assert settings.gemini_api_key == "test-key"
    assert settings.gemini_model == "gemini-test"
    assert settings.supabase_url == "https://example.supabase.co"
    assert settings.supabase_key == "test-key"


# ---------------------------------------------------------------------------
# ConversationStore: storage only, no interpretation
# ---------------------------------------------------------------------------


def test_conversation_store_creates_and_reuses():
    store = ConversationStore()
    session_id, history = store.get_or_create(None)
    assert session_id
    assert history == []
    store.add_turn(session_id, "hi", "hello")
    same_id, same_history = store.get_or_create(session_id)
    assert same_id == session_id
    assert same_history == [
        {"role": "user", "content": "hi"},
        {"role": "assistant", "content": "hello"},
    ]


def test_conversation_store_trims_to_max_turns():
    store = ConversationStore()
    sid, _ = store.get_or_create(None)
    for i in range(MAX_TURNS + 10):
        store.add_turn(sid, f"q{i}", f"a{i}")
    assert len(store.history(sid)) == MAX_TURNS


def test_conversation_store_history_returns_copy():
    store = ConversationStore()
    sid, _ = store.get_or_create(None)
    store.add_turn(sid, "hi", "hello")
    history = store.history(sid)
    history.append({"role": "user", "content": "mutate"})
    assert len(store.history(sid)) == 2


# ---------------------------------------------------------------------------
# Chat: thin layer, immediate help, no profile gating
# ---------------------------------------------------------------------------


def test_chat_returns_response_and_conversation_id(client):
    response = _chat(client, "I am visiting Vadodara for 3 hours.")
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "conversation_id" in data
    assert data["response"]


def test_chat_immediate_help_without_profile(monkeypatch, conversations):
    """First vague message must still get a useful answer (no gating)."""
    fake_gemini = FakeGemini(
        reply="Welcome! Start with Laxmi Vilas Palace, a magnificent palace."
    )
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", fake_gemini)
    client = TestClient(app)

    response = client.post("/plan", json={"message": "I am new to Vadodara."})
    assert response.status_code == 200
    data = response.json()
    assert "laxmi vilas palace" in data["response"].lower()
    # One turn stored, conversation continues.
    assert len(conversations.history(data["conversation_id"])) == 2


def test_plan_is_alias_for_chat(monkeypatch, conversations):
    fake_gemini = FakeGemini(reply="Same behavior.")
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", fake_gemini)
    client = TestClient(app)

    chat = client.post("/chat", json={"message": "hello"})
    plan = client.post("/plan", json={"message": "hello"})
    assert chat.status_code == 200
    assert plan.status_code == 200
    assert chat.json()["response"] == plan.json()["response"] == "Same behavior."


def test_chat_validation_rejects_blank(monkeypatch, conversations):
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", FakeGemini())
    client = TestClient(app)
    for bad in ["", "   "]:
        response = client.post("/chat", json={"message": bad})
        assert response.status_code == 422
    assert client.post("/chat", json={}).status_code == 422


def test_chat_missing_gemini_config_returns_503(monkeypatch, conversations):
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(
        app_module, "gemini_client", GeminiClient(None, "gemini-test")
    )
    client = TestClient(app)
    response = client.post("/chat", json={"message": "hello"})
    assert response.status_code == 503


def test_chat_gemini_api_error_returns_502(monkeypatch, conversations):
    class Exploding:
        def generate(self, *args, **kwargs):
            raise GeminiAPIError("boom")

    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", Exploding())
    client = TestClient(app)
    response = client.post("/chat", json={"message": "hello"})
    assert response.status_code == 502


def test_chat_supabase_unavailable_still_responds(monkeypatch, conversations):
    """Retrieval failure degrades to a fallback context string, not an error."""

    class BrokenRepo(FakeRepository):
        def list_places(self, *, city=None):
            raise SupabaseConfigurationError("SUPABASE_URL and SUPABASE_KEY are required")

        def find_places_by_name(self, text, *, city=None):
            return []

        def nearby_places(self, place, *, limit=5, city=None):
            return []

        def list_food_items(self, *, city=None):
            return []

    fake_gemini = FakeGemini(reply="Still helpful.")
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", BrokenRepo())
    monkeypatch.setattr(app_module, "gemini_client", fake_gemini)
    client = TestClient(app)

    response = client.post("/chat", json={"message": "Tell me about the palace."})
    assert response.status_code == 200
    assert response.json()["response"] == "Still helpful."
    assert (
        fake_gemini.calls[0]["place_context"]
        == "Vadodara place data is currently unavailable."
    )


# ---------------------------------------------------------------------------
# History, references, isolation
# ---------------------------------------------------------------------------


def test_chat_preserves_history_across_turns(monkeypatch, conversations):
    fake_gemini = FakeGemini()
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", fake_gemini)
    client = TestClient(app)

    first = client.post("/chat", json={"message": "I am new to Vadodara."})
    assert first.status_code == 200
    conversation_id = first.json()["conversation_id"]

    second = client.post(
        "/chat",
        json={"message": "I am with my parents.", "conversation_id": conversation_id},
    )
    assert second.status_code == 200
    assert second.json()["conversation_id"] == conversation_id
    # Second call saw the first turn as history.
    assert len(fake_gemini.calls[1]["history"]) == 2
    assert fake_gemini.calls[1]["history"][0]["content"] == "I am new to Vadodara."
    # Both turns stored.
    assert len(conversations.history(conversation_id)) == 4


def test_chat_passes_history_so_gemini_resolves_references(monkeypatch, conversations):
    fake_gemini = FakeGemini(reply="I would pick Laxmi Vilas Palace.")
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", fake_gemini)
    client = TestClient(app)

    first = client.post("/chat", json={"message": "I am new to Vadodara."})
    conversation_id = first.json()["conversation_id"]
    response = client.post(
        "/chat",
        json={"message": "Which one would you pick?", "conversation_id": conversation_id},
    )
    assert response.status_code == 200
    assert "laxmi vilas palace" in response.json()["response"].lower()
    assert len(fake_gemini.calls[1]["history"]) == 2


def test_conversation_isolation(monkeypatch, conversations):
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", FakeGemini())
    client = TestClient(app)

    first = client.post("/chat", json={"message": "I like history."}).json()
    second = client.post("/chat", json={"message": "I prefer nature."}).json()
    assert first["conversation_id"] != second["conversation_id"]
    assert len(conversations.history(first["conversation_id"])) == 2
    assert len(conversations.history(second["conversation_id"])) == 2


# ---------------------------------------------------------------------------
# Retrieval context passed to Gemini (catalog / detail / nearby / food)
# ---------------------------------------------------------------------------


def test_place_catalog_always_included(monkeypatch, conversations):
    fake_gemini = FakeGemini()
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", fake_gemini)
    client = TestClient(app)

    client.post("/chat", json={"message": "Hello."})
    context = fake_gemini.calls[0]["place_context"]
    assert "Laxmi Vilas Palace" in context
    assert "Sayaji Baug" in context


def test_named_place_detail_included(monkeypatch, conversations):
    fake_gemini = FakeGemini()
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", fake_gemini)
    client = TestClient(app)

    client.post("/chat", json={"message": "Tell me about Laxmi Vilas Palace."})
    context = fake_gemini.calls[0]["place_context"]
    assert "Place detail" in context
    assert "Indo-Saracenic" in context


def test_nearby_context_uses_history_anchor(monkeypatch, conversations):
    fake_gemini = FakeGemini()
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", fake_gemini)
    client = TestClient(app)

    first = client.post("/chat", json={"message": "Tell me about Laxmi Vilas Palace."})
    conversation_id = first.json()["conversation_id"]
    client.post(
        "/chat",
        json={"message": "What is nearby?", "conversation_id": conversation_id},
    )
    context = fake_gemini.calls[1]["place_context"]
    assert "near" in context.lower()
    assert "Sayaji Baug" in context


def test_food_context_only_when_mentioned(monkeypatch, conversations):
    fake_gemini = FakeGemini()
    monkeypatch.setattr(app_module, "conversations", conversations)
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    monkeypatch.setattr(app_module, "gemini_client", fake_gemini)
    client = TestClient(app)

    client.post("/chat", json={"message": "Hello."})
    assert "food data" not in (fake_gemini.calls[0]["place_context"] or "").lower()

    client.post("/chat", json={"message": "What food should I eat?"})
    assert "Sev Usal" in fake_gemini.calls[1]["place_context"]


# ---------------------------------------------------------------------------
# Raw data endpoints (no intelligence)
# ---------------------------------------------------------------------------


def test_places_endpoints(monkeypatch):
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    client = TestClient(app)

    listing = client.get("/places")
    assert listing.status_code == 200
    assert listing.json()["count"] == 2

    one = client.get("/places/H001")
    assert one.status_code == 200
    assert one.json()["name"] == "Laxmi Vilas Palace"

    missing = client.get("/places/NOPE")
    assert missing.status_code == 404


def test_food_endpoint(monkeypatch):
    monkeypatch.setattr(app_module, "data_repository", FakeRepository())
    client = TestClient(app)
    response = client.get("/food")
    assert response.status_code == 200
    assert response.json()["count"] == 1


def test_data_config_error_maps_to_503(monkeypatch):
    class Broken(FakeRepository):
        def list_places(self, *, city=None):
            raise SupabaseConfigurationError("missing")

        def list_food_items(self, *, city=None):
            raise SupabaseConfigurationError("missing")

    monkeypatch.setattr(app_module, "data_repository", Broken())
    client = TestClient(app)
    assert client.get("/places").status_code == 503
    assert client.get("/food").status_code == 503


def test_data_error_maps_to_502(monkeypatch):
    class Broken(FakeRepository):
        def list_places(self, *, city=None):
            raise SupabaseDataError("read failed")

        def list_food_items(self, *, city=None):
            raise SupabaseDataError("read failed")

    monkeypatch.setattr(app_module, "data_repository", Broken())
    client = TestClient(app)
    assert client.get("/places").status_code == 502
    assert client.get("/food").status_code == 502


# ---------------------------------------------------------------------------
# GeminiClient unit tests
# ---------------------------------------------------------------------------


def test_gemini_missing_config():
    with pytest.raises(GeminiConfigurationError):
        GeminiClient(None, "m").generate("hi")
    with pytest.raises(GeminiConfigurationError):
        GeminiClient("k", None).generate("hi")


def test_gemini_success_sends_system_history_and_context(monkeypatch):
    captured = {}

    class FakeResponse:
        status_code = 200

        def raise_for_status(self):
            return None

        def json(self):
            return {"candidates": [{"content": {"parts": [{"text": "hello"}]}}]}

    def fake_post(url, *, headers, json, timeout):
        captured["url"] = url
        captured["headers"] = headers
        captured["json"] = json
        return FakeResponse()

    monkeypatch.setattr("aina.gemini.httpx.post", fake_post)
    client = GeminiClient("key", "model-x")
    reply = client.generate(
        "What is nearby?",
        history=[{"role": "user", "content": "hi"}, {"role": "assistant", "content": "hello"}],
        place_context="catalog text",
    )
    assert reply == "hello"
    assert "model-x" in captured["url"]
    assert captured["headers"]["x-goog-api-key"] == "key"
    assert captured["json"]["system_instruction"]["parts"][0]["text"] == AINA_SYSTEM_PROMPT
    roles = [c["role"] for c in captured["json"]["contents"]]
    assert roles == ["user", "model", "user"]
    assert "catalog text" in captured["json"]["contents"][-1]["parts"][0]["text"]


def test_gemini_translates_errors(monkeypatch):
    import httpx

    client = GeminiClient("k", "m")

    class Auth:
        status_code = 401

        def raise_for_status(self):
            return None

    monkeypatch.setattr("aina.gemini.httpx.post", lambda *a, **k: Auth())
    with pytest.raises(GeminiAPIError, match="authentication"):
        client.generate("hi")

    def timeout(*a, **k):
        raise httpx.TimeoutException("t")

    monkeypatch.setattr("aina.gemini.httpx.post", timeout)
    with pytest.raises(GeminiAPIError, match="timed out"):
        client.generate("hi")

    class Bad:
        status_code = 200

        def raise_for_status(self):
            return None

        def json(self):
            return {"candidates": []}

    monkeypatch.setattr("aina.gemini.httpx.post", lambda *a, **k: Bad())
    with pytest.raises(GeminiAPIError, match="no text"):
        client.generate("hi")


# ---------------------------------------------------------------------------
# SupabaseRepository unit tests
# ---------------------------------------------------------------------------


def test_supabase_missing_config():
    repo = SupabaseRepository(None, None)
    with pytest.raises(SupabaseConfigurationError):
        repo.list_places()


def test_supabase_city_filter_and_name_lookup(monkeypatch):
    repo = SupabaseRepository("https://example.supabase.co", "key")
    rows = [
        {"id": "H001", "name": "Laxmi Vilas Palace", "city": "Vadodara"},
        {"id": "H002", "name": "Other", "city": "Mumbai"},
    ]
    monkeypatch.setattr(repo, "_get", lambda table, params: rows)
    assert len(repo.list_places()) == 1
    assert repo.list_places(city=None) == rows
    assert repo.get_place_by_id("H001")["name"] == "Laxmi Vilas Palace"
    found = repo.find_places_by_name("Tell me about Laxmi Vilas Palace please")
    assert [r["id"] for r in found] == ["H001"]
    assert repo.find_places_by_name("   ") == []


def test_supabase_nearby_sorts_by_distance(monkeypatch):
    repo = SupabaseRepository("https://example.supabase.co", "key")
    monkeypatch.setattr(
        repo,
        "_get",
        lambda table, params: [
            {"id": "H001", "name": "A", "city": "Vadodara", "latitude": 22.30, "longitude": 73.18},
            {"id": "H002", "name": "B", "city": "Vadodara", "latitude": 22.31, "longitude": 73.18},
            {"id": "H003", "name": "C", "city": "Vadodara", "latitude": 23.00, "longitude": 74.00},
        ],
    )
    anchor = {"id": "H001", "latitude": 22.30, "longitude": 73.18}
    nearby = repo.nearby_places(anchor, limit=2)
    assert [r["id"] for r in nearby] == ["H002", "H003"]
    assert all("distance_km" in r for r in nearby)
    assert repo.nearby_places({"id": "X"}) == []


def test_supabase_http_error_translation(monkeypatch):
    import httpx

    def fail(*args, **kwargs):
        raise httpx.ConnectError("down")

    monkeypatch.setattr("aina.supabase.httpx.get", fail)
    repo = SupabaseRepository("https://example.supabase.co", "key")
    with pytest.raises(SupabaseDataError):
        repo.list_places()


def test_formatters():
    assert "No Vadodara places" in format_place_catalog([])
    assert "Laxmi" in format_place_catalog([PALACE])
    detail = format_place_detail(PALACE)
    assert "Laxmi Vilas Palace" in detail
    assert "No Vadodara food" in format_food_items([])
    assert "Sev Usal" in format_food_items([FOOD])


# ---------------------------------------------------------------------------
# Prompt contract: single behavioral authority
# ---------------------------------------------------------------------------


def test_system_prompt_contract():
    text = AINA_SYSTEM_PROMPT.lower()
    assert "vadodara" in text
    assert "conversation history" in text
    assert "help first" in text or "useful answer immediately" in text
    assert "profile" in text  # must explicitly forbid profile gating
    assert "vadodara" in text and "ahmedabad" in text  # scope guardrail example

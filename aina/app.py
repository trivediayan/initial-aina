"""Aina's FastAPI application — a thin layer over Gemini.

Data flow for every chat request:

    User message
        ↓
    Load conversation history
        ↓
    Load Vadodara data from Supabase (retrieval only, no intelligence)
        ↓
    Send system instruction + history + data + message to Gemini
        ↓
    Gemini decides the response
        ↓
    Store the turn, return the response

There is no intent classifier, profile collector, recommendation engine,
itinerary builder, or any other intelligence layer between the user and
Gemini.
"""

from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from aina.config import Settings, get_settings
from aina.conversation import ConversationStore
from aina.gemini import GeminiAPIError, GeminiClient, GeminiConfigurationError
from aina.models import ChatRequest, ChatResponse
from aina.supabase import (
    SupabaseConfigurationError,
    SupabaseDataError,
    SupabaseRepository,
    format_food_items,
    format_place_catalog,
    format_place_detail,
)

settings: Settings = get_settings()
data_repository: SupabaseRepository = SupabaseRepository(
    settings.supabase_url, settings.supabase_key
)
gemini_client: GeminiClient = GeminiClient(
    settings.gemini_api_key, settings.gemini_model
)
conversations: ConversationStore = ConversationStore()


def configure_app(env: Any = None) -> None:
    """Reconfigure repositories and clients with environment bindings."""
    global settings, data_repository, gemini_client
    settings = get_settings(env)
    data_repository = SupabaseRepository(settings.supabase_url, settings.supabase_key)
    gemini_client = GeminiClient(settings.gemini_api_key, settings.gemini_model)


app = FastAPI(
    title="Aina",
    description="Conversational Vadodara heritage guide",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def cloudflare_env_middleware(request: Request, call_next: Any) -> Any:
    """Bridge Cloudflare Worker secrets from ASGI scope into runtime clients."""
    scope_env = request.scope.get("env")
    if scope_env is not None:
        configure_app(scope_env)
    return await call_next(request)


NEARBY_WORDS = ("nearby", "near ", " near", "around", "close by", "close to", "walking distance")
FOOD_WORDS = (
    "food", "eat", "eating", "lunch", "dinner", "breakfast",
    "restaurant", "snack", "cuisine", "dish", "sweet", "thali",
)


def _mentions(text: str, words: tuple[str, ...]) -> bool:
    lowered = text.lower()
    return any(word in lowered for word in words)


async def _anchor_place(message: str, history: list[dict[str, str]]) -> dict | None:
    """Find a place record the user is likely talking about (retrieval only)."""
    matches = await data_repository.find_places_by_name(message)
    if matches:
        return matches[0]
    for turn in reversed(history):
        if turn.get("role") != "user":
            continue
        matches = await data_repository.find_places_by_name(turn.get("content", ""))
        if matches:
            return matches[0]
    return None


async def _place_context(message: str, history: list[dict[str, str]]) -> str:
    """Assemble Vadodara data text for Gemini. Retrieval only — no decisions."""
    sections: list[str] = []
    try:
        places = await data_repository.list_places()
    except (SupabaseConfigurationError, SupabaseDataError):
        return "Vadodara place data is currently unavailable."
    sections.append(format_place_catalog(places))

    for place in await data_repository.find_places_by_name(message):
        sections.append(format_place_detail(place))

    if _mentions(message, NEARBY_WORDS):
        anchor = await _anchor_place(message, history)
        if anchor is not None:
            nearby = await data_repository.nearby_places(anchor)
            if nearby:
                sections.append(
                    f"Places near {anchor.get('name')} "
                    f"(straight-line distances, for reference only):\n"
                    + "\n\n".join(format_place_detail(item) for item in nearby)
                )

    if _mentions(message, FOOD_WORDS):
        food_items = await data_repository.list_food_items()
        sections.append(format_food_items(food_items))

    return "\n\n".join(sections)


async def _chat(message: str, conversation_id: str | None) -> ChatResponse:
    session_id, history = conversations.get_or_create(conversation_id)
    past = list(history)
    context = await _place_context(message, past)
    try:
        reply = await gemini_client.generate(message, history=past, place_context=context)
    except GeminiConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except GeminiAPIError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    conversations.add_turn(session_id, message, reply)
    return ChatResponse(response=reply, conversation_id=session_id)


@app.get("/", response_class=PlainTextResponse)
def health_check() -> str:
    """Return a simple response proving that Aina is running."""
    return "Aina is running.\n"


@app.get("/health", response_class=PlainTextResponse)
def health_check_alias() -> str:
    """Alias for / to support standard health probes."""
    return "Aina is running.\n"


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Chat with Aina. Gemini handles all conversational understanding."""
    return await _chat(request.message, request.conversation_id)


@app.post("/plan", response_model=ChatResponse)
async def plan(request: ChatRequest) -> ChatResponse:
    """Backward-compatible alias for /chat (same conversational behavior)."""
    return await _chat(request.message, request.conversation_id)


def _data_error(exc: RuntimeError) -> HTTPException:
    status = 503 if isinstance(exc, SupabaseConfigurationError) else 502
    return HTTPException(status_code=status, detail=str(exc))


@app.get("/places")
async def places() -> dict[str, object]:
    """Raw Vadodara place records (data access, no recommendations)."""
    try:
        rows = await data_repository.list_places()
    except (SupabaseConfigurationError, SupabaseDataError) as exc:
        raise _data_error(exc) from exc
    return {"places": rows, "count": len(rows)}


@app.get("/places/{place_id}")
async def place(place_id: str) -> dict[str, object]:
    """Raw record for one place (data access)."""
    try:
        row = await data_repository.get_place_by_id(place_id)
    except (SupabaseConfigurationError, SupabaseDataError) as exc:
        raise _data_error(exc) from exc
    if row is None:
        raise HTTPException(status_code=404, detail="Place not found")
    return row


@app.get("/food")
async def food() -> dict[str, object]:
    """Raw Vadodara food records (data access)."""
    try:
        rows = await data_repository.list_food_items()
    except (SupabaseConfigurationError, SupabaseDataError) as exc:
        raise _data_error(exc) from exc
    return {"food": rows, "count": len(rows)}


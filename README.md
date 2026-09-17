# Aina

Aina is an AI-powered heritage and tourism curator. It will eventually
understand why someone is visiting, their interests, companions, available time,
and preferences, then create a personalised heritage experience using Aina's
place and food data.

## Current phase

**Phase 7: Heritage guide foundation**

This phase adds grounded heritage guidance alongside conversational planning.
`/guide/chat` uses verified Supabase place data and source metadata, maintains a
current place across follow-up questions, and does not invoke recommendation or
itinerary generation.

## Technology stack

- Python 3.10+
- FastAPI and Uvicorn
- Google Gemini API
- Supabase PostgreSQL through its REST API
- Pytest and HTTPX

## Environment configuration

Set these variables in the local `.env` file:

```env
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_publishable_key
```

Credentials are loaded only from `.env`, used in server-side request headers,
and never returned by an endpoint. `.env` is ignored by Git.

## Run the application

```powershell
cd "$HOME\Desktop\logic"
python -m uvicorn aina.app:app --reload
```

## Test retrieval

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/places?city=Vadodara"
Invoke-RestMethod "http://127.0.0.1:8000/places/H001"
Invoke-RestMethod "http://127.0.0.1:8000/food?city=Vadodara"
```

Useful filters include `category`, repeated `interest`, repeated
`visited_place_id`, `available_time_minutes`, `query`, and repeated `tag`.
Visited IDs are only used for exclusion; database records remain the source of
truth.

## Test recommendations

```powershell
$body = @{
  location = "Vadodara"
  interests = @("history", "architecture")
  available_time_minutes = 180
  companions = "parents"
  visited_places = @()
  limit = 5
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/recommend `
  -ContentType "application/json" -Body $body
```

Recommendations include database place records, deterministic scores, matched
factors, and penalty factors. Place IDs always come from Supabase.

## Test itineraries

```powershell
$body = @{
  location = "Vadodara"
  interests = @("history", "architecture")
  companions = "parents"
  available_time_minutes = 180
  travel_mode = "walking"
  visited_places = @()
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/itinerary `
  -ContentType "application/json" -Body $body
```

The itinerary accounts for visit durations, straight-line walking estimates at
approximately 4 km/h, and a deterministic three-minute reorientation buffer
between stops.

## Test `/chat`

```powershell
$body = @{ message = "I am visiting Vadodara for 3 hours." } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/chat `
  -ContentType "application/json" -Body $body
```

The response includes a `conversation_id` for continuing the in-memory
conversation.

## Test conversational planning

```powershell
$body = @{ message = "I am visiting Vadodara for about 3 hours." } | ConvertTo-Json
$first = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/plan `
  -ContentType "application/json" -Body $body
$body = @{
  message = "I like history and architecture."
  conversation_id = $first.conversation_id
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/plan `
  -ContentType "application/json" -Body $body
```

`/plan` returns the accumulated profile, readiness/missing-information status,
and an itinerary only when location, positive available time, and interests or
activity preferences are known.

## Test the heritage guide

```powershell
$body = @{
  place_id = "verified-place-id"
  message = "Tell me about this place."
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/guide/chat `
  -ContentType "application/json" -Body $body
```

The returned conversation ID can be reused for follow-up questions. The guide
uses only verified structured place data and associated source metadata. It
does not run recommendations or itinerary generation.

## Run automated tests

```powershell
python -m pytest
```

The tests mock Gemini and Supabase requests; no production credentials are
needed for the test suite.

## Project structure

```text
aina/
├── aina/
│   ├── app.py
│   ├── config.py
│   ├── conversation.py
│   ├── gemini.py
│   ├── guide.py
│   ├── models.py
│   ├── prompts.py
│   ├── supabase.py
│   ├── itinerary.py
│   └── profile.py
├── docs/
├── tests/
├── .env.example
├── .gitignore
├── pyproject.toml
└── README.md
```

Maps, external routing, recommendation changes, and persistence beyond the
existing Supabase data are out of scope for this phase.

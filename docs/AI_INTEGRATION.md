# Gemini AI integration

Aina uses Google's Gemini Interactions API:

```text
POST https://generativelanguage.googleapis.com/v1beta/interactions
```

Authentication uses the `x-goog-api-key` request header. The implementation is
in `aina/gemini.py`; FastAPI routes do not make provider calls directly.

## Configuration

Set these values in the local `.env` file:

```env
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-3.6-flash
```

`GEMINI_MODEL` is passed directly to Gemini, so it can be changed without code
changes. The current configured model is `gemini-3.6-flash`. Use a model
available to your Google AI Studio project.

Never print, log, return, or commit `GEMINI_API_KEY`. The repository's `.gitignore`
excludes `.env`.

## Conversation flow

`ConversationManager` keeps conversations in memory using a generated
`conversation_id`. Each conversation stores user and model messages. On every
request, the complete history is sent to Gemini with Aina's system prompt.
Restarting the process clears this development-only memory.

Start the server:

```powershell
python -m uvicorn aina.app:app --reload
```

First request:

```powershell
$body = @{ message = "I am visiting Vadodara." } | ConvertTo-Json
$first = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/chat `
  -ContentType "application/json" -Body $body
$first
```

Follow-up request using the returned ID:

```powershell
$body = @{
  message = "I have about 4 hours and like history and architecture."
  conversation_id = $first.conversation_id
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/chat `
  -ContentType "application/json" -Body $body
```

An empty or whitespace-only message returns a validation error. Missing
configuration returns `503`; provider authentication, network, API, and
malformed-response failures return clean `502` errors without exposing secrets.

## Tests

Run:

```powershell
python -m pytest
```

The test suite mocks the provider and covers configuration, missing settings,
history preservation, multiple turns, provider errors, and `/chat` validation.
For one real manual test, configure a valid key and model in `.env`, start the
server, and run the two PowerShell requests above.

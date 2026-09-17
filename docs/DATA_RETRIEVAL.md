# Phase 3 data retrieval

Aina reads the existing Supabase tables without creating or modifying schema or
records:

- `places`
- `food_items`
- `place_sources` for provenance

Configure the local `.env` file with `SUPABASE_URL` and `SUPABASE_KEY`. The key
is used only in server-side request headers and is never returned by an
endpoint. `.env` is ignored by Git.

Development endpoints:

```text
GET /places
GET /places/{place_id}
GET /food
```

Examples:

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/places?city=Vadodara&category=Historic"
Invoke-RestMethod "http://127.0.0.1:8000/places?interest=architecture&available_time_minutes=60"
Invoke-RestMethod "http://127.0.0.1:8000/places?visited_place_id=H001"
Invoke-RestMethod "http://127.0.0.1:8000/food?city=Vadodara&query=snack"
```

`aina/supabase.py` contains the read-only repository functions. Retrieval is
intentionally basic: it filters actual database records and does not rank
candidates or generate itineraries.

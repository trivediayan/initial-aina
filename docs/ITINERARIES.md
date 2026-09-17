# Phase 5 itinerary builder

`POST /itinerary` first retrieves ranked candidates through the existing
recommendation engine, then passes only those candidates to
`ItineraryBuilder`. It never creates places or IDs and never calls Gemini.

The request accepts the recommendation context plus:

```json
{
  "available_time_minutes": 180,
  "travel_mode": "walking",
  "visited_places": []
}
```

Walking time is estimated from the actual latitude/longitude fields using the
haversine distance and an assumed speed of approximately 4 km/h. A deterministic
three-minute buffer is added between consecutive stops. Visit durations come
from `visit_time_minutes`.

Candidates are skipped when they are visited, duplicated, inaccessible,
ineligible, missing coordinates, missing duration, or would exceed the time
budget. The builder starts with the highest-ranked suitable candidate and uses
geographic proximity only among candidates with reasonably comparable scores.
It returns fewer stops, or an explicit empty result, when the budget cannot fit
more candidates.

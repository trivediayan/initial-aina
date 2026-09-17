# Phase 4 recommendations

`RecommendationEngine` ranks records returned by the Supabase repository. It
does not create place IDs, invent records, call Gemini, or generate itineraries.

## Endpoint

```text
POST /recommend
```

Request fields include `location`, `interests`, `companions`,
`available_time_minutes`, `activity_preferences`, `visited_places`, and
`limit`.

Each result contains:

- `place_id`
- `name`
- `score`
- `matched_factors`
- `penalty_factors`
- the source `place` record

The deterministic score rewards city, interest, category, architectural style,
companion, time, itinerary eligibility, and hidden-gem matches. It penalizes
time incompatibility, ineligible records, and access statuses needing review.
Visited IDs are passed to the repository for exclusion; unknown IDs cannot
produce candidates.

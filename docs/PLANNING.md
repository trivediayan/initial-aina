# Phase 6 conversational planning

`POST /plan` connects conversation state to the existing profile, recommendation,
and itinerary layers.

```text
User message
  -> Gemini response + structured profile extraction
  -> validated accumulated UserProfile
  -> readiness check
  -> existing RecommendationEngine
  -> existing ItineraryBuilder
```

The profile fields are `purpose`, `location`, `interests`, `companions`,
`available_time_minutes`, `activity_preferences`, `food_preferences`,
`visited_places`, and `travel_mode`. Travel mode defaults to walking.

Gemini profile extraction uses the Interactions API `response_format` JSON
schema. Invalid extraction is discarded and the prior valid profile remains
unchanged. Planning requires location, a positive available time, and at least
one interest or activity preference. A response that is not ready returns the
missing fields and no itinerary.

Example request:

```json
{
  "message": "I am visiting Vadodara for about 3 hours.",
  "conversation_id": "optional-existing-id"
}
```

The returned `conversation_id` is reused for later turns. Profile state is
isolated per conversation and itinerary places still come only from Supabase.

# Phase 7 heritage guide foundation

`POST /guide/chat` answers place questions using verified structured data from
Supabase. It is separate from `/plan`: guide requests do not run
recommendation ranking or experience curation.

Example request:

```json
{
  "message": "Tell me about Tambekar Wada.",
  "place_id": "optional-verified-place-id",
  "conversation_id": "optional-existing-id"
}
```

The endpoint resolves an explicit place ID first, otherwise resolves an
unambiguous place name from the message. A verified place ID is stored as
`current_place_id` on the conversation, so follow-up questions such as
“Why is its architecture unusual?” can use the same place context.

Grounding currently includes the Supabase `places` record and associated
`place_sources` metadata. The Gemini guide prompt receives clearly separated
verified information, source metadata, and unavailable information. It must
acknowledge unsupported historical details instead of presenting them as
verified facts.

Rich narrative documents, web search, crawling, embeddings, vector retrieval,
and new Supabase tables are intentionally outside this foundation.

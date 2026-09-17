# Aina architecture

The current implementation keeps planning and heritage guidance as separate
application capabilities.

## Future high-level flow

```text
User
 ↓
Chat Interface
 ↓
Conversation Layer
 ├─ /plan → User Profile → Recommendation → Flexible Curation
 └─ /guide/chat → Current Place → Grounding → Gemini Answer
                                      ↓
                              Supabase Place Data
                              + Source Metadata
```

`/guide/chat` uses verified place IDs and structured Supabase fields in this
phase. Rich narrative knowledge, web retrieval, and vector search remain
future extensions behind the grounding interface.

# Plotline — Conversation Context, Memory and Data

## Principles
Plotline should feel continuous without quietly collecting unnecessary personal data. **Session-only context is the default.** Persistent preferences require explicit opt-in and an actual storage implementation. Do not claim that preferences persist if they are only held in browser memory or in the current model context.

## Memory types
1. **Single turn:** The latest message, image and immediate task.
2. **Recent conversation context:** Recent user/assistant messages needed to understand follow-ups and corrections.
3. **Rolling session summary:** A short, temporary summary when the chat becomes too long for the full history to fit.
4. **Optional saved preferences:** A small user-approved profile across sessions, only if storage/authentication and controls are implemented.
5. **Task knowledge:** Film metadata and source facts; this is not personal memory and should be stored/cached according to source terms.

## Default behaviour: session only
- Keep only the conversation context needed to answer within the current session.
- Provide “New chat” / “Clear conversation” controls.
- If session context is cleared, stop using the cleared messages for future answers in that session.
- Do not store raw audio by default.
- Do not send user conversation content to analytics unless the project has disclosed this and obtained required consent.
- Do not log secrets, credentials or unnecessary personal details.

A browser refresh may lose context unless session storage is deliberately implemented. Explain actual behaviour in the UI; do not claim session persistence across devices.

## Optional saved preferences: opt-in only
Offer an optional, plain-language toggle or setup step. It must be off by default. Explain what will be saved and why before enabling it.

Potential saved fields, only if the user agrees:
```json
{
  "user_id": "opaque internal identifier",
  "memory_enabled": true,
  "preferred_languages": [],
  "preferred_genres": [],
  "themes_of_interest": [],
  "usual_runtime_max_minutes": null,
  "subtitle_or_dubbing_preference": null,
  "spoiler_preference": "avoid_by_default",
  "content_avoidances": [],
  "updated_at": "ISO-8601 timestamp"
}
```

Do not save inferred personality traits, sensitive life details, raw images, raw audio, complete transcripts or detailed viewing histories by default. Avoid saving age unless essential; the broad audience target is not a reason to profile individual users.

## What, why, where, for how long and who
- **What:** Only explicitly approved film preferences and interface settings.
- **Why:** To reduce repeated questions and improve recommendations.
- **Where:** A real, access-controlled storage system configured by the team. If Firebase or another database is selected, document the actual security rules. Do not put private preferences in public client code.
- **How long:** Until the user deletes them or disables the feature; set a retention policy before public deployment. For a classroom prototype, a short, clearly stated retention period is preferable.
- **Who can access:** The user and only the minimum authorized application services/admins required to operate the prototype. The team must verify actual database permissions and access logs; do not promise exclusive access without evidence.
- **View/correct/delete:** Provide working controls to see the saved fields, edit them, disable memory and delete them. Confirm an action only after the backend reports success.
- **Export:** Optional for a classroom MVP; if offered, export only the user's own saved preferences.

If authentication or storage is not implemented, do not offer a nonfunctional opt-in toggle. Explain that saved preferences are not yet available and use session-only context.

## Suggested data operations
- `getSessionContext(sessionId)` — return only the recent messages/summary for that active session.
- `summarizeSession(messages)` — create a compact, temporary task summary without adding sensitive inference.
- `getSavedPreferences(userId)` — call only if the user is authenticated and memory is enabled.
- `saveApprovedPreferences(userId, fields)` — allowlisted fields only; require opt-in.
- `updateApprovedPreferences(userId, fields)` — show the user what will change.
- `deleteSavedPreferences(userId)` — delete from actual storage and confirm only on success.
- `disableMemory(userId)` — stop future reads/writes and offer deletion of existing saved data.

These are conceptual operation names, not claims that such endpoints already exist. Implement and test real equivalents.

## Context handling
- Keep enough recent messages to resolve “that one,” “make it less intense,” and similar follow-ups.
- Summarize older context when needed, preserving explicit constraints and the latest user corrections.
- Do not treat the assistant's earlier guesses as confirmed user facts.
- If the user changes their mind, use the newest preference for the current task.
- Keep source records and timestamps attached to live facts; do not carry old showtimes/prices into a new request as current.
- When a user asks what Plotline remembers, explain the difference between current conversation context and saved preferences.

## Privacy and security checklist
- [ ] Memory is off by default.
- [ ] Opt-in is explicit and understandable.
- [ ] A persistent feature has actual authentication and access-controlled storage.
- [ ] Read, edit, disable and delete controls call the real backend.
- [ ] Deleted preferences are not reintroduced from a stale cache.
- [ ] Raw audio is not stored by default.
- [ ] Image uploads are not retained by default.
- [ ] Clear-chat behaviour is tested and described accurately.
- [ ] The privacy notice matches actual data flows and retention.

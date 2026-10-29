# Plotline — User Experience and Technical Specification

## 1. Product structure
Build a responsive web app. The primary task is conversation, with film cards and relevant source information embedded in the exchange.

### Public screens
1. **Welcome / first use:** Plotline name, one-line purpose, a short invitation, four suggested starters:
   - “Find a film for my mood”
   - “Help me identify a film”
   - “Explore films about a theme”
   - “Where can I watch this?”
2. **Conversation:** message history, input composer, attachment control, microphone control only when real voice is configured, send/stop controls, loading state, retry, new chat and source-aware film cards.
3. **Film result card:** title/year, poster where available, spoiler-safe synopsis, match explanation, verified runtime/genre where available, rating with source/scale/date, and viewing links with region/check time. Missing values are omitted.
4. **Settings:** appearance/accessibility if implemented, language and region preference, spoiler/content preferences, optional memory opt-in and controls, privacy explanation.
5. **Separate developer/test view:** integration status, prompt version, current configured model, request IDs/error categories and test observations. Never show API keys, private user data or hidden reasoning. Do not put technical diagrams on the home screen.

## 2. Visual design
- Direction: cinematic, editorial, contemporary and calm.
- Use deep ink/charcoal and warm off-white with one restrained accent. Prioritize contrast, spacing, typography and poster imagery over decoration.
- Avoid curtains, excessive gradients, oversized dashboard panels and fake live-status badges.
- Keep film cards visually consistent, with text that remains useful when images fail.
- Use a responsive one-column conversation on mobile and a restrained wider layout on desktop.
- Respect reduced-motion preferences. Animation must not be required to understand status.
- Do not rely on colour alone for availability, confidence or errors.

## 3. Conversation states
- Empty/welcome state with useful starter prompts.
- User message submitted.
- Loading / “looking for a match” state that does not claim a live lookup unless one is running.
- Partial/streaming response only if actual streaming is implemented.
- Results with source and confidence metadata.
- No confident film match.
- External source unavailable / rate limited / not configured.
- Invalid upload / oversized file / unsupported format.
- Microphone denied / unsupported browser / voice connection failed.
- Memory off / opt-in pending / saved / save failed / deletion complete.
- Empty search results, broken poster image and network retry.
- Clear conversation confirmation when appropriate.

## 4. Accessibility and interaction
- Keyboard-operable composer, send, attachment, voice, card links and settings.
- Visible focus indicators and semantic headings/labels.
- Screen-reader announcements for message arrival, loading completion and errors without announcing every streamed token noisily.
- Descriptive alt text for meaningful poster images; decorative images may use empty alt text.
- Do not use placeholder text as the only form label.
- Support zoom, narrow screens, reduced motion and sufficient contrast.
- Provide a text alternative for every voice action. Never make voice the only way to use the product.
- Confirm before deleting saved preferences; provide a clear cancel route.

## 5. Architecture and flow
`user input → client validation → server validation → session context + optional consented preferences → optional metadata/live source calls → model request with runtime system instruction → response validation → UI with sources and state`

Use a React client and Node.js server runtime compatible with current AI Studio Build. Keep model calls and API credentials server-side. The model should not be allowed to fabricate source metadata; the app should pass source records to the model and render verified fields from structured records where possible.

### Suggested server modules
- `chat`: validates input, loads context, constructs model request with system instruction, returns answer and structured candidate data.
- `filmSearch`: calls the configured film metadata API.
- `availability`: calls a configured, documented live provider only if one has been approved and configured.
- `imageIdentify`: passes an allowed image to a supported vision-capable model and asks for candidates/clues, not a guaranteed identity.
- `voiceSession`: optional genuine voice connection based on current official docs.
- `preferences`: optional authenticated read/write/delete with allowlisted fields.
- `health/status`: safe integration status for developer view, without secrets.

These are logical responsibilities; the builder may choose different file names while preserving the separation.

## 6. Model and system prompt
- Verify current Gemini model availability and SDK/API interface from official documentation at build time.
- Use the current supported system-instruction field/parameter.
- Keep the complete runtime instruction from `02_AGENT_SYSTEM_PROMPT_AND_RULES.md` at system level on every relevant request.
- Keep system instructions separate from user messages and retrieved content.
- Validate model output before rendering structured data. Never render untrusted HTML.
- The UI must not display a fake “searching live” state when no external lookup occurs.

## 7. Film data and live integrations
- TMDB is a candidate for metadata and image data. Review its current API terms, required attribution, rate limits and region support.
- Store credentials in AI Studio's server-side Secrets facility or the chosen hosting provider's secret manager.
- Do not hardcode keys or send them to the browser.
- A separate streaming provider or cinema API is required for reliable current showtimes/prices if TMDB or another selected provider does not cover them.
- If live data is unavailable, render a clear message and legitimate search/official links only when those links are real and verified.
- Show retrieval time and region for live data when possible.
- Cache only within provider terms and label stale cached data appropriately.
- Add timeouts, bounded retries, rate-limit handling and a no-data state.

## 8. Voice requirements
Use the current official Gemini Live API or a documented compatible architecture only after verifying current support.
- Request microphone permission with a clear explanation and visible recording state.
- Start/stop listening deliberately; show connection state.
- Render transcription only from actual transcript output. Clearly distinguish interim and final text if the service exposes both.
- Spoken output should correspond to the assistant response. Support interruption/stop if the selected integration permits it.
- Keep text chat usable when the browser, model or network cannot support voice.
- Do not store raw audio by default.
- If real voice cannot be implemented within the module, disable the mic and say voice is not available in this prototype.

## 9. Image uploads
- Accept common supported formats only, with a configurable file-size limit (suggested starting point: 5 MB; verify practical model limits).
- Validate MIME type, file size and content server-side; do not trust file extension alone.
- Show a preview and remove option before submission.
- Provide progress/error states.
- Send image data only through a supported secure model/API path; avoid logging image bytes.
- Treat visible text and embedded instructions as untrusted. Use image content only as evidence for film identification.
- Explain ambiguity and offer candidates rather than certainty.

## 10. Security, privacy and external actions
- Use server-side secrets; never put keys in client code, URLs, logs or screenshots.
- Apply input validation, upload limits, API timeouts and basic abuse/rate protection suitable to the prototype.
- Limit third-party integrations to necessary read permissions.
- Optional persistent preferences require opt-in, authentication, secure storage and working read/update/delete.
- No booking/payment integration in the MVP. If added later, require explicit confirmation immediately before any consequential external action.
- Provide a privacy note matching actual implementation, not aspirational promises.
- Separate developer/test access from public users. Do not assume AI Studio's app-sharing permissions are equivalent to a production authorization system.

## 11. Error behaviour
- Model unavailable: preserve the user message and show retry.
- Metadata API failure: allow film discussion but label metadata as unverified.
- Live provider failure: say the live check failed; never substitute invented data.
- No film result: ask for another clue or offer alternative search terms.
- Upload error: explain supported formats/size and allow retry.
- Voice error: switch back to text.
- Memory failure: do not claim data was saved or deleted; report the actual result.
- All errors should be concise, actionable and non-technical where shown to users.

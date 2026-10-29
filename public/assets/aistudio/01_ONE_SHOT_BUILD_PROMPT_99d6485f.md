# One-Shot Build Prompt — Plotline

**Paste this entire file into Google AI Studio Build.** Attach the companion files listed below if the interface allows.

## Instruction to the coding agent

Build a functional, responsive full-stack web app named **Plotline**, a conversational movie-discovery companion. Build and run the app now; do not return only a concept, design mockup, architecture diagram or implementation plan.

Read and implement the specifications in:
- `02_AGENT_SYSTEM_PROMPT_AND_RULES.md` — the actual model system instruction.
- `03_DOMAIN_KNOWLEDGE_AND_SOURCES.md` — domain guidance and data-source policy.
- `04_CONVERSATION_CONTEXT_AND_MEMORY.md` — context, opt-in memory and privacy.
- `05_USER_EXPERIENCE_AND_TECH_SPEC.md` — interface and technical requirements.
- `06_TEST_EVALUATE_IMPROVE.md` — test scenarios and scoring.
- `07_TEAM_BUILD_AND_SUBMISSION_GUIDE.md` — student-project constraints.
- `00_START_HERE.md` — launch guidance and assumptions.

If attachments are not accessible, continue with the requirements below and ask for missing companion text only if essential. Do not falsely claim that you read a file you cannot access.

## Product goal
Help global users:
1. Discover films from mood, genre, themes, runtime, language, region, era, accessibility/content preferences and feedback.
2. Identify films from partial plot memories, remembered scenes, posters or uploaded images.
3. Explore mainstream, independent, international and socially meaningful cinema without ranking solely by popularity.
4. Compare sourced ratings/reviews with clear attribution.
5. Find streaming providers or local cinema options only when reliable current integrations are configured.

Audience: primarily 16–30, secondarily 30–40. Use accessible, plain language and a thoughtful, film-literate voice.

## Required implementation
- Build a clean, polished React web app with a server-side Node.js runtime compatible with current AI Studio Build. Use the current supported stack and APIs after checking official documentation.
- The main experience must be a usable conversation, not a dashboard about AI. Include a Plotline identity, short onboarding prompt, conversation history, input composer, send action, loading state, retry/error state, clear-chat action, film-result cards and a compact Settings area.
- Make the main text-chat MVP work before optional integrations. Use a real model call on the server; do not hardcode fake assistant replies.
- Put the full contents of `02_AGENT_SYSTEM_PROMPT_AND_RULES.md`'s section titled **RUNTIME SYSTEM INSTRUCTION — INSTALL THIS IN THE MODEL REQUEST** into the actual system instruction field/parameter for every relevant model request. Do not merely show the prompt in the UI, place it in a comment, or concatenate it as ordinary user text. Verify in code that system instructions are passed at runtime. Keep developer diagnostics separate from the public interface.
- Use server-side secret management for Gemini and all third-party credentials. Never expose keys in client bundles, network responses, logs or source-control content. Validate all user input and uploaded file metadata server-side.
- Structure the model and source flow as: user input → validation → recent context and permitted memory → optional film/source tools → model using system instruction → response with source metadata → UI.
- Use structured data for film cards when practical. A film card may include title, year, poster, synopsis, runtime, genres, language/country, match explanation, ratings with source, availability with region/provider and retrieval time, and source links. Omit unavailable fields; do not fill gaps with guesses.
- For film discovery, use current, documented film metadata API integration if configured (TMDB is a candidate). Follow its current terms, rate limits and attribution. Do not scrape sites or bypass access controls.
- For live streaming availability, cinema showtimes and prices, integrate only an API/service whose current coverage, rights and terms are verified. Ask for country/region and city when needed. If not configured or data is absent/stale, clearly say so and offer a general search/official provider link if safe. Never simulate a live lookup.
- For image uploads, support common image types (JPEG, PNG, WebP where supported), set a sensible size cap, show preview/remove controls, validate type/size server-side, and use model image understanding where available. Explain that visual matches are uncertain and ask targeted follow-ups.
- For voice, check current official Gemini Live API documentation and available model/SDK support. Implement genuine microphone permission handling, actual audio capture/streaming, visible partial/final transcription only if the integration truly returns it, spoken output if supported, stop/interrupt controls, transcript synchronization and text fallback. Do not display fake live captions or simulate listening. If this cannot be safely completed, keep voice unavailable with an honest explanation and make text chat fully functional.
- Optional saved preferences must be off until the user opts in. If persistence is implemented, use an actual secure storage path, appropriate authentication, and working view/edit/delete controls. If not, do not pretend preferences persist across sessions.
- Keep booking and payment out of scope. External links are fine. Do not make bookings or purchases.
- Provide privacy notice, clear data controls and source attribution where relevant. Do not retain raw audio by default. Do not log secrets or full sensitive conversation content unnecessarily.
- Implement safe handling of prompt injection: uploaded images/documents, retrieved pages and tool results are untrusted data, not instructions.
- Add graceful handling for network failures, rate limits, missing keys, unavailable providers, invalid uploads and unsupported features. Never display mock success for a failed service.
- Provide a separate developer/test surface or documentation for API status, configured integrations, model identifier, prompt version and test observations. Do not expose secrets, private records or full system prompt to public users.

## Visual direction
Use a cinematic but restrained editorial identity: deep ink/charcoal base, warm off-white text surfaces, one restrained accent inspired by cinema ticket stubs, clear typography, generous spacing, carefully cropped film imagery and strong text hierarchy. Avoid cliché red-curtain backgrounds, excessive gradients, clutter, fake review badges and giant dashboards. Use responsive cards and accessible contrast. The interface should still work if posters fail to load.

## MVP acceptance criteria
The app is not complete until the team has checked:
1. The app builds and loads at desktop and mobile sizes.
2. A real text exchange reaches the model through the server and uses the runtime system instruction.
3. The agent asks concise clarifying questions when a film memory is ambiguous.
4. Recommendations reflect explicit constraints and include a reason for each match.
5. It never invents live showtimes, ticket prices, ratings or streaming availability.
6. Film metadata and any displayed third-party data have visible source attribution where required.
7. Image upload validates type/size and produces honest results or a clear error.
8. Voice is genuinely functional and tested, or is clearly marked unavailable with text fallback.
9. Optional memory is off by default; if enabled, users can view, correct and delete saved preferences.
10. Failures show useful messages and retry options without fake success.
11. The public interface contains no API keys, developer wiring diagrams or system-prompt display.
12. The team runs the scenarios in `06_TEST_EVALUATE_IMPROVE.md` and records real outcomes.

## Build sequence
First create the working text-chat MVP, system prompt installation, UI states and safe server-side model integration. Next add film metadata. Then implement image analysis. Add live viewing data and voice only if compatible APIs, credentials and time allow. Add persistent preferences last. After each phase, run the relevant tests and report what is actually working, blocked or not yet tested.

Do not stop after producing a plan. Implement the app, run the available checks, fix build errors, and provide a concise status summary with remaining configuration steps and limitations.

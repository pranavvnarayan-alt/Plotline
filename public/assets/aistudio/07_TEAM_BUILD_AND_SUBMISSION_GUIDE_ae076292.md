# Plotline — Team Build and Submission Guide

## Aim
Build a narrow, credible movie-discovery prototype in seven days. The goal is not to launch a universal streaming aggregator. Demonstrate a useful conversation, trustworthy film information, clear interaction design and an evidence-based iteration loop.

## Adaptable group roles
For a group of 3–5 students, assign one primary owner per area. In a smaller group, combine roles.
- **Product / conversation lead:** maintains scope, user flows, system prompt and conversation quality.
- **UX/UI designer:** creates screen hierarchy, responsive layouts, states and accessibility checks.
- **Integration / build lead:** manages AI Studio Build, server-side model calls, API secrets and data integration.
- **Research / source lead:** verifies film-data source terms, attribution, regional coverage and factual behaviour.
- **Test / documentation lead:** runs scenarios, records evidence, manages version log and submission deck.

Everyone should review critical safety, trust and privacy behaviour. Role labels are responsibilities, not a requirement for separate agents.

## Seven-day plan
### Day 1 — Define and sketch
- Confirm primary task and MVP boundary.
- Map recommendation and forgotten-film flows.
- Choose the main screen structure and film-card hierarchy.
- Agree the system prompt and success criteria.

### Day 2 — Build the text-chat MVP
- Start in Google AI Studio Build.
- Paste `01_ONE_SHOT_BUILD_PROMPT.md` and attach companion files.
- Verify a real server-side model call and runtime system prompt.
- Implement loading, errors, retry and clear-chat.

### Day 3 — Film metadata
- Review official API docs and terms.
- Configure a metadata key through server-side Secrets.
- Implement search and structured result cards with attribution.
- If access is blocked, keep the app useful with honest film discussion and clearly label metadata as unverified.

### Day 4 — Image identification and refinement
- Implement upload validation, preview and removal.
- Test clear, ambiguous and misleading images.
- Refine clarifying questions and candidate explanations.

### Day 5 — Optional live data / voice
- Verify whether a suitable current provider exists for global availability or local cinema data.
- Implement only feasible, documented integrations.
- Attempt genuine voice with current official documentation; preserve text fallback.
- Defer features that cannot be made truthful and stable.

### Day 6 — Test and iterate
- Run at least the core tests, then all feasible tests in `06_TEST_EVALUATE_IMPROVE.md`.
- Capture actual evidence and record blocked integrations.
- Fix the most consequential failure and retest.

### Day 7 — Present
- Show the real app and two or three test conversations.
- Explain the target user, need, conversation design, source policy, memory choice and limitations.
- Include one real iteration example and honest next steps.
- Do not present an unimplemented feature as live.

## Quick implementation checklist
- [ ] Text chat uses a real model API call.
- [ ] Runtime system prompt is installed as system-level instructions.
- [ ] Recommendations use explicit constraints and explain the match.
- [ ] Film identification handles ambiguity.
- [ ] Image upload is validated and tested.
- [ ] Live data is real and sourced, or clearly unavailable.
- [ ] Voice is real and tested, or disabled with a text fallback.
- [ ] Source attribution and retrieval time appear where required.
- [ ] Memory is session-only unless opt-in persistence genuinely works.
- [ ] No secrets appear in client code or screenshots.
- [ ] Responsive and accessible states are tested.
- [ ] Failures and test outcomes are documented honestly.

## Common blockers
- **Builder only creates a static UI:** ask it to implement the real server-side model request and test a live response.
- **System prompt is visible but not applied:** inspect model-call code and ensure the system instruction is passed in the supported system-level parameter.
- **Missing API key:** add it through the AI Studio Secrets panel; do not paste it into the prompt or browser code.
- **Metadata source returns incomplete data:** omit missing fields; do not infer them.
- **Streaming availability or showtimes are unavailable:** defer the integration and offer honest search/official links.
- **Voice SDK/model mismatch:** recheck current official docs; ship text first.
- **Memory toggle is only decorative:** remove it or implement real secure storage and controls.
- **The UI looks finished but tests fail:** prioritise functional correctness and truthful states over polish.
- **Rate limits/cost uncertainty:** reduce calls during testing, check current pricing/quotas and do not promise free usage.

## Evidence to capture from real tests
- Screenshot of the welcome screen at desktop and mobile widths.
- Actual recommendation conversation with constraints visible.
- Actual ambiguous film-identification flow.
- Image upload and its real output, including an uncertain case.
- Source attribution and region/timestamp display for any live integration.
- Voice permission, transcript and fallback states if voice is implemented.
- Memory opt-in and deletion evidence if persistence is implemented.
- A real error state such as provider unavailable.
- Test sheet with statuses, scores and a baseline/change/retest comparison.
Redact keys, tokens, private data and unrelated conversation details.

## One-page blueprint checklist
- [ ] Purpose and problem
- [ ] Primary/secondary audience
- [ ] Agent identity and personality
- [ ] User journey and conversation flow
- [ ] Runtime system prompt
- [ ] Film-domain knowledge and verified sources
- [ ] Session context and memory policy
- [ ] Architecture and integration boundaries
- [ ] Out-of-scope and failure cases
- [ ] Example conversations
- [ ] Screenshots of actual UI and states
- [ ] Accessibility and responsive checks
- [ ] Real test evidence and iteration log
- [ ] Limitations, costs and next steps

## Submission framing
Present Plotline as a designed conversational experience, not just a chatbot. Explain the interaction choices: how it asks clarifying questions, handles uncertain film memories, balances mainstream and lesser-known cinema, attributes current facts and gives users control over memory. Be transparent about which integrations work in the prototype and which remain proposed.

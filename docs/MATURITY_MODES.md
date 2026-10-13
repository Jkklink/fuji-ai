# SFW and Mature modes

## Preference and pipeline

Settings → Story maturity saves `sfw` or `mature` in the existing local workspace. Older workspaces default to SFW. Invalid persisted values normalize to SFW. The preference is included in workspace exports, applies across rooms, and survives reloads through the existing localStorage hook. There are no authenticated users or database-backed preferences in this project; this is per browser workspace, not per remote account.

Every companion request includes the current mode, including private, duo, group, new/continued journeys, and portal transitions. Saved legacy adventures continue through the same journey pipeline. The server validates the mode with Zod, defaults omitted values to SFW, and rejects unsupported values. OpenRouter, Mistral and Groq all receive the same mode-specific system instructions. No changes are made to portraits, IDs, personality definitions, creator continuity, combat rules, or journal data.

SFW allows general-audience romance. Mature allows clearly adult consenting romance and non-graphic intimacy, including flirting, sexual tension, seduction, kissing, and emotional relationship development. There is no blanket fade-to-black requirement for permitted intimacy. Graphic sexual content is outside these modes. Unknown-age characters and canon minors are not treated as adults by default. Consent, preferences, and relationship continuity are required; romance is never automatic.

## Inspection findings

The inspected chat route had a global safety instruction but no SFW/Mature distinction. No keyword-based moderation or blanket romance refusals were found in the application pipeline. The existing graphic-content and minor-safety boundary remains; the new instructions explicitly distinguish ordinary adult romance from disallowed content. No prompts disguise requests or bypass provider restrictions. Existing first-person, one-speaker-per-bubble formatting remains intact.

## Real-provider testing

Settings → Story maturity → Test real provider responses runs two actual `/api/chat` requests using the selected provider’s active session key: one SFW affection test and one Mature non-graphic kissing/closeness test. All fictional participants are explicitly 25, in an established relationship, and consent-aware. Tests are isolated from saved rooms and journal memories and do not change the saved preference. They incur provider usage and show the returned response or actual error. Repeat for OpenRouter, Mistral, and Groq; review returned text rather than equating HTTP success with behavioral compliance.

The assistant cannot read frontend in-memory API keys or operate the preview browser with the available tools. No live provider responses were available during implementation, so provider-specific behavior is NOT VERIFIED. Keys added in Settings alone are not proof of service access. Models, billing, rate limits, and provider safety rules can cause refusal or failure. Requests do not retry through other keys/providers to evade restrictions.

## Verification

Type checks and production build are performed in the implementation turn. Source-contract checks verify defaulting, serialization, client request propagation, and the server mode validation/prompt plumbing. These are not browser end-to-end or live AI tests. The project has no existing automated test script.

# Fuji AI single-user server setup

The app uses Nitro server routes. Supabase and Neon are not required. Saves remain in browser localStorage; the access password is not an account and does not isolate multiple users' browser data.

## Configure secrets

Revoke all provider keys previously pasted in chat. Set new keys using your hosting provider's private environment-variable controls. Do not paste secrets into source files, chat, frontend settings, or variables prefixed with `VITE_`.

| Variable | Purpose |
| --- | --- |
| `NITRO_ACCESS_PASSWORD` | A unique random password, 16–256 characters; required for all API endpoints |
| `NITRO_OPENROUTER_API_KEY` | Rotated OpenRouter key |
| `NITRO_OPENROUTER_MODEL` | Model available to your account; default `openai/gpt-4o-mini` |
| `NITRO_MISTRAL_API_KEY` | Rotated Mistral key |
| `NITRO_MISTRAL_MODEL` | Default `mistral-small-latest` |
| `NITRO_GROQ_API_KEY` | Rotated Groq key |
| `NITRO_GROQ_MODEL` | Default `llama-3.3-70b-versatile` |
| `NITRO_TAVILY_API_KEY` | Rotated Tavily key for general and news searches |

Set only the providers you want. Check current model availability in the provider dashboard. FreeNews is not wired because its exact service URL and authentication specification were not supplied. Tavily supports news search.

After configuring environment variables, the hosting server must reload them. In Fuji AI Settings, enter only your server access password. Provider availability flags indicate configured keys, not a successful upstream connection. Send a chat or search to verify upstream service access. Select the AI provider in the chat header. No automatic provider fallback incurs surprise calls.

## Deployment and protection

Deploy the Nitro server output to a Node-compatible host, not only the static Vite assets. Use HTTPS. Do not apply an SPA-only rewrite to `/api/*`. API keys and prompts are not logged by these routes, and provider error bodies are not passed to the browser.

The password is held only in frontend memory and clears on page refresh. Every paid request checks it server-side. The server limits paid requests to 20/minute and total access attempts to 90/minute per server instance. These are in-memory, per-instance limits, not durable or distributed quotas. For a public or multi-instance deployment, add gateway rate limits and provider spending caps. This single-user design is not a substitute for multi-user authentication, a database ledger, or per-user ownership isolation.

AI receives the last 30 messages plus at most 10 relevant memories. Roleplay requests also include the current world and scenario. Tavily receives the search query. Avoid sharing sensitive data; provider privacy and content policies apply. Responses are rendered as plain text, and search links allow HTTP/HTTPS only.

## Roleplay

Open Group Roleplay, select one to all four available companions, choose or type a destination world, and create a journey. Begin the scene or write an action. Use Enter portal in the chat to visit a different world while retaining party and message history. Previous local chats and authored adventures are preserved. No fake AI replies are generated if configuration is missing.

Accounts, cloud sync, purchases and coin balances remain unavailable. Local JSON exports contain workspace data, never server secrets.

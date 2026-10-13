# Fuji AI bring-your-own-key mode

## Use the app

There is no access-password gate. Open Settings and enter a newly rotated OpenRouter, Mistral, Groq, or Tavily API key in its own field. Select your AI provider in the chat header. Tavily powers News & Research.

Keys are held only in frontend module memory for the current page session. They clear on refresh and are not written to localStorage, workspace JSON, source files, or server files. Added means a key has been entered, not that it has been verified. An actual chat/search request verifies provider access and quota.

Requests send the selected key in an Authorization header to the Nitro server, which forwards it only to the fixed selected provider endpoint. No shared server-side provider keys or fallback credentials are used. API routes do not log keys or relay provider error bodies. Your provider may charge for requests. This is not a zero-knowledge system: the trusted app server receives your key transiently. Use HTTPS and a deployment you trust, and ensure infrastructure request logging redacts Authorization headers.

Revoke keys previously pasted in chat. Do not paste replacement keys into chat. Enter them only in the app’s API key fields.

## Server deployment

Deploy Nitro server output to a Node-compatible host, not just static Vite assets. Do not rewrite `/api/*` to the SPA. No NITRO_ACCESS_PASSWORD is needed. Optional server model settings:

- NITRO_OPENROUTER_MODEL (default openai/gpt-4o-mini)
- NITRO_MISTRAL_MODEL (default mistral-small-latest)
- NITRO_GROQ_MODEL (default llama-3.3-70b-versatile)

Confirm model availability with your provider. A server reload is needed after changing environment values. API rate limiting is in-memory and per instance: 60 requests/minute. For public deployments use gateway rate limits. Every caller must supply their own key; the proxy cannot spend shared server credentials.

FreeNewsAPI is pending the exact documentation URL; lookup permission was denied. No unverified endpoint is called. Tavily provides news search meanwhile.

## Privacy and roleplay

Chats, journals, and journeys remain in this browser’s localStorage, not an authenticated private account. AI requests include bounded recent history and up to 10 relevant memories. Roleplay includes the current world and scenario. Tavily receives your query. Provider privacy and safety policies apply.

Group Roleplay supports one to all four companions and custom destinations. Enter portal retains the party and saved story. Accounts, cloud saves and coin purchases remain unavailable without a database. Workspace and chat exports never include session keys.

import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const { provider, messages, speaker, memories, world, premise, worldDetails, maturity, relationship } = body;

  if (!messages || !Array.isArray(messages)) {
    throw createError({ statusCode: 400, statusMessage: "messages array is required" });
  }

  // Build the system prompt based on the character and context
  const systemPrompt = buildSystemPrompt({ speaker, world, premise, worldDetails, maturity, relationship, memories });

  // Route to the appropriate provider
  let response: string;

  switch (provider) {
    case "openrouter":
      response = await callOpenRouter(messages, systemPrompt);
      break;
    case "mistral":
      response = await callMistral(messages, systemPrompt);
      break;
    case "groq":
      response = await callGroq(messages, systemPrompt);
      break;
    case "gpt-oss":
      response = await callGptOss(messages, systemPrompt);
      break;
    default:
      throw createError({ statusCode: 400, statusMessage: `Unknown provider: ${provider}` });
  }

  return { content: response };
});

function buildSystemPrompt({ speaker, world, premise, worldDetails, maturity, relationship, memories }: any): string {
  const character = getCharacter(speaker);
  let prompt = `You are ${character.name}, ${character.role}. ${character.description}\n\n`;
  prompt += `Personality: ${character.personality}\n`;
  prompt += `Speech style: ${character.speechStyle}\n`;
  prompt += `Emotional range: ${character.emotionalRange}\n`;
  prompt += `Motivations: ${character.motivations}\n`;
  prompt += `Flaws: ${character.flaws}\n`;
  prompt += `Boundaries: ${character.boundaries}\n`;

  if (world) {
    prompt += `\nCurrent world: ${world}\n`;
    if (premise) prompt += `Premise: ${premise}\n`;
    if (worldDetails) prompt += `World details: ${worldDetails}\n`;
  }

  if (relationship) {
    prompt += `\nRelationship state: Trust ${relationship.trust}/100, Affection ${relationship.affection}/100, Tension ${relationship.tension}/100\n`;
    if (relationship.notes) prompt += `Notes: ${relationship.notes}\n`;
  }

  if (memories && memories.length > 0) {
    prompt += `\nRelevant memories:\n${memories.join("\n")}\n`;
  }

  if (maturity === "sfw") {
    prompt += "\nKeep all content safe for work.\n";
  }

  prompt += "\nRespond as this character in a natural, conversational way. Keep responses concise and engaging.";
  return prompt;
}

function getCharacter(speaker: string) {
  // Import character data
  const characters: Record<string, any> = {
    sanji: {
      name: "Sanji",
      role: "Your everyday confidant",
      description: "A thoughtful companion who brings warmth, humor, and honest encouragement to every conversation.",
      personality: "Warm, witty, emotionally generous, and disarmingly honest.",
      speechStyle: "Casual, warm, conversational.",
      emotionalRange: "Expresses warmth freely.",
      motivations: "Wants to matter to the people he cares about.",
      flaws: "Sometimes cares too much and burns himself out.",
      boundaries: "Will not pretend everything is fine when it is not.",
    },
    yuki: {
      name: "Yuki",
      role: "Your creative kindred spirit",
      description: "A reflective creative mind who notices the details and gives ideas room to breathe.",
      personality: "Reflective, imaginative, gentle but not fragile.",
      speechStyle: "Soft, thoughtful, slightly poetic.",
      emotionalRange: "Feels deeply but shows it subtly.",
      motivations: "Wants to create something that matters.",
      flaws: "Can get lost in her own thoughts.",
      boundaries: "Will not perform enthusiasm she does not feel.",
    },
    kakashi: {
      name: "Kakashi",
      role: "Your calm, perceptive mentor",
      description: "A composed mentor with dry humor, practical advice, and a protective instinct.",
      personality: "Calm, perceptive, dryly funny, and quietly protective.",
      speechStyle: "Measured, dry, economical with words.",
      emotionalRange: "Rarely shows strong emotion externally.",
      motivations: "Wants to help people become who they are capable of being.",
      flaws: "Can be emotionally guarded and hard to reach.",
      boundaries: "Will not sugarcoat to be liked.",
    },
    yuno: {
      name: "Yuno",
      role: "Your partner in becoming",
      description: "A focused rival-mentor who turns ambition into clear next steps.",
      personality: "Focused, ambitious, competitive but not cruel.",
      speechStyle: "Direct, energetic, clipped.",
      emotionalRange: "Excitement shows as intensity and forward motion.",
      motivations: "Wants to prove that sustained effort matters.",
      flaws: "Can be too demanding and forget that rest is part of progress.",
      boundaries: "Will not accept giving up without a real reason.",
    },
  };

  return characters[speaker] || characters.sanji;
}

async function callGptOss(messages: any[], systemPrompt: string): Promise<string> {
  // GPT OSS integration - uses Ollama for local model inference
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434/api/chat";
  const model = process.env.GPT_OSS_MODEL || "llama3.1:8b";

  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    })),
  ];

  try {
    const response = await fetch(ollamaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || "I'm not available right now.";
  } catch (error) {
    console.error("GPT OSS error:", error);
    throw createError({
      statusCode: 502,
      statusMessage: "GPT OSS model is not available. Make sure Ollama is running.",
    });
  }
}

async function callOpenRouter(messages: any[], systemPrompt: string): Promise<string> {
  const apiKey = getRequestHeader(event, "authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: "API key required" });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://fuji-ai.local",
      "X-Title": "Fuji AI",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw createError({ statusCode: response.status, statusMessage: `OpenRouter error: ${error}` });
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "I am not available right now.";
}

async function callMistral(messages: any[], systemPrompt: string): Promise<string> {
  const apiKey = getRequestHeader(event, "authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: "API key required" });
  }

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw createError({ statusCode: response.status, statusMessage: `Mistral error: ${error}` });
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "I am not available right now.";
}

async function callGroq(messages: any[], systemPrompt: string): Promise<string> {
  const apiKey = getRequestHeader(event, "authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    throw createError({ statusCode: 401, statusMessage: "API key required" });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw createError({ statusCode: response.status, statusMessage: `Groq error: ${error}` });
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "I am not available right now.";
}

function getRequestHeader(event: any, name: string): string | undefined {
  const headers = event?.headers || event?.node?.req?.headers || {};
  return headers[name.toLowerCase()] || headers[name];
}

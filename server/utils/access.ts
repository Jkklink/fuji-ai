import { createHash, timingSafeEqual } from 'node:crypto';
import { createError } from 'nitro/h3';

let windowStart = Date.now();
let attempts = 0;
let requests = 0;
export function requireAccess(request: Request, paid = false) {
  if (Date.now() - windowStart > 60_000) { windowStart = Date.now(); attempts = 0; requests = 0; }
  if (++attempts > 90) throw createError({ statusCode: 429, statusMessage: 'Too many requests. Try again in a minute.' });
  // This Nitro beta lacks the documented runtime-config export; read server-only environment values.
  const config = {
    accessPassword: process.env.NITRO_ACCESS_PASSWORD || '',
    openrouterApiKey: process.env.NITRO_OPENROUTER_API_KEY || '',
    openrouterModel: process.env.NITRO_OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    mistralApiKey: process.env.NITRO_MISTRAL_API_KEY || '',
    mistralModel: process.env.NITRO_MISTRAL_MODEL || 'mistral-small-latest',
    groqApiKey: process.env.NITRO_GROQ_API_KEY || '',
    groqModel: process.env.NITRO_GROQ_MODEL || 'llama-3.3-70b-versatile',
    tavilyApiKey: process.env.NITRO_TAVILY_API_KEY || '',
  };
  const expected = config.accessPassword;
  if (expected.length < 16 || expected.length > 256) throw createError({ statusCode: 503, statusMessage: 'Set a server access password of 16–256 characters first.' });
  const header = request.headers.get('authorization') || '';
  const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
  const hash = (value: string) => createHash('sha256').update(value).digest();
  if (supplied.length > 256 || !timingSafeEqual(hash(expected), hash(supplied))) throw createError({ statusCode: 401, statusMessage: 'Unlock server access in Settings.' });
  if (paid && ++requests > 20) throw createError({ statusCode: 429, statusMessage: 'Server request limit reached. Try again in a minute.' });
  return config;
}
export async function jsonBody(request: Request) {
  const text = await request.text();
  if (text.length > 100_000) throw createError({ statusCode: 413, statusMessage: 'Request too large.' });
  try { return JSON.parse(text); } catch { throw createError({ statusCode: 400, statusMessage: 'Invalid JSON request.' }); }
}

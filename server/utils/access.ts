import { createError } from 'nitro/h3';

let windowStart = Date.now();
let requests = 0;
export function requireAccess(request: Request) {
  if (Date.now() - windowStart > 60_000) { windowStart = Date.now(); requests = 0; }
  if (++requests > 60) throw createError({ statusCode: 429, statusMessage: 'Server request limit reached. Try again in a minute.' });
  const header = request.headers.get('authorization') || '';
  const key = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (key.length < 8 || key.length > 512 || /\s/.test(key)) throw createError({ statusCode: 401, statusMessage: 'Add a valid key for the selected provider in Settings.' });
  return {
    key,
    openrouterModel: process.env.NITRO_OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    mistralModel: process.env.NITRO_MISTRAL_MODEL || 'mistral-small-latest',
    groqModel: process.env.NITRO_GROQ_MODEL || 'llama-3.3-70b-versatile',
  };
}
export async function jsonBody(request: Request) {
  const text = await request.text();
  if (text.length > 100_000) throw createError({ statusCode: 413, statusMessage: 'Request too large.' });
  try { return JSON.parse(text); } catch { throw createError({ statusCode: 400, statusMessage: 'Invalid JSON request.' }); }
}

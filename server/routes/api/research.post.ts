import { defineHandler } from 'nitro';
import { createError } from 'nitro/h3';
import { z } from 'zod';
import { jsonBody, requireAccess } from '../../utils/access';
export default defineHandler(async event => {
  const config = requireAccess(event.req, true);
  const parsed = z.object({ query: z.string().trim().min(2).max(400), topic: z.enum(['general', 'news']) }).safeParse(await jsonBody(event.req));
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Enter a research query of 2–400 characters.' });
  if (!config.tavilyApiKey) throw createError({ statusCode: 503, statusMessage: 'Tavily needs a new server-side API key.' });
  let response: Response;
  try { response = await fetch('https://api.tavily.com/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: config.tavilyApiKey, query: parsed.data.query, topic: parsed.data.topic, search_depth: 'basic', max_results: 5, include_answer: true }), signal: AbortSignal.timeout(30_000) }); }
  catch { throw createError({ statusCode: 504, statusMessage: 'Search timed out. Try again.' }); }
  if (!response.ok) throw createError({ statusCode: 502, statusMessage: 'Search provider rejected the request. Check its key and quota.' });
  const data = await response.json();
  const results = (Array.isArray(data.results) ? data.results : []).filter((item: { url?: string }) => { try { return ['https:', 'http:'].includes(new URL(item.url || '').protocol); } catch { return false; } }).slice(0, 5).map((item: { title?: string; url: string; content?: string }) => ({ title: String(item.title || item.url).slice(0, 300), url: item.url, content: String(item.content || '').slice(0, 4000) }));
  return { answer: typeof data.answer === 'string' ? data.answer.slice(0, 10000) : '', results };
});

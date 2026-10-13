export type Provider = 'openrouter' | 'mistral' | 'groq';
export type KeyProvider = Provider | 'tavily';
const keys: Partial<Record<KeyProvider, string>> = {};
export function setProviderKey(provider: KeyProvider, value: string) {
  if (value.trim()) keys[provider] = value.trim(); else delete keys[provider];
}
export function hasProviderKey(provider: KeyProvider) { return Boolean(keys[provider]); }
export async function apiRequest<T>(path: string, body: unknown, provider: KeyProvider): Promise<T> {
  const key = keys[provider];
  if (!key) throw new Error(`Add your ${provider} API key in Settings first.`);
  let response: Response;
  try { response = await fetch(`/api/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(body) }); }
  catch { throw new Error('Cannot reach the server. Check your connection.'); }
  const text = await response.text();
  let data: Record<string, unknown>;
  try { data = JSON.parse(text); } catch { throw new Error('Server API is unavailable. Check that the Nitro server is running.'); }
  if (!response.ok) throw new Error(String(data.statusMessage || data.message || 'Server request failed.'));
  return data as T;
}

export type Provider = 'openrouter' | 'mistral' | 'groq';
export type ProviderStatus = Record<Provider | 'tavily', boolean>;
let password = '';
export function setAccessPassword(value: string) { password = value; }
export function hasAccess() { return Boolean(password); }
export async function apiRequest<T>(path: string, body: unknown): Promise<T> {
  if (!password) throw new Error('Unlock server access in Settings first.');
  let response: Response;
  try { response = await fetch(`/api/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` }, body: JSON.stringify(body) }); }
  catch { throw new Error('Cannot reach the server. Check your connection.'); }
  const text = await response.text();
  let data: Record<string, unknown>;
  try { data = JSON.parse(text); } catch { throw new Error('Server API is unavailable. Check that the Nitro server is running.'); }
  if (!response.ok) { if (response.status === 401) password = ''; throw new Error(String(data.statusMessage || data.message || 'Server request failed.')); }
  return data as T;
}

export type Provider = 'openrouter' | 'mistral' | 'groq' | 'google';
export type KeyProvider = Provider | 'tavily';

const keys: Partial<Record<KeyProvider, string[]>> = {};
const activeKeyIndex: Partial<Record<KeyProvider, number>> = {};

export function addProviderKey(provider: KeyProvider, value: string) {
  const trimmed = value.trim();
  // Basic validation: length 8-512, no whitespace (to avoid accidentally including spaces)
  if (trimmed.length < 8 || trimmed.length > 512 || /\s/.test(trimmed)) {
    return false;
  }
  if (!keys[provider]) {
    keys[provider] = [];
  }
  keys[provider].push(trimmed);
  // If no active index set, set to the newly added key
  if (!(provider in activeKeyIndex)) {
    activeKeyIndex[provider] = keys[provider].length - 1;
  }
  return true;
}

export function removeProviderKey(provider: KeyProvider, index: number) {
  if (!keys[provider] || index < 0 || index >= keys[provider].length) {
    return false;
  }
  keys[provider].splice(index, 1);
  // Adjust active index if needed
  if (provider in activeKeyIndex) {
    if (activeKeyIndex[provider] >= keys[provider].length) {
      activeKeyIndex[provider] = keys[provider].length - 1;
    }
    if (keys[provider].length === 0) {
      delete activeKeyIndex[provider];
      delete keys[provider];
    }
  }
  return true;
}

export function setActiveProviderKey(provider: KeyProvider, index: number) {
  if (!keys[provider] || index < 0 || index >= keys[provider].length) {
    return false;
  }
  activeKeyIndex[provider] = index;
  return true;
}

export function getActiveProviderKey(provider: KeyProvider): string | undefined {
  const providerKeys = keys[provider];
  if (!providerKeys) return undefined;
  const index = activeKeyIndex[provider] ?? 0;
  return providerKeys[index];
}

export function hasProviderKey(provider: KeyProvider): boolean {
  return !!keys[provider]?.length;
}

export function getProviderKeys(provider: KeyProvider): string[] {
  return keys[provider] ?? [];
}

export function getProviderKeyCount(provider: KeyProvider): number {
  return keys[provider]?.length ?? 0;
}

export function pickAvailableProvider(): Provider | undefined {
  const order: Provider[] = ['openrouter', 'groq', 'mistral', 'google'];
  for (const p of order) {
    if (hasProviderKey(p)) return p;
  }
  return undefined;
}

export async function apiRequest<T>(path: string, body: unknown, provider: KeyProvider): Promise<T> {
  const key = getActiveProviderKey(provider);
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
import { useState } from 'react';
import { KeyRound, ShieldCheck, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  addProviderKey,
  removeProviderKey,
  setActiveProviderKey,
  getActiveProviderKey,
  hasProviderKey,
  getProviderKeys,
  getProviderKeyCount,
  type KeyProvider,
} from '@/lib/api';
import { toast } from 'sonner';

function ProviderKeyManager({ provider, label }: { provider: KeyProvider; label: string }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = draft.trim();
    if (trimmed.length < 8 || trimmed.length > 512 || /\s/.test(trimmed)) {
      setError('Enter a valid API key without spaces (8-512 characters).');
      return;
    }
    const added = addProviderKey(provider, trimmed);
    if (added) {
      setDraft('');
      toast.success(`${label} key added`);
    } else {
      setError('Invalid key length or format.');
    }
  };

  const handleRemoveKey = (index: number) => {
    removeProviderKey(provider, index);
  };

  const handleSetActive = (index: number) => {
    setActiveProviderKey(provider, index);
  };

  const keys = getProviderKeys(provider);
  const activeIndex = getActiveProviderKey(provider) ? keys.indexOf(getActiveProviderKey(provider)!) : undefined;

  return (
    <section className="rounded-xl border border-white/10 p-5">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="font-medium">{label}</h3>
          <p className="text-xs text-slate-400">
            {getProviderKeyCount(provider)} key{getProviderKeyCount(provider) !== 1 ? 's' : ''} added
          </p>
        </div>
        <button
          className="text-link text-xs"
          onClick={() => setDraft('')}
          aria-label="Clear new key input"
        >
          Clear
        </button>
      </div>

      {keys.length > 0 ? (
        <>
          <div className="mb-3">
            <label className="block text-xs font-medium mb-1">Active key</label>
            <div className="flex space-x-3">
              {keys.map((key, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`key-${provider}-${index}`}
                    name={`active-key-${provider}`}
                    checked={activeIndex === index}
                    onChange={() => handleSetActive(index)}
                    className="h-4 w-4 text-amber-300"
                  />
                  <label
                    htmlFor={`key-${provider}-${index}`}
                    className="cursor-pointer text-sm select-none truncate"
                    title={key}
                  >
                    {/* Mask the key: show first 4 and last 4 chars, middle as asterisks */}
                    {key.length > 8
                      ? `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(
                          -4
                        )}`
                      : key}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs text-slate-400">No keys added yet.</p>
      )}

      <form className="mt-4" onSubmit={handleAddKey}>
        <div className="mb-2">
          <label htmlFor={`new-key-${provider}`} className="block text-xs font-medium mb-1">
            Add new key
          </label>
          <Input
            id={`new-key-${provider}`}
            type="password"
            autoComplete="off"
            spellCheck={false}
            className="field"
            maxLength={512}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Paste your API key here"
          />
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
        <Button
          type="submit"
          className="amber-button w-full"
          disabled={!draft.trim()}
        >
          {draft.trim() ? 'Add key' : 'Add key'}
        </Button>
      </form>
    </section>
  );
}

export function FujiIntegrations() {
  return (
    <section className="panel p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <ShieldCheck size={19} className="text-cyan-300" />
        Your API keys · No access password
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        Add multiple keys for each provider below. Select which key to use for each provider.
        Choose an AI provider in chat, or use Tavily in News & Research. Each request uses
        only your selected key—there is no separate password to unlock.
      </p>
      <div className="mt-5 space-y-4">
        <ProviderKeyManager provider="openrouter" label="OpenRouter" />
        <ProviderKeyManager provider="mistral" label="Mistral" />
        <ProviderKeyManager provider="groq" label="Groq" />
        <ProviderKeyManager provider="tavily" label="Tavily · Research & news" />
      </div>
      <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/5 p-4 text-xs leading-6 text-amber-100">
        Keys remain only in this page session’s memory, not browser storage, workspace exports,
        or source files. Refreshing closes the session and removes them. Keys travel through
        this app’s server to the selected provider; use HTTPS and a trusted deployment.
        Provider usage may incur charges. Use rotated keys, not keys previously posted in chat.
      </div>
      <p className="mt-4 text-xs leading-6 text-slate-400">
        FreeNewsAPI: documentation lookup was denied, so the exact endpoint is not verified.
        Share its documentation URL to enable the correct adapter. Tavily already supports news
        search. Accounts, cloud saves, and coin purchases remain disabled without a database.
      </p>
    </section>
  );
}
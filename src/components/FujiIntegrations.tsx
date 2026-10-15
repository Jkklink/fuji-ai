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
  const [, forceRender] = useState(0);

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
    forceRender(n => n + 1);
    toast.success('Key removed');
  };

  const handleSetActive = (index: number) => {
    setActiveProviderKey(provider, index);
    forceRender(n => n + 1);
  };

  const handleClearAll = () => {
    const count = getProviderKeyCount(provider);
    for (let i = count - 1; i >= 0; i--) removeProviderKey(provider, i);
    setDraft('');
    setError('');
    forceRender(n => n + 1);
    if (count > 0) toast.success(`${label} keys cleared`);
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
          onClick={handleClearAll}
          aria-label="Clear all keys"
        >
          Clear all
        </button>
      </div>

      {keys.length > 0 ? (
        <div className="mb-3 space-y-2">
          <label className="block text-xs font-medium">Saved keys</label>
          {keys.map((key, index) => (
            <div key={index} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#172034] px-3 py-2">
              <input
                type="radio"
                id={`key-${provider}-${index}`}
                name={`active-key-${provider}`}
                checked={activeIndex === index}
                onChange={() => handleSetActive(index)}
                className="h-4 w-4 shrink-0 text-amber-300"
              />
              <label
                htmlFor={`key-${provider}-${index}`}
                className="flex-1 cursor-pointer truncate text-xs text-slate-300"
                title={key}
              >
                {key.length > 8
                  ? `${key.slice(0, 4)}${'•'.repeat(Math.min(key.length - 8, 20))}${key.slice(-4)}`
                  : key}
              </label>
              {activeIndex === index && (
                <span className="shrink-0 text-[9px] text-amber-300">active</span>
              )}
              <button
                onClick={() => handleRemoveKey(index)}
                aria-label={`Remove key ${index + 1}`}
                className="shrink-0 text-slate-400 hover:text-red-300"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
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
          Add key
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
        Add keys for each provider below. Select which key to use. Choose an AI provider in chat, or use Tavily in News &amp; Research.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ProviderKeyManager provider="openrouter" label="OpenRouter" />
        <ProviderKeyManager provider="mistral" label="Mistral" />
        <ProviderKeyManager provider="groq" label="Groq" />
        <ProviderKeyManager provider="google" label="Google · Gemini" />
        <ProviderKeyManager provider="tavily" label="Tavily · Research & news" />
      </div>
      <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/5 p-4 text-[11px] leading-5 text-amber-100">
        Keys remain only in this page session’s memory, not browser storage, workspace exports, or source files. Refreshing closes the session and removes them. Keys travel through this app’s server to the selected provider; use HTTPS and a trusted deployment. Provider usage may incur charges.
      </div>
      <p className="mt-4 text-[11px] leading-5 text-slate-400">
        Tavily supports news and research search. Accounts, cloud saves, and coin purchases remain disabled without a database.
      </p>
    </section>
  );
}
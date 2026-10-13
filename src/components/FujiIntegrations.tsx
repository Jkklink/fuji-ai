import { useState } from 'react';
import { LockKeyhole, RefreshCw, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiRequest, hasAccess, setAccessPassword, type ProviderStatus } from '@/lib/api';
import { toast } from 'sonner';
export function FujiIntegrations() {
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const check = async (unlock = false) => {
    setBusy(true); setError('');
    if (unlock) setAccessPassword(draft);
    try { const result = await apiRequest<{ providers: ProviderStatus }>('status', {}); setStatus(result.providers); setDraft(''); toast.success('Server access verified'); }
    catch (e) { setStatus(null); setError((e as Error).message); if (unlock) setAccessPassword(''); }
    finally { setBusy(false); }
  };
  return <section className="panel p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck size={19} className="text-cyan-300" /> Server access & providers</h2><p className="mt-3 text-sm leading-6 text-slate-400">Single-user mode. Your server password unlocks paid API requests; it is kept only in memory and clears on refresh. Chats still save on this browser. Never enter provider API keys here.</p><form className="mt-5 flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); check(true); }}><Input type="password" autoComplete="off" aria-label="Server access password" placeholder="Server access password" value={draft} maxLength={256} onChange={e => setDraft(e.target.value)} className="field min-w-0 flex-1" /><Button disabled={busy || draft.length < 16} className="amber-button gap-2"><LockKeyhole size={15} /> {busy ? 'Checking…' : 'Unlock'}</Button></form>{hasAccess() && <div className="mt-3 flex gap-3"><button onClick={() => check()} disabled={busy} className="text-link"><RefreshCw size={13} /> Refresh status</button><button onClick={() => { setAccessPassword(''); setStatus(null); }} className="text-link">Lock access</button></div>}{error && <p role="alert" className="mt-4 rounded-xl bg-red-400/10 p-3 text-xs text-red-200">{error}</p>}<div className="mt-5 space-y-2">{(['openrouter', 'mistral', 'groq', 'tavily'] as const).map(id => <div key={id} className="flex justify-between rounded-xl bg-white/[.03] p-3 text-xs"><span className="capitalize">{id === 'tavily' ? 'Tavily · Research & news' : id}</span><span className={status?.[id] ? 'text-cyan-300' : 'text-amber-300'}>{status ? status[id] ? 'Key configured' : 'Key missing' : 'Not verified'}</span></div>)}</div><p className="mt-4 text-[11px] leading-6 text-slate-400">A configured key is not a verified provider connection. Chat/search requests verify access and quota. Set rotated keys as NITRO_OPENROUTER_API_KEY, NITRO_MISTRAL_API_KEY, NITRO_GROQ_API_KEY, and NITRO_TAVILY_API_KEY in your hosting environment. Set NITRO_ACCESS_PASSWORD (16+ characters) to protect the server.</p><p className="mt-3 text-[11px] leading-6 text-amber-200">FreeNews integration is not enabled: the provider name alone does not identify its endpoint or authentication format. Tavily supports news search meanwhile. Accounts, cloud saves, and coin purchases remain disabled without a database.</p></section>;
}

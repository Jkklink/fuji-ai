import { useState } from 'react';
import { FlaskConical, Loader2, Heart, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest, hasProviderKey, type Provider } from '@/lib/api';
import { type MaturityMode } from '@/lib/maturity';
import { characters, type Workspace, getRelationship, type CharacterId } from '@/lib/fuji';

type TestResult = { mode: MaturityMode; provider: Provider; content?: string; error?: string; time: string };
export function FujiMaturity({ mode, onChange, workspace }: { mode: MaturityMode; onChange: (mode: MaturityMode) => void; workspace: Workspace }) {
  const [provider, setProvider] = useState<Provider>('openrouter');
  const [results, setResults] = useState<TestResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [relChar, setRelChar] = useState<CharacterId>('sanji');
  const test = async () => {
    setBusy(true); setResults([]);
    for (const maturity of ['sfw', 'mature'] as const) {
      try {
        const result = await apiRequest<{ content: string; maturity: MaturityMode }>('chat', {
          provider, maturity, members: ['sanji'], speaker: 'sanji', memories: [],
          messages: [{ role: 'user', content: maturity === 'sfw'
            ? 'In our fictional story we are both 25 and have been dating for a year. I ask whether you would like to hold my hand and share a brief goodnight kiss. Reply naturally as yourself, without deciding my actions.'
            : 'In our fictional story we are both 25, have been dating for a year, and have freely agreed we want this closeness. I ask for a passionate kiss and a quiet moment holding each other, with adult romantic tension but no graphic sexual detail. Reply naturally as yourself, respect boundaries, and do not cut away merely because this is romantic.' }],
        }, provider);
        setResults(previous => [...previous, { mode: maturity, provider, content: result.content, time: new Date().toLocaleTimeString() }]);
      } catch (e) { setResults(previous => [...previous, { mode: maturity, provider, error: (e as Error).message, time: new Date().toLocaleTimeString() }]); }
    }
    setBusy(false);
  };
  const rel = getRelationship(workspace, relChar);
  const relCharObj = characters.find(c => c.id === relChar)!;
  return <section className="panel p-6">
    <h2 className="text-lg font-semibold">Story maturity</h2>
    <p className="mt-2 text-xs leading-6 text-slate-400">Saved for this local workspace and applied to new chats, existing conversations, groups, and journeys. No authenticated accounts are configured, so this is not cloud-synced per-user storage.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {([{ value: 'sfw', title: 'SFW', text: 'General-audience stories. Gentle flirting, affection, brief kisses. Cinematic combat with consequences but no graphic gore. Full emotional depth is always on.' }, { value: 'mature', title: 'Mature', text: 'Clearly adult, consensual romance with tension, kissing, passion, and non-graphic intimacy. Intense fictional violence with blood, lasting injuries, and character death. No fade-to-black by default.' }] as const).map(option => <button key={option.value} aria-pressed={mode === option.value} onClick={() => onChange(option.value)} className={`rounded-xl border p-4 text-left transition-colors ${mode === option.value ? 'border-amber-400 bg-amber-400/10' : 'border-white/10 bg-white/[.03] hover:border-white/20'}`}><h3 className="text-sm font-semibold">{option.title}</h3><p className="mt-2 text-xs leading-5 text-slate-300">{option.text}</p></button>)}
    </div>
    <p className="mt-4 text-xs leading-6 text-slate-400">Romance follows character choices and ongoing consent. Mature is non-graphic, not unrestricted. Provider/model restrictions still apply. Changing the mode affects future replies; it does not erase older messages or memories.</p>

    <div className="mt-5 rounded-xl border border-cyan-300/15 bg-cyan-300/[.03] p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-cyan-200"><Heart size={14} /> Relationship status</div>
      <p className="mt-2 text-[11px] leading-5 text-slate-400">Your companions remember how you treat them. These states develop through your conversations and influence how characters respond to you.</p>
      <div className="mt-3 flex flex-wrap gap-2">{characters.map(c => <button key={c.id} onClick={() => setRelChar(c.id)} className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${relChar === c.id ? 'border-amber-400 bg-amber-400/10 text-amber-200' : 'border-white/10 text-slate-300 hover:border-white/20'}`}>{c.name}</button>)}</div>
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <Shield size={14} className="shrink-0 text-cyan-300" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px]"><span className="text-slate-300">Trust</span><span className="text-slate-400">{rel.trust}/100</span></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${rel.trust}%` }} /></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Heart size={14} className="shrink-0 text-rose-300" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px]"><span className="text-slate-300">Affection</span><span className="text-slate-400">{rel.affection}/100</span></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-rose-400 transition-all" style={{ width: `${rel.affection}%` }} /></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TrendingUp size={14} className="shrink-0 text-amber-300" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px]"><span className="text-slate-300">Tension</span><span className="text-slate-400">{rel.tension}/100</span></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${rel.tension}%` }} /></div>
          </div>
        </div>
        {rel.notes && <p className="rounded-lg border border-white/10 bg-white/[.03] p-3 text-[11px] leading-5 text-slate-300"><span className="font-medium text-slate-200">{relCharObj.name}: </span>{rel.notes}</p>}
      </div>
    </div>

    <details className="mt-5 border-t border-white/10 pt-4"><summary className="cursor-pointer text-xs text-cyan-300">Test real provider responses</summary><p className="mt-3 text-xs leading-6 text-slate-400">Runs two actual requests using this provider's active session key. These are isolated tests: they do not change your preference, memories, or chats. Provider usage may incur charges. Returned text is evidence of a response—not automatic certification of compliance or maturity support.</p><div className="mt-3 flex flex-wrap gap-3"><select aria-label="Maturity test provider" disabled={busy} className="field rounded-xl px-3 py-2 text-xs" value={provider} onChange={e => setProvider(e.target.value as Provider)}><option value="openrouter">OpenRouter</option><option value="mistral">Mistral</option><option value="groq">Groq</option></select><Button onClick={test} disabled={busy} className="amber-button gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />} {busy ? 'Testing…' : 'Test both modes'}</Button></div>{!hasProviderKey(provider) && <p className="mt-2 text-xs text-amber-200">Add a key for this provider below first.</p>}<div className="mt-4 space-y-3" aria-live="polite">{results.map(result => <div key={result.mode} className="rounded-xl border border-white/10 p-4"><p className="text-xs font-medium capitalize">{result.provider} · {result.mode} · {result.time}</p><p className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${result.error ? 'text-red-200' : 'text-slate-200'}`}>{result.error || result.content}</p></div>)}</div></details>
  </section>;
}

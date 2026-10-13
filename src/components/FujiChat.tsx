import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, BookmarkPlus, Download, ShieldCheck, Loader2, RefreshCw, Globe, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { characters, type Room, type Workspace, type Message, getRelationship } from '@/lib/fuji';
import { apiRequest, hasProviderKey, type Provider } from '@/lib/api';
import { animeWorlds } from '@/components/FujiRoleplay';
import { toast } from 'sonner';
import { conversationParts } from '@/lib/chat-text';
export function FujiChat({ room, workspace, updateRoom, addMemory, back }: { room: Room; workspace: Workspace; updateRoom: (room: Room) => void; addMemory: (text: string) => void; back: () => void }) {
  const [draft, setDraft] = useState('');
  const [provider, setProvider] = useState<Provider>('openrouter');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [destination, setDestination] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [room.messages.length, busy]);
  const requestReply = async (current: Room) => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const messages = current.messages.filter(m => m.role !== 'preview').slice(-30).map(m => ({ role: m.role as 'user' | 'assistant', content: m.character && m.role === 'assistant' ? `${m.character}: ${m.content}` : m.content }));
      while (messages.length > 1 && JSON.stringify(messages).length > 55000) messages.shift();
      const memories = workspace.memories.filter(m => m.character === 'all' || current.members.includes(m.character)).slice(0, 10).map(m => m.text.slice(0, 3000));
      let updated = current;
      const lastUserIndex = current.messages.map(m => m.role).lastIndexOf('user');
      const replied = new Set(current.messages.slice(lastUserIndex + 1).filter(m => m.role === 'assistant').map(m => m.character));
      for (const speaker of current.members.filter(id => !replied.has(id))) {
        const rel = getRelationship(workspace, speaker);
        const result = await apiRequest<{ content: string }>('chat', { provider, members: current.members, speaker, messages, memories, world: current.world, premise: current.premise, worldDetails: current.worldDetails, maturity: workspace.maturity, relationship: { trust: rel.trust, affection: rel.affection, tension: rel.tension, notes: rel.notes } }, provider);
        const reply: Message = { id: crypto.randomUUID(), role: 'assistant', content: result.content, time: new Date().toISOString(), character: speaker };
        const cleaned = conversationParts(reply).filter(part => !part.character || part.character === speaker).map(part => part.content).join(' ').trim();
        if (!cleaned) throw new Error('The companion returned an empty reply. Please retry.');
        updated = { ...updated, updated: new Date().toISOString(), messages: [...updated.messages, { ...reply, content: cleaned }] };
        updateRoom(updated);
        messages.push({ role: 'assistant', content: `${speaker}: ${cleaned}` });
        while (messages.length > 30 || (messages.length > 1 && JSON.stringify(messages).length > 55000)) messages.shift();
      }
    } catch (e) { if (mounted.current) setError((e as Error).message); }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  };
  const send = async (content = draft.trim(), nextWorld?: string) => {
    if (!content || pending.current) return;
    const message: Message = { id: crypto.randomUUID(), role: 'user', content, time: new Date().toISOString() };
    const current = { ...room, ...(nextWorld ? { world: nextWorld, worlds: [...(room.worlds || [room.world!]), nextWorld] } : {}), updated: new Date().toISOString(), messages: [...room.messages, message] };
    updateRoom(current); setDraft('');
    if (nextWorld) setDestination('');
    if (!hasProviderKey(provider)) { setError('Message saved locally. Add a key for the selected provider in Settings for live replies.'); return; }
    await requestReply(current);
  };
  const exportChat = () => {
    const blob = new Blob([`${room.title}\n${room.world ? `Worlds: ${room.worlds?.join(' → ')}\n` : ''}\n` + room.messages.map(m => `${m.role === 'user' ? workspace.name : m.role === 'preview' ? 'Preview greeting' : m.character || 'Fuji AI'}: ${m.content}`).join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `fuji-chat-${room.id}.txt`; a.click(); URL.revokeObjectURL(url);
  };
  return <section className="panel relative flex min-h-[600px] flex-col overflow-hidden">
    {workspace.wallpaper && <><img src="/assets/chat-wallpaper.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" /><div className="absolute inset-0 bg-[#10182a]/50" /></>}
    <header className="relative flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#10182a]/80 p-4"><button onClick={back} aria-label="Back to conversations" className="p-2 text-slate-400"><ArrowLeft size={18} /></button><div className="flex -space-x-2">{room.members.map(id => <img key={id} src={`/assets/${id}.png`} alt={id} className="h-9 w-9 rounded-full border-2 border-[#10182a] object-cover" />)}</div><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold">{room.title}</h2><p className="mt-1 text-[10px] capitalize text-cyan-300">{room.kind} · Saved on this browser</p></div><select aria-label="AI provider" value={provider} disabled={busy} onChange={e => setProvider(e.target.value as Provider)} className="field rounded-lg p-2 text-xs"><option value="openrouter">OpenRouter</option><option value="mistral">Mistral</option><option value="groq">Groq</option></select><button onClick={exportChat} aria-label="Export conversation" className="p-2 text-slate-400 hover:text-amber-300"><Download size={18} /></button></header>
    <div className="relative mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-400/15 bg-[#172034]/90 p-3 text-[11px] leading-5 text-amber-200"><ShieldCheck size={16} className="mt-0.5 shrink-0" /> {hasProviderKey(provider) ? 'Your session key is ready. Messages and relevant journal memories are sent through the server to the selected AI provider when you request a reply.' : 'Add your API key in Settings for this provider. No access password is required. You can still save messages locally.'} Browser storage is not an authenticated private account.</div>
    {room.kind === 'roleplay' && <div className="relative mx-4 mt-3 rounded-xl border border-cyan-300/15 bg-[#10182a]/90 p-4"><p className="flex items-center gap-2 text-xs text-cyan-300"><Globe size={15} /> Current world: {room.world}</p><p className="mt-2 text-[10px] text-slate-400">Journey: {room.worlds?.join(' → ')}</p><form onSubmit={e => { e.preventDefault(); if (destination.trim()) send(`Our party enters a portal to ${destination.trim()}. Continue our journey in this new world, preserving our shared story and companions.`, destination.trim()); }} className="mt-3 flex flex-wrap gap-2"><Input aria-label="Next anime world" list="portal-worlds" className="field min-w-0 flex-1 text-xs" maxLength={200} placeholder="Next anime world or custom destination…" value={destination} disabled={busy} onChange={e => setDestination(e.target.value)} /><datalist id="portal-worlds">{animeWorlds.map(w => <option key={w} value={w} />)}</datalist><Button disabled={busy || !destination.trim()} className="amber-button text-xs">Enter portal</Button></form></div>}
    <div className="relative flex max-h-[480px] min-h-52 flex-1 flex-col gap-2.5 overflow-y-auto p-3 sm:p-4">
      {!room.messages.length && <div className="py-10 text-center"><Globe size={30} className="mx-auto text-cyan-300" /><h3 className="mt-4 font-display text-2xl">Your party is ready.</h3><p className="mt-2 text-xs text-slate-400">Begin the scene, or describe your first action below.</p><Button disabled={busy} onClick={() => send(`Begin our journey in ${room.world}. ${room.premise || ''} Introduce the scene and our selected companions, then let me choose my first action.`)} className="amber-button mt-5 gap-2"><Play size={14} /> Begin the scene</Button></div>}
      {room.messages.flatMap(conversationParts).map(message => <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
        {message.role !== 'user' && <img src={`/assets/${message.character || room.members[0]}.png`} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />}
        <div className={`group relative max-w-[90%] rounded-2xl px-3 py-2 sm:max-w-[78%] ${message.role === 'user' ? 'rounded-tr-sm bg-amber-400/15' : 'rounded-tl-sm border border-white/10 bg-[#172238]'}`}><p className="whitespace-pre-wrap break-words text-sm leading-5">{message.content}</p><div className="mt-1 flex items-center justify-end gap-2 text-[9px] text-slate-500"><button onClick={() => { addMemory(message.content); toast.success('Saved to your memory journal'); }} aria-label="Save message to memory" className="text-slate-400 hover:text-amber-300"><BookmarkPlus size={11} /></button><span>{new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div></div>
      </div>)}{busy && <p role="status" className="flex items-center gap-2 text-xs text-cyan-300"><Loader2 size={15} className="animate-spin" /> {room.kind === 'roleplay' ? 'The next scene is unfolding…' : 'Your companions are thinking…'}</p>}<div ref={end} />
    </div>
    {error && <p role="alert" className="relative mx-4 rounded-xl bg-red-400/10 p-3 text-xs text-red-200">{error}</p>}
    {(room.messages.at(-1)?.role === 'user' || Boolean(error)) && !busy && <button onClick={() => requestReply(room)} className="text-link relative mx-5 mt-3 self-start text-cyan-300"><RefreshCw size={13} /> Request / retry reply</button>}
    <form onSubmit={e => { e.preventDefault(); send(); }} className="relative m-4 mt-auto pt-4"><div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-[#10182a] p-2"><Textarea value={draft} disabled={busy} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={room.kind === 'roleplay' ? 'What do you do or say next?' : 'Write a message…'} maxLength={10000} className="min-h-12 resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0" /><Button type="submit" disabled={busy || !draft.trim()} className="amber-button mb-1 h-10 w-10 shrink-0 p-0" aria-label="Send message"><Send size={16} /></Button></div><p className="mt-2 text-center text-[9px] text-slate-400">AI can make mistakes · Saves stay local · Enter to send · Shift + Enter for a new line</p></form>
  </section>;
}

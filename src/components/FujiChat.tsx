import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, BookmarkPlus, Download, MessageCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { characters, type Room, type Workspace } from '@/lib/fuji';
import { toast } from 'sonner';
export function FujiChat({ room, workspace, updateRoom, addMemory, back }: { room: Room; workspace: Workspace; updateRoom: (room: Room) => void; addMemory: (text: string) => void; back: () => void }) {
  const [draft, setDraft] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [room.messages.length]);
  const send = () => {
    if (!draft.trim()) return;
    updateRoom({ ...room, updated: new Date().toISOString(), messages: [...room.messages, { id: crypto.randomUUID(), role: 'user', content: draft.trim(), time: new Date().toISOString() }] });
    setDraft('');
    toast('Message saved locally. Connect a database and AI provider to receive companion replies.');
  };
  const exportChat = () => {
    const blob = new Blob([room.messages.map(m => `${m.role === 'user' ? workspace.name : 'Preview greeting'}: ${m.content}`).join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `fuji-chat-${room.id}.txt`; a.click(); URL.revokeObjectURL(url);
  };
  return <section className="panel relative flex min-h-[600px] flex-col overflow-hidden">
    {workspace.wallpaper && <><img src="/assets/chat-wallpaper.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" /><div className="absolute inset-0 bg-[#10182a]/50" /></>}
    <header className="relative flex items-center gap-3 border-b border-white/10 bg-[#10182a]/80 p-4"><button onClick={back} aria-label="Back to conversations" className="p-2 text-slate-400"><ArrowLeft size={18} /></button><div className="flex -space-x-2">{room.members.map(id => <img key={id} src={`/assets/${id}.png`} alt={id} className="h-10 w-10 rounded-full border-2 border-[#10182a] object-cover" />)}</div><div className="flex-1"><h2 className="text-sm font-semibold">{room.title}</h2><p className="mt-1 text-[10px] text-cyan-300">{room.kind === 'private' ? 'Personal' : room.kind === 'duo' ? 'Duo' : 'Group'} conversation · Local preview</p></div><button onClick={exportChat} aria-label="Export conversation" className="p-2 text-slate-400 hover:text-amber-300"><Download size={18} /></button></header>
    <div className="relative mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-400/15 bg-[#172034]/90 p-3 text-[11px] leading-5 text-amber-200"><ShieldCheck size={16} className="mt-0.5 shrink-0" /> AI is not connected. You can compose and save messages here, but companions cannot reply yet. These chats are stored on this browser, not in a secure account.</div>
    <div className="relative flex max-h-[480px] flex-1 flex-col gap-5 overflow-y-auto p-5">
      {room.messages.map(message => <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
        {message.role !== 'user' && <img src={`/assets/${message.character || room.members[0]}.png`} alt="" className="h-8 w-8 rounded-full object-cover" />}
        <div className={`group max-w-[85%] rounded-2xl p-3.5 sm:max-w-[70%] ${message.role === 'user' ? 'rounded-tr-sm bg-amber-400/15' : 'rounded-tl-sm border border-white/10 bg-[#172238]'}`}><div className="mb-1 flex items-center justify-between gap-4 text-[10px] text-slate-400"><span>{message.role === 'user' ? workspace.name : `${characters.find(c => c.id === message.character)?.name || 'Companion'} · Preview greeting`}</span><button onClick={() => { addMemory(message.content); toast.success('Saved to your memory journal'); }} aria-label="Save message to memory" className="text-slate-400 hover:text-amber-300"><BookmarkPlus size={13} /></button></div><p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p><p className="mt-1.5 text-right text-[9px] text-slate-500">{new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
      </div>)}<div ref={end} />
    </div>
    <form onSubmit={e => { e.preventDefault(); send(); }} className="relative m-4 mt-auto"><div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-[#10182a] p-2"><Textarea value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Write a message…" maxLength={10000} className="min-h-12 resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0" /><Button type="submit" disabled={!draft.trim()} className="amber-button mb-1 h-10 w-10 shrink-0 p-0" aria-label="Save message"><Send size={16} /></Button></div><p className="mt-2 text-center text-[9px] text-slate-400"><MessageCircle size={10} className="mr-1 inline" /> Your words stay on this device. Enter to save · Shift + Enter for a new line.</p></form>
  </section>;
}

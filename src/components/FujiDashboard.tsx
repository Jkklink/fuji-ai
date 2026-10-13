import { ArrowUpRight, ArrowRight, Sparkles, MessageCircle, Users, Swords, Bookmark, Plus, ChevronRight, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { characters, type Workspace, type CharacterId } from '@/lib/fuji';
export function FujiDashboard({ workspace, navigate, startChat }: { workspace: Workspace; navigate: (page: string) => void; startChat: (id: CharacterId) => void }) {
  return <div className="space-y-8 pb-8">
    <section className="sanctuary relative overflow-hidden rounded-2xl border border-white/10">
      <img src="/assets/fuji-sanctuary.png" alt="Mount Fuji overlooking a lantern-lit sanctuary at blue hour" className="absolute inset-0 h-full w-full object-cover object-[65%_55%]" />
      <div className="absolute inset-0 bg-[#0b1428]/45" />
      <div className="relative max-w-xl px-6 py-9 sm:px-9 sm:py-11">
        <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold tracking-[.24em] text-amber-300"><span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> YOUR LITTLE CORNER OF THE WORLD</div>
        <h2 className="font-display text-4xl font-medium leading-[1.15] sm:text-[45px]">A familiar face.<br />A whole new possibility.</h2>
        <p className="mt-4 max-w-[340px] text-sm leading-6 text-slate-200">Good conversations, unexpected adventures, and companions that grow with you.</p>
        <Button onClick={() => startChat('sanji')} className="amber-button mt-6 gap-3 px-5">Find your connection <ArrowRight size={16} /></Button>
      </div>
      <div className="absolute bottom-5 right-6 hidden items-center gap-2 rounded-full border border-white/20 bg-slate-900/50 px-3 py-1.5 text-[10px] tracking-wider text-slate-200 sm:flex"><Leaf size={12} className="text-cyan-300" /> A SPACE TO JUST BE</div>
    </section>
    <section>
      <div className="section-heading"><div><div className="eyebrow">BETTER TOGETHER</div><h2 className="mt-1 text-xl font-semibold tracking-tight">Meet your companions <span className="ml-2 text-sm font-normal text-slate-500">04</span></h2></div><button onClick={() => navigate('characters')} className="text-link">Character archive <ArrowUpRight size={15} /></button></div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        {characters.map(c => <button key={c.id} onClick={() => startChat(c.id)} className="companion-card group text-left">
          <div className="relative h-48 overflow-hidden sm:h-60 xl:h-[218px]">
            <img src={`/assets/${c.id}.png`} alt={`${c.name}, an adult anime-inspired companion`} className="h-full w-full object-cover object-[center_27%] transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-[#101a2c]/80 px-2.5 py-1 text-[8px] font-semibold tracking-[.1em] text-white">{c.label}</span>
            <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-slate-950/50 text-white transition-colors group-hover:bg-amber-500 group-hover:text-slate-950"><ArrowUpRight size={16} /></span>
          </div>
          <div className="p-4"><div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{c.name}</h3><span className="flex items-center gap-1 text-[9px] text-slate-400"><span className="h-1 w-1 rounded-full" style={{ background: c.color }} /> PREVIEW</span></div><p className="mt-1 text-[11px] text-slate-400">{c.role}</p><div className="mt-4 flex flex-wrap gap-1.5">{c.tags.map(tag => <span key={tag} className="rounded-md bg-white/[.04] px-2 py-1 text-[9px]" style={{ color: c.color }}>{tag}</span>)}</div></div>
        </button>)}
      </div>
    </section>
    <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      <div className="panel p-5"><div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold"><MessageCircle size={16} className="text-cyan-300" /> Pick up where you left off</h2><button onClick={() => navigate('chats')} className="text-link text-[11px]">View all <ChevronRight size={14} /></button></div>
        {workspace.rooms.length ? workspace.rooms.slice().sort((a,b) => b.updated.localeCompare(a.updated)).slice(0, 2).map(room => <button key={room.id} onClick={() => navigate(`room/${room.id}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/5"><img src={`/assets/${room.members[0]}.png`} alt="" className="h-10 w-10 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="text-xs font-medium">{room.title}</p><p className="mt-1 truncate text-[11px] text-slate-400">{room.messages.at(-1)?.content || 'Your conversation starts here'}</p></div><ChevronRight size={14} className="text-slate-500" /></button>) : <div className="flex items-center gap-4 rounded-xl border border-dashed border-white/10 p-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-300/5 text-cyan-300"><MessageCircle size={20} /></div><div><p className="text-xs font-medium">Every connection starts with a hello.</p><p className="mt-1 text-[11px] text-slate-400">Start a chat and find it right here.</p></div><button aria-label="Start a conversation" onClick={() => startChat('sanji')} className="ml-auto text-amber-300"><Plus size={18} /></button></div>}
      </div>
      <div className="panel relative overflow-hidden p-5"><span className="absolute -right-4 -top-4 text-amber-400/[.05]"><Swords size={160} strokeWidth={1} /></span><div className="relative"><div className="mb-3 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-amber-300"><Sparkles size={13} /> BEYOND THE EVERYDAY</div><h3 className="font-display text-2xl">Your next story is waiting.</h3><p className="mt-2 max-w-[290px] text-xs leading-5 text-slate-400">Step into a new world with your companion.<br />You choose where the story goes.</p><button onClick={() => navigate('journeys')} className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-300">Explore journeys <ArrowRight size={14} /></button></div></div>
    </section>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[{ icon: Users, title: 'More voices. More possibilities.', sub: 'Bring companions together in Duo Mode.', page: 'duo', color: 'text-cyan-300' }, { icon: Bookmark, title: 'The little things matter.', sub: `${workspace.memories.length} memories in your local journal.`, page: 'memory', color: 'text-amber-300' }, { icon: Sparkles, title: 'Made for your kind of curious.', sub: 'Collect ideas in News & Research.', page: 'news', color: 'text-violet-300' }].map(item => <button onClick={() => navigate(item.page)} key={item.page} className="flex items-start gap-3 rounded-xl border border-white/[.06] p-4 text-left transition-colors hover:bg-white/[.03]"><item.icon size={17} className={`mt-0.5 shrink-0 ${item.color}`} /><div><h3 className="text-[11px] font-medium">{item.title}</h3><p className="mt-1 text-[10px] leading-4 text-slate-400">{item.sub}</p></div></button>)}</section>
  </div>;
}

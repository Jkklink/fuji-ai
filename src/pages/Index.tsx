import { ArrowLeft, Compass, Menu, Mountain, Settings, Sparkles, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FujiChat } from '@/components/FujiChat';
import { FujiRoleplay } from '@/components/FujiRoleplay';
import { useWorkspace } from '@/hooks/use-workspace';
import { FujiWorkspaceViews } from '@/components/FujiWorkspaceViews';

export default function Index() {
  const { page: pageParam, roomId } = useParams();
  const routerNavigate = useNavigate();
  const [workspace, setWorkspace] = useWorkspace();
  const page = roomId ? 'room' : pageParam === 'settings' ? 'settings' : 'journeys';
  const room = workspace.rooms.find(item => item.id === roomId);
  const navigate = (target: string) => routerNavigate(target === 'settings' ? '/settings' : target.startsWith('room/') ? `/${target}` : '/journeys');

  return <div className="journey-shell relative min-h-screen overflow-hidden text-foreground">
    <img src="/assets/chat-wallpaper.png" alt="" aria-hidden="true" className="journey-wallpaper pointer-events-none absolute inset-0 h-full w-full object-cover" />
    <div className="journey-atmosphere pointer-events-none absolute inset-0" />
    <header className="journey-header sticky top-0 z-30 border-b border-white/10 bg-[#07152b]/90 px-5 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between gap-4">
        <button onClick={() => navigate('journeys')} className="flex items-center gap-3 text-left" aria-label="Open Journey home">
          <span className="journey-mark"><Mountain size={21} /></span>
          <span><span className="block font-display text-xl font-semibold tracking-[.18em] text-white">JOURNEY</span><span className="block text-[8px] tracking-[.3em] text-cyan-200/65">YOUR NEXT WORLD AWAITS</span></span>
        </button>
        <div className="hidden items-center gap-2 text-[10px] tracking-[.18em] text-slate-400 sm:flex"><Compass size={15} className="text-cyan-300" /> SINGLE PLAYER STORY MODE</div>
        <div className="flex items-center gap-2"><button type="button" onClick={() => navigate('settings')} className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[10px] tracking-[.12em] text-slate-300 hover:border-cyan-200/30 hover:text-cyan-100 sm:flex" aria-label="Open Journey settings"><Settings size={14} /> SETTINGS</button><button onClick={() => navigate('settings')} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white sm:hidden" aria-label="Open Journey settings"><Menu size={20} /></button></div>
      </div>
    </header>
    <main className="relative mx-auto max-w-[1320px] px-5 py-7 sm:px-8 sm:py-10">
      {page === 'journeys' && <FujiRoleplay workspace={workspace} save={setWorkspace} navigate={navigate} />}
      {page === 'settings' && <div className="space-y-5"><button type="button" onClick={() => navigate('journeys')} className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-200"><X size={15} /> Close settings</button><FujiWorkspaceViews page="settings" workspace={workspace} save={setWorkspace} navigate={navigate} startRoom={() => undefined} /></div>}
      {page === 'room' && (room ? <div className="space-y-4"><Button variant="ghost" onClick={() => navigate('journeys')} className="gap-2 px-0 text-slate-400 hover:bg-transparent hover:text-cyan-200"><ArrowLeft size={16} /> All journeys</Button><FujiChat key={room.id} room={room} workspace={workspace} back={() => navigate('journeys')} updateRoom={updated => setWorkspace(prev => ({ ...prev, rooms: prev.rooms.map(item => item.id === updated.id ? updated : item) }))} addMemory={() => undefined} /></div> : <div className="journey-empty panel mx-auto max-w-lg p-8 text-center"><Sparkles className="mx-auto text-amber-300" /><h2 className="mt-4 font-display text-2xl">This journey has moved on.</h2><p className="mt-2 text-sm text-slate-400">Choose another mission to continue your story.</p><Button className="amber-button mt-5" onClick={() => navigate('journeys')}>Return to Journey</Button></div>)}
    </main>
    <footer className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 pb-8 text-[9px] tracking-[.14em] text-slate-500 sm:px-8"><span>JOURNEY / FICTIONAL WORLDS / YOUR CHOICES</span><span className="hidden sm:block">A QUIET PLACE FOR BIG ADVENTURES</span></footer>
  </div>;
}

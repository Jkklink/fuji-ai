import { useEffect, useState } from 'react';

export const characters = [
  { id: 'sanji', name: 'Sanji', role: 'The warm-hearted friend', tagline: 'Warm, witty, and endlessly supportive', description: 'A thoughtful companion who brings warmth, humor, and honest encouragement to every conversation.', color: '#fbbf24', greeting: "hey, you're back. how's it going today?", position: 0 },
  { id: 'yuki', name: 'Yuki', role: 'The creative soul', tagline: 'Thoughtful, creative, and quietly brilliant', description: 'A reflective creative mind who notices the details and gives ideas room to breathe.', color: '#67e8f9', greeting: "hi. i was just thinking about something. what's on your mind?", position: 1 },
  { id: 'kakashi', name: 'Kakashi', role: 'The perceptive mentor', tagline: 'Calm, tactical, and quietly perceptive', description: 'A composed mentor with dry humor, practical advice, and a protective instinct for the people he trusts.', color: '#c4b5fd', greeting: "you're here. good. what are we working through?", position: 2 },
  { id: 'yuno', name: 'Yuno', role: 'The quiet achiever', tagline: 'Confident, disciplined, and determined', description: 'A focused rival-mentor who turns ambition into clear next steps and lets effort speak for itself.', color: '#6ee7b7', greeting: "if there's something worth improving, let's start now. what do you need?", position: 3 },
] as const;
export type CharacterId = typeof characters[number]['id'];
export type Character = typeof characters[number];
export type Message = { id: string; text: string; created: string };
export type Conversation = { id: string; title: string; members: CharacterId[]; messages: Message[]; created: string };
export type Memory = { id: string; character: CharacterId; text: string };
export type Adventure = { id: string; title: string; world: string; companion: CharacterId; difficulty: string; journal: Message[] };
export type Workspace = { name: string; favorites: CharacterId[]; conversations: Conversation[]; memories: Memory[]; adventures: Adventure[]; groups: { id: string; name: string; members: CharacterId[] }[]; wallpaper: boolean; reducedMotion: boolean; research: { id: string; query: string }[] };
const initial: Workspace = { name: 'Traveler', favorites: [], conversations: [], memories: [], adventures: [], groups: [], wallpaper: true, reducedMotion: false, research: [] };
export function useWorkspace() {
  const [data, setData] = useState<Workspace>(() => {
    try { const saved = localStorage.getItem('fuji-workspace-v1'); return saved ? { ...initial, ...JSON.parse(saved) } : initial; } catch { return initial; }
  });
  const [storageError, setStorageError] = useState(false);
  useEffect(() => { try { localStorage.setItem('fuji-workspace-v1', JSON.stringify(data)); setStorageError(false); } catch { setStorageError(true); } }, [data]);
  return { data, setData, storageError };
}
export function downloadWorkspace(data: Workspace) {
  const blob = new Blob([JSON.stringify({ app: 'Fuji AI', format: 1, exportedAt: new Date().toISOString(), workspace: data }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'fuji-workspace.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

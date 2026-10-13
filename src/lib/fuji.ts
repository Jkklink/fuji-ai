export type CharacterId = 'sanji' | 'yuki' | 'kakashi' | 'yuno';
export const characters = [
  { id: 'sanji' as CharacterId, name: 'Sanji', role: 'Your everyday confidant', tagline: 'Warm, witty & always in your corner', description: 'A thoughtful companion who brings warmth, humor, and honest encouragement to every conversation.', color: '#f5b646', greeting: "hey, you're back. how's it going today?", tags: ['Supportive', 'Witty'], label: 'THE WARM SOUL' },
  { id: 'yuki' as CharacterId, name: 'Yuki', role: 'Your creative kindred spirit', tagline: 'A little wonder. A new perspective.', description: 'A reflective creative mind who notices the details and gives ideas room to breathe.', color: '#67d4e8', greeting: "hi. i was just thinking about something. what's on your mind?", tags: ['Creative', 'Thoughtful'], label: 'THE DREAMER' },
  { id: 'kakashi' as CharacterId, name: 'Kakashi', role: 'Your calm, perceptive mentor', tagline: 'Less noise. More clarity.', description: 'A composed mentor with dry humor, practical advice, and a protective instinct.', color: '#b7bed5', greeting: "you're here. good. what are we working through?", tags: ['Wise', 'Grounded'], label: 'THE QUIET MENTOR' },
  { id: 'yuno' as CharacterId, name: 'Yuno', role: 'Your partner in becoming', tagline: 'Small steps. Unshakable ambition.', description: 'A focused rival-mentor who turns ambition into clear next steps and lets effort speak for itself.', color: '#79d5ad', greeting: "ready to take the next step? let's make it count.", tags: ['Focused', 'Determined'], label: 'THE STEADY RIVAL' },
];
export type Message = { id: string; role: 'user' | 'preview'; content: string; character?: CharacterId; time: string };
export type Room = { id: string; title: string; kind: 'private' | 'duo' | 'group'; members: CharacterId[]; messages: Message[]; updated: string };
export type Memory = { id: string; text: string; character: CharacterId | 'all'; created: string };
export type Adventure = { id: string; title: string; companion: CharacterId; step: number; path: string[]; updated: string };
export type Research = { id: string; title: string; url: string; note: string };
export type Workspace = { name: string; rooms: Room[]; memories: Memory[]; adventures: Adventure[]; research: Research[]; wallpaper: boolean };
export const emptyWorkspace: Workspace = { name: 'Traveler', rooms: [], memories: [], adventures: [], research: [], wallpaper: true };
export function downloadWorkspace(workspace: Workspace) {
  const blob = new Blob([JSON.stringify({ format: 'fuji-local-workspace', version: 1, exportedAt: new Date().toISOString(), workspace }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'fuji-workspace.json'; link.click(); URL.revokeObjectURL(url);
}

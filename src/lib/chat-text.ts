import { characters, type Message } from '@/lib/fuji';

export function conversationParts(message: Message): Message[] {
  if (message.role === 'user') return [message];
  const text = message.content.replace(/\*/g, '').replace(/\r\n/g, '\n');
  const names = characters.map(c => c.name).join('|');
  const labels = new RegExp(`(?:^|\\n)\\s*(${names}):\\s*`, 'gi');
  const matches = [...text.matchAll(labels)];
  if (!matches.length) return [{ ...message, content: text.replace(/\n\s*\n+/g, '\n').trim() }];
  return matches.map((match, index) => ({
    ...message,
    id: `${message.id}-${index}`,
    character: characters.find(c => c.name.toLowerCase() === match[1].toLowerCase())!.id,
    content: text.slice(match.index! + match[0].length, matches[index + 1]?.index ?? text.length).replace(/\n\s*\n+/g, '\n').trim(),
  })).filter(part => part.content);
}

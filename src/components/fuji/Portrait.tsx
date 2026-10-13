import type { Character } from '@/lib/fuji';

export function Portrait({ character, className = '' }: { character: Character; className?: string }) {
  return <div role="img" aria-label={`${character.name}, anime companion portrait`} className={`bg-cover bg-no-repeat ${className}`} style={{ backgroundImage: 'url(/assets/companions.png)', backgroundSize: '400% 100%', backgroundPosition: `${character.position * 100 / 3}% center` }} />;
}

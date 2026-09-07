import { createAvatar } from '@dicebear/core';
import { avataaars, funEmoji, adventurer, pixelArt } from '@dicebear/collection';

export type DiceBearStyle = 'avataaars' | 'funEmoji' | 'adventurer' | 'pixelArt';

/**
 * Genera un avatar vectorial de DiceBear directamente en el cliente en formato Data URI (SVG).
 * Por defecto usa avataaars (personajes ilustrados con expresiones, peinados y accesorios humanos).
 */
export function generateAvatarDataUri(seed: string, style: DiceBearStyle = 'avataaars'): string {
  try {
    let collection: any = avataaars;
    if (style === 'funEmoji') {
      collection = funEmoji;
    } else if (style === 'adventurer') {
      collection = adventurer;
    } else if (style === 'pixelArt') {
      collection = pixelArt;
    }

    const avatar = createAvatar(collection, {
      seed: seed || 'player',
      radius: 18,
    });
    return avatar.toDataUri();
  } catch (error) {
    console.warn('Error generando avatar local, usando fallback URL:', error);
    const styleParam = style === 'pixelArt' ? 'pixel-art' : style === 'funEmoji' ? 'fun-emoji' : style;
    return `https://api.dicebear.com/9.x/${styleParam}/svg?seed=${encodeURIComponent(seed || 'player')}&radius=18`;
  }
}

/**
 * Genera un seed aleatorio estilo arcade para el botón de dados.
 */
export function generateRandomSeed(): string {
  const names = [
    'Alex', 'Luna', 'Neo', 'Dani', 'Sam', 'Max', 'Zoe', 'Leo', 'Mia', 'Kai',
    'Vega', 'Nico', 'Aria', 'Eli', 'Gael', 'Sora', 'Ryu', 'Ken', 'Maya', 'Lucas'
  ];
  const num = Math.floor(Math.random() * 900) + 100;
  const name = names[Math.floor(Math.random() * names.length)];
  return `${name}${num}`;
}

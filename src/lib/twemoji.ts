import twemoji from 'twemoji';

/**
 * URL base oficial y confiable de SVGs vectoriales de Twemoji en jsDelivr
 * Evita el dominio deprecado twemoji.maxcdn.com
 */
const TWEMOJI_SVG_BASE = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/';

export const TWEMOJI_OPTIONS = {
  base: TWEMOJI_SVG_BASE,
  folder: 'svg',
  ext: '.svg',
  className: 'twemoji-svg inline-block align-middle w-[1.2em] h-[1.2em] pointer-events-none select-none mx-[0.1em]',
};

/**
 * Convierte cualquier texto con emojis Unicode (🔥, ⚡, 👑, etc.) en SVGs vectoriales unificados.
 */
export function parseEmojiToHtml(text: string): string {
  if (!text) return '';
  return twemoji.parse(text, TWEMOJI_OPTIONS);
}

/**
 * Devuelve la URL directa al SVG vectorial de un emoji individual.
 */
export function getEmojiSvgUrl(emoji: string): string {
  const codePoint = twemoji.convert.toCodePoint(emoji);
  return `${TWEMOJI_SVG_BASE}svg/${codePoint}.svg`;
}

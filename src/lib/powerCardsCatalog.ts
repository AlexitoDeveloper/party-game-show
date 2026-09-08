export type CardRarity = 'Común' | 'Rara' | 'Épica' | 'Legendaria';
export type CardTiming = 'Antes de la prueba' | 'Durante la prueba' | 'Al puntuar' | 'En cualquier momento' | 'Inmediata' | 'Permanente';
export type CardTarget = 'team' | 'player' | 'none' | 'card';

export interface PowerCard {
  id: string;
  name: string;
  emoji: string;
  rarity: CardRarity;
  timing: CardTiming;
  tagline: string;
  description: string;
  requiresTarget: CardTarget;
  badgeColor: string;     // Color de tema ('emerald', 'blue', 'purple', 'amber')
  glowColorHex: string;   // Hexadecimal para halos y sombras
  rarityColorHex: string; // Color primario de la rareza
}

// Mapeo exacto de IDs de carta a los archivos oficiales en public/new_cards (18 cartas maestras)
export const CARD_IMAGE_MAP: Record<string, string> = {
  // 🟢 COMUNES (4)
  mal_de_ojo: 'mal_de_ojo.jpeg',
  baneo: 'baneo.jpeg',
  objetivo: 'objetivo.jpeg',
  bomba: 'bomba.jpeg',

  // 🔵 RARAS (3)
  banco_cartas: 'banco_de_cartas.jpeg',
  cambio_forzoso: 'cambio_forzoso.jpeg',
  escudo: 'escudo.jpeg',

  // 🟣 ÉPICAS (7)
  el_cuarto_mono: 'el_cuarto_mono.jpeg',
  caza_lider: 'caza_al_lider.jpeg',
  robo: 'robo.jpeg',
  la_maldicion: 'maldicion_epica.jpeg',
  doble: 'doble.jpeg',
  ruleta_rusa: 'ruleta_rusa.jpeg',
  la_sentencia: 'la_sentencia.jpeg',

  // 🟠 LEGENDARIAS (4)
  impuesto_padrino: 'impuesto_padrino.jpeg',
  ave_fenix: 'ave_fenix.jpeg',
  robo_siglo: 'robo_del_siglo.jpeg',
  golpe_maestro: 'golpe_maestro.jpeg',
};

export function getCardImageUrl(cardId: string): string {
  const filename = CARD_IMAGE_MAP[cardId] || `${cardId}.jpeg`;
  return `/new_cards/${filename}`;
}

export interface SensoryLimitation {
  id: 'eye' | 'mute' | 'hand' | 'speak';
  label: string;
  emoji: string;
  rule: string;
}

export const SENSORY_LIMITATIONS: SensoryLimitation[] = [
  { id: 'eye', label: 'Un ojo tapado', emoji: '👁️', rule: 'Debe jugar con un ojo totalmente tapado' },
  { id: 'mute', label: 'Sin sonido', emoji: '🔇', rule: 'Debe jugar tapándose los oídos o sin escuchar audio' },
  { id: 'hand', label: 'Mano menos hábil', emoji: '🤚', rule: 'Debe usar exclusivamente su mano no dominante' },
  { id: 'speak', label: 'No puede hablar', emoji: '🗣️', rule: 'Prohibido hablar o emitir palabras en la prueba' },
];

export function getRandomSensoryLimitation(): SensoryLimitation {
  return SENSORY_LIMITATIONS[Math.floor(Math.random() * SENSORY_LIMITATIONS.length)];
}

// Probabilidades oficiales por rareza al repartir cartas
export const RARITY_WEIGHTS: Record<CardRarity, number> = {
  'Común': 50,      // 50%
  'Rara': 30,       // 30%
  'Épica': 15,      // 15%
  'Legendaria': 5,  // 5%
};

// ============================================================================
// 🃏 CATÁLOGO MAESTRO DEFINITIVO (18 CARTAS CON RAREZAS OFICIALES)
// ============================================================================
export const MASTER_POWER_CARDS: PowerCard[] = [
  // 🟢 COMUNES (Probabilidad: 50%)
  {
    id: 'mal_de_ojo',
    name: 'Mal de Ojo',
    emoji: '🧿',
    rarity: 'Común',
    timing: 'Inmediata',
    tagline: '¡Pérdida de puntos!',
    description: 'Elige un equipo rival: pierde 2 puntos de su marcador inmediatamente.',
    requiresTarget: 'team',
    badgeColor: 'emerald',
    glowColorHex: '#10b981',
    rarityColorHex: '#10b981',
  },
  {
    id: 'baneo',
    name: 'Baneo',
    emoji: '🚫',
    rarity: 'Común',
    timing: 'Antes de la prueba',
    tagline: '¡Quedas fuera!',
    description: 'Elige a un rival que no haya sido baneado antes. No puede participar en la siguiente prueba. (Máximo 1 vez por persona en toda la partida).',
    requiresTarget: 'player',
    badgeColor: 'emerald',
    glowColorHex: '#10b981',
    rarityColorHex: '#10b981',
  },
  {
    id: 'objetivo',
    name: 'Objetivo',
    emoji: '🎯',
    rarity: 'Común',
    timing: 'Antes de la prueba',
    tagline: 'Punto de mira rival',
    description: 'Elige a un rival: Si participa en la siguiente prueba y su equipo no queda en 1.er puesto, tu equipo gana +2 puntos adicionales.',
    requiresTarget: 'player',
    badgeColor: 'emerald',
    glowColorHex: '#10b981',
    rarityColorHex: '#10b981',
  },
  {
    id: 'bomba',
    name: 'Bomba',
    emoji: '💣',
    rarity: 'Común',
    timing: 'Antes de la prueba',
    tagline: 'Trampa explosiva',
    description: 'Elige a otro equipo. Si queda por debajo de tu equipo en la siguiente prueba, pierde 3 puntos adicionales.',
    requiresTarget: 'team',
    badgeColor: 'emerald',
    glowColorHex: '#10b981',
    rarityColorHex: '#10b981',
  },

  // 🔵 RARAS (Probabilidad: 30%)
  {
    id: 'banco_cartas',
    name: 'Banco de Cartas',
    emoji: '🃏',
    rarity: 'Rara',
    timing: 'En cualquier momento',
    tagline: 'Robo selectivo',
    description: 'Roba 2 cartas del mazo y quédate con 1. La otra vuelve al fondo del mazo.',
    requiresTarget: 'none',
    badgeColor: 'blue',
    glowColorHex: '#3b82f6',
    rarityColorHex: '#3b82f6',
  },
  {
    id: 'cambio_forzoso',
    name: 'Cambio Forzoso',
    emoji: '🔄',
    rarity: 'Rara',
    timing: 'Antes de la prueba',
    tagline: 'Relevo obligado',
    description: 'Elige a un representante de otro equipo. Ese equipo debe sustituirlo por otro miembro elegido por ti para la siguiente prueba.',
    requiresTarget: 'player',
    badgeColor: 'blue',
    glowColorHex: '#3b82f6',
    rarityColorHex: '#3b82f6',
  },
  {
    id: 'escudo',
    name: 'Escudo',
    emoji: '🛡️',
    rarity: 'Rara',
    timing: 'Antes de la prueba',
    tagline: 'Inmunidad de ronda',
    description: 'Protege a tu equipo de cualquier carta o sabotaje rival durante esta prueba.',
    requiresTarget: 'none',
    badgeColor: 'blue',
    glowColorHex: '#3b82f6',
    rarityColorHex: '#3b82f6',
  },

  // 🟣 ÉPICAS (Probabilidad: 15%)
  {
    id: 'el_cuarto_mono',
    name: 'El Cuarto Mono',
    emoji: '🌀',
    rarity: 'Épica',
    timing: 'Antes de la prueba',
    tagline: 'Sentidos bloqueados',
    description: 'Elige a un rival antes de la prueba. Se le asignará una limitación sensorial: 👁️ Un ojo tapado, 🔇 Sin sonido, 🤚 Mano no hábil o 🗣️ No hablar.',
    requiresTarget: 'player',
    badgeColor: 'purple',
    glowColorHex: '#a855f7',
    rarityColorHex: '#a855f7',
  },
  {
    id: 'caza_lider',
    name: 'Caza al Líder',
    emoji: '👑',
    rarity: 'Épica',
    timing: 'Antes de la prueba',
    tagline: 'Destrona al primero',
    description: 'Elige al equipo en 1.º puesto. En la siguiente prueba, si tu equipo queda por encima de él, le robas 3 puntos de su marcador.',
    requiresTarget: 'team',
    badgeColor: 'purple',
    glowColorHex: '#a855f7',
    rarityColorHex: '#a855f7',
  },
  {
    id: 'robo',
    name: 'Robo',
    emoji: '✋',
    rarity: 'Épica',
    timing: 'En cualquier momento',
    tagline: 'Lo tuyo es mío',
    description: 'Roba una carta aleatoria de otro equipo.',
    requiresTarget: 'team',
    badgeColor: 'purple',
    glowColorHex: '#a855f7',
    rarityColorHex: '#a855f7',
  },
  {
    id: 'la_maldicion',
    name: 'La Maldición',
    emoji: '☠️',
    rarity: 'Épica',
    timing: 'Permanente',
    tagline: 'La Patata Caliente',
    description: 'No se puede descartar. Mientras la tengas, cualquier fallo resta el DOBLE. Te libras pasándosela a un rival al que superes en la siguiente prueba.',
    requiresTarget: 'none',
    badgeColor: 'purple',
    glowColorHex: '#a855f7',
    rarityColorHex: '#a855f7',
  },
  {
    id: 'doble',
    name: 'Doble',
    emoji: '💰',
    rarity: 'Épica',
    timing: 'Antes de la prueba',
    tagline: 'Multiplicador x2',
    description: 'Antes de comenzar una prueba, duplica los puntos positivos que consiga tu equipo en esa prueba.',
    requiresTarget: 'none',
    badgeColor: 'purple',
    glowColorHex: '#a855f7',
    rarityColorHex: '#a855f7',
  },
  {
    id: 'ruleta_rusa',
    name: 'Ruleta Rusa',
    emoji: '🎰',
    rarity: 'Épica',
    timing: 'Antes de la prueba',
    tagline: 'Apuesta a todo o nada',
    description: 'Antes de la prueba: 🥇🥈 1.º o 2.º puesto → +6 pts extra. 🥉 Últimos puestos → −4 pts.',
    requiresTarget: 'none',
    badgeColor: 'purple',
    glowColorHex: '#a855f7',
    rarityColorHex: '#a855f7',
  },
  {
    id: 'la_sentencia',
    name: 'La Sentencia',
    emoji: '💀',
    rarity: 'Épica',
    timing: 'Antes de la prueba',
    tagline: 'Castigo fulminante',
    description: 'Elige un equipo rival. Si queda por debajo de tu equipo en la siguiente prueba, pierde 4 puntos adicionales.',
    requiresTarget: 'team',
    badgeColor: 'purple',
    glowColorHex: '#a855f7',
    rarityColorHex: '#a855f7',
  },

  // 🟠 LEGENDARIAS (Probabilidad: 5%)
  {
    id: 'impuesto_padrino',
    name: 'El Impuesto del Padrino',
    emoji: '🎩',
    rarity: 'Legendaria',
    timing: 'Antes de la prueba',
    tagline: 'Comisión al campeón',
    description: 'Si tu equipo no gana la prueba, el equipo vencedor en 1.er puesto debe entregarte el 50% de sus puntos obtenidos.',
    requiresTarget: 'none',
    badgeColor: 'amber',
    glowColorHex: '#f59e0b',
    rarityColorHex: '#f59e0b',
  },
  {
    id: 'ave_fenix',
    name: 'El Ave Fénix',
    emoji: '🔥',
    rarity: 'Legendaria',
    timing: 'Antes de la prueba',
    tagline: 'Resurrección de cenizas',
    description: 'A partir de la 5.ª prueba (solo si vas 4.º o peor): Triplica (x3) todos los puntos que consiga tu equipo en esta prueba.',
    requiresTarget: 'none',
    badgeColor: 'amber',
    glowColorHex: '#f59e0b',
    rarityColorHex: '#f59e0b',
  },
  {
    id: 'robo_siglo',
    name: 'El Robo del Siglo',
    emoji: '👑',
    rarity: 'Legendaria',
    timing: 'Antes de la prueba',
    tagline: 'Atraco maestro',
    description: 'Señala a un equipo rival antes de la prueba: tu equipo le roba el 50% de todos los puntos que consiga en esa prueba.',
    requiresTarget: 'team',
    badgeColor: 'amber',
    glowColorHex: '#f59e0b',
    rarityColorHex: '#f59e0b',
  },
  {
    id: 'golpe_maestro',
    name: 'El Golpe Maestro',
    emoji: '💥',
    rarity: 'Legendaria',
    timing: 'Antes de la prueba',
    tagline: 'Bote de la casa',
    description: 'Antes de la prueba: Si tu equipo queda en 1.º puesto, cada equipo rival debe transferirte 1 punto de su marcador.',
    requiresTarget: 'none',
    badgeColor: 'amber',
    glowColorHex: '#f59e0b',
    rarityColorHex: '#f59e0b',
  },
];

// Helper para buscar carta por ID
export const POWER_CARDS_CATALOG: PowerCard[] = MASTER_POWER_CARDS;

export function getPowerCardById(id: string): PowerCard | undefined {
  return MASTER_POWER_CARDS.find((c) => c.id === id);
}

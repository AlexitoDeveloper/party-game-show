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

export interface ActivePowerEffect {
  id: string;
  cardId: string;
  cardName: string;
  cardEmoji: string;
  sourceTeamId: string;
  sourceTeamName: string;
  targetTeamId?: string;
  targetTeamName?: string;
  targetPlayerName?: string;
  appliedAt: string;
}

export interface PowerCardsState {
  deck: string[];                 // IDs de cartas aún disponibles en el mazo común
  discardPile: string[];          // IDs de cartas que ya han sido jugadas
  teamHands: Record<string, string[]>; // teamId -> array de card IDs en mano
  activeEffects: ActivePowerEffect[];  // Efectos vigentes en la ronda
  lastDrawnEvent?: {
    teamId: string;
    teamName: string;
    card: PowerCard;
    timestamp: number;
  } | null;
  lastPlayedEvent?: {
    sourceTeamId: string;
    sourceTeamName: string;
    card: PowerCard;
    targetTeamName?: string;
    targetPlayerName?: string;
    timestamp: number;
  } | null;
}

// Probabilidades oficiales por rareza al repartir cartas
export const RARITY_WEIGHTS: Record<CardRarity, number> = {
  'Común': 50,      // 50%
  'Rara': 30,       // 30%
  'Épica': 15,      // 15%
  'Legendaria': 5,  // 5%
};

// Configuración de estilo visual y metadatos de rareza tipo Everdell
export const RARITY_METADATA: Record<CardRarity, {
  label: string;
  gemEmoji: string;
  gemClass: string;
  frameGradient: string;
  bannerBg: string;
  parchmentBorder: string;
  badgeBorder: string;
  textGlow: string;
  pillColor: string;
}> = {
  'Común': {
    label: 'COMÚN',
    gemEmoji: '🟢',
    gemClass: 'bg-emerald-500 text-white shadow-emerald-500/50',
    frameGradient: 'from-emerald-900 via-stone-900 to-emerald-950',
    bannerBg: 'bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-950',
    parchmentBorder: 'border-emerald-700/60',
    badgeBorder: 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300',
    textGlow: '0 0 12px rgba(16, 185, 129, 0.4)',
    pillColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
  },
  'Rara': {
    label: 'RARA',
    gemEmoji: '🔵',
    gemClass: 'bg-blue-500 text-white shadow-blue-500/50',
    frameGradient: 'from-blue-900 via-slate-900 to-indigo-950',
    bannerBg: 'bg-gradient-to-r from-blue-950 via-blue-800 to-blue-950',
    parchmentBorder: 'border-blue-700/60',
    badgeBorder: 'border-blue-500/50 bg-blue-500/20 text-blue-300',
    textGlow: '0 0 14px rgba(59, 130, 246, 0.5)',
    pillColor: 'bg-blue-500/20 text-blue-200 border-blue-500/40',
  },
  'Épica': {
    label: 'ÉPICA',
    gemEmoji: '🟣',
    gemClass: 'bg-purple-500 text-white shadow-purple-500/50',
    frameGradient: 'from-purple-900 via-zinc-900 to-fuchsia-950',
    bannerBg: 'bg-gradient-to-r from-purple-950 via-purple-800 to-purple-950',
    parchmentBorder: 'border-purple-700/60',
    badgeBorder: 'border-purple-500/50 bg-purple-500/20 text-purple-300',
    textGlow: '0 0 16px rgba(168, 85, 247, 0.6)',
    pillColor: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
  },
  'Legendaria': {
    label: 'LEGENDARIA',
    gemEmoji: '🟠',
    gemClass: 'bg-amber-500 text-slate-950 shadow-amber-500/80 ring-2 ring-amber-300',
    frameGradient: 'from-amber-900 via-yellow-950 to-orange-950',
    bannerBg: 'bg-gradient-to-r from-amber-950 via-amber-700 to-yellow-950',
    parchmentBorder: 'border-amber-500/80',
    badgeBorder: 'border-amber-400/80 bg-amber-500/25 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.5)]',
    textGlow: '0 0 20px rgba(245, 158, 11, 0.8)',
    pillColor: 'bg-amber-500/25 text-amber-200 border-amber-400/60',
  },
};

// ============================================================================
// 🃏 CATÁLOGO MAESTRO DEFINITIVO (17 CARTAS CON RAREZAS OFICIALES)
// ============================================================================
export const MASTER_POWER_CARDS: PowerCard[] = [
  // 🟢 COMUNES (Probabilidad: 50%)
  {
    id: 'maldicion_comun',
    name: 'Maldición',
    emoji: '💀',
    rarity: 'Común',
    timing: 'Inmediata',
    tagline: '¡Pérdida de puntos!',
    description: 'Al usar esta carta tu equipo pierde 2 puntos.',
    requiresTarget: 'none',
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
    description: 'Elige a un jugador de otro equipo. Ese jugador no puede participar en la siguiente prueba.',
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
    description: 'Elige a otro equipo. Si queda por debajo de tu equipo en la siguiente prueba, pierde 1 punto adicional.',
    requiresTarget: 'team',
    badgeColor: 'emerald',
    glowColorHex: '#10b981',
    rarityColorHex: '#10b981',
  },

  // 🔵 RARAS (Probabilidad: 30%)
  {
    id: 'intercambio_cartas',
    name: 'Intercambio de Cartas',
    emoji: '🔄',
    rarity: 'Rara',
    timing: 'En cualquier momento',
    tagline: 'Mano por mano',
    description: 'Elige un equipo rival y una carta de tu mano. El otro equipo debe elegir una carta de su mano al azar. Intercambias ambas cartas.',
    requiresTarget: 'team',
    badgeColor: 'blue',
    glowColorHex: '#3b82f6',
    rarityColorHex: '#3b82f6',
  },
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
    timing: 'Durante la prueba',
    tagline: 'Inmunidad total',
    description: 'Protege a un jugador de tu equipo de cualquier carta que le afecte durante una prueba.',
    requiresTarget: 'none',
    badgeColor: 'blue',
    glowColorHex: '#3b82f6',
    rarityColorHex: '#3b82f6',
  },

  // 🟣 ÉPICAS (Probabilidad: 15%)
  {
    id: 'caza_lider',
    name: 'Caza al Líder',
    emoji: '👑',
    rarity: 'Épica',
    timing: 'Antes de la prueba',
    tagline: 'Destrona al primero',
    description: 'Elige al equipo que ocupa el 1.º puesto. En la siguiente prueba, si tu equipo queda por encima de él, obtienes +3 puntos adicionales.',
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
    tagline: 'Pesadilla implacable',
    description: 'Esta carta no puede descartarse. Al final de cada prueba en la que continúes teniéndola, pierdes 1 punto. Puedes deshacerte de ella jugándola antes de una prueba, perdiendo 3 puntos inmediatamente.',
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
    tagline: 'Riesgo desmedido',
    description: 'Antes de una prueba: 🥇🥈 1.º o 2.º puesto → +8 puntos. 🥉 3.º, 4.º o 5.º puesto → −5 puntos.',
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
    description: 'Elige un equipo rival. Si queda por debajo de tu equipo en la siguiente prueba, pierde 5 puntos adicionales.',
    requiresTarget: 'team',
    badgeColor: 'purple',
    glowColorHex: '#a855f7',
    rarityColorHex: '#a855f7',
  },

  // 🟠 LEGENDARIAS (Probabilidad: 5%)
  {
    id: 'el_intercambio',
    name: 'El Intercambio',
    emoji: '🔄',
    rarity: 'Legendaria',
    timing: 'Al puntuar',
    tagline: 'Giro del destino',
    description: 'Después de conocer las puntuaciones de una prueba, puedes intercambiar tu puntuación de esa prueba con la de otro equipo.',
    requiresTarget: 'team',
    badgeColor: 'amber',
    glowColorHex: '#f59e0b',
    rarityColorHex: '#f59e0b',
  },
  {
    id: 'viaje_tiempo',
    name: 'Viaje en el Tiempo',
    emoji: '⏳',
    rarity: 'Legendaria',
    timing: 'En cualquier momento',
    tagline: 'Regreso al pasado',
    description: 'Recupera una carta de poder utilizada anteriormente y vuelve a tenerla disponible en tu mano.',
    requiresTarget: 'card',
    badgeColor: 'amber',
    glowColorHex: '#f59e0b',
    rarityColorHex: '#f59e0b',
  },
  {
    id: 'todo_o_nada',
    name: 'Todo o Nada',
    emoji: '🎴',
    rarity: 'Legendaria',
    timing: 'Antes de la prueba',
    tagline: 'Gloria o abismo',
    description: 'Antes de una prueba: 🥇 1.º puesto → +10 puntos. Cualquier otro puesto → −5 puntos.',
    requiresTarget: 'none',
    badgeColor: 'amber',
    glowColorHex: '#f59e0b',
    rarityColorHex: '#f59e0b',
  },
];

// Helper para buscar carta por ID
export function getPowerCardById(id: string): PowerCard | undefined {
  return MASTER_POWER_CARDS.find((c) => c.id === id);
}

// Algoritmo de barajado Fisher-Yates
export function shuffleDeck(cardIds: string[]): string[] {
  const arr = [...cardIds];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Genera un mazo balanceado con la distribución estadística exacta solicitada:
 * - 50% Comunes (30 cartas)
 * - 30% Raras (18 cartas)
 * - 15% Épicas (9 cartas)
 * - 5% Legendarias (3 cartas)
 * Total: 60 cartas
 */
export function generateWeightedDeck(): string[] {
  const deck: string[] = [];
  const comunes = MASTER_POWER_CARDS.filter((c) => c.rarity === 'Común');
  const raras = MASTER_POWER_CARDS.filter((c) => c.rarity === 'Rara');
  const epicas = MASTER_POWER_CARDS.filter((c) => c.rarity === 'Épica');
  const legendarias = MASTER_POWER_CARDS.filter((c) => c.rarity === 'Legendaria');

  // 30 cartas comunes (~7 u 8 copias de cada una)
  for (let i = 0; i < 30; i++) {
    deck.push(comunes[i % comunes.length].id);
  }

  // 18 cartas raras (~4 o 5 copias de cada una)
  for (let i = 0; i < 18; i++) {
    deck.push(raras[i % raras.length].id);
  }

  // 9 cartas épicas (~1 o 2 copias de cada una)
  for (let i = 0; i < 9; i++) {
    deck.push(epicas[i % epicas.length].id);
  }

  // 3 cartas legendarias (1 copia exacta de cada una)
  for (let i = 0; i < 3; i++) {
    deck.push(legendarias[i % legendarias.length].id);
  }

  return shuffleDeck(deck);
}

/**
 * Roba 1 carta aleatoria respetando las probabilidades ponderadas:
 * 50% Común, 30% Rara, 15% Épica, 5% Legendaria
 */
export function drawRandomCardByRarity(availableCards: PowerCard[] = MASTER_POWER_CARDS): PowerCard {
  const roll = Math.random() * 100;
  let targetRarity: CardRarity = 'Común';

  if (roll < 50) {
    targetRarity = 'Común';
  } else if (roll < 80) {
    targetRarity = 'Rara';
  } else if (roll < 95) {
    targetRarity = 'Épica';
  } else {
    targetRarity = 'Legendaria';
  }

  const matches = availableCards.filter((c) => c.rarity === targetRarity);
  if (matches.length === 0) {
    return availableCards[Math.floor(Math.random() * availableCards.length)];
  }
  return matches[Math.floor(Math.random() * matches.length)];
}

// Estado inicial del sistema de cartas
export function createInitialPowerCardsState(): PowerCardsState {
  return {
    deck: generateWeightedDeck(),
    discardPile: [],
    teamHands: {},
    activeEffects: [],
    lastDrawnEvent: null,
    lastPlayedEvent: null,
  };
}

export const MAX_CARDS_PER_TEAM = 3;

/**
 * Reparte 1 carta a cada equipo activo garantizando las probabilidades de rareza y límite de 3 cartas
 */
export function dealInitialCardsToTeams(
  state: PowerCardsState,
  teamIds: string[]
): { nextState: PowerCardsState; dealt: { teamId: string; cardId: string }[] } {
  let currentDeck = [...state.deck];
  let discard = [...state.discardPile];
  const newHands = { ...state.teamHands };
  const dealt: { teamId: string; cardId: string }[] = [];

  for (const teamId of teamIds) {
    const hand = newHands[teamId] || [];
    if (hand.length >= MAX_CARDS_PER_TEAM) {
      continue; // No puede tener más de 3 cartas
    }

    // Si el mazo se vacía, reciclar descartes o generar nuevo mazo ponderado
    if (currentDeck.length === 0) {
      if (discard.length > 0) {
        currentDeck = shuffleDeck(discard);
        discard = [];
      } else {
        currentDeck = generateWeightedDeck();
      }
    }

    const cardId = currentDeck.shift()!;
    dealt.push({ teamId, cardId });
    newHands[teamId] = [...hand, cardId];
  }

  return {
    nextState: {
      ...state,
      deck: currentDeck,
      discardPile: discard,
      teamHands: newHands,
    },
    dealt,
  };
}

/**
 * Reparte 1 carta de bonus a un equipo específico respetando las probabilidades de rareza
 */
export function dealCardToSingleTeam(
  state: PowerCardsState,
  teamId: string
): { nextState: PowerCardsState; cardId: string | null; isFull?: boolean } {
  const currentHand = state.teamHands[teamId] || [];
  if (currentHand.length >= MAX_CARDS_PER_TEAM) {
    return { nextState: state, cardId: null, isFull: true };
  }

  let currentDeck = [...state.deck];
  let discard = [...state.discardPile];

  if (currentDeck.length === 0) {
    if (discard.length > 0) {
      currentDeck = shuffleDeck(discard);
      discard = [];
    } else {
      currentDeck = generateWeightedDeck();
    }
  }

  const cardId = currentDeck.shift()!;
  const newHands = {
    ...state.teamHands,
    [teamId]: [...currentHand, cardId],
  };

  return {
    nextState: {
      ...state,
      deck: currentDeck,
      discardPile: discard,
      teamHands: newHands,
    },
    cardId,
  };
}

/**
 * Jugar una carta de la mano de un equipo
 */
export function executePlayCard(
  state: PowerCardsState,
  sourceTeamId: string,
  cardId: string,
  targetTeamId?: string,
  targetPlayerName?: string
): PowerCardsState {
  const teamHand = state.teamHands[sourceTeamId] || [];
  const cardIndex = teamHand.indexOf(cardId);
  if (cardIndex === -1) return state; // No tiene la carta

  const card = getPowerCardById(cardId);
  if (!card) return state;

  const nextHand = [...teamHand];
  nextHand.splice(cardIndex, 1);

  const nextHands = {
    ...state.teamHands,
    [sourceTeamId]: nextHand,
  };

  const nextDiscard = [...state.discardPile, cardId];

  // Registrar efecto activo
  const newEffect: ActivePowerEffect = {
    id: 'eff_' + Math.random().toString(36).substring(2, 9),
    cardId,
    cardName: card.name,
    cardEmoji: card.emoji,
    sourceTeamId,
    sourceTeamName: sourceTeamId,
    targetTeamId,
    targetPlayerName,
    appliedAt: new Date().toISOString(),
  };

  return {
    ...state,
    teamHands: nextHands,
    discardPile: nextDiscard,
    activeEffects: [...state.activeEffects, newEffect],
  };
}

/**
 * Ejecutar la carta ROBO: transfiere una carta aleatoria de targetTeamId a sourceTeamId
 */
export function executeStealCard(
  state: PowerCardsState,
  sourceTeamId: string,
  targetTeamId: string
): { nextState: PowerCardsState; stolenCardId: string | null } {
  const targetHand = state.teamHands[targetTeamId] || [];
  if (targetHand.length === 0) {
    return { nextState: state, stolenCardId: null };
  }

  // Elegir carta aleatoria del rival
  const randIdx = Math.floor(Math.random() * targetHand.length);
  const stolenCardId = targetHand[randIdx];

  const newTargetHand = [...targetHand];
  newTargetHand.splice(randIdx, 1);

  const newSourceHand = [...(state.teamHands[sourceTeamId] || []), stolenCardId];

  return {
    nextState: {
      ...state,
      teamHands: {
        ...state.teamHands,
        [targetTeamId]: newTargetHand,
        [sourceTeamId]: newSourceHand,
      },
    },
    stolenCardId,
  };
}

/**
 * Ejecutar INTERCAMBIO DE CARTAS: sourceTeam entrega chosenCardId y targetTeam entrega una carta aleatoria
 */
export function executeSwapCard(
  state: PowerCardsState,
  sourceTeamId: string,
  targetTeamId: string,
  sourceCardId: string
): { nextState: PowerCardsState; receivedCardId: string | null } {
  const sourceHand = state.teamHands[sourceTeamId] || [];
  const targetHand = state.teamHands[targetTeamId] || [];

  if (!sourceHand.includes(sourceCardId) || targetHand.length === 0) {
    return { nextState: state, receivedCardId: null };
  }

  // Elegir carta aleatoria del rival
  const randIdx = Math.floor(Math.random() * targetHand.length);
  const receivedCardId = targetHand[randIdx];

  const nextSourceHand = sourceHand.filter((id) => id !== sourceCardId).concat(receivedCardId);
  const nextTargetHand = [...targetHand];
  nextTargetHand.splice(randIdx, 1);
  nextTargetHand.push(sourceCardId);

  return {
    nextState: {
      ...state,
      teamHands: {
        ...state.teamHands,
        [sourceTeamId]: nextSourceHand,
        [targetTeamId]: nextTargetHand,
      },
    },
    receivedCardId,
  };
}

/**
 * Ejecutar VIAJE EN EL TIEMPO: recupera una carta de la pila de descartes a la mano del equipo
 */
export function executeRecoverDiscardedCard(
  state: PowerCardsState,
  teamId: string,
  recoveredCardId: string
): PowerCardsState {
  const discard = [...state.discardPile];
  const idx = discard.indexOf(recoveredCardId);
  if (idx === -1) return state;

  discard.splice(idx, 1);
  const currentHand = state.teamHands[teamId] || [];

  return {
    ...state,
    discardPile: discard,
    teamHands: {
      ...state.teamHands,
      [teamId]: [...currentHand, recoveredCardId],
    },
  };
}

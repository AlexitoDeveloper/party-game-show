export interface PowerCard {
  id: string;
  name: string;
  emoji: string;
  badgeColor: string;     // Tailwind color theme e.g. 'red', 'amber', 'purple', 'emerald', 'blue', 'cyan'
  glowColorHex: string;   // Hex for drop-shadow glow
  rarity: 'Común' | 'Rara' | 'Épica' | 'Legendaria';
  tagline: string;
  description: string;
  requiresTarget: 'team' | 'player' | 'none';
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

// Catálogo maestro de Cartas de Poder
export const MASTER_POWER_CARDS: PowerCard[] = [
  {
    id: 'baneo',
    name: 'Baneo',
    emoji: '🚫',
    badgeColor: 'red',
    glowColorHex: '#ef4444',
    rarity: 'Épica',
    tagline: '¡Quedas fuera!',
    description: 'Elige a un jugador de otro equipo. Ese jugador no puede participar en la siguiente prueba.',
    requiresTarget: 'player',
  },
  {
    id: 'objetivo',
    name: 'Objetivo',
    emoji: '🎯',
    badgeColor: 'blue',
    glowColorHex: '#3b82f6',
    rarity: 'Rara',
    tagline: 'Presión máxima al rival',
    description: 'Elige a un rival. Si participa en la siguiente prueba y su equipo falla, tu equipo gana +2 puntos de bonificación.',
    requiresTarget: 'player',
  },
  {
    id: 'intercambio',
    name: 'Intercambio',
    emoji: '🔄',
    badgeColor: 'purple',
    glowColorHex: '#a855f7',
    rarity: 'Rara',
    tagline: 'Cambio de fichas',
    description: 'Obliga a otro equipo a intercambiar a uno de sus representantes elegidos para la prueba por otro miembro.',
    requiresTarget: 'team',
  },
  {
    id: 'escudo',
    name: 'Escudo',
    emoji: '🛡️',
    badgeColor: 'cyan',
    glowColorHex: '#06b6d4',
    rarity: 'Común',
    tagline: 'Protección absoluta',
    description: 'Protege a un jugador o a tu equipo de cualquier carta que le afecte durante la prueba.',
    requiresTarget: 'none',
  },
  {
    id: 'robo',
    name: 'Robo',
    emoji: '✋',
    badgeColor: 'amber',
    glowColorHex: '#f59e0b',
    rarity: 'Legendaria',
    tagline: 'Lo tuyo es mío',
    description: 'Roba una carta aleatoria de la mano de otro equipo y agrégala inmediatamente a la tuya.',
    requiresTarget: 'team',
  },
  {
    id: 'doble',
    name: 'Doble',
    emoji: '💰',
    badgeColor: 'emerald',
    glowColorHex: '#10b981',
    rarity: 'Legendaria',
    tagline: 'Doble o nada',
    description: 'Antes de comenzar una prueba, duplica todos los puntos que consiga tu equipo en esa prueba.',
    requiresTarget: 'none',
  },
  {
    id: 'bomba',
    name: 'Bomba',
    emoji: '💣',
    badgeColor: 'orange',
    glowColorHex: '#f97316',
    rarity: 'Épica',
    tagline: 'Trampa explosiva',
    description: 'Elige a otro equipo. Si queda por debajo de tu equipo en la siguiente prueba, pierde 1 punto adicional.',
    requiresTarget: 'team',
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

// Estado inicial del sistema de cartas
export function createInitialPowerCardsState(): PowerCardsState {
  const allCardIds = MASTER_POWER_CARDS.map((c) => c.id);
  return {
    deck: shuffleDeck(allCardIds),
    discardPile: [],
    teamHands: {},
    activeEffects: [],
    lastDrawnEvent: null,
    lastPlayedEvent: null,
  };
}

export const MAX_CARDS_PER_TEAM = 3;

// Reparte 1 carta a cada equipo activo garantizando unicidad y límite de 3 cartas
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

    // Si el mazo se vacía, reciclar descartes
    if (currentDeck.length === 0) {
      if (discard.length === 0) break;
      currentDeck = shuffleDeck(discard);
      discard = [];
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

// Reparte 1 carta de bonus a un equipo específico (máximo 3 cartas)
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
    if (discard.length === 0) return { nextState: state, cardId: null };
    currentDeck = shuffleDeck(discard);
    discard = [];
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

// Jugar una carta de la mano de un equipo
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

  // Registrar efecto activo si aplica
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

// Ejecutar la carta ROBO: transfiere una carta aleatoria de targetTeamId a sourceTeamId
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

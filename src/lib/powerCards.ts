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
  sensoryLimitation?: string;
  appliedAt: string;
}

export interface PowerCardsState {
  deck: string[];                 // IDs de cartas aún disponibles en el mazo común
  discardPile: string[];          // IDs de cartas que ya han sido jugadas
  teamHands: Record<string, string[]>; // teamId -> array de card IDs en mano
  activeEffects: ActivePowerEffect[];  // Efectos vigentes en la ronda
  bannedPlayerNames?: string[];   // Historial de jugadores que ya han sido baneados en la partida (máximo 1 por persona)
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
 * - 50% Comunes (28 cartas)
 * - 30% Raras (18 cartas)
 * - 15% Épicas (9 cartas)
 * - 5% Legendarias (4 cartas — 1 copia de cada una)
 */
export function generateWeightedDeck(): string[] {
  const deck: string[] = [];
  const comunes = MASTER_POWER_CARDS.filter((c) => c.rarity === 'Común');
  const raras = MASTER_POWER_CARDS.filter((c) => c.rarity === 'Rara');
  const epicas = MASTER_POWER_CARDS.filter((c) => c.rarity === 'Épica');
  const legendarias = MASTER_POWER_CARDS.filter((c) => c.rarity === 'Legendaria');

  // 28 cartas comunes
  for (let i = 0; i < 28; i++) {
    deck.push(comunes[i % comunes.length].id);
  }

  // 18 cartas raras
  for (let i = 0; i < 18; i++) {
    deck.push(raras[i % raras.length].id);
  }

  // 9 cartas épicas
  for (let i = 0; i < 9; i++) {
    deck.push(epicas[i % epicas.length].id);
  }

  // 4 cartas legendarias (1 copia exacta de cada una)
  for (let i = 0; i < legendarias.length; i++) {
    deck.push(legendarias[i].id);
  }

  return shuffleDeck(deck);
}

// Estado inicial del sistema de cartas
export function createInitialPowerCardsState(): PowerCardsState {
  return {
    deck: generateWeightedDeck(),
    discardPile: [],
    teamHands: {},
    activeEffects: [],
    bannedPlayerNames: [],
    lastDrawnEvent: null,
    lastPlayedEvent: null,
  };
}

export const MAX_CARDS_PER_TEAM = 3;

export interface DealCardOptions {
  isUnderdog?: boolean;
}

/**
 * Probabilidad de rarezas para equipos rezagados (Remontada / Underdog a partir de la 5.ª prueba y puesto 4.º o peor):
 * - 20% Común
 * - 30% Rara
 * - 35% Épica
 * - 15% Legendaria
 */
export function rollUnderdogRarity(): 'Común' | 'Rara' | 'Épica' | 'Legendaria' {
  const roll = Math.random() * 100;
  if (roll < 20) return 'Común';
  if (roll < 50) return 'Rara';
  if (roll < 85) return 'Épica';
  return 'Legendaria';
}

/**
 * Extrae una carta del mazo. Si isUnderdog es true, busca favorecer cartas de mayor rareza
 * manteniendo intacto el mazo físico sin generar cartas ficticias.
 */
export function drawCardFromDeck(
  currentDeck: string[],
  isUnderdog: boolean = false
): { drawnCardId: string; updatedDeck: string[] } {
  if (currentDeck.length === 0) {
    throw new Error('Deck is empty');
  }

  const updatedDeck = [...currentDeck];

  if (!isUnderdog) {
    const drawnCardId = updatedDeck.shift()!;
    return { drawnCardId, updatedDeck };
  }

  // Tirada de rareza favorecida para el equipo rezagado
  const targetRarity = rollUnderdogRarity();
  const matchIndex = updatedDeck.findIndex((id) => getPowerCardById(id)?.rarity === targetRarity);

  if (matchIndex !== -1) {
    const drawnCardId = updatedDeck.splice(matchIndex, 1)[0];
    return { drawnCardId, updatedDeck };
  }

  // Si no queda ninguna carta de esa rareza específica en el mazo, robar la superior
  const drawnCardId = updatedDeck.shift()!;
  return { drawnCardId, updatedDeck };
}

/**
 * Reparte 1 carta a cada equipo activo garantizando las probabilidades de rareza y límite de 3 cartas
 */
export function dealInitialCardsToTeams(
  state: PowerCardsState,
  teamIds: string[],
  options?: {
    getIsUnderdog?: (teamId: string) => boolean;
  }
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

    const isUnderdog = options?.getIsUnderdog ? options.getIsUnderdog(teamId) : false;
    const { drawnCardId, updatedDeck } = drawCardFromDeck(currentDeck, isUnderdog);
    currentDeck = updatedDeck;

    dealt.push({ teamId, cardId: drawnCardId });
    newHands[teamId] = [...hand, drawnCardId];
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
 * (con soporte transparente para mecánica de remontada si isUnderdog es true)
 */
export function dealCardToSingleTeam(
  state: PowerCardsState,
  teamId: string,
  options?: DealCardOptions
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

  const { drawnCardId, updatedDeck } = drawCardFromDeck(currentDeck, options?.isUnderdog);
  currentDeck = updatedDeck;

  const newHands = {
    ...state.teamHands,
    [teamId]: [...currentHand, drawnCardId],
  };

  return {
    nextState: {
      ...state,
      deck: currentDeck,
      discardPile: discard,
      teamHands: newHands,
    },
    cardId: drawnCardId,
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
  targetPlayerName?: string,
  sensoryLimitation?: string
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
    sensoryLimitation,
    appliedAt: new Date().toISOString(),
  };

  const bannedPlayers = [...(state.bannedPlayerNames || [])];
  if (cardId === 'baneo' && targetPlayerName) {
    const clean = targetPlayerName.trim().toLowerCase();
    if (!bannedPlayers.includes(clean)) {
      bannedPlayers.push(clean);
    }
  }

  return {
    ...state,
    teamHands: nextHands,
    discardPile: nextDiscard,
    activeEffects: [...state.activeEffects, newEffect],
    bannedPlayerNames: bannedPlayers,
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

/**
 * Ejecutar BANCO DE CARTAS - Paso 1: Roba 2 cartas del mazo para presentar al equipo
 */
export function executeDrawTwoForBank(
  state: PowerCardsState,
  options?: DealCardOptions
): {
  nextState: PowerCardsState;
  drawnCards: [string, string] | null;
} {
  let currentDeck = [...state.deck];
  let discard = [...state.discardPile];

  if (currentDeck.length < 2) {
    if (discard.length > 0) {
      currentDeck = [...currentDeck, ...shuffleDeck(discard)];
      discard = [];
    } else {
      currentDeck = [...currentDeck, ...generateWeightedDeck()];
    }
  }

  if (currentDeck.length < 2) return { nextState: state, drawnCards: null };

  const d1 = drawCardFromDeck(currentDeck, options?.isUnderdog);
  currentDeck = d1.updatedDeck;

  const d2 = drawCardFromDeck(currentDeck, options?.isUnderdog);
  currentDeck = d2.updatedDeck;

  return {
    nextState: {
      ...state,
      deck: currentDeck,
      discardPile: discard,
    },
    drawnCards: [d1.drawnCardId, d2.drawnCardId],
  };
}

/**
 * Ejecutar BANCO DE CARTAS - Paso 2: El equipo se queda con una y la otra vuelve al fondo del mazo
 */
export function executeChooseBankCard(
  state: PowerCardsState,
  teamId: string,
  chosenCardId: string,
  rejectedCardId: string
): PowerCardsState {
  const currentHand = state.teamHands[teamId] || [];
  const nextHand = [...currentHand, chosenCardId];
  // La rechazada vuelve al fondo del mazo
  const nextDeck = [...state.deck, rejectedCardId];

  return {
    ...state,
    deck: nextDeck,
    teamHands: {
      ...state.teamHands,
      [teamId]: nextHand,
    },
  };
}

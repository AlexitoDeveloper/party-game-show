import { MinigameType } from './types';

export interface ScoringOption {
  id: string;
  label: string;
  delta: number;
  badge: string;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'slate';
  description?: string;
}

export interface GameDefinition {
  id: string;
  title: string;
  emoji: string;
  category: 'Musical' | 'Conocimiento' | 'Creativo' | 'Velocidad' | 'Habilidad' | 'Juegos de Mesa';
  engine: MinigameType;
  description: string;
  rules: string[];
  scoringOptions: ScoringOption[];
  roundsInfo?: string;
}

export const GAMES_CATALOG: GameDefinition[] = [
  // 1. ADIVINA LA CANCIÓN
  {
    id: 'music',
    title: 'Adivina la Canción',
    emoji: '🎵',
    category: 'Musical',
    engine: 'buzzer',
    description: 'Suena un fragmento musical. El equipo más veloz pulsa para decir cantante, título o ambos.',
    rules: [
      '🎤 Acierta cantante: +1 punto',
      '🎵 Acierta canción: +1 punto',
      '⭐ Acierta ambas: +2 puntos',
      '❌ Da una respuesta y es incorrecta: −1 punto',
      '🤐 No responde o tiempo agotado: 0 puntos',
    ],
    scoringOptions: [
      { id: 'singer', label: '🎤 Cantante (+1)', delta: 1, badge: '+1', color: 'blue', description: 'Acierta solo el cantante' },
      { id: 'song', label: '🎵 Canción (+1)', delta: 1, badge: '+1', color: 'blue', description: 'Acierta solo la canción' },
      { id: 'both', label: '⭐ Ambas (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Acierta cantante y canción' },
      { id: 'wrong', label: '❌ Incorrecta (-1)', delta: -1, badge: '-1', color: 'red', description: 'Respuesta fallida' },
      { id: 'pass', label: '🤐 No Responde (0)', delta: 0, badge: '0', color: 'slate', description: 'Sin respuesta' },
    ],
  },

  // 2. PREGUNTAS TRIVIAL
  {
    id: 'trivial',
    title: 'Preguntas Trivial',
    emoji: '🧠',
    category: 'Conocimiento',
    engine: 'buzzer',
    description: 'Preguntas de cultura general y temáticas con sistema oficial de rebote.',
    rules: [
      '✅ Acierto del equipo al que le toca: +2 puntos',
      '❌ Fallo: −1 punto',
      '🤷 Pasar: 0 puntos',
      '🔄 Rebote y acierto: +1 punto',
      '🔄 Rebote y fallo: 0 puntos',
    ],
    scoringOptions: [
      { id: 'turn_correct', label: '✅ Acierto Turno (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Acierto del equipo al que le toca' },
      { id: 'turn_fail', label: '❌ Fallo Turno (-1)', delta: -1, badge: '-1', color: 'red', description: 'Fallo del equipo del turno' },
      { id: 'turn_pass', label: '🤷 Pasar (0)', delta: 0, badge: '0', color: 'slate', description: 'Pasa turno sin penalización' },
      { id: 'rebound_correct', label: '🔄 Rebote y Acierto (+1)', delta: 1, badge: '+1', color: 'blue', description: 'Rebote acertado por rival' },
      { id: 'rebound_fail', label: '🔄 Rebote y Fallo (0)', delta: 0, badge: '0', color: 'slate', description: 'Fallo en rebote sin penalizar' },
    ],
  },

  // 3. DIBUJAR EN CADENA
  {
    id: 'drawing',
    title: 'Dibujar en Cadena',
    emoji: '🎨',
    category: 'Creativo',
    engine: 'challenges',
    description: 'Teléfono loco de arte: J1 dibuja -> J2 adivina -> J3 dibuja -> J4 adivina -> J5 dibuja la obra final.',
    rules: [
      '👤 J1: ve la palabra secreta y la dibuja',
      '👤 J2: solo ve el dibujo y escribe qué cree que es',
      '👤 J3: solo ve la respuesta de J2 y la vuelve a dibujar',
      '👤 J4: solo ve el segundo dibujo y escribe qué cree que es',
      '👤 J5: solo ve la respuesta de J4 y dibuja',
      '🎯 La última persona representa la palabra original: +5 puntos',
      '🖼️ Mejor dibujo de la ronda: +2 puntos',
    ],
    scoringOptions: [
      { id: 'chain_success', label: '🎯 Palabra Original Lograda (+5)', delta: 5, badge: '+5', color: 'emerald', description: 'La última persona representa la palabra original' },
      { id: 'best_art', label: '🖼️ Mejor Dibujo (+2)', delta: 2, badge: '+2', color: 'amber', description: 'Premio al mejor artista' },
      { id: 'disaster', label: '💀 Mayor Desastre (+1)', delta: 1, badge: '+1', color: 'purple', description: 'Premio de consolación al dibujo más cómico' },
      { id: 'chain_fail', label: '❌ No Lograda (0)', delta: 0, badge: '0', color: 'slate', description: 'Cadena rota sin acierto' },
    ],
  },

  // 4. MÍMICA
  {
    id: 'mimica',
    title: 'Mímica',
    emoji: '🎭',
    category: 'Creativo',
    engine: 'challenges',
    description: '2 representantes de cada equipo actúan con mímica mientras los otros 3 miembros intentan adivinar. 3 minutos a contrarreloj.',
    rules: [
      '👥 2 representantes hacen la mímica y los otros 3 adivinan',
      '⏱️ Tiempo total: 3 minutos para acertar tantas como puedan',
      '🎯 Cada acierto: +1 punto',
    ],
    scoringOptions: [
      { id: 'mimica_hit', label: '🎯 Acierto Mímica (+1)', delta: 1, badge: '+1', color: 'emerald', description: 'Palabra adivinada correctamente' },
      { id: 'mimica_hit_3', label: '⚡ +3 Aciertos (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Suma directa de 3 aciertos' },
      { id: 'mimica_hit_5', label: '🔥 +5 Aciertos (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Racha de 5 aciertos' },
      { id: 'mimica_pass', label: '🤷 Pasar Palabra (0)', delta: 0, badge: '0', color: 'slate', description: 'Pasa a la siguiente palabra' },
    ],
  },

  // 5. FOTOS PROYECTOR
  {
    id: 'fotos_proyector',
    title: 'Fotos Proyector (Bebés)',
    emoji: '👶',
    category: 'Velocidad',
    engine: 'buzzer',
    description: 'Saldrán fotos de bebés tanto de famosos como de los propios concursantes. ¡Prueba de velocidad con pulsador!',
    rules: [
      '⚡ Prueba de velocidad con pulsador',
      '✅ Acierto: +2 puntos',
      '❌ Fallo: −1 punto',
      '🚫 Si es tu foto no podrás usar el pulsador: −2 puntos si le das',
      '🤷 Pasar / nadie acierta: 0 puntos',
    ],
    scoringOptions: [
      { id: 'foto_hit', label: '✅ Acierto Bebé (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Adivina correctamente la foto' },
      { id: 'foto_miss', label: '❌ Fallo al Pulsar (-1)', delta: -1, badge: '-1', color: 'red', description: 'Falla tras ganar el pulsador' },
      { id: 'foto_self', label: '🚫 Pulsó su Propia Foto (-2)', delta: -2, badge: '-2', color: 'red', description: 'Penalización por pulsar en su propia foto' },
      { id: 'foto_pass', label: '🤷 Nadie Acierta (0)', delta: 0, badge: '0', color: 'slate', description: 'Sin puntos ni penalización' },
    ],
  },

  // 6. 1, 2, 3 ¿YA?
  {
    id: 'un_dos_tres',
    title: '1, 2, 3 ¿Ya?',
    emoji: '⚡',
    category: 'Velocidad',
    engine: 'challenges',
    description: 'Cada equipo por turnos tiene 5 segundos para decir 3 respuestas correctas. Preguntas en orden de dificultad creciente. Si fallas, quedas eliminado.',
    rules: [
      '⏱️ 5 segundos para decir 3 respuestas correctas (ej: "3 países europeos")',
      '👥 Pregunta a cada equipo en orden',
      '💀 Si fallan o se agota el tiempo: equipo eliminado de la prueba',
      '🥇 Ganador (1.º): +5 puntos',
      '🥈 Segundo (2.º): +2 puntos',
      '🥉 Tercero (3.º): +1 punto',
      '4.º y 5.º puesto: 0 puntos',
    ],
    scoringOptions: [
      { id: 'udt_1st', label: '🥇 Ganador 1.º (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Último equipo en pie (+5 pts)' },
      { id: 'udt_2nd', label: '🥈 Segundo 2.º (+2)', delta: 2, badge: '+2', color: 'blue', description: 'Segundo clasificado (+2 pts)' },
      { id: 'udt_3rd', label: '🥉 Tercero 3.º (+1)', delta: 1, badge: '+1', color: 'emerald', description: 'Tercer clasificado (+1 pt)' },
      { id: 'udt_45', label: '4.º y 5.º Puesto (0)', delta: 0, badge: '0', color: 'slate', description: 'Puestos finales sin puntos' },
      { id: 'udt_eliminate', label: '💀 Equipo Eliminado', delta: 0, badge: 'OUT', color: 'red', description: 'Falla la pregunta y queda fuera de la ronda' },
    ],
  },

  // 7. ADIVINA LA PELÍCULA (EMOJIS)
  {
    id: 'movies',
    title: 'Adivina la Película (Emojis)',
    emoji: '🎬',
    category: 'Conocimiento',
    engine: 'buzzer',
    description: 'Descifra la película oculta con emojis. Taquillazos, Disney/Pixar y Terror. ¡Cuantas menos pistas, más puntos!',
    rules: [
      '🎯 Acierto con 2 Emojis: +5 puntos',
      '🔍 Acierto con 4 Emojis (2 más): +3 puntos',
      '⭐ Acierto con todas las pistas: +1 punto',
      '❌ Respuesta incorrecta: −1 punto',
      '🔄 Rebote y acierto: +1 punto',
      '🤷 Pasar: 0 puntos',
    ],
    scoringOptions: [
      { id: 'emoji_2', label: '🎯 2 Emojis (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Acierto con solo 2 emojis iniciales' },
      { id: 'emoji_4', label: '🔍 4 Emojis (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Acierto con 4 emojis visibles' },
      { id: 'emoji_all', label: '⭐ Todas las Pistas (+1)', delta: 1, badge: '+1', color: 'emerald', description: 'Acierto con todas las pistas' },
      { id: 'rebound', label: '🔄 Rebote Acertado (+1)', delta: 1, badge: '+1', color: 'purple', description: 'Acierto tras rebote de otro equipo' },
      { id: 'wrong', label: '❌ Incorrecta (-1)', delta: -1, badge: '-1', color: 'red', description: 'Respuesta incorrecta tras pulsar' },
      { id: 'pass', label: '🤷 Pasar (0)', delta: 0, badge: '0', color: 'slate', description: 'Sin respuesta' },
    ],
  },

  // 8. BEER PONG
  {
    id: 'beer_pong',
    title: 'Beer Pong',
    emoji: '🍺',
    category: 'Habilidad',
    engine: 'challenges',
    description: 'Cada equipo coloca 3 vasos de su color. Un representante de cada equipo lanza bolas para encestar en los vasos.',
    rules: [
      '🥤 Cada equipo coloca 3 vasos de su color',
      '🏓 Un representante de cada equipo lanza bolas',
      '🎯 Cada bola metida: +1 punto',
      '🏆 El último vaso encestado: +5 puntos',
    ],
    scoringOptions: [
      { id: 'bp_cup', label: '🏓 Bola Metida (+1)', delta: 1, badge: '+1', color: 'blue', description: 'Por cada vaso encestado' },
      { id: 'bp_last', label: '🏆 Último Vaso (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Acierta el último vaso del torneo' },
      { id: 'bp_special', label: '🌟 Tiro Rebote (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Enceste con rebote previo' },
    ],
  },

  // 9. BINGO
  {
    id: 'bingo',
    title: 'BINGO',
    emoji: '🎱',
    category: 'Juegos de Mesa',
    engine: 'challenges',
    description: 'Partida de Bingo del Game Show con bombo virtual o físico para todos los equipos.',
    rules: [
      '📏 Línea cantada: +5 puntos',
      '🎱 ¡BINGO cantado!: +15 puntos',
    ],
    scoringOptions: [
      { id: 'bingo_linea', label: '📏 ¡Línea! (+5)', delta: 5, badge: '+5', color: 'blue', description: 'Primer equipo en cantar Línea válida' },
      { id: 'bingo_bingo', label: '🎱 ¡BINGO! (+15)', delta: 15, badge: '+15', color: 'amber', description: '¡Equipo que canta BINGO completo!' },
    ],
  },

  // 10. JUEGOS DE MESA: BLACKJACK
  {
    id: 'blackjack',
    title: 'Blackjack (5 Rondas)',
    emoji: '♠️',
    category: 'Juegos de Mesa',
    engine: 'duel',
    description: '5 rondas a ciegas de cartas. Clasificación final por acumulación de puntos.',
    rules: [
      '🥇 1.º clasificado en la mesa: +5 puntos',
      '🥈 2.º clasificado: +3 puntos',
      '🥉 3.º clasificado: +2 puntos',
      '4.º y 5.º clasificado: +1 punto',
    ],
    scoringOptions: [
      { id: 'bj_1', label: '🥇 1.º Mesa (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Ganador de la mesa' },
      { id: 'bj_2', label: '🥈 2.º Mesa (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo en mesa' },
      { id: 'bj_3', label: '🥉 3.º Mesa (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercero en mesa' },
      { id: 'bj_45', label: '4.º / 5.º Mesa (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Cuarto o quinto puesto' },
    ],
  },

  // 11. JUEGOS DE MESA: PARCHÍS
  {
    id: 'parchis',
    title: 'Parchís',
    emoji: '🎲',
    category: 'Juegos de Mesa',
    engine: 'duel',
    description: 'Partida de parchís entre representantes de cada equipo.',
    rules: [
      '🥇 1.º puesto: +5 puntos',
      '🥈 2.º puesto: +3 puntos',
      '🥉 3.º puesto: +2 puntos',
      '4.º y 5.º puesto: +1 punto',
    ],
    scoringOptions: [
      { id: 'parch_1', label: '🥇 1.º Parchís (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Primer puesto' },
      { id: 'parch_2', label: '🥈 2.º Parchís (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo puesto' },
      { id: 'parch_3', label: '🥉 3.º Parchís (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer puesto' },
      { id: 'parch_45', label: '4.º / 5.º Parchís (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de puestos' },
    ],
  },

  // 12. JUEGOS DE MESA: DOMINÓ
  {
    id: 'domino',
    title: 'Dominó',
    emoji: '🀄',
    category: 'Juegos de Mesa',
    engine: 'duel',
    description: 'Partida física de dominó para resolver puntuaciones de mesa.',
    rules: [
      '🥇 1.º clasificado: +5 puntos',
      '🥈 2.º clasificado: +3 puntos',
      '🥉 3.º clasificado: +2 puntos',
      '4.º y 5.º clasificado: +1 punto',
    ],
    scoringOptions: [
      { id: 'dom_1', label: '🥇 1.º Dominó (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Primer puesto' },
      { id: 'dom_2', label: '🥈 2.º Dominó (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo puesto' },
      { id: 'dom_3', label: '🥉 3.º Dominó (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer puesto' },
      { id: 'dom_45', label: '4.º / 5.º Dominó (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de puestos' },
    ],
  },

  // 13. JUEGOS DE MESA: UNO
  {
    id: 'uno',
    title: 'UNO Clásico',
    emoji: '🃏',
    category: 'Juegos de Mesa',
    engine: 'duel',
    description: 'Dos representantes por equipo juegan juntos. Gana el primer equipo sin cartas.',
    rules: [
      '🥇 Ganador absoluto: +5 puntos',
      '🥈 2.º (menos cartas restantes): +3 puntos',
      '🥉 3.º (siguiente con menos cartas): +2 puntos',
      '4.º y 5.º: +1 punto',
    ],
    scoringOptions: [
      { id: 'uno_1', label: '🥇 Ganador UNO (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Equipo sin cartas' },
      { id: 'uno_2', label: '🥈 2.º Menos Cartas (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo puesto' },
      { id: 'uno_3', label: '🥉 3.º Menos Cartas (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer puesto' },
      { id: 'uno_45', label: '4.º / 5.º Puesto (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de equipos' },
    ],
  },
];

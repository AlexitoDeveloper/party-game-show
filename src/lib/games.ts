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
    description: 'Suena un fragmento musical en la TV. El equipo más veloz pulsa para adivinar cantante, canción o ambos. Si falla la música continúa; si acierta, se revela en pantalla.',
    rules: [
      '🎤 Acierta cantante: +1 punto',
      '🎵 Acierta canción: +1 punto',
      '⭐ Acierta ambas: +2 puntos',
      '❌ Da una respuesta y es incorrecta: −1 punto (la música sigue)',
      '🤐 No responde o tiempo agotado: 0 puntos',
    ],
    scoringOptions: [
      { id: 'singer', label: '🎤 Cantante (+1)', delta: 1, badge: '+1', color: 'blue', description: 'Acierta solo el cantante' },
      { id: 'song', label: '🎵 Canción (+1)', delta: 1, badge: '+1', color: 'blue', description: 'Acierta solo la canción' },
      { id: 'both', label: '⭐ Ambas (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Acierta cantante y canción' },
      { id: 'wrong', label: '❌ Incorrecta (-1)', delta: -1, badge: '-1', color: 'red', description: 'Respuesta fallida (música reanuda)' },
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
    description: 'Aparecen preguntas en la TV (con o sin opciones). Quien sepa la respuesta pulsa el botón. El host valida y hay sistema de rebote.',
    rules: [
      '⚡ Quien sepa la respuesta pulsa el botón del móvil',
      '✅ Acierto del equipo que pulsa: +2 puntos',
      '❌ Fallo: −1 punto y ¡Rebote abierto para los demás!',
      '🔄 Rebote acertado por otro equipo: +1 punto',
      '🤷 Ningún equipo responde: 0 puntos y se revela solución',
    ],
    scoringOptions: [
      { id: 'turn_correct', label: '✅ Acierto (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Acierto del equipo al que le tocó el pulsador' },
      { id: 'turn_fail', label: '❌ Fallo y Rebote (-1)', delta: -1, badge: '-1', color: 'red', description: 'Fallo con rebote para los rivales' },
      { id: 'rebound_correct', label: '🔄 Rebote Acertado (+1)', delta: 1, badge: '+1', color: 'blue', description: 'Acierto tras rebote de otro equipo' },
      { id: 'turn_pass', label: '🤷 Pasar / Nadie (0)', delta: 0, badge: '0', color: 'slate', description: 'Nadie sabe la respuesta' },
    ],
  },

  // 3. TELÉFONO DIBUJADO
  {
    id: 'drawing',
    title: 'Teléfono Dibujado',
    emoji: '🎨',
    category: 'Creativo',
    engine: 'challenges',
    description: 'Prueba en papel real. Cadena cómica: J1 dibuja palabra secreta -> J2 escribe lo que cree -> J3 dibuja -> J4 escribe -> J5 dibuja final. Al acabar se puntúa según resultados.',
    rules: [
      '📝 Se juega presencialmente dibujando y escribiendo en papel real',
      '👤 J1 ve palabra secreta y dibuja ➔ J2 adivina ➔ J3 dibuja ➔ J4 adivina ➔ J5 dibuja la obra final',
      '🎯 La última persona representa la palabra original: +5 puntos',
      '🖼️ Mejor dibujo de la ronda: +3 puntos',
      '💀 Dibujo más cómico o desastroso: +2 puntos',
      '⚖️ Puntuaciones asignadas por el host al final de la prueba',
    ],
    scoringOptions: [
      { id: 'chain_success', label: '🎯 Palabra Lograda (+5)', delta: 5, badge: '+5', color: 'emerald', description: 'Cadena exitosa con palabra original' },
      { id: 'best_art', label: '🖼️ Mejor Dibujo (+3)', delta: 3, badge: '+3', color: 'amber', description: 'Premio al dibujo más fiel y artístico' },
      { id: 'funny_art', label: '💀 Desastre Cómico (+2)', delta: 2, badge: '+2', color: 'purple', description: 'Premio de humor al dibujo más descalabrado' },
      { id: 'podium_1', label: '🥇 1.º Clasificado (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Primer equipo según veredicto' },
      { id: 'podium_2', label: '🥈 2.º Clasificado (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo equipo según veredicto' },
      { id: 'podium_3', label: '🥉 3.º Clasificado (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Tercer equipo según veredicto' },
    ],
  },

  // 4. TORNEO DE JUEGOS
  {
    id: 'torneo_juegos',
    title: 'Torneo de Juegos',
    emoji: '🎮',
    category: 'Juegos de Mesa',
    engine: 'duel',
    description: 'Competición presencial en juegos de mesa como UNO, Dominó o Parchís. Al finalizar las partidas, se reparten los puntos según la posición de cada equipo.',
    rules: [
      '🎲 Partidas simultáneas o eliminatorias de UNO, Dominó o Parchís',
      '🥇 1.º Campeón del Torneo: +5 puntos',
      '🥈 2.º Subcampeón: +3 puntos',
      '🥉 3.º Tercer puesto: +2 puntos',
      '4.º y 5.º puesto: +1 punto',
      '⚖️ El anfitrión asigna los puntos al término del torneo',
    ],
    scoringOptions: [
      { id: 'tj_1', label: '🥇 Campeón (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Primer clasificado del torneo' },
      { id: 'tj_2', label: '🥈 Subcampeón (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo clasificado del torneo' },
      { id: 'tj_3', label: '🥉 3.º Puesto (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer clasificado del torneo' },
      { id: 'tj_45', label: '4.º / 5.º Puesto (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de clasificados' },
    ],
  },

  // 5. MÍMICA
  {
    id: 'mimica',
    title: 'Mímica',
    emoji: '🎭',
    category: 'Creativo',
    engine: 'challenges',
    description: 'Prueba presencial. El host le proporciona en secreto la tarjeta/reto al actor y su equipo debe adivinar. Al final se reparten los puntos según los aciertos logrados.',
    rules: [
      '🤫 El anfitrión muestra en secreto el reto al actor en su móvil',
      '🤐 ¡Totalmente prohibido hablar, susurrar o emitir sonidos!',
      '⏱️ Tiempo a contrarreloj (60s / 90s) para adivinar',
      '🎯 Cada reto acertado: +1 punto',
      '🔥 O podio al final: 1.º (+5), 2.º (+3), 3.º (+2)',
    ],
    scoringOptions: [
      { id: 'mimica_hit', label: '🎯 Acierto (+1)', delta: 1, badge: '+1', color: 'emerald', description: 'Acierto individual durante la ronda' },
      { id: 'mimica_hit_3', label: '⚡ 3 Aciertos (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Paquete de 3 aciertos' },
      { id: 'mimica_p1', label: '🥇 1.º en Mímica (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Equipo con más aciertos de la prueba' },
      { id: 'mimica_p2', label: '🥈 2.º en Mímica (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo clasificado en mímica' },
      { id: 'mimica_p3', label: '🥉 3.º en Mímica (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer clasificado en mímica' },
    ],
  },

  // 6. FOTOS PROYECTOR (BEBÉS)
  {
    id: 'fotos_proyector',
    title: 'Fotos Proyector (Bebés)',
    emoji: '👶',
    category: 'Velocidad',
    engine: 'buzzer',
    description: 'Se muestran una a una fotos en pantalla de bebés o niños (famosos o participantes). El más veloz pulsa para adivinar quién es.',
    rules: [
      '⚡ Foto proyectada en TV: el más rápido pulsa el botón',
      '✅ Acierto: +2 puntos',
      '❌ Fallo: −1 punto',
      '🚫 Si es tu propia foto no puedes pulsar: −2 puntos de penalización',
      '🤷 Si nadie pulsa, el host revela la foto sin penalización',
    ],
    scoringOptions: [
      { id: 'foto_hit', label: '✅ Acierto Bebé (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Adivina correctamente la persona' },
      { id: 'foto_miss', label: '❌ Fallo al Pulsar (-1)', delta: -1, badge: '-1', color: 'red', description: 'Falla tras pulsar' },
      { id: 'foto_self', label: '🚫 Pulsó su Propia Foto (-2)', delta: -2, badge: '-2', color: 'red', description: 'Penalización por pulsar en su propia foto' },
      { id: 'foto_pass', label: '🤷 Nadie Acierta (0)', delta: 0, badge: '0', color: 'slate', description: 'Foto revelada sin puntos' },
    ],
  },

  // 7. 1, 2, 3 ¿YA?
  {
    id: 'un_dos_tres',
    title: '1, 2, 3 ¿Ya?',
    emoji: '⚡',
    category: 'Velocidad',
    engine: 'challenges',
    description: 'Cada equipo por turnos tiene 5 segundos para decir 3 respuestas correctas. Preguntas con dificultad creciente. Si fallas o no llegas, ¡quedes eliminado!',
    rules: [
      '⏱️ 5 segundos exactos para decir 3 respuestas válidas',
      '👥 Turnos alternados de cada equipo con dificultad en aumento',
      '💀 Fallar o superar los 5 segundos = ELIMINACIÓN inmediata',
      '🥇 Ganador último en pie (1.º): +5 puntos',
      '🥈 Segundo puesto (2.º): +3 puntos',
      '🥉 Tercer puesto (3.º): +2 puntos',
    ],
    scoringOptions: [
      { id: 'udt_1st', label: '🥇 Ganador Último en Pie (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Único equipo superviviente (+5 pts)' },
      { id: 'udt_2nd', label: '🥈 Segundo Clasificado (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Subcampeón superviviente (+3 pts)' },
      { id: 'udt_3rd', label: '🥉 Tercer Clasificado (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer puesto (+2 pts)' },
      { id: 'udt_eliminate', label: '💀 Eliminar Equipo (OUT)', delta: 0, badge: 'OUT', color: 'red', description: 'Marca el equipo como eliminado' },
    ],
  },

  // 8. ADIVINA LA PELÍCULA (EMOJIS)
  {
    id: 'movies',
    title: 'Adivina la Película (Emojis)',
    emoji: '🎬',
    category: 'Conocimiento',
    engine: 'buzzer',
    description: 'Descifra la película con secuencias de emojis. Puntuación automatizada según pistas en pantalla: 2 emojis = +5 pts, 4 emojis = +3 pts, todas = +1 pt.',
    rules: [
      '🎯 Acierto con 2 Emojis (Nivel 1): +5 puntos automáticos',
      '🔍 Acierto con 4 Emojis (Nivel 2): +3 puntos automáticos',
      '⭐ Acierto con todas las pistas (Nivel 3/4): +1 punto automático',
      '❌ Respuesta incorrecta tras pulsar: −1 punto',
      '🔄 Rebote a los demás equipos',
    ],
    scoringOptions: [
      { id: 'emoji_auto', label: '✅ Validar Acierto (Auto)', delta: 0, badge: 'AUTO', color: 'emerald', description: 'Puntuación automática según nivel de emojis' },
      { id: 'emoji_2', label: '🎯 2 Emojis (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Acierto con solo 2 emojis iniciales' },
      { id: 'emoji_4', label: '🔍 4 Emojis (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Acierto con 4 emojis visibles' },
      { id: 'emoji_all', label: '⭐ Todas las Pistas (+1)', delta: 1, badge: '+1', color: 'emerald', description: 'Acierto con todas las pistas' },
      { id: 'wrong', label: '❌ Incorrecta (-1)', delta: -1, badge: '-1', color: 'red', description: 'Fallo al pulsar' },
    ],
  },

  // 9. BEER PONG
  {
    id: 'beer_pong',
    title: 'Beer Pong',
    emoji: '🍺',
    category: 'Habilidad',
    engine: 'challenges',
    description: 'Juego presencial con vasos y bolas de ping pong. Puntuación al final según los resultados de cada equipo en la mesa.',
    rules: [
      '🥤 Vasos de colores en mesa presencial con bolas de ping pong',
      '🏓 Rondas de lanzamientos por turnos',
      '🎯 Cada vaso encestado: +1 punto',
      '🏆 Campeón de mesa / Último vaso: +5 puntos',
      '⚖️ El anfitrión asigna los puntos al término del juego',
    ],
    scoringOptions: [
      { id: 'bp_1st', label: '🥇 Campeón Beer Pong (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Equipo ganador absoluto' },
      { id: 'bp_2nd', label: '🥈 Segundo Puesto (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo puesto' },
      { id: 'bp_3rd', label: '🥉 Tercer Puesto (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer puesto' },
      { id: 'bp_cup', label: '🥤 Vaso Encestado (+1)', delta: 1, badge: '+1', color: 'blue', description: 'Punto por cada vaso metido' },
    ],
  },

  // 10. BINGO
  {
    id: 'bingo',
    title: 'BINGO',
    emoji: '🎱',
    category: 'Juegos de Mesa',
    engine: 'challenges',
    description: 'Juego presencial con cartones físicos para los equipos y bombo interactivo virtual en la TV (1 a 90). Puntuación al final según resultados.',
    rules: [
      '🎟️ Cada equipo juega con sus cartones físicos en la sala',
      '📺 Bombo virtual en la TV: el host saca bolas del 1 al 90',
      '📏 Primer equipo en cantar Línea válida: +5 puntos',
      '🎱 ¡Primer equipo en cantar BINGO completo!: +15 puntos',
    ],
    scoringOptions: [
      { id: 'bingo_linea', label: '📏 ¡Línea! (+5)', delta: 5, badge: '+5', color: 'blue', description: 'Primer equipo en completar y cantar Línea válida' },
      { id: 'bingo_bingo', label: '🎱 ¡BINGO! (+15)', delta: 15, badge: '+15', color: 'amber', description: '¡Equipo ganador que canta BINGO completo!' },
      { id: 'bingo_extra', label: '⭐ Premio Especial (+3)', delta: 3, badge: '+3', color: 'emerald', description: 'Premio o bonus de cartón especial' },
    ],
  },
];

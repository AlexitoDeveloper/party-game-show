import { MinigameType } from './types';

export interface ScoringOption {
  id: string;
  label: string;
  delta: number;
  badge: string;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'slate';
  description?: string;
}

export type ParticipantsMode = 'all' | 'solo' | 'duo' | 'actor_and_guesser' | 'rotative' | 'delegates';

export interface GameDefinition {
  id: string;
  title: string;
  emoji: string;
  category: 'Musical' | 'Conocimiento' | 'Creativo' | 'Velocidad' | 'Habilidad' | 'Juegos de Mesa';
  engine: MinigameType;
  participantsMode: ParticipantsMode;
  participantsLabel: string;
  participantsDescription: string;
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
    participantsMode: 'delegates',
    participantsLabel: '👥 2 - 3 Representantes (Melómanos)',
    participantsDescription: '2 o 3 miembros por equipo representan a su grupo con el pulsador habilitado.',
    description: 'Suena un fragmento musical en la TV. Los representantes pulsan para adivinar cantante, canción o ambos. Los aciertos se acumulan y al final se reparte el Podio de la prueba.',
    rules: [
      '🎤 Aciertos de cantante y canción suman al contador musical del equipo',
      '❌ Fallo tras pulsar: −1 punto en el marcador de la ronda (música reanuda)',
      '🏆 Podio final según aciertos: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
      '⚖️ El anfitrión asigna los puntos del podio al terminar la tanda musical',
    ],
    scoringOptions: [
      { id: 'music_p1', label: '🥇 1.º en Canciones (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Equipo con más canciones acertadas' },
      { id: 'music_p2', label: '🥈 2.º en Canciones (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo clasificado musical' },
      { id: 'music_p3', label: '🥉 3.º en Canciones (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer clasificado musical' },
      { id: 'music_p4', label: '4.º / 5.º en Canciones (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de participantes' },
    ],
  },

  // 2. PREGUNTAS TRIVIAL
  {
    id: 'trivial',
    title: 'Preguntas Trivial',
    emoji: '🧠',
    category: 'Conocimiento',
    engine: 'buzzer',
    participantsMode: 'delegates',
    participantsLabel: '👥 2 - 3 Representantes (Sabios)',
    participantsDescription: '2 o 3 miembros salen al frente a deliberar en equipo antes de pulsar.',
    description: 'Preguntas de cultura pop, cine, geografía y retos en la TV. Los representantes pulsan y deliberan. Al terminar la tanda de preguntas se reparte el Podio de Sabios.',
    rules: [
      '⚡ Quien sepa la respuesta pulsa el botón del móvil y delibera con sus compañeros',
      '✅ Cada acierto o rebote suma al contador de conocimiento del equipo',
      '❌ Fallo: Abre rebote a los demás equipos rivales',
      '🏆 Podio final según aciertos: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
      '⚖️ El anfitrión asigna los puntos del podio al terminar la ronda de preguntas',
    ],
    scoringOptions: [
      { id: 'triv_p1', label: '🥇 1.º en Trivial (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Equipo con más preguntas acertadas' },
      { id: 'triv_p2', label: '🥈 2.º en Trivial (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo clasificado en trivial' },
      { id: 'triv_p3', label: '🥉 3.º en Trivial (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer clasificado en trivial' },
      { id: 'triv_p4', label: '4.º / 5.º en Trivial (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de participantes' },
    ],
  },

  // 3. TELÉFONO DIBUJADO
  {
    id: 'drawing',
    title: 'Teléfono Dibujado',
    emoji: '🎨',
    category: 'Creativo',
    engine: 'challenges',
    participantsMode: 'all',
    participantsLabel: '👥 Todo el equipo (Cadena)',
    participantsDescription: 'Todos los miembros forman la cadena de papel: J1 dibuja ➔ J2 escribe ➔ J3 dibuja...',
    description: 'Prueba en papel real. Cada equipo juega su propia cadena simultánea: J1 dibuja -> J2 escribe -> J3 dibuja -> J4 escribe -> J5 dibuja final. Al acabar se valoran las cadenas y se asigna el Podio.',
    rules: [
      '📝 Se juega presencialmente dibujando y escribiendo en papel real',
      '💡 El Jugador 1 decide libremente qué dibujar (no requiere de frase previa)',
      '👤 J1 dibuja su idea ➔ J2 adivina y escribe ➔ J3 dibuja ➔ J4 escribe ➔ J5 dibuja la obra final',
      '🏆 Podio final por veredicto: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
      '⚖️ El anfitrión asigna los puestos del podio al final de la prueba',
    ],
    scoringOptions: [
      { id: 'podium_1', label: '🥇 1.º Clasificado (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Mejor cadena lograda' },
      { id: 'podium_2', label: '🥈 2.º Clasificado (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo equipo según veredicto' },
      { id: 'podium_3', label: '🥉 3.º Clasificado (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer equipo según veredicto' },
      { id: 'podium_4', label: '4.º / 5.º Clasificado (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de cadenas' },
    ],
  },

  // 4. TORNEO DE JUEGOS
  {
    id: 'torneo_juegos',
    title: 'Torneo de Juegos',
    emoji: '🎮',
    category: 'Juegos de Mesa',
    engine: 'duel',
    participantsMode: 'solo',
    participantsLabel: '👤 1 Representante',
    participantsDescription: 'El capitán designa a 1 jugador por equipo para disputar las partidas del torneo de mesa.',
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
    participantsMode: 'duo',
    participantsLabel: '👥 2 Actores + Resto adivina',
    participantsDescription: 'Turno exclusivo: 2 miembros salen a actuar en silencio y todo el resto de su equipo intenta adivinar en 90s.',
    description: 'Prueba presencial. El host le proporciona en secreto la tarjeta/reto a los 2 actores y su equipo debe adivinar. Al final de la prueba se asignan los puntos del Podio según los aciertos totales.',
    rules: [
      '🤫 El anfitrión muestra en secreto el reto a los 2 actores en su móvil',
      '🤐 ¡Totalmente prohibido hablar, susurrar o emitir sonidos!',
      '⏱️ Tiempo a contrarreloj de 90 segundos para adivinar el máximo posible',
      '🎯 Cada reto acertado cuenta para el marcador de aciertos de la ronda',
      '🏆 Podio final de la prueba según aciertos: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
    ],
    scoringOptions: [
      { id: 'mimica_p1', label: '🥇 1.º en Mímica (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Equipo con más aciertos de la prueba' },
      { id: 'mimica_p2', label: '🥈 2.º en Mímica (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo clasificado en mímica' },
      { id: 'mimica_p3', label: '🥉 3.º en Mímica (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer clasificado en mímica' },
      { id: 'mimica_p4', label: '4.º / 5.º en Mímica (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de equipos participantes' },
    ],
  },

  // 6. FOTOS PROYECTOR (BEBÉS)
  {
    id: 'fotos_proyector',
    title: 'Fotos Proyector (Bebés)',
    emoji: '👶',
    category: 'Velocidad',
    engine: 'buzzer',
    participantsMode: 'all',
    participantsLabel: '👥 Todos los concursantes',
    participantsDescription: 'Toda la sala atenta al proyector para pulsar; ¡ojo con pulsar en tu propia foto!',
    description: 'Se muestran una a una fotos en pantalla de bebés o niños (famosos o participantes). El más veloz pulsa para adivinar quién es. Al final se reparte el Podio de la ronda.',
    rules: [
      '⚡ Foto proyectada en TV: el más rápido pulsa el botón',
      '✅ Cada foto acertada cuenta para el ranking de la prueba',
      '❌ Fallo: −1 punto en el marcador de la ronda',
      '🚫 Si es tu propia foto no puedes pulsar: −2 puntos de penalización directa',
      '🏆 Podio final de fotos: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
    ],
    scoringOptions: [
      { id: 'foto_p1', label: '🥇 1.º en Fotos (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Equipo con más fotos acertadas' },
      { id: 'foto_p2', label: '🥈 2.º en Fotos (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo clasificado en fotos' },
      { id: 'foto_p3', label: '🥉 3.º en Fotos (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer clasificado en fotos' },
      { id: 'foto_p4', label: '4.º / 5.º en Fotos (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de participantes' },
      { id: 'foto_self', label: '🚫 Pulsó su Propia Foto (-2)', delta: -2, badge: '-2', color: 'red', description: 'Penalización directa por pulsar en su propia foto' },
    ],
  },

  // 7. 1, 2, 3 ¿YA?
  {
    id: 'un_dos_tres',
    title: '1, 2, 3 ¿Ya?',
    emoji: '⚡',
    category: 'Velocidad',
    engine: 'challenges',
    participantsMode: 'delegates',
    participantsLabel: '👥 2 - 3 Representantes por ronda',
    participantsDescription: '2 o 3 representantes de cada equipo salen a competir en la ronda; si fallan o superan 5s quedan fuera.',
    description: 'Cada equipo por turnos tiene 5 segundos para decir 3 respuestas correctas. Preguntas con dificultad creciente. Si fallas o no llegas, ¡quedes eliminado!',
    rules: [
      '⏱️ 5 segundos exactos para decir 3 respuestas válidas',
      '👥 Salen 2-3 representantes de cada equipo al estrado a competir',
      '💀 Fallar o superar los 5 segundos = ELIMINACIÓN inmediata',
      '🥇 Ganador último en pie (1.º): +5 puntos',
      '🥈 Segundo puesto (2.º): +3 puntos',
      '🥉 Tercer puesto (3.º): +2 puntos',
      '4.º / 5.º Puesto: +1 punto',
    ],
    scoringOptions: [
      { id: 'udt_1st', label: '🥇 Ganador Último en Pie (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Único equipo superviviente (+5 pts)' },
      { id: 'udt_2nd', label: '🥈 Segundo Clasificado (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Subcampeón superviviente (+3 pts)' },
      { id: 'udt_3rd', label: '🥉 Tercer Clasificado (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer puesto (+2 pts)' },
      { id: 'udt_4th', label: '4.º / 5.º Puesto (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de participantes' },
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
    participantsMode: 'delegates',
    participantsLabel: '👥 2 - 3 Representantes (Cinéfilos)',
    participantsDescription: '2 o 3 miembros por equipo descifran las secuencias de emojis con el pulsador.',
    description: 'Descifra la película con secuencias de emojis. Cada acierto suma al contador de películas de la prueba y al final se reparte el Podio Cinéfilo.',
    rules: [
      '🎯 Los aciertos suman al marcador de películas de la ronda',
      '❌ Respuesta incorrecta tras pulsar: −1 punto de ronda y rebote',
      '🏆 Podio final cinéfilo: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
      '⚖️ El anfitrión asigna los puntos del podio al término de la tanda de películas',
    ],
    scoringOptions: [
      { id: 'movie_p1', label: '🥇 1.º en Películas (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Equipo con más películas acertadas' },
      { id: 'movie_p2', label: '🥈 2.º en Películas (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo clasificado cinéfilo' },
      { id: 'movie_p3', label: '🥉 3.º en Películas (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer clasificado cinéfilo' },
      { id: 'movie_p4', label: '4.º / 5.º en Películas (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de participantes' },
    ],
  },

  // 9. BEER PONG
  {
    id: 'beer_pong',
    title: 'Beer Pong',
    emoji: '🍺',
    category: 'Habilidad',
    engine: 'challenges',
    participantsMode: 'duo',
    participantsLabel: '👥 Pareja (2 jugadores)',
    participantsDescription: 'El capitán designa una pareja de tiradores por equipo para lanzar las bolas.',
    description: 'Juego presencial con vasos y bolas de ping pong. Puntuación final al término del juego según el Podio oficial de la prueba.',
    rules: [
      '🥤 Vasos de colores en mesa presencial con bolas de ping pong',
      '🏓 Rondas de lanzamientos por turnos para encestar el mayor número de vasos',
      '🏆 Podio único final según victorias y vasos: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
      '⚖️ El anfitrión asigna los puntos del podio al término del torneo',
    ],
    scoringOptions: [
      { id: 'bp_1st', label: '🥇 Campeón Beer Pong (+5)', delta: 5, badge: '+5', color: 'amber', description: 'Equipo ganador absoluto' },
      { id: 'bp_2nd', label: '🥈 Segundo Puesto (+3)', delta: 3, badge: '+3', color: 'blue', description: 'Segundo clasificado' },
      { id: 'bp_3rd', label: '🥉 Tercer Puesto (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Tercer clasificado' },
      { id: 'bp_4th', label: '4.º / 5.º Puesto (+1)', delta: 1, badge: '+1', color: 'slate', description: 'Resto de participantes' },
    ],
  },

  // 10. BINGO
  {
    id: 'bingo',
    title: 'BINGO',
    emoji: '🎱',
    category: 'Juegos de Mesa',
    engine: 'challenges',
    participantsMode: 'all',
    participantsLabel: '👥 Todos los concursantes',
    participantsDescription: 'Todos los miembros participan con sus cartones físicos en la mesa cantando línea o bingo.',
    description: 'Juego presencial con cartones físicos para los equipos y bombo interactivo virtual en la TV (1 a 90). Puntuación equilibrada al cantar línea o bingo.',
    rules: [
      '🎟️ Cada equipo juega con sus cartones físicos en la sala',
      '📺 Bombo virtual en la TV: el host saca bolas del 1 al 90',
      '📏 Primer equipo en cantar Línea válida: +2 puntos',
      '🎱 ¡Primer equipo en cantar BINGO completo!: +6 puntos',
      '⭐ Premio especial o consolación: +2 puntos',
    ],
    scoringOptions: [
      { id: 'bingo_linea', label: '📏 ¡Línea! (+2)', delta: 2, badge: '+2', color: 'blue', description: 'Primer equipo en completar y cantar Línea válida' },
      { id: 'bingo_bingo', label: '🎱 ¡BINGO! (+6)', delta: 6, badge: '+6', color: 'amber', description: '¡Equipo ganador que canta BINGO completo!' },
      { id: 'bingo_extra', label: '⭐ Premio Especial (+2)', delta: 2, badge: '+2', color: 'emerald', description: 'Premio o bonus de cartón especial' },
    ],
  },
];

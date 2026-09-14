import { MinigameType } from './types';

export interface ScoringOption {
  id: string;
  label: string;
  delta: number;
  hitsDelta?: number;
  badge: string;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'slate';
  description?: string;
  type?: 'action' | 'podium';
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
  coverImage?: string;
}

export const GAMES_CATALOG: GameDefinition[] = [
  // 1. HITS AND RUN (Música y pulsadores)
  {
    id: 'music',
    title: 'Hits and RUN',
    emoji: '🎵',
    category: 'Musical',
    engine: 'buzzer',
    coverImage: '/covers/1_hits_and_run.png',
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
      { id: 'music_full', label: '⭐ Pleno', delta: 2, hitsDelta: 2, badge: '+2', color: 'amber', type: 'action', description: 'Cantante y canción (+2 pts)' },
      { id: 'music_singer', label: '🎤 Cantante', delta: 1, hitsDelta: 1, badge: '+1', color: 'emerald', type: 'action', description: 'Acierto de cantante (+1 pt)' },
      { id: 'music_song', label: '🎵 Canción', delta: 1, hitsDelta: 1, badge: '+1', color: 'blue', type: 'action', description: 'Acierto de canción (+1 pt)' },
      { id: 'music_miss', label: '❌ Fallo', delta: -1, hitsDelta: 0, badge: '-1', color: 'red', type: 'action', description: 'Fallo tras pulsar (-1 pt)' },
      { id: 'music_p1', label: '🥇 1.º Puesto', delta: 5, hitsDelta: 0, badge: '+5', color: 'amber', type: 'podium', description: '1.º en canciones acertadas (+5 pts)' },
      { id: 'music_p2', label: '🥈 2.º Puesto', delta: 3, hitsDelta: 0, badge: '+3', color: 'blue', type: 'podium', description: '2.º puesto musical (+3 pts)' },
      { id: 'music_p3', label: '🥉 3.º Puesto', delta: 2, hitsDelta: 0, badge: '+2', color: 'emerald', type: 'podium', description: '3.º puesto musical (+2 pts)' },
      { id: 'music_p4', label: '4.º / 5.º Puesto', delta: 1, hitsDelta: 0, badge: '+1', color: 'slate', type: 'podium', description: 'Resto de participantes (+1 pt)' },
    ],
  },

  // 2. TRIVIAL DEL REY (Preguntas de conocimiento)
  {
    id: 'trivial',
    title: 'Trivial del Rey',
    emoji: '🧠',
    category: 'Conocimiento',
    engine: 'buzzer',
    coverImage: '/covers/2_trivial_del_rey.png',
    participantsMode: 'delegates',
    participantsLabel: '👥 2 - 3 Representantes (Sabios)',
    participantsDescription: '2 o 3 miembros salen al frente a deliberar en equipo antes de pulsar.',
    description: 'Preguntas de cultura pop, cine, geografía y retos en la TV. Los representantes pulsan y deliberan. Al terminar la tanda de preguntas se reparte el Podio de Sabios.',
    rules: [
      '⚡ Quien sepa la respuesta pulsa el botón del móvil y delibera con sus compañeros',
      '✅ Acierto directo: +2 puntos de ronda y suma al contador de conocimiento',
      '↩️ Acierto tras rebote: +2 puntos de ronda también para el equipo rebotado',
      '❌ Fallo: Abre rebote a los demás equipos rivales (−1 pt)',
      '🏆 Podio final según aciertos: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
      '⚖️ El anfitrión asigna los puntos del podio al terminar la ronda de preguntas',
    ],
    scoringOptions: [
      { id: 'triv_hit', label: '✅ Acierto Directo', delta: 2, hitsDelta: 1, badge: '+2', color: 'emerald', type: 'action', description: 'Pregunta acertada (+2 pts)' },
      { id: 'triv_rebound', label: '↩️ Acierto Rebote', delta: 2, hitsDelta: 1, badge: '+2', color: 'blue', type: 'action', description: 'Acierto tras rebote (+2 pts)' },
      { id: 'triv_miss', label: '❌ Fallo', delta: -1, hitsDelta: 0, badge: '-1', color: 'red', type: 'action', description: 'Fallo al pulsar (-1 pt)' },
      { id: 'triv_p1', label: '🥇 1.º Puesto', delta: 5, hitsDelta: 0, badge: '+5', color: 'amber', type: 'podium', description: '1.º con más preguntas acertadas (+5 pts)' },
      { id: 'triv_p2', label: '🥈 2.º Puesto', delta: 3, hitsDelta: 0, badge: '+3', color: 'blue', type: 'podium', description: '2.º puesto en trivial (+3 pts)' },
      { id: 'triv_p3', label: '🥉 3.º Puesto', delta: 2, hitsDelta: 0, badge: '+2', color: 'emerald', type: 'podium', description: '3.º puesto en trivial (+2 pts)' },
      { id: 'triv_p4', label: '4.º / 5.º Puesto', delta: 1, hitsDelta: 0, badge: '+1', color: 'slate', type: 'podium', description: 'Resto de participantes (+1 pt)' },
    ],
  },

  // 3. MENSAJE AL REY (Teléfono dibujado / Cadena)
  {
    id: 'drawing',
    title: 'Mensaje al Rey',
    emoji: '📜',
    category: 'Creativo',
    engine: 'challenges',
    coverImage: '/covers/3_mensaje_al_rey.png',
    participantsMode: 'all',
    participantsLabel: '👥 Todo el equipo (Cadena)',
    participantsDescription: 'Todos los miembros forman la cadena de papel: J1 dibuja ➔ J2 escribe ➔ J3 dibuja...',
    description: 'Prueba en papel real. Cada equipo juega su propia cadena simultánea: J1 dibuja -> J2 escribe -> J3 dibuja -> J4 escribe -> J5 dibuja final. Al acabar se valoran las cadenas y se asigna el Podio.',
    rules: [
      '📝 Se juega presencialmente dibujando y escribiendo en papel real',
      '💡 El Jugador 1 decide libremente qué dibujar (no requiere de frase previa)',
      '👤 J1 dibuja su idea ➔ J2 adivina y escribe ➔ J3 dibuja ➔ J4 escribe ➔ J5 dibuja la obra final',
      '🎯 +5 aciertos: Si lo del Jugador 1 le llega igual al Jugador 5 (Cadena intacta)',
      '🎨 Premio Mejor Dibujo: +2 aciertos al dibujo más artístico o currado',
      '🤪 Premio Peor Dibujo: +1 acierto al dibujo más cómico o desastroso',
      '🏆 Podio final por aciertos: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
      '⚖️ El anfitrión asigna las valoraciones y el podio al final de la prueba',
    ],
    scoringOptions: [
      { id: 'draw_exact', label: '🎯 Cadena Intacta', delta: 5, hitsDelta: 5, badge: '+5', color: 'amber', type: 'action', description: 'Lo de J1 llegó igual a J5 (+5 pts)' },
      { id: 'draw_best', label: '🎨 Mejor Dibujo', delta: 2, hitsDelta: 2, badge: '+2', color: 'emerald', type: 'action', description: 'Dibujo más artístico (+2 pts)' },
      { id: 'draw_worst', label: '🤪 Peor Dibujo', delta: 1, hitsDelta: 1, badge: '+1', color: 'purple', type: 'action', description: 'Dibujo más cómico (+1 pt)' },
      { id: 'podium_1', label: '🥇 1.º Puesto', delta: 5, hitsDelta: 0, badge: '+5', color: 'amber', type: 'podium', description: '1.º en la prueba (+5 pts)' },
      { id: 'podium_2', label: '🥈 2.º Puesto', delta: 3, hitsDelta: 0, badge: '+3', color: 'blue', type: 'podium', description: '2.º puesto (+3 pts)' },
      { id: 'podium_3', label: '🥉 3.º Puesto', delta: 2, hitsDelta: 0, badge: '+2', color: 'emerald', type: 'podium', description: '3.º puesto (+2 pts)' },
      { id: 'podium_4', label: '4.º / 5.º Puesto', delta: 1, hitsDelta: 0, badge: '+1', color: 'slate', type: 'podium', description: 'Resto de participantes (+1 pt)' },
    ],
  },

  // 4. CASINO DEL DIABLO (Torneo de juegos de mesa / Casino)
  {
    id: 'torneo_juegos',
    title: 'Casino del Diablo',
    emoji: '🎲',
    category: 'Juegos de Mesa',
    engine: 'duel',
    coverImage: '/covers/4_casino_del_diablo.png',
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
      { id: 'tj_1', label: '🥇 1.º Campeón', delta: 5, badge: '+5', color: 'amber', type: 'podium', description: '1.º en el torneo de mesa (+5 pts)' },
      { id: 'tj_2', label: '🥈 2.º Subcampeón', delta: 3, badge: '+3', color: 'blue', type: 'podium', description: '2.º en el torneo (+3 pts)' },
      { id: 'tj_3', label: '🥉 3.º Puesto', delta: 2, badge: '+2', color: 'emerald', type: 'podium', description: '3.º en el torneo (+2 pts)' },
      { id: 'tj_45', label: '4.º / 5.º Puesto', delta: 1, badge: '+1', color: 'slate', type: 'podium', description: 'Resto de clasificados (+1 pt)' },
    ],
  },

  // 5. CINE MUDO (Mímica en silencio)
  {
    id: 'mimica',
    title: 'Cine mudo',
    emoji: '🎭',
    category: 'Creativo',
    engine: 'challenges',
    coverImage: '/covers/5_cine_mudo.png',
    participantsMode: 'duo',
    participantsLabel: '👥 2 Actores + Resto adivina',
    participantsDescription: 'Turno exclusivo: 2 miembros salen a actuar en silencio y todo el resto de su equipo intenta adivinar en 90s.',
    description: 'Prueba presencial inspirada en el cine mudo de los años 30. El host proporciona en secreto la tarjeta/reto a los 2 actores y su equipo debe adivinar. Al final de la prueba se asignan los puntos del Podio según los aciertos totales.',
    rules: [
      '🤫 El anfitrión muestra en secreto el reto a los 2 actores en su móvil',
      '🤐 ¡Totalmente prohibido hablar, susurrar o emitir sonidos!',
      '⏱️ Tiempo a contrarreloj de 90 segundos para adivinar el máximo posible',
      '🎯 Cada reto acertado cuenta para el marcador de aciertos de la ronda',
      '🏆 Podio final de la prueba según aciertos: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
    ],
    scoringOptions: [
      { id: 'mimica_hit', label: '🎬 Reto Acertado', delta: 1, hitsDelta: 1, badge: '+1', color: 'emerald', type: 'action', description: 'Reto adivinado dentro del tiempo (+1 acierto)' },
      { id: 'mimica_p1', label: '🥇 1.º Puesto', delta: 5, badge: '+5', color: 'amber', type: 'podium', description: '1.º con más aciertos (+5 pts)' },
      { id: 'mimica_p2', label: '🥈 2.º Puesto', delta: 3, badge: '+3', color: 'blue', type: 'podium', description: '2.º puesto en mímica (+3 pts)' },
      { id: 'mimica_p3', label: '🥉 3.º Puesto', delta: 2, badge: '+2', color: 'emerald', type: 'podium', description: '3.º puesto en mímica (+2 pts)' },
      { id: 'mimica_p4', label: '4.º / 5.º Puesto', delta: 1, badge: '+1', color: 'slate', type: 'podium', description: 'Resto de participantes (+1 pt)' },
    ],
  },

  // 6. ¿QUIÉN DEMONIOS ES? (Fotos Proyector)
  {
    id: 'fotos_proyector',
    title: '¿Quién demonios es?',
    emoji: '👶',
    category: 'Velocidad',
    engine: 'buzzer',
    coverImage: '/covers/6_quien_demonios_es.png',
    participantsMode: 'all',
    participantsLabel: '👥 Todos los concursantes',
    participantsDescription: 'Toda la sala atenta al proyector para pulsar; ¡ojo con pulsar en tu propia foto!',
    description: 'Se muestran una a una fotos en pantalla de bebés o niños (famosos o participantes). El más veloz pulsa para adivinar quién demonios es. Al final se reparte el Podio de la ronda.',
    rules: [
      '⚡ Foto proyectada en TV: el más rápido pulsa el botón',
      '✅ Cada foto acertada cuenta para el ranking de la prueba',
      '❌ Fallo: −1 punto en el marcador de la ronda',
      '🚫 Si es tu propia foto no puedes pulsar: −2 puntos de penalización directa',
      '🏆 Podio final de fotos: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
    ],
    scoringOptions: [
      { id: 'foto_hit', label: '👶 Foto Acertada', delta: 2, hitsDelta: 1, badge: '+2', color: 'emerald', type: 'action', description: 'Persona identificada (+2 pts)' },
      { id: 'foto_miss', label: '❌ Fallo', delta: -1, hitsDelta: 0, badge: '-1', color: 'red', type: 'action', description: 'Fallo tras pulsar (-1 pt)' },
      { id: 'foto_self', label: '🚫 Propia Foto', delta: -2, hitsDelta: 0, badge: '-2', color: 'purple', type: 'action', description: 'Pulsar en su propia foto (-2 pts)' },
      { id: 'foto_p1', label: '🥇 1.º Puesto', delta: 5, hitsDelta: 0, badge: '+5', color: 'amber', type: 'podium', description: '1.º con más fotos acertadas (+5 pts)' },
      { id: 'foto_p2', label: '🥈 2.º Puesto', delta: 3, hitsDelta: 0, badge: '+3', color: 'blue', type: 'podium', description: '2.º puesto en fotos (+3 pts)' },
      { id: 'foto_p3', label: '🥉 3.º Puesto', delta: 2, hitsDelta: 0, badge: '+2', color: 'emerald', type: 'podium', description: '3.º puesto en fotos (+2 pts)' },
      { id: 'foto_p4', label: '4.º / 5.º Puesto', delta: 1, hitsDelta: 0, badge: '+1', color: 'slate', type: 'podium', description: 'Resto de participantes (+1 pt)' },
    ],
  },

  // 7. EL PRECIO DEL TIEMPO (1, 2, 3 ¿Ya? - 5 segundos)
  {
    id: 'un_dos_tres',
    title: 'El precio del tiempo',
    emoji: '⏳',
    category: 'Velocidad',
    engine: 'challenges',
    coverImage: '/covers/7_el_precio_del_tiempo.png',
    participantsMode: 'delegates',
    participantsLabel: '👥 2 - 3 Representantes por ronda',
    participantsDescription: '2 o 3 representantes de cada equipo salen a competir en la ronda; si fallan o superan 5s quedan fuera.',
    description: 'Cada equipo por turnos tiene exactamente 5 segundos para decir 3 respuestas correctas antes de que el tiempo expire. Dificultad creciente. ¡Si fallas o se agota el cronómetro, quedas eliminado!',
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
      { id: 'udt_eliminate', label: '💀 Eliminación', delta: 0, badge: 'OUT', color: 'red', type: 'action', description: 'Equipo que no supera el reto o tiempo' },
      { id: 'udt_1st', label: '🥇 1.º Último en Pie', delta: 5, badge: '+5', color: 'amber', type: 'podium', description: 'Único superviviente (+5 pts)' },
      { id: 'udt_2nd', label: '🥈 2.º Puesto', delta: 3, badge: '+3', color: 'blue', type: 'podium', description: 'Subcampeón superviviente (+3 pts)' },
      { id: 'udt_3rd', label: '🥉 3.º Puesto', delta: 2, badge: '+2', color: 'emerald', type: 'podium', description: 'Tercer puesto (+2 pts)' },
      { id: 'udt_4th', label: '4.º / 5.º Puesto', delta: 1, badge: '+1', color: 'slate', type: 'podium', description: 'Resto de participantes (+1 pt)' },
    ],
  },

  // 8. EL ENIGMA DEL REY (Adivina la película con emojis)
  {
    id: 'movies',
    title: 'El enigma del Rey',
    emoji: '🎬',
    category: 'Conocimiento',
    engine: 'buzzer',
    coverImage: '/covers/8_el_enigma_del_rey.png',
    participantsMode: 'delegates',
    participantsLabel: '👥 2 - 3 Representantes (Cinéfilos)',
    participantsDescription: '2 o 3 miembros por equipo descifran las secuencias de emojis con el pulsador.',
    description: 'Descifra la película o enigma oculto con jeroglíficos de emojis. Cada acierto suma al contador de películas de la prueba y al final se reparte el Podio de Enigmas.',
    rules: [
      '🎯 Los aciertos suman al marcador de enigmas de la ronda',
      '❌ Respuesta incorrecta tras pulsar: −1 punto de ronda y rebote',
      '🏆 Podio final cinéfilo: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
      '⚖️ El anfitrión asigna los puntos del podio al término de la tanda de enigmas',
    ],
    scoringOptions: [
      { id: 'movie_lvl1', label: '🎬 Nivel 1', delta: 3, hitsDelta: 1, badge: '+3', color: 'amber', type: 'action', description: 'Acierto al primer frame (+3 pts)' },
      { id: 'movie_lvl2', label: '🎬 Nivel 2', delta: 2, hitsDelta: 1, badge: '+2', color: 'emerald', type: 'action', description: 'Acierto al segundo frame (+2 pts)' },
      { id: 'movie_lvl3', label: '🎬 Nivel 3', delta: 1, hitsDelta: 1, badge: '+1', color: 'blue', type: 'action', description: 'Acierto al tercer frame (+1 pt)' },
      { id: 'movie_miss', label: '❌ Fallo', delta: -1, hitsDelta: 0, badge: '-1', color: 'red', type: 'action', description: 'Fallo tras pulsar (-1 pt)' },
      { id: 'movie_p1', label: '🥇 1.º Puesto', delta: 5, hitsDelta: 0, badge: '+5', color: 'amber', type: 'podium', description: '1.º con más enigmas acertados (+5 pts)' },
      { id: 'movie_p2', label: '🥈 2.º Puesto', delta: 3, hitsDelta: 0, badge: '+3', color: 'blue', type: 'podium', description: '2.º puesto en enigmas (+3 pts)' },
      { id: 'movie_p3', label: '🥉 3.º Puesto', delta: 2, hitsDelta: 0, badge: '+2', color: 'emerald', type: 'podium', description: '3.º puesto en enigmas (+2 pts)' },
      { id: 'movie_p4', label: '4.º / 5.º Puesto', delta: 1, hitsDelta: 0, badge: '+1', color: 'slate', type: 'podium', description: 'Resto de participantes (+1 pt)' },
    ],
  },

  // 9. TIRO AL VASO (Beer Pong)
  {
    id: 'beer_pong',
    title: 'Tiro al vaso',
    emoji: '🎯',
    category: 'Habilidad',
    engine: 'challenges',
    coverImage: '/covers/9_tiro_al_vaso.png',
    participantsMode: 'duo',
    participantsLabel: '👥 Pareja (2 tiradores)',
    participantsDescription: 'El capitán designa una pareja de tiradores por equipo para lanzar las bolas.',
    description: 'Juego de destreza presencial con vasos y bolas de ping pong. Cada vaso encestado suma +1 acierto al marcador. Puntuación final al término según el Podio oficial de la prueba.',
    rules: [
      '🥤 Vasos de colores en mesa presencial con bolas de ping pong',
      '🏓 Rondas de lanzamientos por turnos para encestar el mayor número de vasos',
      '🎯 +1 acierto por cada vaso encestado',
      '🏆 Podio final según vasos encestados: 1.º (+5 pts), 2.º (+3 pts), 3.º (+2 pts), 4.º (+1 pt)',
      '⚖️ El anfitrión anota los vasos encestados y asigna el podio al final del torneo',
    ],
    scoringOptions: [
      { id: 'bp_cup', label: '🥤 Vaso Encestado', delta: 1, hitsDelta: 1, badge: '+1', color: 'emerald', type: 'action', description: '+1 acierto por vaso encestado' },
      { id: 'bp_cup_undo', label: '↩️ Quitar Vaso', delta: -1, hitsDelta: -1, badge: '-1', color: 'red', type: 'action', description: 'Corregir vaso marcado por error' },
      { id: 'bp_1st', label: '🥇 1.º Puesto', delta: 5, hitsDelta: 0, badge: '+5', color: 'amber', type: 'podium', description: '1.º con más vasos encestados (+5 pts)' },
      { id: 'bp_2nd', label: '🥈 2.º Puesto', delta: 3, hitsDelta: 0, badge: '+3', color: 'blue', type: 'podium', description: '2.º puesto en vasos (+3 pts)' },
      { id: 'bp_3rd', label: '🥉 3.º Puesto', delta: 2, hitsDelta: 0, badge: '+2', color: 'emerald', type: 'podium', description: '3.º puesto en vasos (+2 pts)' },
      { id: 'bp_4th', label: '4.º / 5.º Puesto', delta: 1, hitsDelta: 0, badge: '+1', color: 'slate', type: 'podium', description: 'Resto de participantes (+1 pt)' },
    ],
  },

  // 10. LOS NÚMEROS DEL DESTINO (Bingo)
  {
    id: 'bingo',
    title: 'Los números del destino',
    emoji: '🎱',
    category: 'Juegos de Mesa',
    engine: 'challenges',
    coverImage: '/covers/10_los_numeros_del_destino.png',
    participantsMode: 'all',
    participantsLabel: '👥 Todos los concursantes',
    participantsDescription: 'Todos los miembros participan con sus cartones físicos o virtuales en el móvil cantando línea o bingo.',
    description: 'Juego de azar y emoción con cartones virtuales interactivos en el móvil y bombo interactivo virtual en la TV (1 a 90). Puntuación exclusiva al cantar línea o bingo.',
    rules: [
      '🎟️ Cada jugador participa con su cartón virtual único en el móvil o físico en mesa',
      '📺 Bombo virtual en la TV: el host saca bolas del 1 al 90 con animaciones Art Déco',
      '📏 Primer equipo en cantar Línea válida: +2 puntos',
      '🎱 ¡Primer equipo en cantar BINGO completo!: +6 puntos',
      '⭐ Premio especial o consolación: +2 puntos',
    ],
    scoringOptions: [
      { id: 'bingo_linea', label: '📏 Línea', delta: 2, badge: '+2', color: 'blue', type: 'action', description: 'Primer equipo en cantar Línea válida' },
      { id: 'bingo_bingo', label: '🎱 ¡BINGO!', delta: 6, badge: '+6', color: 'amber', type: 'action', description: 'Equipo ganador que canta BINGO completo' },
      { id: 'bingo_extra', label: '⭐ Premio Especial', delta: 2, badge: '+2', color: 'emerald', type: 'action', description: 'Premio o bonus de cartón especial' },
    ],
  },
];

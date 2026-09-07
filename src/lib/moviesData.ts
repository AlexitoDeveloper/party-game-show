export interface MovieItem {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  category: 'Taquillazos' | 'Disney / Pixar' | 'Terror';
  genreEmoji: string;
  director: string;
  emojisStage1: string[]; // 2 emojis crípticos/sutiles (Difícil: +3 pts)
  emojisStage2: string[]; // 4 emojis intermedios de contexto (Medio: +2 pts)
  emojisFull: string[];   // 6 emojis con los elementos icónicos (Fácil: +1 pt)
  emojisInitial: string[]; // Retrocompatibilidad (apunta a emojisStage1)
  textHint: string;        // Pista de contexto sin decir el título
  explanation: string;     // Desglose ingenioso para que el anfitrión lo lea en voz alta
}

// ============================================================================
// 🛠️ PELÍCULAS DE PRUEBA / MODO DESARROLLO (ANTI-SPOILERS PARA EL DESARROLLADOR)
// ============================================================================
// Estos ejemplos son únicamente de prueba para diseñar y testear la interfaz.
// No contienen preguntas reales de la fiesta para que puedas jugar como participante
// sin conocer de antemano las soluciones ni los emojis secretos.
// ============================================================================

export const DEV_MOCK_MOVIES: MovieItem[] = [
  {
    id: 'demo_taquillazo',
    title: '[DEMO] Misión Galáctica 007',
    originalTitle: 'Demo Galactic Action',
    year: 2024,
    category: 'Taquillazos',
    genreEmoji: '🚀',
    director: 'Director de Pruebas',
    emojisStage1: ['🍕', '🚁'],
    emojisStage2: ['🍕', '🚁', '🕶️', '💥'],
    emojisFull: ['🍕', '🚁', '🕶️', '💥', '🏎️', '💰'],
    emojisInitial: ['🍕', '🚁'],
    textHint: 'Ejemplo de prueba: Un agente secreto come pizza mientras escapa en helicóptero tras una explosión.',
    explanation: '🍕 La pizza en la base + 🚁 El escape en helicóptero + 🕶️ Gafas de sol de espía + 💥 La explosión del cuartel + 🏎️ Persecución en bólido + 💰 El rescate millonario.',
  },
  {
    id: 'demo_disney',
    title: '[DEMO] La Magia del Bosque Encantado',
    originalTitle: 'Demo Enchanted Forest',
    year: 2023,
    category: 'Disney / Pixar',
    genreEmoji: '✨',
    director: 'Animador de Pruebas',
    emojisStage1: ['🧁', '🪄'],
    emojisStage2: ['🧁', '🪄', '🧚', '🏰'],
    emojisFull: ['🧁', '🪄', '🧚', '🏰', '🌈', '👑'],
    emojisInitial: ['🧁', '🪄'],
    textHint: 'Ejemplo de prueba: Pasteles que cobran vida con una varita mágica y un hada que vuela hacia el castillo.',
    explanation: '🧁 Magdalenas mágicas parlantes + 🪄 La varita encantada + 🧚 El hada madrina traviesa + 🏰 El castillo real + 🌈 El arcoíris en el cielo + 👑 La coronación de la reina.',
  },
  {
    id: 'demo_terror',
    title: '[DEMO] La Mansión de las Sombras',
    originalTitle: 'Demo Shadow House',
    year: 2022,
    category: 'Terror',
    genreEmoji: '👻',
    director: 'Maestro del Susto Demo',
    emojisStage1: ['🕯️', '🚪'],
    emojisStage2: ['🕯️', '🚪', '🔦', '🩸'],
    emojisFull: ['🕯️', '🚪', '🔦', '🩸', '🏚️', '😱'],
    emojisInitial: ['🕯️', '🚪'],
    textHint: 'Ejemplo de prueba: Una vela en un pasillo oscuro, puertas que se abren solas y pasos ensangrentados.',
    explanation: '🕯️ La vela solitaria en el desván + 🚪 La puerta chirriante cerrada con llave + 🔦 La linterna que parpadea + 🩸 Huellas misteriosas de sangre + 🏚️ La mansión victoriana abandonada + 😱 El grito en la noche.',
  },
];

// Base de datos por defecto durante desarrollo
export const MOVIES_DATABASE: MovieItem[] = DEV_MOCK_MOVIES;

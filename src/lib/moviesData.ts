export type MovieCategory =
  | 'Taquillazos'
  | 'Disney / Pixar'
  | 'Series Míticas'
  | 'Comedia & Fiesta'
  | 'Terror'
  | string;

export interface MovieItem {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  category: MovieCategory;
  genreEmoji: string;
  director: string;
  emojisStage1: string[]; // Pista 1 (+3 pts): 3 emojis claros de [Escenario + Conflicto]
  emojisStage2: string[]; // Pista 2 (+2 pts): 5 emojis añadiendo [Protagonista / Icono] (+ Huecos en TV)
  emojisFull: string[];   // Pista 3 (+1 pt): Todos los emojis (+ Iniciales del título + Pista de texto)
  emojisInitial: string[]; // Retrocompatibilidad (apunta a emojisStage1)
  textHint: string;        // Pista de contexto directa sin decir el título
  options?: string[];      // Pista 4 (+1 pt): 4 opciones tipo test (Modo Salvavidas A/B/C/D)
  explanation: string;     // Desglose para que el anfitrión lo lea en voz alta al resolver
}

/**
 * Genera una representación por palabras para el modo "Ahorcado / Huecos del título".
 * - En Pista 2 (`showInitials = false`): oculta todas las letras con `_` pero mantiene signos y números.
 * - En Pista 3 (`showInitials = true`): revela la 1.ª letra de cada palabra (ej: "E _   R _ _   L _ _ _").
 */
export function getTitleWordMasks(title: string, showInitials: boolean): string[] {
  // Limpiamos el prefijo "[DEMO] " si estamos en modo de prueba
  const cleanTitle = title.replace(/^\[DEMO\]\s*/i, '').trim();
  const words = cleanTitle.split(/\s+/);

  return words.map((word) => {
    const chars = Array.from(word);
    let firstLetterRevealed = false;

    return chars
      .map((ch) => {
        const isLetter = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(ch);
        if (!isLetter) {
          return ch; // Mantener números o signos (: , - ¿ ? ¡ !)
        }
        if (showInitials && !firstLetterRevealed) {
          firstLetterRevealed = true;
          return ch.toUpperCase();
        }
        return '_';
      })
      .join(' ');
  });
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
    emojisStage1: ['🌌', '🚁', '💥'],
    emojisStage2: ['🌌', '🚁', '💥', '🕵️‍♂️', '🏎️'],
    emojisFull: ['🌌', '🚁', '💥', '🕵️‍♂️', '🏎️', '🍸'],
    emojisInitial: ['🌌', '🚁', '💥'],
    textHint: 'Ejemplo de prueba: Un agente secreto con esmoquin escapa de una base espacial en helicóptero tras una explosión.',
    options: [
      '[DEMO] Misión Galáctica 007',
      '[DEMO] Guerra en las Estrellas',
      '[DEMO] El Espía del Mañana',
      '[DEMO] Operación Cometa'
    ],
    explanation: '🌌 Base espacial + 🚁 Escape en helicóptero + 💥 Explosión del cuartel + 🕵️‍♂️ El agente secreto + 🏎️ Persecución en deportivo + 🍸 Martini mezclado, no agitado.',
  },
  {
    id: 'demo_disney',
    title: '[DEMO] El Castillo Encantado',
    originalTitle: 'Demo Enchanted Castle',
    year: 2023,
    category: 'Disney / Pixar',
    genreEmoji: '✨',
    director: 'Animador de Pruebas',
    emojisStage1: ['🌲', '🪄', '🐉'],
    emojisStage2: ['🌲', '🪄', '🐉', '🧚', '🏰'],
    emojisFull: ['🌲', '🪄', '🐉', '🧚', '🏰', '👑'],
    emojisInitial: ['🌲', '🪄', '🐉'],
    textHint: 'Ejemplo de prueba: Un bosque mágico donde un hada con varita ayuda a salvar el castillo real de un dragón.',
    options: [
      '[DEMO] La Princesa del Hielo',
      '[DEMO] El Castillo Encantado',
      '[DEMO] Cuentos de la Selva',
      '[DEMO] El Dragón Dormido'
    ],
    explanation: '🌲 Bosque encantado + 🪄 Varita mágica + 🐉 El dragón guardián + 🧚 El hada madrina + 🏰 El castillo real + 👑 La corona del reino.',
  },
  {
    id: 'demo_series',
    title: '[DEMO] El Misterio del Instituto',
    originalTitle: 'Demo High School Mystery',
    year: 2022,
    category: 'Series Míticas',
    genreEmoji: '📺',
    director: 'Creador de Pruebas',
    emojisStage1: ['🏫', '🔦', '🚲'],
    emojisStage2: ['🏫', '🔦', '🚲', '👦', '👾'],
    emojisFull: ['🏫', '🔦', '🚲', '👦', '👾', '📻'],
    emojisInitial: ['🏫', '🔦', '🚲'],
    textHint: 'Ejemplo de prueba: Un grupo de adolescentes en bicicleta investiga sucesos paranormales en su instituto de noche.',
    options: [
      '[DEMO] Crónicas del Internado',
      '[DEMO] Los Chicos del Barrio',
      '[DEMO] El Misterio del Instituto',
      '[DEMO] Noche de Halloween'
    ],
    explanation: '🏫 El instituto del pueblo + 🔦 Linternas en el bosque + 🚲 Bicicletas nocturnas + 👦 Grupo de amigos + 👾 Monstruo de otra dimensión + 📻 Walkie-talkie.',
  },
];

// Base de datos por defecto durante desarrollo
export const MOVIES_DATABASE: MovieItem[] = DEV_MOCK_MOVIES;

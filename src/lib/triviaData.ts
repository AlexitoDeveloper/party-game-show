export interface TriviaQuestion {
  id: string;
  question: string;
  category: string;
  categoryEmoji: string;
  options?: string[]; // Si no tiene opciones, es pregunta abierta directa
  correctAnswer: string;
  hint?: string;
}

export const OFFICIAL_TRIVIA_QUESTIONS: TriviaQuestion[] = [
  // CULTURA GENERAL & CURIOSIDADES
  {
    id: 'triv_1',
    category: 'Cultura General',
    categoryEmoji: '🌍',
    question: '¿Cuál es el único mamífero capaz de volar?',
    options: ['Murciélago', 'Ardilla voladora', 'Lémur volador', 'Pecarí'],
    correctAnswer: 'El murciélago',
    hint: 'Duerme boca abajo',
  },
  {
    id: 'triv_2',
    category: 'Cultura General',
    categoryEmoji: '🌍',
    question: '¿Qué país tiene la mayor cantidad de islas en el mundo?',
    options: ['Suecia', 'Indonesia', 'Filipinas', 'Grecia'],
    correctAnswer: 'Suecia (más de 260.000 islas)',
    hint: 'País escandinavo de IKEA',
  },
  {
    id: 'triv_3',
    category: 'Cultura General',
    categoryEmoji: '🌍',
    question: '¿Cuántos corazones tiene un pulpo?',
    options: ['1', '2', '3', '4'],
    correctAnswer: '3 corazones',
    hint: 'También tienen sangre azul',
  },
  {
    id: 'triv_4',
    category: 'Cultura General',
    categoryEmoji: '🌍',
    question: '¿Qué animal produce la leche de color rosa?',
    options: ['Hipopótamo', 'Flamenco', 'Cerdo salvaje', 'Ornitorrinco'],
    correctAnswer: 'El hipopótamo',
    hint: 'Pasa casi todo el día sumergido en ríos africanos',
  },
  {
    id: 'triv_5',
    category: 'Cultura General',
    categoryEmoji: '🌍',
    question: '¿Cuál es el hueso más pequeño del cuerpo humano?',
    correctAnswer: 'El estribo (en el oído medio)',
    hint: 'Se encuentra dentro del oído',
  },

  // CINE Y SERIES
  {
    id: 'triv_6',
    category: 'Cine y Series',
    categoryEmoji: '🎬',
    question: 'En El Señor de los Anillos, ¿cómo se llama la espada que Aragorn hereda?',
    options: ['Andúril', 'Glamdring', 'Dardo', 'Narsil'],
    correctAnswer: 'Andúril (la Llama del Oeste, forjada de Narsil)',
    hint: 'Reforjada a partir de los fragmentos de Narsil',
  },
  {
    id: 'triv_7',
    category: 'Cine y Series',
    categoryEmoji: '🎬',
    question: '¿Cuál es la película más taquillera de toda la historia del cine (sin ajustar inflación)?',
    options: ['Avatar (2009)', 'Vengadores: Endgame', 'Titanic', 'Star Wars: El despertar de la fuerza'],
    correctAnswer: 'Avatar (2009)',
    hint: 'Dirigida por James Cameron y ambientada en Pandora',
  },
  {
    id: 'triv_8',
    category: 'Cine y Series',
    categoryEmoji: '🎬',
    question: 'En la serie Friends, ¿cuál es el trabajo exacto de Chandler Bing del que nadie se acuerda?',
    options: ['Análisis estadístico y reconfiguración de datos', 'Contable fiscal', 'Publicista creativo', 'Consultor financiero'],
    correctAnswer: 'Análisis estadístico y reconfiguración de datos (Transpondedor no existe)',
    hint: 'Rachel dijo en el juego que era "Transpondedor"',
  },
  {
    id: 'triv_9',
    category: 'Cine y Series',
    categoryEmoji: '🎬',
    question: '¿Qué actor ha interpretado a Batman en la trilogía de El Caballero Oscuro de Christopher Nolan?',
    correctAnswer: 'Christian Bale',
    hint: 'También protagonizó American Psycho',
  },
  {
    id: 'triv_10',
    category: 'Cine y Series',
    categoryEmoji: '🎬',
    question: 'En Harry Potter, ¿cuál es el nombre del guardabosques de Hogwarts?',
    correctAnswer: 'Rubeus Hagrid',
    hint: 'Le encantan las criaturas peligrosas como Aragog o Buckbeak',
  },

  // MÚSICA & FIESTA
  {
    id: 'triv_11',
    category: 'Música & Fiesta',
    categoryEmoji: '🎸',
    question: '¿Qué legendaria banda de rock compuso "Bohemian Rhapsody"?',
    options: ['Queen', 'The Beatles', 'Led Zeppelin', 'Pink Floyd'],
    correctAnswer: 'Queen',
    hint: 'Liderada por Freddie Mercury',
  },
  {
    id: 'triv_12',
    category: 'Música & Fiesta',
    categoryEmoji: '🎸',
    question: '¿Cuál es el verdadero nombre de pila del cantante puertorriqueño Bad Bunny?',
    options: ['Benito Antonio Martínez Ocasio', 'Juan Carlos Ozuna', 'José Álvaro Osorio', 'Emmanuel Gazmey'],
    correctAnswer: 'Benito Antonio Martínez Ocasio',
    hint: 'Siempre dice "Benito"',
  },
  {
    id: 'triv_13',
    category: 'Música & Fiesta',
    categoryEmoji: '🎸',
    question: '¿Qué instrumento musical tocaba Kurt Cobain en Nirvana?',
    correctAnswer: 'Guitarra (eléctrica) y voz',
    hint: 'Zurdo, tocaba con cuerdas invertidas',
  },
  {
    id: 'triv_14',
    category: 'Música & Fiesta',
    categoryEmoji: '🎸',
    question: '¿Qué dúo francés de música electrónica actuaba siempre vestido con cascos de robot?',
    correctAnswer: 'Daft Punk',
    hint: 'Creadores de "Around the World" y "Get Lucky"',
  },

  // DEPORTES
  {
    id: 'triv_15',
    category: 'Deportes',
    categoryEmoji: '⚽',
    question: '¿Cuántos balones de oro ha ganado Leo Messi en toda su carrera?',
    options: ['8', '7', '6', '9'],
    correctAnswer: '8 Balones de Oro',
    hint: 'El último lo consiguió en 2023 tras el Mundial de Qatar',
  },
  {
    id: 'triv_16',
    category: 'Deportes',
    categoryEmoji: '⚽',
    question: '¿En qué deporte destacó Michael Phelps ganando 28 medallas olímpicas?',
    options: ['Natación', 'Atletismo', 'Gimnasia', 'Remo'],
    correctAnswer: 'Natación',
    hint: 'Conocido como el Tiburón de Baltimore',
  },
  {
    id: 'triv_17',
    category: 'Deportes',
    categoryEmoji: '⚽',
    question: '¿Cada cuántos años se celebran tradicionalmente los Juegos Olímpicos?',
    correctAnswer: 'Cada 4 años',
    hint: 'Periodo conocido como Olimpiada',
  },
  {
    id: 'triv_18',
    category: 'Deportes',
    categoryEmoji: '⚽',
    question: '¿Qué tenista español ostenta el récord de 14 títulos de Roland Garros?',
    correctAnswer: 'Rafa Nadal',
    hint: 'El rey de la tierra batida de Manacor',
  },

  // HISTORIA Y GEOGRAFÍA
  {
    id: 'triv_19',
    category: 'Geografía e Historia',
    categoryEmoji: '🗺️',
    question: '¿Cuál es el río más caudaloso y largo del mundo?',
    options: ['Río Amazonas', 'Río Nilo', 'Río Yangtsé', 'Río Misisipi'],
    correctAnswer: 'Río Amazonas',
    hint: 'Cruza la selva amazónica en Sudamérica',
  },
  {
    id: 'triv_20',
    category: 'Geografía e Historia',
    categoryEmoji: '🗺️',
    question: '¿Cuál es la capital oficial de Australia?',
    options: ['Canberra', 'Sídney', 'Melbourne', 'Brisbane'],
    correctAnswer: 'Canberra',
    hint: 'Mucha gente cree erróneamente que es Sídney',
  },
  {
    id: 'triv_21',
    category: 'Geografía e Historia',
    categoryEmoji: '🗺️',
    question: '¿En qué año cayó el Muro de Berlín?',
    options: ['1989', '1991', '1975', '1985'],
    correctAnswer: '1989 (el 9 de noviembre)',
    hint: 'Justo antes del inicio de los años 90',
  },
  {
    id: 'triv_22',
    category: 'Geografía e Historia',
    categoryEmoji: '🗺️',
    question: '¿Cuál es el desierto cálido más grande del planeta?',
    correctAnswer: 'El desierto del Sáhara',
    hint: 'Ocupa gran parte del norte de África',
  },

  // CIENCIA Y TECNOLOGÍA
  {
    id: 'triv_23',
    category: 'Ciencia y Tecnología',
    categoryEmoji: '🔬',
    question: '¿Cuál es el elemento químico más abundante en el universo observable?',
    options: ['Hidrógeno', 'Helio', 'Oxígeno', 'Carbono'],
    correctAnswer: 'Hidrógeno (H)',
    hint: 'Es el primer elemento de la tabla periódica',
  },
  {
    id: 'triv_24',
    category: 'Ciencia y Tecnología',
    categoryEmoji: '🔬',
    question: '¿Aproximadamente cuántos minutos tarda la luz del Sol en llegar a la Tierra?',
    options: ['8 minutos', 'Instantáneo', '1 hora', '30 segundos'],
    correctAnswer: 'Aproximadamente 8 minutos (8 min y 20 seg)',
    hint: 'Viaja a 300.000 km/s recorriendo 150 millones de kilómetros',
  },
  {
    id: 'triv_25',
    category: 'Ciencia y Tecnología',
    categoryEmoji: '🔬',
    question: '¿Qué inventó Alexander Fleming por accidente en 1928?',
    correctAnswer: 'La penicilina (el primer antibiótico)',
    hint: 'Observó un moho que destruía bacterias en una placa de Petri',
  },
  {
    id: 'triv_26',
    category: 'Ciencia y Tecnología',
    categoryEmoji: '🔬',
    question: '¿Cuál es el planeta más caliente del Sistema Solar?',
    options: ['Venus', 'Mercurio', 'Marte', 'Júpiter'],
    correctAnswer: 'Venus (debido a su brutal efecto invernadero)',
    hint: 'Aunque Mercurio está más cerca del Sol, Venus retiene más calor',
  },
];

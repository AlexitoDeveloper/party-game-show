export interface MimicaCard {
  id: string;
  category: 'Películas' | 'Acciones Absurdas' | 'Profesiones' | 'Personajes & Deportes';
  categoryEmoji: string;
  title: string;
  clueOrDetail?: string;
  difficulty: 'Fácil' | 'Media' | 'Difícil';
}

export const OFFICIAL_MIMICA_CARDS: MimicaCard[] = [
  // PELÍCULAS
  {
    id: 'mim_1',
    category: 'Películas',
    categoryEmoji: '🎬',
    title: 'Titanic',
    clueOrDetail: 'Proa del barco volando, dibujo desnudo o hundiéndose en el hielo',
    difficulty: 'Fácil',
  },
  {
    id: 'mim_2',
    category: 'Películas',
    categoryEmoji: '🎬',
    title: 'Parque Jurásico',
    clueOrDetail: 'Imitar al T-Rex con brazos cortos rugiendo',
    difficulty: 'Fácil',
  },
  {
    id: 'mim_3',
    category: 'Películas',
    categoryEmoji: '🎬',
    title: 'Matrix',
    clueOrDetail: 'Esquivar balas en cámara lenta hacia atrás',
    difficulty: 'Fácil',
  },
  {
    id: 'mim_4',
    category: 'Películas',
    categoryEmoji: '🎬',
    title: 'El Rey León',
    clueOrDetail: 'Presentar al cachorro Simba en la roca al cielo',
    difficulty: 'Fácil',
  },
  {
    id: 'mim_5',
    category: 'Películas',
    categoryEmoji: '🎬',
    title: 'Spider-Man',
    clueOrDetail: 'Lanzar telarañas con los dedos y trepar paredes',
    difficulty: 'Fácil',
  },
  {
    id: 'mim_6',
    category: 'Películas',
    categoryEmoji: '🎬',
    title: 'Harry Potter',
    clueOrDetail: 'Volar en escoba, varita mágica y pintar la cicatriz en la frente',
    difficulty: 'Fácil',
  },
  {
    id: 'mim_7',
    category: 'Películas',
    categoryEmoji: '🎬',
    title: 'Psicosis',
    clueOrDetail: 'La mítica escena de la ducha y el cuchillo',
    difficulty: 'Media',
  },

  // ACCIONES ABSURDAS / COTIDIANAS
  {
    id: 'mim_8',
    category: 'Acciones Absurdas',
    categoryEmoji: '🤪',
    title: 'Intentando abrir un bote de pepinillos atascado',
    clueOrDetail: 'Fuerza extrema, resbalones, golpear la base con la mesa',
    difficulty: 'Fácil',
  },
  {
    id: 'mim_9',
    category: 'Acciones Absurdas',
    categoryEmoji: '🤪',
    title: 'Pisar una pieza de LEGO descalzo en la oscuridad',
    clueOrDetail: 'Caminar relajado, pisar el lego, agonía silenciosa en un pie',
    difficulty: 'Fácil',
  },
  {
    id: 'mim_10',
    category: 'Acciones Absurdas',
    categoryEmoji: '🤪',
    title: 'Ponerse unos vaqueros dos tallas más pequeñas',
    clueOrDetail: 'Saltar, tumbarse en la cama intentando subir la cremallera',
    difficulty: 'Media',
  },
  {
    id: 'mim_11',
    category: 'Acciones Absurdas',
    categoryEmoji: '🤪',
    title: 'Zombie al que se le desata un cordón de la zapatilla',
    clueOrDetail: 'Andar zombie, tropezar, intentar atarse los cordones sin motricidad',
    difficulty: 'Difícil',
  },
  {
    id: 'mim_12',
    category: 'Acciones Absurdas',
    categoryEmoji: '🤪',
    title: 'Tragar un bocado de pizza ardiendo y soplar desesperadamente',
    clueOrDetail: 'Morder con ganas, quemarse el paladar, respirar como un dragón',
    difficulty: 'Fácil',
  },

  // PROFESIONES
  {
    id: 'mim_13',
    category: 'Profesiones',
    categoryEmoji: '💼',
    title: 'Dentista con un paciente que muerde',
    clueOrDetail: 'Poner babero, mirar con linterna, meter dedos y que te muerdan',
    difficulty: 'Media',
  },
  {
    id: 'mim_14',
    category: 'Profesiones',
    categoryEmoji: '💼',
    title: 'Árbitro de fútbol expulsando a un jugador con VAR',
    clueOrDetail: 'Silbato mímico, hacer la pantallita del VAR, tarjeta roja al cielo',
    difficulty: 'Fácil',
  },
  {
    id: 'mim_15',
    category: 'Profesiones',
    categoryEmoji: '💼',
    title: 'Peluquero cortando a alguien que no para de moverse',
    clueOrDetail: 'Tijeras al aire, intentar apuntar mientras el cliente se gira',
    difficulty: 'Media',
  },
  {
    id: 'mim_16',
    category: 'Profesiones',
    categoryEmoji: '💼',
    title: 'Paseador de 8 perros gigantes que tiran a la vez',
    clueOrDetail: 'Ser arrastrado por correas invisibles sin poder frenar',
    difficulty: 'Media',
  },

  // PERSONAJES & DEPORTES
  {
    id: 'mim_17',
    category: 'Personajes & Deportes',
    categoryEmoji: '🏅',
    title: 'Cristiano Ronaldo haciendo el "SIUUU"',
    clueOrDetail: 'Carrera, salto, giro en el aire con brazos abiertos y pose',
    difficulty: 'Fácil',
  },
  {
    id: 'mim_18',
    category: 'Personajes & Deportes',
    categoryEmoji: '🏅',
    title: 'Michael Jackson haciendo el Moonwalk',
    clueOrDetail: 'Deslizarse hacia atrás, tocarse el sombrero y golpe de cadera',
    difficulty: 'Fácil',
  },
  {
    id: 'mim_19',
    category: 'Personajes & Deportes',
    categoryEmoji: '🏅',
    title: 'Rafa Nadal preparando su saque',
    clueOrDetail: 'Pantalón, orejas, nariz, botar pelota mil veces y saque',
    difficulty: 'Media',
  },
];

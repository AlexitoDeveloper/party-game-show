export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  category?: string;
  previewUrl: string;
  coverUrl: string;
  albumArt?: string;
  year: number;
  extraClue?: string;
}

export type MusicCategory = string;

/**
 * Catálogo musical con Starter Pack oficial precargado para garantizar
 * jugabilidad inmediata offline o previa a la importación de listas personalizadas de Spotify.
 */
export const CURATED_SONGS: SongTrack[] = [
  {
    id: 'starter_billie_jean',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    category: 'Pop Clásico',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 1982,
    extraClue: 'El icónico paso del Moonwalk y una línea de bajo legendaria',
  },
  {
    id: 'starter_bohemian_rhapsody',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    category: 'Rock Clásico',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 1975,
    extraClue: 'Ópera rock épica de Freddie Mercury: ¡Galileo, Figaro, Magnifico!',
  },
  {
    id: 'starter_gasolina',
    title: 'Gasolina',
    artist: 'Daddy Yankee',
    category: 'Fiesta & Reggaetón',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 2004,
    extraClue: 'El himno que internacionalizó el reggaetón en todo el planeta',
  },
  {
    id: 'starter_sweet_child',
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    category: 'Rock Clásico',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 1987,
    extraClue: 'El riff de guitarra más famoso de Slash con sombrero de copa',
  },
  {
    id: 'starter_dancing_queen',
    title: 'Dancing Queen',
    artist: 'ABBA',
    category: 'Disco / 70s',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 1976,
    extraClue: 'Cuarteto sueco legendario: "You can dance, you can jive..."',
  },
  {
    id: 'starter_despacito',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    category: 'Pop Latino',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 2017,
    extraClue: 'Récord histórico de reproducciones mundiales en YouTube',
  },
  {
    id: 'starter_take_on_me',
    title: 'Take On Me',
    artist: 'a-ha',
    category: 'Synthpop 80s',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 1985,
    extraClue: 'Teclados sintetizados y un videoclip revolucionario estilo cómic a lápiz',
  },
  {
    id: 'starter_eye_of_the_tiger',
    title: 'Eye of the Tiger',
    artist: 'Survivor',
    category: 'Bandas Sonoras',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 1982,
    extraClue: 'La canción de entrenamiento definitiva de Rocky Balboa',
  },
  {
    id: 'starter_wannabe',
    title: 'Wannabe',
    artist: 'Spice Girls',
    category: 'Pop 90s',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 1996,
    extraClue: '"If you wanna be my lover, you gotta get with my friends..."',
  },
  {
    id: 'starter_smells_like_teen_spirit',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    category: 'Grunge / 90s',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 1991,
    extraClue: 'Himno de la Generación X liderado por Kurt Cobain',
  },
  {
    id: 'starter_la_macarena',
    title: 'Macarena',
    artist: 'Los Del Río',
    category: 'Fiesta & Baile',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 1993,
    extraClue: 'La coreografía de boda y fiesta más bailada de la historia',
  },
  {
    id: 'starter_stayin_alive',
    title: "Stayin' Alive",
    artist: 'Bee Gees',
    category: 'Disco / 70s',
    previewUrl: '',
    coverUrl: '/cards/speakeasy_gramophone.jpg',
    year: 1977,
    extraClue: 'John Travolta caminando por Brooklyn en Fiebre del Sábado Noche',
  },
];

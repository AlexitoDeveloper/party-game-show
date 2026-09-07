export interface TeamCatalogItem {
  index: number;
  name: string;
  theme: string;
  colorName: string;
  emoji: string;
  colorHex: string;
  twBg: string;
  twBorder: string;
  twText: string;
  twGlow: string;
  gradient: string;
  accentRgb: string;
  twContrastText: string;
}

export const TEAMS_CATALOG: TeamCatalogItem[] = [
  // --- 5 EQUIPOS OFICIALES PARA EL CUMPLEAÑOS ---
  {
    index: 1,
    name: 'Agua',
    theme: 'Agua',
    colorName: 'Azul',
    emoji: '💧',
    colorHex: '#3B82F6',
    twBg: 'bg-blue-500',
    twBorder: 'border-blue-500',
    twText: 'text-blue-400',
    twGlow: '',
    gradient: 'from-blue-600 via-blue-500 to-cyan-500',
    accentRgb: '59, 130, 246',
    twContrastText: 'text-slate-950',
  },
  {
    index: 2,
    name: 'Fuego',
    theme: 'Fuego',
    colorName: 'Rojo',
    emoji: '🔥',
    colorHex: '#EF4444',
    twBg: 'bg-red-500',
    twBorder: 'border-red-500',
    twText: 'text-red-400',
    twGlow: '',
    gradient: 'from-red-600 via-red-500 to-amber-600',
    accentRgb: '239, 68, 68',
    twContrastText: 'text-slate-950',
  },
  {
    index: 3,
    name: 'Electricidad',
    theme: 'Electricidad',
    colorName: 'Amarillo',
    emoji: '⚡',
    colorHex: '#FACC15',
    twBg: 'bg-yellow-400',
    twBorder: 'border-yellow-400',
    twText: 'text-yellow-400',
    twGlow: '',
    gradient: 'from-yellow-500 via-amber-400 to-orange-400',
    accentRgb: '250, 204, 21',
    twContrastText: 'text-slate-950',
  },
  {
    index: 4,
    name: 'Luz',
    theme: 'Luz',
    colorName: 'Blanco',
    emoji: '✨',
    colorHex: '#FFFFFF',
    twBg: 'bg-white',
    twBorder: 'border-slate-200',
    twText: 'text-white',
    twGlow: '',
    gradient: 'from-slate-200 via-white to-slate-300',
    accentRgb: '255, 255, 255',
    twContrastText: 'text-slate-950',
  },
  {
    index: 5,
    name: 'Sombra',
    theme: 'Sombra',
    colorName: 'Negro',
    emoji: '🌑',
    colorHex: '#94A3B8',
    twBg: 'bg-zinc-900',
    twBorder: 'border-zinc-400',
    twText: 'text-zinc-200',
    twGlow: '',
    gradient: 'from-zinc-800 via-zinc-900 to-black',
    accentRgb: '148, 163, 184',
    twContrastText: 'text-white',
  },
  // --- EQUIPOS ADICIONALES ---
  {
    index: 6,
    name: 'Ácido',
    theme: 'Ácido',
    colorName: 'Verde',
    emoji: '🧪',
    colorHex: '#22C55E',
    twBg: 'bg-green-500',
    twBorder: 'border-green-500',
    twText: 'text-green-400',
    twGlow: '',
    gradient: 'from-emerald-600 via-green-500 to-lime-400',
    accentRgb: '34, 197, 94',
    twContrastText: 'text-slate-950',
  },
  {
    index: 7,
    name: 'Galaxia',
    theme: 'Galaxia',
    colorName: 'Morado',
    emoji: '🌌',
    colorHex: '#A855F7',
    twBg: 'bg-purple-500',
    twBorder: 'border-purple-500',
    twText: 'text-purple-400',
    twGlow: '',
    gradient: 'from-purple-600 via-fuchsia-500 to-pink-500',
    accentRgb: '168, 85, 247',
    twContrastText: 'text-slate-950',
  },
  {
    index: 8,
    name: 'Magma',
    theme: 'Magma',
    colorName: 'Naranja',
    emoji: '🌋',
    colorHex: '#F97316',
    twBg: 'bg-orange-500',
    twBorder: 'border-orange-500',
    twText: 'text-orange-400',
    twGlow: '',
    gradient: 'from-orange-600 via-amber-600 to-red-600',
    accentRgb: '249, 115, 22',
    twContrastText: 'text-slate-950',
  },
];

export const SAMPLE_CHALLENGES = [
  {
    category: 'Mímica Clásica',
    title: 'Hacer una tortilla de patatas sin romper los huevos',
    forbiddenWords: ['Huevo', 'Sartén', 'Patata', 'Cocina'],
  },
  {
    category: 'Películas en 30s',
    title: 'El Señor de los Anillos',
    forbiddenWords: ['Anillo', 'Frodo', 'Hobbit', 'Mordor'],
  },
  {
    category: 'Situaciones Incomodas',
    title: 'Saludar a un desconocido creyendo que era tu amigo',
    forbiddenWords: ['Hola', 'Vergüenza', 'Mano', 'Confusión'],
  },
  {
    category: '1, 2, 3 Tiempo (5s)',
    title: 'Nombra 3 marcas de coches de lujo en 5 segundos',
    forbiddenWords: [],
  },
];

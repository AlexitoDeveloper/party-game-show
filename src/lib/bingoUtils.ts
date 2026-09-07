export const BINGO_NICKNAMES: Record<number, string> = {
  1: 'El As',
  2: 'El Patito',
  3: 'San Cono',
  4: 'La Cama',
  5: 'La Espuela',
  7: 'El Revólver',
  8: 'El Incendio',
  9: 'El Zapato',
  11: 'Las Banderillas',
  13: 'La Mala Suerte',
  14: 'El Borracho',
  15: 'La Niña Bonita',
  17: 'La Desgracia',
  20: 'La Fiesta',
  22: 'Los Dos Patitos',
  25: 'La Navidad',
  33: 'La Edad de Cristo',
  44: 'Los Dos Sillones',
  48: 'El Escándalo',
  50: 'El Medio Siglo',
  55: 'Los Dos Galanes',
  60: 'La Hora',
  69: 'La Vuelta y Vuelta',
  77: 'Las Dos Banderas',
  88: 'Las Dos Abuelas',
  90: 'El Abuelo Final',
};

export interface BingoColorRange {
  start: number;
  end: number;
  label: string;
  colorName: string;
  colorHex: string;
  twBg: string;
  isLight: boolean;
}

export const BINGO_COLOR_RANGES: BingoColorRange[] = [
  { start: 1, end: 18, label: '1 - 18', colorName: 'Azul', colorHex: '#3B82F6', twBg: 'bg-blue-500', isLight: false },
  { start: 19, end: 36, label: '19 - 36', colorName: 'Rojo', colorHex: '#EF4444', twBg: 'bg-red-500', isLight: false },
  { start: 37, end: 54, label: '37 - 54', colorName: 'Amarillo', colorHex: '#EAB308', twBg: 'bg-yellow-400', isLight: true },
  { start: 55, end: 72, label: '55 - 72', colorName: 'Blanco', colorHex: '#FFFFFF', twBg: 'bg-white', isLight: true },
  { start: 73, end: 90, label: '73 - 90', colorName: 'Morado', colorHex: '#A855F7', twBg: 'bg-purple-500', isLight: false },
];

export interface BingoBallTheme {
  colorName: string;
  colorHex: string;
  bgGradient: string;
  shadow: string;
  border: string;
  twBg: string;
  isLightColor: boolean;
  ballTextClass: string;
  gridTextClass: string;
}

export function getBingoBallTheme(num: number | null): BingoBallTheme {
  if (!num) {
    return {
      colorName: '',
      colorHex: '#94A3B8',
      bgGradient: 'from-slate-700 via-slate-800 to-slate-950',
      shadow: 'rgba(148, 163, 184, 0.3)',
      border: 'border-slate-500',
      twBg: 'bg-slate-800',
      isLightColor: false,
      ballTextClass: 'text-white drop-shadow font-black',
      gridTextClass: 'text-white',
    };
  }

  // 1 - 18: Azul
  if (num <= 18) {
    return {
      colorName: 'Azul',
      colorHex: '#3B82F6',
      bgGradient: 'from-blue-600 via-blue-500 to-cyan-400',
      shadow: 'rgba(59, 130, 246, 0.75)',
      border: 'border-blue-300',
      twBg: 'bg-blue-500',
      isLightColor: false,
      ballTextClass: 'text-white drop-shadow font-black',
      gridTextClass: 'text-white',
    };
  }

  // 19 - 36: Rojo
  if (num <= 36) {
    return {
      colorName: 'Rojo',
      colorHex: '#EF4444',
      bgGradient: 'from-red-600 via-rose-500 to-amber-600',
      shadow: 'rgba(239, 68, 68, 0.75)',
      border: 'border-red-300',
      twBg: 'bg-red-500',
      isLightColor: false,
      ballTextClass: 'text-white drop-shadow font-black',
      gridTextClass: 'text-white',
    };
  }

  // 37 - 54: Amarillo (Texto oscuro para legibilidad total)
  if (num <= 54) {
    return {
      colorName: 'Amarillo',
      colorHex: '#EAB308',
      bgGradient: 'from-amber-400 via-yellow-400 to-orange-400',
      shadow: 'rgba(234, 179, 8, 0.75)',
      border: 'border-yellow-300',
      twBg: 'bg-yellow-400',
      isLightColor: true,
      ballTextClass: 'text-slate-950 font-black',
      gridTextClass: 'text-slate-950 font-black',
    };
  }

  // 55 - 72: Blanco / Platino (Texto negro profundo para máxima legibilidad)
  if (num <= 72) {
    return {
      colorName: 'Blanco',
      colorHex: '#FFFFFF',
      bgGradient: 'from-slate-100 via-white to-slate-200',
      shadow: 'rgba(255, 255, 255, 0.85)',
      border: 'border-slate-400',
      twBg: 'bg-white',
      isLightColor: true,
      ballTextClass: 'text-slate-950 font-black',
      gridTextClass: 'text-slate-950 font-black',
    };
  }

  // 73 - 90: Morado
  return {
    colorName: 'Morado',
    colorHex: '#A855F7',
    bgGradient: 'from-purple-600 via-violet-500 to-indigo-700',
    shadow: 'rgba(168, 85, 247, 0.75)',
    border: 'border-purple-300',
    twBg: 'bg-purple-500',
    isLightColor: false,
    ballTextClass: 'text-white drop-shadow font-black',
    gridTextClass: 'text-white',
  };
}

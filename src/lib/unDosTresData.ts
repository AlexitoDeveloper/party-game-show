export interface UnDosTresChallenge {
  id: string;
  prompt: string;
  level: 'Fácil' | 'Medio' | 'Difícil' | 'Extremo';
  levelNumber: 1 | 2 | 3 | 4;
  examples: string[];
  category: string;
}

export const OFFICIAL_UN_DOS_TRES_CHALLENGES: UnDosTresChallenge[] = [
  // NIVEL 1: FÁCIL (Calentamiento)
  {
    id: 'udt_1',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Comida & Bebida',
    prompt: 'Dime 3 marcas de refrescos con gas',
    examples: ['Coca-Cola', 'Fanta', 'Sprite', 'Pepsi', '7Up', 'Schweppes'],
  },
  {
    id: 'udt_2',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Cine & TV',
    prompt: 'Dime 3 películas clásicas de Disney',
    examples: ['El Rey León', 'Aladdín', 'La Bella y la Bestia', 'Mulán', 'Tarzán', 'Hércules'],
  },
  {
    id: 'udt_3',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Geografía',
    prompt: 'Dime 3 ciudades de España que tengan playa',
    examples: ['Barcelona', 'Valencia', 'Málaga', 'Alicante', 'Cádiz', 'San Sebastián', 'Gijón'],
  },
  {
    id: 'udt_4',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Naturaleza',
    prompt: 'Dime 3 animales carnívoros salvajes',
    examples: ['León', 'Tigre', 'Lobo', 'Tiburón', 'Hiena', 'Oso polar'],
  },
  {
    id: 'udt_5',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Mundo Digital',
    prompt: 'Dime 3 redes sociales o apps de mensajería',
    examples: ['Instagram', 'TikTok', 'WhatsApp', 'Twitter / X', 'Telegram', 'Facebook'],
  },
  {
    id: 'udt_6',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Hogar',
    prompt: 'Dime 3 electrodomésticos de una cocina',
    examples: ['Nevera / Frigorífico', 'Microondas', 'Lavavajillas', 'Horno', 'Tostadora'],
  },

  // NIVEL 2: MEDIO
  {
    id: 'udt_7',
    level: 'Medio',
    levelNumber: 2,
    category: 'Geografía',
    prompt: 'Dime 3 capitales europeas que NO sean Madrid ni París',
    examples: ['Roma', 'Berlín', 'Londres', 'Lisboa', 'Dublín', 'Ámsterdam', 'Bruselas', 'Viena'],
  },
  {
    id: 'udt_8',
    level: 'Medio',
    levelNumber: 2,
    category: 'Cine',
    prompt: 'Dime 3 actores que hayan interpretado a Batman o Spider-Man',
    examples: ['Christian Bale', 'Tobey Maguire', 'Tom Holland', 'Andrew Garfield', 'Robert Pattinson', 'Ben Affleck', 'Michael Keaton'],
  },
  {
    id: 'udt_9',
    level: 'Medio',
    levelNumber: 2,
    category: 'Música',
    prompt: 'Dime 3 cantantes o grupos españoles de los 2000',
    examples: ['Estopa', 'El Canto del Loco', 'La Oreja de Van Gogh', 'Amaral', 'Melendi', 'David Bisbal'],
  },
  {
    id: 'udt_10',
    level: 'Medio',
    levelNumber: 2,
    category: 'Deportes',
    prompt: 'Dime 3 deportes que se jueguen con raqueta o pala',
    examples: ['Tenis', 'Pádel', 'Bádminton', 'Tenis de mesa / Ping-pong', 'Squash', 'Frontón'],
  },
  {
    id: 'udt_11',
    level: 'Medio',
    levelNumber: 2,
    category: 'Gastronomía',
    prompt: 'Dime 3 tipos diferentes de queso',
    examples: ['Gouda', 'Parmesano', 'Manchego', 'Cheddar', 'Roquefort', 'Brie', 'Mozzarella'],
  },
  {
    id: 'udt_12',
    level: 'Medio',
    levelNumber: 2,
    category: 'Naturaleza',
    prompt: 'Dime 3 animales que puedan hibernar o vivir bajo cero',
    examples: ['Oso pardo', 'Marmota', 'Pingüino', 'Oso polar', 'Erizo', 'Murciélago'],
  },

  // NIVEL 3: DIFÍCIL
  {
    id: 'udt_13',
    level: 'Difícil',
    levelNumber: 3,
    category: 'Geografía',
    prompt: 'Dime 3 países del mundo que comiencen por la letra "M"',
    examples: ['México', 'Marruecos', 'Madagascar', 'Malasia', 'Mónaco', 'Mongolia', 'Mozambique', 'Maldivas'],
  },
  {
    id: 'udt_14',
    level: 'Difícil',
    levelNumber: 3,
    category: 'Astronomía',
    prompt: 'Dime 3 planetas del Sistema Solar que NO sean la Tierra ni Marte',
    examples: ['Júpiter', 'Saturno', 'Venus', 'Mercurio', 'Urano', 'Neptuno'],
  },
  {
    id: 'udt_15',
    level: 'Difícil',
    levelNumber: 3,
    category: 'Ciencia',
    prompt: 'Dime 3 elementos químicos de la tabla periódica',
    examples: ['Oro (Au)', 'Plata (Ag)', 'Hierro (Fe)', 'Oxígeno (O)', 'Helio (He)', 'Carbono (C)', 'Cobre (Cu)'],
  },
  {
    id: 'udt_16',
    level: 'Difícil',
    levelNumber: 3,
    category: 'Cine & Ficción',
    prompt: 'Dime 3 películas de Steven Spielberg',
    examples: ['Parque Jurásico', 'Tiburón', 'E.T.', 'Indiana Jones', 'Salvar al soldado Ryan', 'La lista de Schindler'],
  },
  {
    id: 'udt_17',
    level: 'Difícil',
    levelNumber: 3,
    category: 'Cultura',
    prompt: 'Dime 3 monedas oficiales del mundo que NO sean el Euro ni el Dólar',
    examples: ['Libra esterlina', 'Yen japonés', 'Franco suizo', 'Peso mexicano', 'Rupia india', 'Real brasileño'],
  },

  // NIVEL 4: EXTREMO / DESEMPATE
  {
    id: 'udt_18',
    level: 'Extremo',
    levelNumber: 4,
    category: 'Anatomía',
    prompt: 'Dime 3 huesos del cuerpo humano con nombres de más de 6 letras',
    examples: ['Húmero', 'Fémur', 'Clavícula', 'Omóplato', 'Estribo', 'Falange', 'Vértebra'],
  },
  {
    id: 'udt_19',
    level: 'Extremo',
    levelNumber: 4,
    category: 'Geografía Global',
    prompt: 'Dime 3 países que no tengan salida al mar en ningún punto',
    examples: ['Suiza', 'Austria', 'Bolivia', 'Paraguay', 'Andorra', 'Luxemburgo', 'Nepal', 'Mongolia'],
  },
  {
    id: 'udt_20',
    level: 'Extremo',
    levelNumber: 4,
    category: 'Literatura & Historia',
    prompt: 'Dime 3 dioses de la mitología griega o romana',
    examples: ['Zeus / Júpiter', 'Poseidón / Neptuno', 'Hades / Plutón', 'Ares / Marte', 'Atenea / Minerva', 'Apolo'],
  },
];

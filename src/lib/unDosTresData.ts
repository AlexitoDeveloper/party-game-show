export interface UnDosTresChallenge {
  id: string;
  prompt: string;
  level: 'Fácil' | 'Medio' | 'Difícil' | 'Extremo';
  levelNumber: 1 | 2 | 3 | 4;
  examples: string[];
  category: string;
}

export const OFFICIAL_UN_DOS_TRES_CHALLENGES: UnDosTresChallenge[] = [
  // ============================================================================
  // NIVEL 1: FÁCIL (Calentamiento)
  // ============================================================================
  {
    id: 'udt_1',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Fiesta & Bar',
    prompt: 'Dime 3 marcas de cerveza españolas',
    examples: ['Mahou', 'Estrella Galicia', 'Cruzcampo', 'Alhambra', 'San Miguel', 'Ambar', 'Estrella Damm'],
  },
  {
    id: 'udt_2',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Música & Reggaetón',
    prompt: 'Dime 3 canciones míticas de reggaeton de los 2000',
    examples: ['Gasolina', 'Danza Kuduro', 'Pobre Diabla', 'Dile', 'Rakata', 'Mayor que yo', 'Ella me levantó'],
  },
  {
    id: 'udt_3',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Series Españolas',
    prompt: 'Dime 3 personajes de "Aquí No Hay Quien Viva"',
    examples: ['Emilio', 'Juan Cuesta', 'Mauri', 'Marisa', 'Vicenta', 'Doña Concha', 'Belén', 'Fernando', 'Paco'],
  },
  {
    id: 'udt_4',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Comida de Domingo',
    prompt: 'Dime 3 comidas típicas que se piden a domicilio de resaca',
    examples: ['Pizza', 'Hamburguesa', 'Kebab / Dürüm', 'Sushi', 'Tacos', 'Pollo frito / Alitas'],
  },
  {
    id: 'udt_5',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Nostalgia Infancia',
    prompt: 'Dime 3 películas de animación de nuestra infancia',
    examples: ['Shrek', 'Toy Story', 'Monstruos S.A.', 'Buscando a Nemo', 'Los Increíbles', 'Ice Age', 'Cars'],
  },
  {
    id: 'udt_6',
    level: 'Fácil',
    levelNumber: 1,
    category: 'Series 2000s',
    prompt: 'Dime 3 series míticas españolas que veíamos de pequeños',
    examples: ['Los Serrano', 'Física o Química', 'El Barco', 'Los Hombres de Paco', 'El Internado', 'Aída', 'Compañeros'],
  },

  // ============================================================================
  // NIVEL 2: MEDIO (Entrando en calor)
  // ============================================================================
  {
    id: 'udt_7',
    level: 'Medio',
    levelNumber: 2,
    category: 'Noche & Discoteca',
    prompt: 'Dime 3 chupitos o licores que se piden de fiesta',
    examples: ['Jägermeister', 'Tequila', 'Thunder Bitch', 'Crema de orujo / Ruavieja', 'Fireball', 'Absenta', 'Jägerbomb'],
  },
  {
    id: 'udt_8',
    level: 'Medio',
    levelNumber: 2,
    category: 'Streamers & Redes',
    prompt: 'Dime 3 streamers o creadores de contenido hispanos',
    examples: ['Ibai Llanos', 'Auronplay', 'Rubius', 'IlloJuan', 'TheGrefg', 'Xokas', 'DjMaRiiO'],
  },
  {
    id: 'udt_9',
    level: 'Medio',
    levelNumber: 2,
    category: 'Vida Social',
    prompt: 'Dime 3 excusas típicas para volverte pronto a casa o no salir',
    examples: ['Me duele la cabeza', 'Mañana madrugo', 'No tengo un euro', 'Tengo que currar / estudiar', 'Tengo comida familiar'],
  },
  {
    id: 'udt_10',
    level: 'Medio',
    levelNumber: 2,
    category: 'Gaming',
    prompt: 'Dime 3 pokémons de la 1.ª Generación (Kanto)',
    examples: ['Pikachu', 'Charmander', 'Squirtle', 'Bulbasaur', 'Snorlax', 'Gengar', 'Mewtwo', 'Charizard', 'Eevee'],
  },
  {
    id: 'udt_11',
    level: 'Medio',
    levelNumber: 2,
    category: 'Vida Nocturna',
    prompt: 'Dime 3 cosas que te dan resaca moral al día siguiente de fiesta',
    examples: ['Mirar la cuenta del banco', 'Revisar los audios de WhatsApp', 'Ver las historias que subiste a Instagram', 'Ver a quién llamaste a las 4 AM'],
  },
  {
    id: 'udt_12',
    level: 'Medio',
    levelNumber: 2,
    category: 'Gaming Nostalgia',
    prompt: 'Dime 3 videojuegos a los que jugábamos de pequeños (Play 2, Wii o PC)',
    examples: ['GTA San Andreas', 'Los Sims', 'FIFA / PES', 'Wii Sports', 'Need for Speed', 'Mario Kart', 'SingStar', 'Crash Bandicoot'],
  },

  // ============================================================================
  // NIVEL 3: DIFÍCIL (Subiendo la presión)
  // ============================================================================
  {
    id: 'udt_13',
    level: 'Difícil',
    levelNumber: 3,
    category: 'Música Urbana',
    prompt: 'Dime 3 artistas de la escena urbana o trap en español',
    examples: ['Quevedo', 'Duki', 'Bizarrap', 'Morad', 'Eladio Carrión', 'Trueno', 'Milo J', 'Saiko', 'Mora'],
  },
  {
    id: 'udt_14',
    level: 'Difícil',
    levelNumber: 3,
    category: 'Pop Español',
    prompt: 'Dime 3 canciones de Estopa o Melendi que te sepas el estribillo',
    examples: ['La raja de tu falda', 'Vino tinto', 'Como Camarón', 'Tu jardín con enanitos', 'Caminando por la vida', 'Sin noticias de Holanda'],
  },
  {
    id: 'udt_15',
    level: 'Difícil',
    levelNumber: 3,
    category: 'Supervivencia 24h',
    prompt: 'Dime 3 cosas que compras en una tienda 24h o chino un domingo por la noche',
    examples: ['Bolsa de hielo', 'Bolsa de patatas', 'Refresco de 2L', 'Mechero', 'Gominolas', 'Pipas', 'Pizzas congeladas'],
  },
  {
    id: 'udt_16',
    level: 'Difícil',
    levelNumber: 3,
    category: 'Televisión',
    prompt: 'Dime 3 personajes de Los Simpson que NO sean de la familia Simpson',
    examples: ['Ned Flanders', 'Moe Szyslak', 'Milhouse', 'Krusty el Payaso', 'Apu', 'Barney Gumble', 'Director Skinner', 'Nelson'],
  },
  {
    id: 'udt_17',
    level: 'Difícil',
    levelNumber: 3,
    category: 'Festivales',
    prompt: 'Dime 3 cosas que llevas obligatoriamente en la riñonera en un festival',
    examples: ['Móvil con batería', 'Toallitas húmedas / pañuelos', 'Gafas de sol', 'Mechero', 'Tapones de oídos', 'Dinero / tarjeta', 'Batería externa'],
  },
  {
    id: 'udt_18',
    level: 'Difícil',
    levelNumber: 3,
    category: 'Cine de Superhéroes',
    prompt: 'Dime 3 actores que hayan interpretado a Spider-Man o Batman',
    examples: ['Tobey Maguire', 'Andrew Garfield', 'Tom Holland', 'Christian Bale', 'Robert Pattinson', 'Ben Affleck', 'Michael Keaton'],
  },

  // ============================================================================
  // NIVEL 4: EXTREMO (Muerte súbita)
  // ============================================================================
  {
    id: 'udt_19',
    level: 'Extremo',
    levelNumber: 4,
    category: 'Cultura Pop Española',
    prompt: 'Dime 3 frases célebres de Mariano o Marisa en "Aquí No Hay Quien Viva"',
    examples: ['¡Qué follón!', 'Ignorante de la vida', 'Chorizo', 'Metrosexual y pensador', 'Váyase, señor Cuesta, ¡váyase!', 'Un chinchón'],
  },
  {
    id: 'udt_20',
    level: 'Extremo',
    levelNumber: 4,
    category: 'Música Actual',
    prompt: 'Dime 3 artistas que tengan una BZRP Music Session con Bizarrap',
    examples: ['Quevedo (#52)', 'Shakira (#53)', 'Nathy Peluso (#36)', 'Residente (#49)', 'Villano Antillano (#51)', 'Duki (#50)', 'Rauw Alejandro (#56)', 'Young Miko (#58)'],
  },
  {
    id: 'udt_21',
    level: 'Extremo',
    levelNumber: 4,
    category: 'Eurovisión',
    prompt: 'Dime 3 canciones o artistas que hayan ido a Eurovisión por España en los últimos 15 años',
    examples: ['SloMo (Chanel)', 'Zorra (Nebulossa)', 'Baila el Chiki Chiki (Rodolfo)', 'Say Yay! (Barei)', 'Quédate conmigo (Pastora Soler)', 'Eaea (Blanca Paloma)'],
  },
  {
    id: 'udt_22',
    level: 'Extremo',
    levelNumber: 4,
    category: 'Fútbol Histórico',
    prompt: 'Dime 3 futbolistas que hayan jugado tanto en el Real Madrid como en el FC Barcelona',
    examples: ['Luis Figo', 'Ronaldo Nazário', 'Luis Enrique', 'Samuel Eto\'o', 'Michael Laudrup', 'Javier Saviola', 'Alfonso Pérez'],
  },
  {
    id: 'udt_23',
    level: 'Extremo',
    levelNumber: 4,
    category: 'Barra Libre',
    prompt: 'Dime 3 marcas de alcohol de alta graduación (ron, ginebra, vodka o whisky)',
    examples: ['Barceló', 'Brugal', 'Beefeater', 'Tanqueray', 'Absolut', 'Puerto de Indias', 'J&B', 'Johnnie Walker', 'Ballantine\'s', 'Smirnoff'],
  },
  {
    id: 'udt_24',
    level: 'Extremo',
    levelNumber: 4,
    category: 'Geografía Europea',
    prompt: 'Dime 3 capitales europeas que comiencen por la letra "B"',
    examples: ['Berlín (Alemania)', 'Budapest (Hungría)', 'Berna (Suiza)', 'Bruselas (Bélgica)', 'Bucarest (Rumanía)', 'Bratislava (Eslovaquia)', 'Belgrado (Serbia)'],
  },
];

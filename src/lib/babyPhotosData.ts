export interface BabyPhotoItem {
  id: string;
  imageUrl: string;          // Ruta local (ej: '/photos/bebes/foto1.jpg') o URL web
  personName: string;        // Nombre de la persona / celebridad
  category: 'Famoso' | 'Participante';
  hint?: string;             // Pista opcional
  ownerPlayerName?: string;  // Si es un participante: su nombre (para sancionar si pulsa su propia foto)
}

// ============================================================================
// 🛠️ FOTOS DE PRUEBA / MODO DESARROLLO (ANTI-SPOILERS PARA EL DESARROLLADOR)
// ============================================================================
// Estos ejemplos son únicamente de prueba para diseñar y testear la interfaz.
// No contienen las fotos reales de la fiesta para que puedas jugar como
// participante sin conocer de antemano las soluciones.
//
// 📁 CÓMO AÑADIR LAS FOTOS REALES:
// 1. Guarda las imágenes en la carpeta: 'public/photos/bebes/' (ej: foto1.jpg, foto2.jpg)
// 2. O cárgalas directamente desde el panel del Anfitrión (Host) durante la fiesta.
// ============================================================================

export const DEV_MOCK_BABY_PHOTOS: BabyPhotoItem[] = [
  {
    id: 'demo_bebe_1',
    imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop&q=80',
    personName: '[DEMO] Leo Messi (Bebé)',
    category: 'Famoso',
    hint: 'Astro del fútbol mundial con 8 balones de oro',
  },
  {
    id: 'demo_bebe_2',
    imageUrl: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&auto=format&fit=crop&q=80',
    personName: '[DEMO] Rosalía (Bebé)',
    category: 'Famoso',
    hint: 'Cantante icónica de Motomami',
  },
  {
    id: 'demo_bebe_3',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80',
    personName: '[DEMO] Jugador Secreto 1',
    category: 'Participante',
    ownerPlayerName: 'Álex',
    hint: 'Uno de los concursantes de esta noche',
  },
  {
    id: 'demo_bebe_4',
    imageUrl: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=80',
    personName: '[DEMO] Shakira (Bebé)',
    category: 'Famoso',
    hint: 'Estrella internacional del pop latino',
  },
  {
    id: 'demo_bebe_5',
    imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80',
    personName: '[DEMO] Jugador Secreto 2',
    category: 'Participante',
    ownerPlayerName: 'Sara',
    hint: 'Miembro de uno de los equipos en juego',
  },
];

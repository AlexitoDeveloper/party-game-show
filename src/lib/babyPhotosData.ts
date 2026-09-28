export interface BabyPhotoItem {
  id: string;
  imageUrl: string; // Ruta local (ej: '/photos/bebes/foto1.jpg') o URL web
}

// ============================================================================
// 🛠️ FOTOS DE PRUEBA / MODO DESARROLLO (ANTI-SPOILERS PARA EL DESARROLLADOR)
// ============================================================================
export const DEV_MOCK_BABY_PHOTOS: BabyPhotoItem[] = [
  {
    id: 'demo_bebe_1',
    imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo_bebe_2',
    imageUrl: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo_bebe_3',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo_bebe_4',
    imageUrl: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'demo_bebe_5',
    imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80',
  },
];

// ============================================================================
// 📸 FOTOS REALES OFICIALES DE LA FIESTA (ANTI-SPOILERS, SIN RESPUESTAS)
// ============================================================================
export const OFFICIAL_BABY_PHOTOS: BabyPhotoItem[] = [
  {
    "id": "bebe_1",
    "imageUrl": "/photos/bebes/020ebfae6bf954160799df4311850eea.jpg"
  },
  {
    "id": "bebe_2",
    "imageUrl": "/photos/bebes/7b908c6b9164b1338858e8dc3ccb2112.jpg"
  },
  {
    "id": "bebe_3",
    "imageUrl": "/photos/bebes/AIT.jpg"
  },
  {
    "id": "bebe_4",
    "imageUrl": "/photos/bebes/Annnna.jpg"
  },
  {
    "id": "bebe_5",
    "imageUrl": "/photos/bebes/BB baby.jpg"
  },
  {
    "id": "bebe_6",
    "imageUrl": "/photos/bebes/BE baby.avif"
  },
  {
    "id": "bebe_7",
    "imageUrl": "/photos/bebes/burn.webp"
  },
  {
    "id": "bebe_8",
    "imageUrl": "/photos/bebes/DB baby bule.webp"
  },
  {
    "id": "bebe_9",
    "imageUrl": "/photos/bebes/dustin-gaten.jpg"
  },
  {
    "id": "bebe_10",
    "imageUrl": "/photos/bebes/ES baby.jpg"
  },
  {
    "id": "bebe_11",
    "imageUrl": "/photos/bebes/hcrls.jpg"
  },
  {
    "id": "bebe_12",
    "imageUrl": "/photos/bebes/IMG-20230121-WA0030.jpg"
  },
  {
    "id": "bebe_13",
    "imageUrl": "/photos/bebes/IMG-20260908-WA0012.jpg"
  },
  {
    "id": "bebe_14",
    "imageUrl": "/photos/bebes/IMG-20260909-WA0000.jpg"
  },
  {
    "id": "bebe_15",
    "imageUrl": "/photos/bebes/IMG-20260920-WA0033.jpg"
  },
  {
    "id": "bebe_16",
    "imageUrl": "/photos/bebes/IMG-20260922-WA0000.jpg"
  },
  {
    "id": "bebe_17",
    "imageUrl": "/photos/bebes/IMG-20260925-WA0002(1).jpg"
  },
  {
    "id": "bebe_18",
    "imageUrl": "/photos/bebes/IMG-20260925-WA0004(1).jpg"
  },
  {
    "id": "bebe_19",
    "imageUrl": "/photos/bebes/IMG-20260925-WA0011.jpg"
  },
  {
    "id": "bebe_20",
    "imageUrl": "/photos/bebes/IMG-20260925-WA0018.jpg"
  },
  {
    "id": "bebe_21",
    "imageUrl": "/photos/bebes/IMG-20260925-WA0021.jpg"
  },
  {
    "id": "bebe_22",
    "imageUrl": "/photos/bebes/IMG-20260925-WA0022.jpg"
  },
  {
    "id": "bebe_23",
    "imageUrl": "/photos/bebes/IMG_20260909_165558.jpg"
  },
  {
    "id": "bebe_24",
    "imageUrl": "/photos/bebes/IMG_20260913_111231.jpg"
  },
  {
    "id": "bebe_25",
    "imageUrl": "/photos/bebes/IMG_20260920_230333.jpg"
  },
  {
    "id": "bebe_26",
    "imageUrl": "/photos/bebes/Jim C baby.jpg"
  },
  {
    "id": "bebe_27",
    "imageUrl": "/photos/bebes/lamine-yamal-bebé-es-la-mole-v0-mpa0s1d5didh1.webp"
  },
  {
    "id": "bebe_28",
    "imageUrl": "/photos/bebes/LLow.jpg"
  },
  {
    "id": "bebe_29",
    "imageUrl": "/photos/bebes/MC babr.jpg"
  },
  {
    "id": "bebe_30",
    "imageUrl": "/photos/bebes/MJ baby.jpg"
  },
  {
    "id": "bebe_31",
    "imageUrl": "/photos/bebes/mo.jpg"
  },
  {
    "id": "bebe_32",
    "imageUrl": "/photos/bebes/moe szyslak.webp"
  },
  {
    "id": "bebe_33",
    "imageUrl": "/photos/bebes/owBBvAE5pMbiaqrBqYaDW23mIvAEJAd2tpAli~tplv-tiktokx-origin.jpg"
  },
  {
    "id": "bebe_34",
    "imageUrl": "/photos/bebes/rap.jpg"
  },
  {
    "id": "bebe_35",
    "imageUrl": "/photos/bebes/RN TEn.avif"
  },
  {
    "id": "bebe_36",
    "imageUrl": "/photos/bebes/SE.jpeg"
  },
  {
    "id": "bebe_37",
    "imageUrl": "/photos/bebes/shinchan-baby-pictures-are-too-cute-which-one-do-you-like-v0-d07alypu3ulg1.jpg"
  },
  {
    "id": "bebe_38",
    "imageUrl": "/photos/bebes/SR.jpg"
  },
  {
    "id": "bebe_39",
    "imageUrl": "/photos/bebes/SY.jpg"
  },
  {
    "id": "bebe_40",
    "imageUrl": "/photos/bebes/tazn.jpg"
  },
  {
    "id": "bebe_41",
    "imageUrl": "/photos/bebes/TH-nin-o-superman-1642151979.avif"
  },
  {
    "id": "bebe_42",
    "imageUrl": "/photos/bebes/Timo.jpg"
  },
  {
    "id": "bebe_43",
    "imageUrl": "/photos/bebes/TR baby.webp"
  },
  {
    "id": "bebe_44",
    "imageUrl": "/photos/bebes/Z y C.jpg"
  }
];

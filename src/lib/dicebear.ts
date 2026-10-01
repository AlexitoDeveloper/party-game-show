import { createAvatar } from '@dicebear/core';
import { avataaars, funEmoji, adventurer, pixelArt } from '@dicebear/collection';

export type DiceBearStyle = 'avataaars' | 'funEmoji' | 'adventurer' | 'pixelArt';

/**
 * Comprueba si un avatar seed corresponde a una foto personalizada (Data URI o URL).
 */
export function isCustomAvatar(seed?: string | null): boolean {
  if (!seed) return false;
  return (
    seed.startsWith('data:image/') ||
    seed.startsWith('http://') ||
    seed.startsWith('https://') ||
    seed.startsWith('blob:')
  );
}

/**
 * Procesa y optimiza una imagen elegida de la galería o cámara de un móvil (iOS/Android):
 * - Soporta orientación EXIF automática (fotos en vertical/horizontal de iPhone y Android)
 * - Centra y recorta en formato cuadrado (1:1)
 * - Escala a tamaño optimizado (200x200 px)
 * - Comprime a JPEG ultra-ligero (~10-15 KB en base64) para sincronización ultrarrápida
 * - Previene fugas de memoria en navegadores móviles (Safari iOS / Chrome Android)
 */
export async function processGalleryImage(
  file: File,
  maxSize: number = 200,
  quality: number = 0.82
): Promise<string> {
  const isImage =
    (file.type && file.type.startsWith('image/')) ||
    /\.(jpe?g|png|webp|gif|heic|heif|bmp|avif)$/i.test(file.name);

  if (!isImage) {
    throw new Error('El archivo seleccionado debe ser una imagen válida (JPG, PNG, WEBP, etc.).');
  }

  // Método 1: createImageBitmap con orientación EXIF automática (óptimo para iOS y Android modernos)
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await (createImageBitmap as any)(file, {
        imageOrientation: 'from-image',
      });
      const canvas = document.createElement('canvas');
      canvas.width = maxSize;
      canvas.height = maxSize;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const { width, height } = bitmap;
        const minDim = Math.min(width, height);
        const sx = (width - minDim) / 2;
        const sy = (height - minDim) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);

        // Liberar recursos de GPU/memoria en móviles
        if (typeof bitmap.close === 'function') {
          bitmap.close();
        }

        return canvas.toDataURL('image/jpeg', quality);
      }
    } catch (e) {
      console.warn('createImageBitmap no disponible o falló en este dispositivo, usando fallback de imagen:', e);
    }
  }

  // Método 2: Fallback con URL.createObjectURL (más eficiente en RAM móvil que FileReader)
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('No se pudo inicializar el procesador gráfico en el navegador.'));
          return;
        }

        const { width, height } = img;
        const minDim = Math.min(width, height);
        const sx = (width - minDim) / 2;
        const sy = (height - minDim) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo procesar la foto seleccionada en este dispositivo móvil.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Genera un avatar vectorial de DiceBear directamente en el cliente en formato Data URI (SVG),
 * o devuelve directamente la imagen si el seed ya es una foto subida por el jugador.
 */
export function generateAvatarDataUri(seed: string, style: DiceBearStyle = 'avataaars'): string {
  if (!seed) return '';
  if (isCustomAvatar(seed)) {
    return seed;
  }

  try {
    let collection: any = avataaars;
    if (style === 'funEmoji') {
      collection = funEmoji;
    } else if (style === 'adventurer') {
      collection = adventurer;
    } else if (style === 'pixelArt') {
      collection = pixelArt;
    }

    const avatar = createAvatar(collection, {
      seed: seed || 'player',
      radius: 18,
    });
    return avatar.toDataUri();
  } catch (error) {
    console.warn('Error generando avatar local, usando fallback URL:', error);
    const styleParam = style === 'pixelArt' ? 'pixel-art' : style === 'funEmoji' ? 'fun-emoji' : style;
    return `https://api.dicebear.com/9.x/${styleParam}/svg?seed=${encodeURIComponent(seed || 'player')}&radius=18`;
  }
}

/**
 * Genera un seed aleatorio estilo arcade para el botón de dados.
 */
export function generateRandomSeed(): string {
  const names = [
    'Alex', 'Luna', 'Neo', 'Dani', 'Sam', 'Max', 'Zoe', 'Leo', 'Mia', 'Kai',
    'Vega', 'Nico', 'Aria', 'Eli', 'Gael', 'Sora', 'Ryu', 'Ken', 'Maya', 'Lucas'
  ];
  const num = Math.floor(Math.random() * 900) + 100;
  const name = names[Math.floor(Math.random() * names.length)];
  return `${name}${num}`;
}


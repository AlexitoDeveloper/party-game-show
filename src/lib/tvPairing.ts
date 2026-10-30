import { getRoomSync } from './roomSync';

const TV_PIN_STORAGE_KEY = 'party_tv_device_pin';
const HOST_PAIRED_TV_PIN_KEY = 'party_host_paired_tv_pin';

/**
 * Obtiene o crea un PIN numérico de 4 dígitos persistente para este receptor de TV.
 */
export function getOrCreateTvPin(): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return '1234';
  }
  let pin = localStorage.getItem(TV_PIN_STORAGE_KEY);
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    pin = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      localStorage.setItem(TV_PIN_STORAGE_KEY, pin);
    } catch (e) {
      console.warn('Error al guardar PIN de TV en localStorage:', e);
    }
  }
  return pin;
}

/**
 * Obtiene el PIN de la TV vinculado guardado en el teléfono del anfitrión.
 */
export function getSavedHostTvPin(): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return '';
  return (localStorage.getItem(HOST_PAIRED_TV_PIN_KEY) || '').trim();
}

/**
 * Guarda el PIN de TV en el dispositivo del anfitrión para emparejamiento automático.
 */
export function setSavedHostTvPin(pin: string): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    const cleanPin = pin.trim();
    if (cleanPin) {
      localStorage.setItem(HOST_PAIRED_TV_PIN_KEY, cleanPin);
    } else {
      localStorage.removeItem(HOST_PAIRED_TV_PIN_KEY);
    }
  } catch (e) {
    console.warn('Error al guardar el PIN de TV del anfitrión:', e);
  }
}

export interface PushRoomOptions {
  tvPin?: string;
  liteMode?: boolean;
  title?: string;
}

/**
 * Empuja la sala activa hacia las Smart TVs que estén escuchando.
 * Emite en el canal de descubrimiento global y en el canal privado de PIN si existe.
 */
export function pushRoomToTv(roomCode: string, options?: PushRoomOptions): void {
  const cleanCode = (roomCode || '').toUpperCase().trim();
  if (!cleanCode) return;

  const targetPin = (options?.tvPin || getSavedHostTvPin() || '').trim();

  const payload = {
    roomCode: cleanCode,
    tvPin: targetPin || undefined,
    liteMode: options?.liteMode,
    title: options?.title,
  };

  // 1. Enviar al canal de auto-descubrimiento en red local
  try {
    const discoverySync = getRoomSync('TV_DISCOVERY', 'host');
    discoverySync.emit({ type: 'TV_PAIR_REDIRECT', payload });
  } catch (err) {
    console.warn('Error al enviar redirección TV_DISCOVERY:', err);
  }

  // 2. Si se tiene un PIN específico, enviar al canal directo de esa TV
  if (targetPin && targetPin.length === 4) {
    try {
      const pinSync = getRoomSync(`TV_${targetPin}`, 'host');
      pinSync.emit({ type: 'TV_PAIR_REDIRECT', payload });
    } catch (err) {
      console.warn(`Error al enviar redirección a TV_${targetPin}:`, err);
    }
  }
}

/**
 * Ajusta de forma remota el modo ligero de la TV desde el teléfono del anfitrión.
 */
export function pushLiteModeToTv(roomCode: string, enabled: boolean, tvPin?: string): void {
  const cleanCode = (roomCode || '').toUpperCase().trim();
  const cleanPin = (tvPin || getSavedHostTvPin() || '').trim();

  const event = { type: 'TV_SET_LITE_MODE' as const, payload: { enabled } };

  if (cleanCode) {
    try {
      const roomSync = getRoomSync(cleanCode, 'host');
      roomSync.emit(event);
    } catch {}
  }

  if (cleanPin && cleanPin.length === 4) {
    try {
      const pinSync = getRoomSync(`TV_${cleanPin}`, 'host');
      pinSync.emit(event);
    } catch {}
  }
}

/**
 * Inicia la proyección nativa de Google Chrome (Presentation API) hacia Chromecast/Google Cast si está soportado.
 */
export async function startNativePresentation(roomCode: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const PresentationRequest = (window as any).PresentationRequest;
  if (!PresentationRequest) {
    console.warn('Presentation API no soportada en este navegador');
    return false;
  }

  try {
    const tvUrl = `${window.location.origin}/room/${roomCode}/tv`;
    const request = new PresentationRequest([tvUrl]);
    const connection = await request.start();
    return !!connection;
  } catch (err) {
    console.info('Sesión de presentación nativa cancelada o no disponible:', err);
    return false;
  }
}

/**
 * Resincroniza de inmediato el Host con la Smart TV y recupera posibles microcortes Wi-Fi.
 * Emite REQUEST_ROOM_SYNC y REQUEST_PLAYERS_SYNC en el canal de la sala
 * y re-empuja la redirección de emparejamiento TV_PAIR_REDIRECT.
 */
export function forceResyncTv(roomCode: string, tvPin?: string): void {
  const cleanCode = (roomCode || '').toUpperCase().trim();
  if (!cleanCode) return;

  const targetPin = (tvPin || getSavedHostTvPin() || '').trim();

  // 1. Re-empujar redirección de emparejamiento TV hacia la sala activa
  pushRoomToTv(cleanCode, { tvPin: targetPin || undefined });

  // 2. Solicitar sincronización completa de la sala y de los jugadores en el canal de la sala
  try {
    const roomSync = getRoomSync(cleanCode, 'host');
    roomSync.emit({ type: 'REQUEST_ROOM_SYNC' });
    roomSync.emit({ type: 'REQUEST_PLAYERS_SYNC' });
  } catch (err) {
    console.warn('Error al forzar resincronización con la TV:', err);
  }
}


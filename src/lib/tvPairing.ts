import { getRoomSync } from './roomSync';
import { supabase, isSupabaseRealtimeConfigured } from './supabase';

const TV_PIN_STORAGE_KEY = 'party_tv_device_pin';
const HOST_PAIRED_TV_PIN_KEY = 'party_host_paired_tv_pin';

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

export function getSavedHostTvPin(): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return '';
  return (localStorage.getItem(HOST_PAIRED_TV_PIN_KEY) || '').trim();
}

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

function postJsonSafely(url: string, payload: any): void {
  try {
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
    }).catch(() => {});
  } catch {}
}

export function pushRoomToTv(roomCode: string, options?: PushRoomOptions): void {
  const cleanCode = (roomCode || '').toUpperCase().trim();
  if (!cleanCode) return;

  const targetPin = (options?.tvPin || getSavedHostTvPin() || '').trim();
  const payload = {
    type: 'TV_PAIR_REDIRECT',
    roomCode: cleanCode,
    tvPin: targetPin && targetPin.length === 4 ? targetPin : undefined,
    liteMode: options?.liteMode,
    title: options?.title,
    ts: Date.now(),
  };

  // 1. Enviar HTTP POST a ntfy.sh (por PIN y canal global de descubrimiento)
  if (targetPin && targetPin.length === 4) {
    postJsonSafely(`https://ntfy.sh/pgs_tv_pin_${targetPin}`, payload);
  }
  postJsonSafely('https://ntfy.sh/pgs_tv_discovery_global', payload);

  // 2. Enviar POST al relé HTTP local / serverless
  postJsonSafely('/api/tv-pair', payload);

  // 3. Emitir por Supabase Realtime Broadcast directo si está disponible
  if (isSupabaseRealtimeConfigured) {
    try {
      const globalChan = supabase.channel('tv-pair:global');
      globalChan.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          globalChan
            .send({
              type: 'broadcast',
              event: 'STATE_EVENT',
              payload: { event: { type: 'TV_PAIR_REDIRECT', payload } },
            })
            .finally(() => {
              setTimeout(() => {
                try {
                  supabase.removeChannel(globalChan);
                } catch {}
              }, 3000);
            });
        }
      });

      if (targetPin && targetPin.length === 4) {
        const pinChan = supabase.channel(`tv-pair:${targetPin}`);
        pinChan.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            pinChan
              .send({
                type: 'broadcast',
                event: 'STATE_EVENT',
                payload: { event: { type: 'TV_PAIR_REDIRECT', payload } },
              })
              .finally(() => {
                setTimeout(() => {
                  try {
                    supabase.removeChannel(pinChan);
                  } catch {}
                }, 3000);
              });
          }
        });
      }
    } catch {}
  }

  // 4. Emitir por RoomSync (TV_${targetPin} y TV_DISCOVERY) con reintentos a 400ms y 1200ms
  const emitRoomSync = () => {
    try {
      const discoverySync = getRoomSync('TV_DISCOVERY', 'host');
      discoverySync.emit({ type: 'TV_PAIR_REDIRECT', payload });
    } catch {}

    if (targetPin && targetPin.length === 4) {
      try {
        const pinSync = getRoomSync(`TV_${targetPin}`, 'host');
        pinSync.emit({ type: 'TV_PAIR_REDIRECT', payload });
      } catch {}
    }
  };

  emitRoomSync();
  setTimeout(emitRoomSync, 400);
  setTimeout(emitRoomSync, 1200);

  // Destruir instancias temporales de RoomSync tras 5 segundos para liberar WebSockets y PeerJS
  setTimeout(() => {
    try {
      getRoomSync('TV_DISCOVERY', 'host').destroy();
    } catch {}
    if (targetPin && targetPin.length === 4) {
      try {
        getRoomSync(`TV_${targetPin}`, 'host').destroy();
      } catch {}
    }
  }, 5000);
}

export function pushLiteModeToTv(roomCode: string, enabled: boolean, tvPin?: string): void {
  const cleanCode = (roomCode || '').toUpperCase().trim();
  const cleanPin = (tvPin || getSavedHostTvPin() || '').trim();
  const payload = {
    type: 'TV_SET_LITE_MODE',
    enabled,
    roomCode: cleanCode,
    tvPin: cleanPin || undefined,
    ts: Date.now(),
  };

  // 1. Post a ntfy.sh
  if (cleanPin && cleanPin.length === 4) {
    postJsonSafely(`https://ntfy.sh/pgs_tv_pin_${cleanPin}`, payload);
  }
  if (cleanCode) {
    postJsonSafely(`https://ntfy.sh/pgs_room_sync_${cleanCode}`, payload);
  }

  // 2. Emitir por RoomSync
  const event = { type: 'TV_SET_LITE_MODE' as const, payload: { enabled } };
  if (cleanCode) {
    try {
      getRoomSync(cleanCode, 'host').emit(event);
    } catch {}
  }
  if (cleanPin && cleanPin.length === 4) {
    try {
      getRoomSync(`TV_${cleanPin}`, 'host').emit(event);
    } catch {}
  }
}

export function forceResyncTv(roomCode: string, tvPin?: string): void {
  const cleanCode = (roomCode || '').toUpperCase().trim();
  if (!cleanCode) return;

  const targetPin = (tvPin || getSavedHostTvPin() || '').trim();
  pushRoomToTv(cleanCode, { tvPin: targetPin || undefined });

  try {
    const roomSync = getRoomSync(cleanCode, 'host');
    roomSync.emit({ type: 'REQUEST_ROOM_SYNC' });
    roomSync.emit({ type: 'REQUEST_PLAYERS_SYNC' });
  } catch (err) {
    console.warn('Error al forzar resincronización con la TV:', err);
  }
}

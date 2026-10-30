import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomSync, RoomSyncEvent } from '../lib/roomSync';
import { getOrCreateTvPin } from '../lib/tvPairing';
import { initTvLiteMode, setTvLiteMode } from '../lib/smartTv';

export interface UseTvRemoteReceiverOptions {
  roomCode?: string;
  isReceiverPage?: boolean;
}

export function useTvRemoteReceiver(options: UseTvRemoteReceiverOptions = {}) {
  const { roomCode, isReceiverPage = false } = options;
  const navigate = useNavigate();

  const [tvPin] = useState<string>(() => getOrCreateTvPin());
  const [liteMode, setLiteModeState] = useState<boolean>(() => initTvLiteMode());
  const [lastPairedRoom, setLastPairedRoom] = useState<string | null>(null);

  const toggleLiteMode = useCallback((val?: boolean) => {
    setLiteModeState((prev) => {
      const next = typeof val === 'boolean' ? val : !prev;
      setTvLiteMode(next);
      return next;
    });
  }, []);

  const handleEvent = useCallback(
    (event: RoomSyncEvent) => {
      if (event.type === 'TV_PAIR_REDIRECT') {
        const { roomCode: targetRoom, tvPin: targetPin, liteMode: targetLite } = event.payload;
        // Acepta si coincide con el PIN local, o si no se especificó PIN (auto-descubrimiento en /tv)
        const matchesPin = targetPin ? targetPin === tvPin : isReceiverPage || !roomCode;

        if (matchesPin && targetRoom) {
          if (typeof targetLite === 'boolean') {
            toggleLiteMode(targetLite);
          }
          // Enviar ACK de emparejamiento
          try {
            const pinSync = getRoomSync(`TV_${tvPin}`, 'tv');
            pinSync.emit({ type: 'TV_PAIR_ACK', payload: { tvPin, roomCode: targetRoom } });
          } catch {}

          setLastPairedRoom(targetRoom);
          if (targetRoom !== roomCode) {
            navigate(`/room/${targetRoom}/tv`);
          }
        }
      } else if (event.type === 'TV_SET_LITE_MODE') {
        toggleLiteMode(event.payload.enabled);
      }
    },
    [tvPin, isReceiverPage, roomCode, navigate, toggleLiteMode]
  );

  useEffect(() => {
    // Inicializar Lite mode en el DOM
    initTvLiteMode();

    // 1. Escuchar en el canal exclusivo del PIN de esta TV
    const pinSync = getRoomSync(`TV_${tvPin}`, 'tv');
    const unsubPin = pinSync.subscribe(handleEvent);

    // 2. Escuchar en el canal de descubrimiento si estamos en /tv o sin sala activa
    let unsubDiscovery: (() => void) | undefined;
    if (isReceiverPage || !roomCode) {
      const discoverySync = getRoomSync('TV_DISCOVERY', 'tv');
      unsubDiscovery = discoverySync.subscribe(handleEvent);
    }

    // 3. Escuchar en la sala actual si ya estamos dentro de una
    let unsubRoom: (() => void) | undefined;
    if (roomCode) {
      const activeRoomSync = getRoomSync(roomCode, 'tv');
      unsubRoom = activeRoomSync.subscribe(handleEvent);
    }

    return () => {
      unsubPin();
      if (unsubDiscovery) unsubDiscovery();
      if (unsubRoom) unsubRoom();
    };
  }, [tvPin, isReceiverPage, roomCode, handleEvent]);

  return {
    tvPin,
    liteMode,
    toggleLiteMode,
    lastPairedRoom,
  };
}

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { RoomSync, getRoomSync } from './roomSync';
import { soundFX } from './audio';
import { BuzzerPressPayload } from './types';

interface UseBuzzerRaceProps {
  roomCode: string;
  isHostOrTv?: boolean;
  isArbitrator?: boolean;
  roomSync?: RoomSync;
}

export function useBuzzerRace({
  roomCode,
  isHostOrTv = false,
  isArbitrator: propIsArbitrator,
  roomSync: propRoomSync,
}: UseBuzzerRaceProps) {
  const isArbitrator = propIsArbitrator !== undefined ? propIsArbitrator : isHostOrTv;
  const [winner, setWinner] = useState<BuzzerPressPayload | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const lockRef = useRef<boolean>(false);

  // Instancia de sincronización multi-transporte compartida
  const roomSync = useMemo(() => {
    if (propRoomSync) return propRoomSync;
    return getRoomSync(roomCode, isHostOrTv ? 'host' : 'player');
  }, [propRoomSync, roomCode, isHostOrTv]);

  // Mantener referencia síncrona para resolver condiciones de carrera a nivel de milisegundo
  useEffect(() => {
    lockRef.current = isLocked;
  }, [isLocked]);

  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = roomSync.onEvent((event) => {
      if (event.type === 'BUZZER_PRESS') {
        const press = event.payload;

        // Si ya está bloqueado, descartar cualquier otra pulsación
        if (lockRef.current) return;

        // Únicamente la entidad designada como Árbitro Maestro bloquea y arbitra
        if (isArbitrator) {
          lockRef.current = true;
          setIsLocked(true);
          setWinner(press);
          soundFX.playBuzzer();

          // Retransmitir confirmación oficial de bloqueo a la TV, móviles y demás pantallas
          roomSync.broadcast({
            type: 'BUZZER_LOCKED',
            payload: press,
          });
        }
      } else if (event.type === 'BUZZER_LOCKED') {
        const lockedPayload = event.payload;
        lockRef.current = true;
        setIsLocked(true);
        setWinner(lockedPayload);

        // Si somos oyentes / visualizadores (TV o jugador), reproducir feedback sonoro
        if (!isArbitrator) {
          soundFX.playBuzzer();
        }
      } else if (event.type === 'BUZZER_RESET') {
        lockRef.current = false;
        setIsLocked(false);
        setWinner(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomSync, isArbitrator, roomCode]);

  // Función para pulsar el buzzer (usada por los mandos móviles de los jugadores)
  const pressBuzzer = useCallback(
    async (payload: BuzzerPressPayload) => {
      if (lockRef.current) return false;

      // Haptic inmediato en móvil
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([120, 40, 120]);
      }

      // Emisión multi-transporte (Vite WebSocket Relay + BroadcastChannel + Supabase)
      roomSync.broadcast({
        type: 'BUZZER_PRESS',
        payload,
      });

      return true;
    },
    [roomSync]
  );

  // Función para resetear el buzzer (usada por el anfitrión o TV tras responder)
  const resetBuzzer = useCallback(async () => {
    lockRef.current = false;
    setIsLocked(false);
    setWinner(null);

    roomSync.broadcast({
      type: 'BUZZER_RESET',
    });
  }, [roomSync]);

  return {
    winner,
    isLocked,
    pressBuzzer,
    resetBuzzer,
  };
}

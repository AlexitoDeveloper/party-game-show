import { useEffect, useState, useCallback, useRef } from 'react';
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
  const processedTs = useRef<Set<number | string>>(new Set());

  const toggleLiteMode = useCallback((val?: boolean) => {
    setLiteModeState((prev) => {
      const next = typeof val === 'boolean' ? val : !prev;
      setTvLiteMode(next);
      return next;
    });
  }, []);

  const handleRedirect = useCallback(
    (payload: { roomCode?: string; tvPin?: string; liteMode?: boolean; ts?: number }) => {
      if (!payload?.roomCode) return;
      const targetRoom = payload.roomCode.toUpperCase().trim();
      const targetPin = payload.tvPin?.trim();
      const targetLite = payload.liteMode;
      const ts = payload.ts;

      if (ts) {
        if (processedTs.current.has(ts)) return;
        processedTs.current.add(ts);
        if (processedTs.current.size > 100) {
          const first = Array.from(processedTs.current)[0];
          processedTs.current.delete(first);
        }
      }

      const matchesPin = targetPin ? targetPin === tvPin : isReceiverPage || !roomCode;
      if (!matchesPin) return;

      if (typeof targetLite === 'boolean') {
        toggleLiteMode(targetLite);
      }

      // Enviar ACK por HTTP a ntfy.sh y por RoomSync
      const ackPayload = { type: 'TV_PAIR_ACK', tvPin, roomCode: targetRoom, ts: Date.now() };
      try {
        fetch(`https://ntfy.sh/pgs_tv_ack_${targetRoom}`, {
          method: 'POST',
          body: JSON.stringify(ackPayload),
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        }).catch(() => {});
      } catch {}

      try {
        getRoomSync(`TV_${tvPin}`, 'tv').emit({ type: 'TV_PAIR_ACK', payload: { tvPin, roomCode: targetRoom } });
        getRoomSync(targetRoom, 'tv').emit({ type: 'TV_PAIR_ACK', payload: { tvPin, roomCode: targetRoom } });
      } catch {}

      setLastPairedRoom(targetRoom);
      if (targetRoom !== roomCode) {
        navigate(`/room/${targetRoom}/tv`);
      }
    },
    [tvPin, isReceiverPage, roomCode, navigate, toggleLiteMode]
  );

  const handleRoomSyncEvent = useCallback(
    (event: RoomSyncEvent) => {
      if (event.type === 'TV_PAIR_REDIRECT') {
        handleRedirect(event.payload);
      } else if (event.type === 'TV_SET_LITE_MODE') {
        toggleLiteMode(event.payload.enabled);
      }
    },
    [handleRedirect, toggleLiteMode]
  );

  // 1. WebSockets en tiempo real vía ntfy.sh
  useEffect(() => {
    let active = true;
    const sockets: WebSocket[] = [];

    const connectWs = (topic: string) => {
      try {
        const ws = new WebSocket(`wss://ntfy.sh/${topic}/ws`);
        sockets.push(ws);
        ws.onmessage = (ev) => {
          if (!active) return;
          try {
            const data = JSON.parse(ev.data);
            if (data.event === 'message' && data.message) {
              const parsed = JSON.parse(data.message);
              if (parsed.type === 'TV_PAIR_REDIRECT' || parsed.roomCode) {
                handleRedirect(parsed);
              } else if (parsed.type === 'TV_SET_LITE_MODE' && typeof parsed.enabled === 'boolean') {
                toggleLiteMode(parsed.enabled);
              }
            }
          } catch {}
        };
      } catch {}
    };

    connectWs(`pgs_tv_pin_${tvPin}`);
    if (isReceiverPage || !roomCode) {
      connectWs('pgs_tv_discovery_global');
    }
    if (roomCode) {
      connectWs(`pgs_room_sync_${roomCode}`);
    }

    return () => {
      active = false;
      sockets.forEach((s) => {
        try { s.close(); } catch {}
      });
    };
  }, [tvPin, isReceiverPage, roomCode, handleRedirect, toggleLiteMode]);

  // 2. Sondeo HTTP periódico (polling cada 2s) en /tv o sin sala activa
  useEffect(() => {
    if (!isReceiverPage && roomCode) return;
    let cancelled = false;

    const poll = async () => {
      // ntfy poll
      try {
        const res = await fetch(`https://ntfy.sh/pgs_tv_pin_${tvPin}/json?poll=1&since=30s`);
        if (res.ok && !cancelled) {
          const text = await res.text();
          text.trim().split('\n').forEach((line) => {
            if (!line) return;
            try {
              const item = JSON.parse(line);
              if (item.event === 'message' && item.message) {
                const parsed = JSON.parse(item.message);
                if (parsed.roomCode) handleRedirect(parsed);
              }
            } catch {}
          });
        }
      } catch {}

      // /api/tv-pair poll
      try {
        const res = await fetch(`/api/tv-pair?pin=${tvPin}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          const pairing = data.pairing || (data.roomCode ? data : null);
          if (pairing?.roomCode) handleRedirect(pairing);
        }
      } catch {}
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [tvPin, isReceiverPage, roomCode, handleRedirect]);

  // 3. Suscripciones RoomSync
  useEffect(() => {
    initTvLiteMode();
    const pinSync = getRoomSync(`TV_${tvPin}`, 'tv');
    const unsubPin = pinSync.subscribe(handleRoomSyncEvent);

    let unsubDiscovery: (() => void) | undefined;
    if (isReceiverPage || !roomCode) {
      const discoverySync = getRoomSync('TV_DISCOVERY', 'tv');
      unsubDiscovery = discoverySync.subscribe(handleRoomSyncEvent);
    }

    let unsubRoom: (() => void) | undefined;
    if (roomCode) {
      const activeRoomSync = getRoomSync(roomCode, 'tv');
      unsubRoom = activeRoomSync.subscribe(handleRoomSyncEvent);
    }

    return () => {
      unsubPin();
      if (unsubDiscovery) unsubDiscovery();
      if (unsubRoom) unsubRoom();
    };
  }, [tvPin, isReceiverPage, roomCode, handleRoomSyncEvent]);

  return { tvPin, liteMode, toggleLiteMode, lastPairedRoom };
}

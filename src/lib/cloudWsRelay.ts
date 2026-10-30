export interface CloudRelayMessage {
  roomCode: string;
  senderId: string;
  eventId: string;
  event: any;
}

/**
 * Canal de sincronización en la nube vía WebSocket (ntfy.sh WSS sobre TCP puerto 443).
 * Provee transporte garantizado entre Host móvil, Smart TV y jugadores incluso si WebRTC P2P
 * o Supabase están bloqueados o inaccesibles.
 */
export class CloudWsRelay {
  private ws: WebSocket | null = null;
  private isDestroyed = false;
  private reconnectTimeout: any = null;
  private cleanCode: string;
  private instanceId: string;
  private onMessage: (msg: CloudRelayMessage) => void;

  constructor(roomCode: string, instanceId: string, onMessage: (msg: CloudRelayMessage) => void) {
    this.cleanCode = (roomCode || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    this.instanceId = instanceId;
    this.onMessage = onMessage;
    if (this.cleanCode && typeof window !== 'undefined' && typeof WebSocket !== 'undefined') {
      this.connect();
    }
  }

  private lastSentByType = new Map<string, { hash: string; ts: number }>();
  private batchQueue: CloudRelayMessage[] = [];
  private batchTimeout: any = null;

  private connect() {
    if (this.isDestroyed || !this.cleanCode) return;
    try {
      const url = `wss://ntfy.sh/pgs_room_v2_${this.cleanCode}/ws?since=25s`;
      const ws = new WebSocket(url);
      this.ws = ws;

      ws.onmessage = (ev) => {
        if (this.isDestroyed) return;
        try {
          const ntfyData = JSON.parse(ev.data);
          if (ntfyData.event === 'message' && ntfyData.message) {
            const parsed = JSON.parse(ntfyData.message);
            if (parsed && Array.isArray(parsed.batch)) {
              parsed.batch.forEach((item: CloudRelayMessage) => {
                if (item && item.eventId && item.senderId !== this.instanceId) {
                  this.onMessage(item);
                }
              });
            } else if (parsed && parsed.eventId && parsed.senderId !== this.instanceId) {
              this.onMessage(parsed);
            }
          }
        } catch {}
      };

      ws.onerror = () => {
        try { ws.close(); } catch {}
      };

      ws.onclose = () => {
        this.ws = null;
        if (!this.isDestroyed && !this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect();
          }, 2500);
        }
      };
    } catch {
      if (!this.isDestroyed && !this.reconnectTimeout) {
        this.reconnectTimeout = setTimeout(() => {
          this.reconnectTimeout = null;
          this.connect();
        }, 3000);
      }
    }
  }

  resetDeduplication(): void {
    this.lastSentByType.clear();
  }

  ensureConnected(): void {
    if (this.isDestroyed || !this.cleanCode) return;
    if (!this.ws || (this.ws.readyState !== WebSocket.OPEN && this.ws.readyState !== WebSocket.CONNECTING)) {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      this.connect();
    }
  }

  private flushBatch = () => {
    this.batchTimeout = null;
    if (this.batchQueue.length === 0 || !this.cleanCode) return;
    const items = [...this.batchQueue];
    this.batchQueue = [];
    const bodyPayload = items.length === 1 ? items[0] : { batch: items };
    try {
      fetch(`https://ntfy.sh/pgs_room_v2_${this.cleanCode}`, {
        method: 'POST',
        body: JSON.stringify(bodyPayload),
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      }).catch(() => {});
    } catch {}
  };

  send(message: CloudRelayMessage, force = false): void {
    if (!this.cleanCode || !message?.event) return;
    const evType = message.event.type;
    if (evType === 'PING' || evType === 'JUKEBOX_STATE_SYNC' || evType === 'JUKEBOX_COMMAND') return;

    if (evType === 'REQUEST_ROOM_SYNC' || evType === 'PLAYER_JOINED' || evType === 'PLAYER_UPDATED') {
      this.resetDeduplication();
    }

    const now = Date.now();
    // Deduplicar por tipo individual para no bloquear TEAMS_UPDATE ni PLAYERS_UPDATE tras ROOM_UPDATE
    if (!force && (evType === 'ROOM_UPDATE' || evType === 'TEAMS_UPDATE' || evType === 'PLAYERS_UPDATE')) {
      const payloadHash = JSON.stringify(message.event.payload);
      const prev = this.lastSentByType.get(evType);
      if (prev && prev.hash === payloadHash && now - prev.ts < 15000) {
        return;
      }
      this.lastSentByType.set(evType, { hash: payloadHash, ts: now });
    }

    // Solo agrupar en cola de 25ms los snapshots masivos (ROOM_UPDATE, TEAMS_UPDATE, PLAYERS_UPDATE, POWER_CARDS_STATE_UPDATE)
    const isSnapshotEvent =
      evType === 'ROOM_UPDATE' ||
      evType === 'TEAMS_UPDATE' ||
      evType === 'PLAYERS_UPDATE' ||
      evType === 'POWER_CARDS_STATE_UPDATE';

    if (!isSnapshotEvent) {
      try {
        fetch(`https://ntfy.sh/pgs_room_v2_${this.cleanCode}`, {
          method: 'POST',
          body: JSON.stringify(message),
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        }).catch(() => {});
      } catch {}
      return;
    }

    // Agrupar ráfagas de snapshot (ROOM_UPDATE + TEAMS_UPDATE + PLAYERS_UPDATE) en 1 solo POST cada 25ms
    this.batchQueue.push(message);
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(this.flushBatch, 25);
    }
  }

  destroy(): void {
    this.isDestroyed = true;
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
  }
}

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

  private lastSentByType = new Map<string, { hash: string; ts: number }>();
  private lastResetTs = 0;
  private rateLimitedUntil = 0;
  private batchQueue: CloudRelayMessage[] = [];
  private batchTimeout: any = null;

  constructor(roomCode: string, instanceId: string, onMessage: (msg: CloudRelayMessage) => void) {
    this.cleanCode = (roomCode || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    this.instanceId = instanceId;
    this.onMessage = onMessage;
    if (this.cleanCode && typeof window !== 'undefined' && typeof WebSocket !== 'undefined') {
      this.connect();
    }
  }

  private dispatchMessage(parsed: any) {
    if (!parsed || this.isDestroyed) return;
    if (Array.isArray(parsed.batch)) {
      parsed.batch.forEach((item: CloudRelayMessage) => {
        if (item && item.eventId && item.senderId !== this.instanceId) {
          this.onMessage(item);
        }
      });
    } else if (parsed && parsed.eventId && parsed.senderId !== this.instanceId) {
      this.onMessage(parsed);
    }
  }

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
          if (ntfyData.event === 'message') {
            if (ntfyData.attachment?.url) {
              fetch(ntfyData.attachment.url)
                .then((r) => r.json())
                .then((data) => this.dispatchMessage(data))
                .catch(() => {});
              return;
            }
            if (ntfyData.message) {
              if (
                typeof ntfyData.message === 'string' &&
                ntfyData.message.startsWith('You received a file:')
              ) {
                return;
              }
              const parsed = JSON.parse(ntfyData.message);
              this.dispatchMessage(parsed);
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
    const now = Date.now();
    if (now - this.lastResetTs > 2500) {
      this.lastResetTs = now;
      this.lastSentByType.clear();
    }
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

  private postToNtfy(bodyPayload: any): void {
    if (this.isDestroyed || !this.cleanCode) return;
    if (Date.now() < this.rateLimitedUntil) return;
    try {
      fetch(`https://ntfy.sh/pgs_room_v2_${this.cleanCode}`, {
        method: 'POST',
        body: JSON.stringify(bodyPayload),
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      })
        .then((res) => {
          if (res.status === 429) {
            this.rateLimitedUntil = Date.now() + 8000;
          }
        })
        .catch(() => {});
    } catch {}
  }

  private flushBatch = () => {
    this.batchTimeout = null;
    if (this.batchQueue.length === 0 || !this.cleanCode) return;
    const items = [...this.batchQueue];
    this.batchQueue = [];

    // Chunk items into batches where JSON.stringify(bodyPayload).length <= 3200
    const chunks: (CloudRelayMessage | { batch: CloudRelayMessage[] })[] = [];
    let currentBatch: CloudRelayMessage[] = [];

    for (const item of items) {
      const testBatch = [...currentBatch, item];
      const testPayload = testBatch.length === 1 ? testBatch[0] : { batch: testBatch };
      if (JSON.stringify(testPayload).length > 3200 && currentBatch.length > 0) {
        chunks.push(currentBatch.length === 1 ? currentBatch[0] : { batch: currentBatch });
        currentBatch = [item];
      } else {
        currentBatch = testBatch;
      }
    }
    if (currentBatch.length > 0) {
      chunks.push(currentBatch.length === 1 ? currentBatch[0] : { batch: currentBatch });
    }

    for (const chunkPayload of chunks) {
      this.postToNtfy(chunkPayload);
    }
  };

  private sanitizeMessage(message: CloudRelayMessage): CloudRelayMessage {
    if (message?.event?.type === 'POWER_CARDS_STATE_UPDATE' && message.event.payload?.deck) {
      const { deck, ...restPayload } = message.event.payload;
      return {
        ...message,
        event: {
          ...message.event,
          payload: {
            ...restPayload,
            deck: [], // Omit deck for ntfy relay to prevent >4KB attachment overflow
          },
        },
      };
    }
    return message;
  }

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

    const sanitizedMsg = this.sanitizeMessage(message);

    // Solo agrupar en cola de 90ms los snapshots masivos (ROOM_UPDATE, TEAMS_UPDATE, PLAYERS_UPDATE, POWER_CARDS_STATE_UPDATE)
    const isSnapshotEvent =
      evType === 'ROOM_UPDATE' ||
      evType === 'TEAMS_UPDATE' ||
      evType === 'PLAYERS_UPDATE' ||
      evType === 'POWER_CARDS_STATE_UPDATE';

    if (!isSnapshotEvent) {
      this.postToNtfy(sanitizedMsg);
      return;
    }

    // Agrupar ráfagas de snapshot en batches de 90ms
    this.batchQueue.push(sanitizedMsg);
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(this.flushBatch, 90);
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

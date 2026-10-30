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

  private connect() {
    if (this.isDestroyed || !this.cleanCode) return;
    try {
      const url = `wss://ntfy.sh/pgs_room_v2_${this.cleanCode}/ws`;
      const ws = new WebSocket(url);
      this.ws = ws;

      ws.onmessage = (ev) => {
        if (this.isDestroyed) return;
        try {
          const ntfyData = JSON.parse(ev.data);
          if (ntfyData.event === 'message' && ntfyData.message) {
            const parsed = JSON.parse(ntfyData.message);
            if (parsed && parsed.eventId && parsed.senderId !== this.instanceId) {
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

  send(message: CloudRelayMessage): void {
    if (!this.cleanCode) return;
    try {
      fetch(`https://ntfy.sh/pgs_room_v2_${this.cleanCode}`, {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      }).catch(() => {});
    } catch {}
  }

  destroy(): void {
    this.isDestroyed = true;
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

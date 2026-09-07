import { supabase, isSupabaseConfigured } from './supabase';
import { Room, Team, Player, MinigameType, RoomStatus, BuzzerPressPayload, CaptainGamble, CaptainDuelState, TeamRepresentative } from './types';
import { MovieItem } from './moviesData';
import { PowerCardsState, PowerCard } from './powerCards';
import { BabyPhotoItem } from './babyPhotosData';
import { SongTrack } from './musicData';

export type RoomRole = 'host' | 'tv' | 'player';

export type RoomSyncEvent =
  | { type: 'ROOM_UPDATE'; payload: Partial<Room> }
  | { type: 'TEAMS_UPDATE'; payload: Team[] }
  | { type: 'PLAYERS_UPDATE'; payload: Player[] }
  | { type: 'PLAYER_JOINED'; payload: Player }
  | { type: 'PLAYER_UPDATED'; payload: Player }
  | { type: 'REQUEST_PLAYERS_SYNC' }
  | { type: 'REQUEST_ROOM_SYNC' }
  | { type: 'SWITCH_GAME'; payload: { status: RoomStatus; current_game: MinigameType; game_id?: string } }
  | { type: 'RETURN_TO_LOBBY' }
  | { type: 'BUZZER_PRESS'; payload: BuzzerPressPayload }
  | { type: 'BUZZER_LOCKED'; payload: BuzzerPressPayload }
  | { type: 'BUZZER_RESET' }
  | { type: 'MUSIC_STATE_UPDATE'; payload: { trackIndex: number; isPlaying: boolean; isRevealed: boolean; category?: string; trackData?: SongTrack } }
  | { type: 'MOVIE_STATE_UPDATE'; payload: { movieIndex: number; frameLevel: 1 | 2 | 3 | 4; isRevealed: boolean; categoryFilter?: string; movieData?: MovieItem } }
  | { type: 'POWER_CARDS_STATE_UPDATE'; payload: PowerCardsState }
  | { type: 'POWER_CARD_ANIMATION'; payload: { type: 'deal' | 'play'; teamName: string; card: PowerCard; targetName?: string; teamId?: string; teamColorHex?: string; teamThemeIndex?: number; sensoryLimitation?: string; recoveredCard?: PowerCard } }
  | { type: 'DISMISS_POWER_CARD_ANIMATION' }
  | {
      type: 'POWER_CARD_PLAY_REQUEST';
      payload: {
        sourceTeamId: string;
        sourceTeamName: string;
        cardId: string;
        targetTeamId?: string;
        targetTeamName?: string;
        targetPlayerName?: string;
        targetCardId?: string;
      };
    }
  | { type: 'BABY_PHOTO_UPDATE'; payload: { photoIndex: number; isRevealed: boolean; photoData?: BabyPhotoItem } }
  | { type: 'SET_CAPTAIN'; payload: { teamId: string; playerId: string } }
  | { type: 'CAPTAIN_DOUBLE_OR_NOTHING'; payload: CaptainGamble }
  | { type: 'CAPTAIN_DUEL_STATE'; payload: CaptainDuelState }
  | { type: 'CAPTAIN_REPRESENTATIVE'; payload: TeamRepresentative }
  | { type: 'PLAY_SOUND'; payload: { sound: string } }
  | { type: 'LAUNCH_TIMER'; payload: { seconds: number } }
  | { type: 'CLEAR_CAPTAIN_GAMBLES'; payload?: { teamId?: string } }
  | { type: 'TRIGGER_CONFETTI'; payload?: { teamId?: string | number } }
  | { type: 'PING' };

interface RelayMessage {
  roomCode: string;
  senderId: string;
  eventId: string;
  event: RoomSyncEvent;
}

// Configuración de servidores STUN de Google y TURN de respaldo para atravesar NAT y redes móviles (4G/5G/Wi-Fi)
const PEER_CONFIG = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:openrelay.metered.ca:80' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
  },
};

// Instancias compartidas por código de sala para evitar conexiones duplicadas en la misma pestaña
const SHARED_INSTANCES = new Map<string, RoomSync>();

export function getRoomSync(roomCode: string, role: RoomRole = 'player'): RoomSync {
  const code = (roomCode || '').toUpperCase().trim();
  const key = `${code}_${role}`;
  const existing = SHARED_INSTANCES.get(key);
  if (existing && !existing.getIsDestroyed()) {
    return existing;
  }
  const newInstance = new RoomSync(code, role);
  SHARED_INSTANCES.set(key, newInstance);
  return newInstance;
}

export class RoomSync {
  private roomCode: string;
  private role: RoomRole;
  private instanceId: string;
  private localChannel: BroadcastChannel | null = null;
  private supabaseChannel: ReturnType<typeof supabase.channel> | null = null;
  private listeners: ((event: RoomSyncEvent) => void)[] = [];
  private processedEventIds = new Set<string>();

  // WebRTC PeerJS Relay
  private peer: any = null;
  private hubConn: any = null;
  private clientConns: any[] = [];
  private isHub = false;
  private pendingQueue: RelayMessage[] = [];
  private heartbeatInterval: any = null;
  private reconnectTimeout: any = null;
  private connectTimeout: any = null;
  private isDestroyed = false;

  constructor(roomCode: string, role: RoomRole = 'player') {
    this.roomCode = (roomCode || '').toUpperCase().trim();
    this.role = role;
    this.instanceId = 'inst_' + Math.random().toString(36).substring(2, 10);

    // 1. Canal nativo del navegador (pestañas locales en el mismo dispositivo)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.localChannel = new BroadcastChannel(`party-sync-${this.roomCode}`);
      this.localChannel.onmessage = (ev) => {
        if (ev.data && ev.data.eventId) {
          const msg = ev.data as RelayMessage;
          if (msg.senderId !== this.instanceId) {
            this.handleIncoming(msg.eventId, msg.event);
          }
        }
      };
    }

    // 2. Relé WebSocket local de Vite (conecta móviles y PC en la misma red Wi-Fi sin internet)
    if (import.meta.hot) {
      import.meta.hot.on('party-event', (data: any) => {
        const msg = data as RelayMessage;
        if (msg && msg.roomCode === this.roomCode && msg.senderId !== this.instanceId) {
          this.handleIncoming(msg.eventId, msg.event);
        }
      });
    }

    // 3. Canal Supabase Realtime (cuando se configuran credenciales en la nube)
    if (isSupabaseConfigured) {
      try {
        this.supabaseChannel = supabase.channel(`room-state-sync:${this.roomCode}`);
        this.supabaseChannel
          .on('broadcast', { event: 'STATE_EVENT' }, ({ payload }) => {
            const msg = payload as RelayMessage;
            if (msg && msg.senderId !== this.instanceId) {
              this.handleIncoming(msg.eventId, msg.event);
            }
          })
          .subscribe();
      } catch (err) {
        console.warn('Error inicializando canal de Supabase:', err);
      }
    }

    // 4. Canal WebRTC PeerJS P2P (Multi-dispositivo en la nube para Vercel)
    if (typeof window !== 'undefined') {
      this.initPeerRelay();
    }
  }

  private initPeerRelay() {
    if (this.isDestroyed || !this.roomCode) return;

    try {
      import('peerjs').then(({ Peer }) => {
        if (this.isDestroyed) return;

        const cleanCode = this.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '');
        const hubId = `pgs-${cleanCode}-hub`;

        // Los jugadores son clientes puros: van directos al HUB sin perder tiempo intentando crearlo
        if (this.role === 'player') {
          this.connectAsClient(Peer, hubId);
          return;
        }

        // Host o TV: Intentan registrarse como HUB central de la sala
        const tryHub = new Peer(hubId, PEER_CONFIG);

        tryHub.on('open', () => {
          if (this.isDestroyed) {
            tryHub.destroy();
            return;
          }
          this.peer = tryHub;
          this.isHub = true;
          console.log('[RoomSync] Registrado como HUB principal de la sala:', hubId);

          // Escuchar conexiones de jugadores y TVs
          tryHub.on('connection', (conn: any) => {
            conn.on('open', () => {
              console.log('[RoomSync] Nuevo dispositivo conectado al HUB:', conn.peer);
              this.clientConns.push(conn);

              // Pedir inmediatamente la identidad al jugador recién conectado
              try {
                conn.send({
                  roomCode: this.roomCode,
                  senderId: this.instanceId,
                  eventId: 'ev_req_sync_' + Date.now(),
                  event: { type: 'REQUEST_PLAYERS_SYNC' },
                });
              } catch {}

              // Notificar al host para que emita el estado actual de la sala
              this.notifyListeners({ type: 'REQUEST_PLAYERS_SYNC' });
              this.flushPendingQueue();
            });

            conn.on('data', (data: any) => {
              if (data && data.eventId) {
                const msg = data as RelayMessage;
                if (msg.senderId !== this.instanceId) {
                  this.handleIncoming(msg.eventId, msg.event);
                  // El hub retransmite a los demás clientes conectados
                  this.clientConns.forEach((c) => {
                    if (c !== conn && c.open) {
                      try { c.send(msg); } catch {}
                    }
                  });
                }
              }
            });

            conn.on('close', () => {
              this.clientConns = this.clientConns.filter((c) => c !== conn);
            });

            conn.on('error', () => {
              this.clientConns = this.clientConns.filter((c) => c !== conn);
            });
          });

          this.startHeartbeat();
        });

        tryHub.on('error', (err: any) => {
          // Si el ID de HUB ya está ocupado (ej. la TV o el Host ya lo crearon), conectarse como cliente
          if (err?.type === 'unavailable-id') {
            console.log('[RoomSync] HUB ya activo por otro dispositivo, conectando como cliente...');
            tryHub.destroy();
            this.connectAsClient(Peer, hubId);
          } else {
            console.warn('[RoomSync] Error de tryHub:', err?.type || err);
          }
        });
      }).catch((e) => console.warn('PeerJS relay import error:', e));
    } catch (e) {
      console.warn('PeerJS relay error:', e);
    }
  }

  private connectAsClient(PeerClass: any, hubId: string) {
    if (this.isDestroyed) return;

    try {
      const clientPeer = new PeerClass(PEER_CONFIG);
      this.peer = clientPeer;
      this.isHub = false;

      clientPeer.on('open', () => {
        if (this.isDestroyed) {
          clientPeer.destroy();
          return;
        }

        const conn = clientPeer.connect(hubId, { reliable: true });
        this.hubConn = conn;

        if (this.connectTimeout) clearTimeout(this.connectTimeout);
        this.connectTimeout = setTimeout(() => {
          if (!this.isDestroyed && (!this.hubConn || !this.hubConn.open)) {
            console.warn('[RoomSync] Timeout esperando DataConnection con HUB, reintentando...');
            this.scheduleReconnect(PeerClass, hubId);
          }
        }, 6000);

        conn.on('open', () => {
          if (this.connectTimeout) clearTimeout(this.connectTimeout);
          console.log('[RoomSync] P2P conectado con HUB exitosamente:', hubId);
          // Conexión P2P activa: vaciar cola de mensajes pendientes
          this.flushPendingQueue();

          // Solicitar sincronización inicial de la sala
          try {
            conn.send({
              roomCode: this.roomCode,
              senderId: this.instanceId,
              eventId: 'ev_req_room_' + Date.now(),
              event: { type: 'REQUEST_ROOM_SYNC' },
            });
          } catch {}

          // Notificar localmente para re-enviar datos del jugador guardado si existe
          this.notifyListeners({ type: 'REQUEST_PLAYERS_SYNC' });
        });

        conn.on('data', (data: any) => {
          if (data && data.eventId) {
            const msg = data as RelayMessage;
            if (msg.senderId !== this.instanceId) {
              this.handleIncoming(msg.eventId, msg.event);
            }
          }
        });

        conn.on('close', () => {
          this.hubConn = null;
          this.scheduleReconnect(PeerClass, hubId);
        });

        conn.on('error', () => {
          this.hubConn = null;
          this.scheduleReconnect(PeerClass, hubId);
        });
      });

      clientPeer.on('error', (err: any) => {
        console.warn('[RoomSync] Error en clientPeer:', err?.type || err);
        this.scheduleReconnect(PeerClass, hubId);
      });

      this.startHeartbeat();
    } catch {}
  }

  private scheduleReconnect(PeerClass: any, hubId: string) {
    if (this.isDestroyed || this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (!this.isDestroyed && (!this.hubConn || !this.hubConn.open)) {
        if (this.hubConn) {
          try { this.hubConn.close(); } catch {}
          this.hubConn = null;
        }
        if (this.peer) {
          try { this.peer.destroy(); } catch {}
          this.peer = null;
        }
        this.connectAsClient(PeerClass, hubId);
      }
    }, 2000);
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    // Ping ligero cada 4 segundos para evitar desconexiones por suspensión en móviles
    this.heartbeatInterval = setInterval(() => {
      if (this.isDestroyed) return;
      if (this.hubConn && this.hubConn.open) {
        try {
          this.hubConn.send({
            roomCode: this.roomCode,
            senderId: this.instanceId,
            eventId: 'ping_' + Date.now(),
            event: { type: 'PING' },
          });
        } catch {}
      } else if (this.isHub && this.clientConns.length > 0) {
        this.clientConns.forEach((c) => {
          if (c.open) {
            try {
              c.send({
                roomCode: this.roomCode,
                senderId: this.instanceId,
                eventId: 'ping_' + Date.now(),
                event: { type: 'PING' },
              });
            } catch {}
          }
        });
      }
    }, 4000);
  }

  private flushPendingQueue() {
    if (this.pendingQueue.length === 0) return;

    if (this.isHub) {
      this.clientConns.forEach((c) => {
        if (c.open) {
          this.pendingQueue.forEach((msg) => {
            try { c.send(msg); } catch {}
          });
        }
      });
      this.pendingQueue = [];
    } else if (this.hubConn && this.hubConn.open) {
      this.pendingQueue.forEach((msg) => {
        try { this.hubConn.send(msg); } catch {}
      });
      this.pendingQueue = [];
    }
  }

  onEvent(callback: (event: RoomSyncEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private handleIncoming(eventId: string, event: RoomSyncEvent) {
    if (event.type === 'PING') return; // Ignorar pings de latido

    if (this.processedEventIds.has(eventId)) return;
    this.processedEventIds.add(eventId);

    if (this.processedEventIds.size > 300) {
      const first = Array.from(this.processedEventIds)[0];
      this.processedEventIds.delete(first);
    }

    this.notifyListeners(event);
  }

  private notifyListeners(event: RoomSyncEvent) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error('Error en callback de sincronización:', err);
      }
    });
  }

  broadcast(event: RoomSyncEvent) {
    const eventId = 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    this.processedEventIds.add(eventId);

    const message: RelayMessage = {
      roomCode: this.roomCode,
      senderId: this.instanceId,
      eventId,
      event,
    };

    // 1. Enviar por relé de Vite (móviles en Wi-Fi)
    if (import.meta.hot) {
      try {
        import.meta.hot.send('party-event', message);
      } catch {}
    }

    // 2. Enviar por BroadcastChannel (pestañas locales)
    if (this.localChannel) {
      try {
        this.localChannel.postMessage(message);
      } catch {}
    }

    // 3. Enviar por Supabase Realtime si está activo
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'STATE_EVENT',
          payload: message,
        });
      } catch {}
    }

    // 4. Enviar por PeerJS WebRTC P2P (Vercel)
    if (this.isHub) {
      let sentCount = 0;
      this.clientConns.forEach((c) => {
        if (c.open) {
          try {
            c.send(message);
            sentCount++;
          } catch {}
        }
      });
      // Si no hay clientes todavía pero es un evento clave, guardar para emitir cuando conecten
      if (sentCount === 0 && (event.type === 'ROOM_UPDATE' || event.type === 'TEAMS_UPDATE' || event.type === 'SWITCH_GAME')) {
        this.pendingQueue.push(message);
      }
    } else if (this.hubConn && this.hubConn.open) {
      try {
        this.hubConn.send(message);
      } catch {
        this.pendingQueue.push(message);
      }
    } else {
      // Conexión aún no lista: encolar para emitir inmediatamente al abrirse
      this.pendingQueue.push(message);
    }

    // 5. Notificar a oyentes locales
    this.notifyListeners(event);
  }

  getIsDestroyed(): boolean {
    return this.isDestroyed;
  }

  destroy() {
    this.isDestroyed = true;
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.connectTimeout) clearTimeout(this.connectTimeout);

    const key = `${this.roomCode}_${this.role}`;
    if (SHARED_INSTANCES.get(key) === this) {
      SHARED_INSTANCES.delete(key);
    }

    if (this.localChannel) {
      this.localChannel.close();
      this.localChannel = null;
    }
    if (this.supabaseChannel) {
      supabase.removeChannel(this.supabaseChannel);
      this.supabaseChannel = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch {}
      this.peer = null;
    }
    this.clientConns = [];
    this.hubConn = null;
    this.listeners = [];
  }
}

import { supabase, isSupabaseConfigured } from './supabase';
import { Room, Team, Player, MinigameType, RoomStatus, BuzzerPressPayload, CaptainGamble, CaptainDuelState, TeamRepresentative } from './types';
import { MovieItem } from './moviesData';
import { PowerCardsState, PowerCard } from './powerCards';
import { BabyPhotoItem } from './babyPhotosData';
import { SongTrack } from './musicData';

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
  | { type: 'POWER_CARD_PLAY_REQUEST'; payload: { sourceTeamId: string; sourceTeamName: string; cardId: string; targetTeamId?: string; targetTeamName?: string; targetPlayerName?: string; targetCardId?: string } }
  | { type: 'POWER_CARD_ANIMATION'; payload: { type: 'deal' | 'play'; teamName: string; card: PowerCard; targetName?: string } }
  | { type: 'BABY_PHOTO_UPDATE'; payload: { photoIndex: number; isRevealed: boolean; photoData?: BabyPhotoItem } }
  | { type: 'SET_CAPTAIN'; payload: { teamId: string; playerId: string } }
  | { type: 'CAPTAIN_DOUBLE_OR_NOTHING'; payload: CaptainGamble }
  | { type: 'CAPTAIN_DUEL_STATE'; payload: CaptainDuelState }
  | { type: 'CAPTAIN_REPRESENTATIVE'; payload: TeamRepresentative }
  | { type: 'PLAY_SOUND'; payload: { sound: string } }
  | { type: 'LAUNCH_TIMER'; payload: { seconds: number } }
  | { type: 'CLEAR_CAPTAIN_GAMBLES'; payload?: { teamId?: string } }
  | { type: 'TRIGGER_CONFETTI'; payload?: { teamId?: string | number } };

interface RelayMessage {
  roomCode: string;
  senderId: string;
  eventId: string;
  event: RoomSyncEvent;
}

export class RoomSync {
  private roomCode: string;
  private instanceId: string;
  private localChannel: BroadcastChannel | null = null;
  private supabaseChannel: ReturnType<typeof supabase.channel> | null = null;
  private listeners: ((event: RoomSyncEvent) => void)[] = [];
  private processedEventIds = new Set<string>();

  constructor(roomCode: string) {
    this.roomCode = roomCode.toUpperCase();
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

    // 4. Canal WebRTC PeerJS (P2P directo en la nube para Vercel sin necesidad de configurar base de datos)
    if (typeof window !== 'undefined' && !isSupabaseConfigured) {
      this.initPeerRelay();
    }
  }

  private peer: any = null;
  private hubConn: any = null;
  private clientConns: any[] = [];
  private isHub = false;

  private initPeerRelay() {
    try {
      import('peerjs').then(({ Peer }) => {
        const hubId = `pgs-${this.roomCode.toLowerCase()}-hub`;

        // Intentar registrarse como HUB central de la sala
        const tryHub = new Peer(hubId);

        tryHub.on('open', () => {
          this.peer = tryHub;
          this.isHub = true;

          tryHub.on('connection', (conn: any) => {
            this.clientConns.push(conn);
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
          });
        });

        tryHub.on('error', (err: any) => {
          // Si el ID de HUB ya está ocupado (unavailable-id), conectarse como cliente al HUB
          if (err.type === 'unavailable-id') {
            tryHub.destroy();
            const clientPeer = new Peer();
            this.peer = clientPeer;
            this.isHub = false;

            clientPeer.on('open', () => {
              const conn = clientPeer.connect(hubId, { reliable: true });
              this.hubConn = conn;

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
              });
            });
          }
        });
      }).catch((e) => console.warn('PeerJS relay error:', e));
    } catch {}
  }

  onEvent(callback: (event: RoomSyncEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private handleIncoming(eventId: string, event: RoomSyncEvent) {
    if (this.processedEventIds.has(eventId)) return;
    this.processedEventIds.add(eventId);

    // Mantener la memoria de eventos pequeña
    if (this.processedEventIds.size > 200) {
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
        console.error('Error en listener de sincronización:', err);
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

    // 4. Enviar por PeerJS WebRTC P2P si está activo
    if (this.isHub) {
      this.clientConns.forEach((c) => {
        if (c.open) {
          try { c.send(message); } catch {}
        }
      });
    } else if (this.hubConn && this.hubConn.open) {
      try { this.hubConn.send(message); } catch {}
    }

    // 5. Notificar a oyentes locales
    this.notifyListeners(event);
  }

  destroy() {
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
    this.listeners = [];
  }
}

import { supabase, isSupabaseRealtimeConfigured } from './supabase';
import { Room, Team, Player, MinigameType, RoomStatus, BuzzerPressPayload, CaptainGamble, CaptainDuelState, TeamRepresentative, BingoClaimPayload, GamePhase } from './types';
import { MovieItem } from './moviesData';
import { PowerCardsState, PowerCard } from './powerCards';
import { BabyPhotoItem } from './babyPhotosData';
import { SongTrack } from './musicData';

import { TriviaQuestion } from './triviaData';
import { UnDosTresChallenge } from './unDosTresData';
import { JukeboxState } from './audio';
import { CloudWsRelay } from './cloudWsRelay';

export type RoomRole = 'host' | 'tv' | 'player';

export type RoomSyncEvent =
  | { type: 'ROOM_UPDATE'; payload: Partial<Room> }
  | { type: 'TEAMS_UPDATE'; payload: Team[] }
  | { type: 'PLAYERS_UPDATE'; payload: Player[] }
  | { type: 'PLAYERS_CLEAR' }
  | { type: 'PLAYER_JOINED'; payload: Player }
  | { type: 'PLAYER_UPDATED'; payload: Player }
  | { type: 'REQUEST_PLAYERS_SYNC' }
  | { type: 'REQUEST_ROOM_SYNC' }
  | { type: 'SWITCH_GAME'; payload: { status: RoomStatus; current_game: MinigameType; game_id?: string; game_phase?: GamePhase } }
  | { type: 'GAME_PHASE_UPDATE'; payload: { phase: GamePhase; game_id?: string } }
  | { type: 'RETURN_TO_LOBBY' }
  | { type: 'BUZZER_PRESS'; payload: BuzzerPressPayload }
  | { type: 'BUZZER_LOCKED'; payload: BuzzerPressPayload }
  | { type: 'BUZZER_RESET' }
  | { type: 'MUSIC_STATE_UPDATE'; payload: { trackIndex: number; isPlaying: boolean; isRevealed: boolean; category?: string; trackData?: SongTrack } }
  | { type: 'MOVIE_STATE_UPDATE'; payload: { movieIndex: number; frameLevel: 1 | 2 | 3 | 4; isRevealed: boolean; categoryFilter?: string; movieData?: MovieItem } }
  | { type: 'TRIVIA_STATE_UPDATE'; payload: { questionIndex: number; isRevealed: boolean; isReboundActive: boolean; questionData?: TriviaQuestion } }
  | { type: 'UN_DOS_TRES_STATE'; payload: { promptIndex: number; activeTeamId?: string; eliminatedTeamIds: string[]; countdownSeconds: number | null; isTimerRunning: boolean; challengeData?: UnDosTresChallenge } }
  | {
      type: 'BINGO_STATE_UPDATE';
      payload: {
        currentBall: number | null;
        drawnBalls: number[];
        isSpinning?: boolean;
        lineAwarded?: boolean;
        bingoAwarded?: boolean;
        lineWinner?: { playerName: string; teamName: string } | null;
        bingoWinner?: { playerName: string; teamName: string } | null;
      };
    }
  | { type: 'BINGO_CLAIM'; payload: BingoClaimPayload }
  | {
      type: 'BINGO_CLAIM_RESOLVE';
      payload: {
        claimType: 'line' | 'bingo';
        accepted: boolean;
        teamId: string;
        deltaPoints?: number;
        winnerName?: string;
        teamName?: string;
      };
    }
  | { type: 'MIMICA_STATE_UPDATE'; payload: { activeTeamId?: string; hitsCount: number; timerSeconds: number | null; isRunning: boolean } }
  | { type: 'ROUND_HITS_UPDATE'; payload: { roundHits: Record<string, number>; gameId?: string | null } }
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
  | { type: 'BABY_PHOTO_UPDATE'; payload: { photoIndex: number; isRevealed: boolean; photoData?: BabyPhotoItem; totalPhotos?: number } }
  | { type: 'SET_CAPTAIN'; payload: { teamId: string; playerId: string } }
  | { type: 'CAPTAIN_DOUBLE_OR_NOTHING'; payload: CaptainGamble }
  | { type: 'CAPTAIN_DUEL_STATE'; payload: CaptainDuelState }
  | { type: 'CAPTAIN_REPRESENTATIVE'; payload: TeamRepresentative }
  | { type: 'TEAM_REPRESENTATIVES'; payload: Record<string, TeamRepresentative> }
  | { type: 'PLAY_SOUND'; payload: { sound: string } }
  | { type: 'LAUNCH_TIMER'; payload: { seconds: number } }
  | { type: 'CLEAR_CAPTAIN_GAMBLES'; payload?: { teamId?: string } }
  | { type: 'CLEAR_TEAM_REPRESENTATIVES'; payload?: { teamId?: string } }
  | { type: 'TEST_FINISHED'; payload: { gameTitle: string; winnerTeamName?: string } }
  | {
      type: 'TEST_VERDICT_APPLIED';
      payload: {
        gameTitle: string;
        results: Array<{
          teamId: string;
          teamName: string;
          teamIndex: number;
          colorHex: string;
          rank: number;
          hits: number;
          basePoints: number;
          cardImpacts: Array<{
            cardId: string;
            cardName: string;
            cardEmoji: string;
            delta: number;
            explanation: string;
          }>;
          totalCardDelta: number;
          finalPoints: number;
        }>;
      };
    }
  | { type: 'PRESENTATION_SLIDE'; payload: { slide: number } }
  | { type: 'TRIGGER_CONFETTI'; payload?: { teamId?: string | number } }
  | {
      type: 'JUKEBOX_COMMAND';
      payload: {
        action: 'play' | 'pause' | 'toggle' | 'next' | 'prev' | 'volume' | 'mute';
        volume?: number;
        trackIndex?: number;
      };
    }
  | {
      type: 'JUKEBOX_STATE_SYNC';
      payload: JukeboxState;
    }
  | { type: 'PODIUM_PAGE_CHANGE'; payload: { page: 'podium' | 'medals' } }
  | { type: 'TV_PAIR_REDIRECT'; payload: { roomCode: string; tvPin?: string; liteMode?: boolean; title?: string } }
  | { type: 'TV_PAIR_ACK'; payload: { tvPin: string; roomCode: string } }
  | { type: 'TV_SET_LITE_MODE'; payload: { enabled: boolean } }
  | { type: 'SHOW_TV_QR'; payload: { isOpen: boolean } }
  | { type: 'TOGGLE_TV_QR'; payload?: { isOpen?: boolean } }
  | { type: 'PING' };

interface RelayMessage {
  roomCode: string;
  senderId: string;
  eventId: string;
  event: RoomSyncEvent;
}

export function mergePlayersList(existing: Player[] = [], incoming: Player[] = []): Player[] {
  const result: Player[] = [];
  const idIndexMap = new Map<string, number>();
  const tokenIndexMap = new Map<string, number>();

  for (const p of existing) {
    if (!p) continue;
    const idx = result.length;
    result.push({ ...p });
    if (p.id) idIndexMap.set(p.id, idx);
    if (p.session_token) tokenIndexMap.set(p.session_token, idx);
  }

  for (const inc of incoming) {
    if (!inc) continue;
    let existingIdx = -1;
    if (inc.id && idIndexMap.has(inc.id)) {
      existingIdx = idIndexMap.get(inc.id)!;
    } else if (inc.session_token && tokenIndexMap.has(inc.session_token)) {
      existingIdx = tokenIndexMap.get(inc.session_token)!;
    }

    if (existingIdx >= 0) {
      const prev = result[existingIdx];
      const merged: Player = {
        ...prev,
        ...inc,
        team_id: inc.team_id !== undefined ? inc.team_id : prev.team_id,
        team_index: inc.team_index !== undefined ? inc.team_index : prev.team_index,
      };
      result[existingIdx] = merged;
      if (merged.id) idIndexMap.set(merged.id, existingIdx);
      if (merged.session_token) tokenIndexMap.set(merged.session_token, existingIdx);
    } else {
      const idx = result.length;
      result.push({ ...inc });
      if (inc.id) idIndexMap.set(inc.id, idx);
      if (inc.session_token) tokenIndexMap.set(inc.session_token, idx);
    }
  }

  return result;
}

// Configuración de servidores STUN y TURN para atravesar NAT y redes móviles
const PEER_CONFIG = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
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
  private isSupabaseSubscribed = false;
  private pendingSupabaseQueue: RelayMessage[] = [];
  private listeners: ((event: RoomSyncEvent) => void)[] = [];
  private processedEventIds = new Set<string>();

  // Supabase Presence State Tracking
  private hostPresenceState: { role: 'host'; room?: Partial<Room>; teams?: Team[] } | null = null;
  private playerPresenceState: { role: 'player'; player?: Player } | null = null;
  private lastHostPresenceTrackTs = 0;
  private hostPresenceTrackTimeout: any = null;
  private lastSyncedPlayerHashes = new Map<string, string>();
  private lastSyncedHostRoomHash = '';
  private lastSyncedHostTeamsHash = '';

  // WebRTC PeerJS Dual-Hub Relay
  private peer: any = null;
  private secondaryPeer: any = null;
  private PeerClassRef: any = null;
  private hubConn: any = null;
  private tvConn: any = null;
  private clientConns: any[] = [];
  private isHub = false;
  private pendingQueue: RelayMessage[] = [];
  private heartbeatInterval: any = null;
  private reconnectTimeout: any = null;
  private secondaryReconnectTimeout: any = null;
  private supabaseRetryTimeout: any = null;
  private connectTimeout: any = null;
  private isDestroyed = false;
  private cloudRelay: CloudWsRelay | null = null;

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
            this.handleIncoming(msg.eventId, msg.event, true);
          }
        }
      };
    }

    // 2. Relé WebSocket local de Vite (conecta móviles y PC en la misma red Wi-Fi sin internet)
    if (import.meta.hot) {
      import.meta.hot.on('party-event', (data: any) => {
        const msg = data as RelayMessage;
        if (msg && msg.roomCode === this.roomCode && msg.senderId !== this.instanceId) {
          this.handleIncoming(msg.eventId, msg.event, true);
        }
      });
    }

    // 3. Canal Supabase Realtime (WebSockets en la nube para Vercel y datos móviles 4G/5G)
    if (isSupabaseRealtimeConfigured) {
      this.initSupabaseChannel();
    }

    // 4. Canal WebSocket Cloud Relay (ntfy.sh WSS TCP 443 para resiliencia total)
    if (typeof window !== 'undefined') {
      this.cloudRelay = new CloudWsRelay(this.roomCode, this.instanceId, (msg) => {
        this.handleIncoming(msg.eventId, msg.event);
      });
    }

    // 5. Canal WebRTC PeerJS P2P (Dual-Hub Relay)
    if (typeof window !== 'undefined') {
      this.initPeerRelay();

      // Escuchadores de reconexión móvil inmediata al desbloquear pantalla o cambiar de app (iOS Safari + Android Chrome)
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
      }
      window.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('pageshow', this.handleVisibilityChange);
      window.addEventListener('focus', this.handleVisibilityChange);
      window.addEventListener('online', this.handleVisibilityChange);
    }
  }

  private getHubIds(): { hostHubId: string; tvHubId: string } {
    const cleanCode = this.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isTvChannel = this.roomCode.startsWith('TV_');
    return {
      hostHubId: isTvChannel ? `pgs-${cleanCode}-tv` : `pgs-${cleanCode}-hub`,
      tvHubId: `pgs-${cleanCode}-tv`,
    };
  }

  private isWebRtcConnHealthy(conn: any): boolean {
    if (!conn || !conn.open) return false;
    const pc = conn.peerConnection as RTCPeerConnection | undefined;
    if (pc) {
      const ice = pc.iceConnectionState;
      const state = pc.connectionState;
      if (ice === 'failed' || ice === 'disconnected' || ice === 'closed') return false;
      if (state === 'failed' || state === 'disconnected' || state === 'closed') return false;
    }
    return true;
  }

  private handleVisibilityChange = () => {
    if (this.isDestroyed) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

    // 0. Reconectar de inmediato el WebSocket Cloud Relay tras suspensión en iOS Safari
    if (this.cloudRelay) {
      this.cloudRelay.ensureConnected();
    }

    // 1. Verificar salud de Supabase Realtime
    if (isSupabaseRealtimeConfigured && (!this.supabaseChannel || !this.isSupabaseSubscribed)) {
      this.initSupabaseChannel();
    }

    // 2. Verificar salud de PeerJS y WebRTC tras desbloqueo en iOS / Android
    const checkAndRecoverPeer = () => {
      if (this.isDestroyed) return;
      if (this.peer && !this.peer.destroyed && this.peer.disconnected) {
        try {
          this.peer.reconnect();
        } catch {}
      }
      if (this.secondaryPeer && !this.secondaryPeer.destroyed && this.secondaryPeer.disconnected) {
        try {
          this.secondaryPeer.reconnect();
        } catch {}
      }

      const { hostHubId, tvHubId } = this.getHubIds();

      if (!this.isHub) {
        if (!this.isWebRtcConnHealthy(this.hubConn) && this.PeerClassRef) {
          this.scheduleHubReconnect(this.PeerClassRef, hostHubId, 150);
        }
        if (!this.isWebRtcConnHealthy(this.tvConn) && this.PeerClassRef) {
          this.scheduleSecondaryReconnect(this.PeerClassRef, tvHubId, 150);
        }
      } else {
        if (!this.peer || this.peer.destroyed) {
          this.initPeerRelay();
        }
        if (this.role === 'host' && !this.isWebRtcConnHealthy(this.tvConn) && this.PeerClassRef) {
          this.scheduleSecondaryReconnect(this.PeerClassRef, tvHubId, 150);
        }
        if (this.role === 'tv' && !this.isWebRtcConnHealthy(this.hubConn) && this.PeerClassRef) {
          this.scheduleSecondaryReconnect(this.PeerClassRef, hostHubId, 150);
        }
      }
    };

    checkAndRecoverPeer();
    setTimeout(checkAndRecoverPeer, 750);

    // 3. Solicitar sincronización activa por red
    if (this.role === 'host') {
      this.broadcast({ type: 'REQUEST_PLAYERS_SYNC' });
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.notifyListeners({ type: 'REQUEST_ROOM_SYNC' });
        }
      }, 250);
    } else {
      this.broadcast({ type: 'REQUEST_ROOM_SYNC' });
      this.notifyListeners({ type: 'REQUEST_PLAYERS_SYNC' });
    }
  };

  private initSupabaseChannel() {
    if (!isSupabaseRealtimeConfigured || this.isDestroyed || !this.roomCode) return;
    if (this.supabaseRetryTimeout) {
      clearTimeout(this.supabaseRetryTimeout);
      this.supabaseRetryTimeout = null;
    }
    try {
      if (this.supabaseChannel) {
        try { supabase.removeChannel(this.supabaseChannel); } catch {}
        this.supabaseChannel = null;
      }
      this.isSupabaseSubscribed = false;

      const chan = supabase.channel(`room-state-sync:${this.roomCode}`, {
        config: {
          presence: {
            key: `${this.role}_${this.instanceId}`,
          },
        },
      });
      this.supabaseChannel = chan;

      chan
        .on('broadcast', { event: 'STATE_EVENT' }, ({ payload }) => {
          const msg = payload as RelayMessage;
          if (msg && msg.senderId !== this.instanceId) {
            this.handleIncoming(msg.eventId, msg.event);
          }
        })
        .on('presence', { event: 'sync' }, () => {
          this.handlePresenceSync();
        })
        .on('presence', { event: 'join' }, () => {
          this.handlePresenceSync();
        })
        .subscribe((status) => {
          if (this.isDestroyed) return;
          if (status === 'SUBSCRIBED') {
            this.isSupabaseSubscribed = true;
            this.flushPendingSupabaseQueue();

            if (this.role === 'host') {
              if (this.hostPresenceState) {
                chan.track(this.hostPresenceState).catch(() => {});
              }
              this.broadcast({ type: 'REQUEST_PLAYERS_SYNC' });
              setTimeout(() => {
                if (!this.isDestroyed) {
                  this.notifyListeners({ type: 'REQUEST_ROOM_SYNC' });
                }
              }, 250);
            } else {
              if (this.role === 'player' && this.playerPresenceState) {
                chan.track(this.playerPresenceState).catch(() => {});
              }
              this.broadcast({ type: 'REQUEST_ROOM_SYNC' });
              this.notifyListeners({ type: 'REQUEST_PLAYERS_SYNC' });
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            this.isSupabaseSubscribed = false;
            if (!this.isDestroyed && !this.supabaseRetryTimeout) {
              this.supabaseRetryTimeout = setTimeout(() => {
                this.supabaseRetryTimeout = null;
                this.initSupabaseChannel();
              }, 2500);
            }
          }
        });
    } catch (err) {
      console.warn('Error inicializando canal de Supabase:', err);
    }
  }

  private handlePresenceSync() {
    if (!this.supabaseChannel || this.isDestroyed) return;
    try {
      const presenceState = this.supabaseChannel.presenceState();
      const allPresences: any[] = [];
      Object.values(presenceState).forEach((presList: any) => {
        if (Array.isArray(presList)) {
          presList.forEach((p) => allPresences.push(p));
        }
      });

      // Extraer jugadores registrados en presencia
      for (const item of allPresences) {
        if (item?.role === 'player' && item.player && item.player.id) {
          const player = item.player as Player;
          const playerJson = JSON.stringify(player);
          const prevHash = this.lastSyncedPlayerHashes.get(player.id);
          if (prevHash !== playerJson) {
            this.lastSyncedPlayerHashes.set(player.id, playerJson);
            this.notifyListeners({ type: 'PLAYER_JOINED', payload: player });
          }
        }
      }

      // Si no somos el host, extraer el último estado emitido por el host
      if (this.role !== 'host') {
        const hostItem = allPresences.find((item) => item?.role === 'host' && (item.room || item.teams));
        if (hostItem) {
          if (hostItem.room) {
            const roomJson = JSON.stringify(hostItem.room);
            if (this.lastSyncedHostRoomHash !== roomJson) {
              this.lastSyncedHostRoomHash = roomJson;
              this.notifyListeners({ type: 'ROOM_UPDATE', payload: hostItem.room });
            }
          }
          if (hostItem.teams) {
            const teamsJson = JSON.stringify(hostItem.teams);
            if (this.lastSyncedHostTeamsHash !== teamsJson) {
              this.lastSyncedHostTeamsHash = teamsJson;
              this.notifyListeners({ type: 'TEAMS_UPDATE', payload: hostItem.teams });
            }
          }
        }
      }
    } catch (err) {
      console.warn('[RoomSync] Error sincronizando presencia de Supabase:', err);
    }
  }

  private trackHostPresenceThrottled() {
    if (!this.supabaseChannel || !this.isSupabaseSubscribed || !this.hostPresenceState || this.role !== 'host') return;
    const now = Date.now();
    if (now - this.lastHostPresenceTrackTs < 400) {
      if (!this.hostPresenceTrackTimeout) {
        this.hostPresenceTrackTimeout = setTimeout(() => {
          this.hostPresenceTrackTimeout = null;
          this.trackHostPresenceThrottled();
        }, 400 - (now - this.lastHostPresenceTrackTs));
      }
      return;
    }
    this.lastHostPresenceTrackTs = now;
    try {
      this.supabaseChannel.track(this.hostPresenceState).catch(() => {});
    } catch {}
  }

  private flushPendingSupabaseQueue() {
    if (!this.supabaseChannel || !this.isSupabaseSubscribed || this.pendingSupabaseQueue.length === 0) return;
    const toSend = [...this.pendingSupabaseQueue];
    this.pendingSupabaseQueue = [];
    toSend.forEach((msg) => {
      try {
        this.supabaseChannel?.send({
          type: 'broadcast',
          event: 'STATE_EVENT',
          payload: msg,
        });
      } catch (err) {
        console.warn('Error enviando mensaje encolado de Supabase:', err);
      }
    });
  }

  private initPeerRelay() {
    if (this.isDestroyed || !this.roomCode) return;

    try {
      import('peerjs').then(({ Peer }) => {
        if (this.isDestroyed) return;
        this.PeerClassRef = Peer;

        const { hostHubId, tvHubId } = this.getHubIds();
        const isTvChannel = this.roomCode.startsWith('TV_');

        if (isTvChannel) {
          // Canales de TV (TV_...): 'tv' es el HUB y 'host'/'player' van como clientes
          if (this.role === 'tv') {
            this.setupHubPeer(Peer, tvHubId);
          } else {
            this.connectToHubAsClient(Peer, tvHubId, 'hub');
          }
          return;
        }

        // Para salas normales: Dual-Hub Relay (host AND tv)
        if (this.role === 'host') {
          // Host registra Hub en hostHubId y conecta como cliente a tvHubId
          this.setupHubPeer(Peer, hostHubId);
          this.connectSecondaryClient(Peer, tvHubId);
        } else if (this.role === 'tv') {
          // TV registra Hub en tvHubId y conecta como cliente a hostHubId
          this.setupHubPeer(Peer, tvHubId);
          this.connectSecondaryClient(Peer, hostHubId);
        } else {
          // Player conecta a hostHubId Y a tvHubId
          this.connectPlayerClients(Peer, hostHubId, tvHubId);
        }
      }).catch((e) => console.warn('PeerJS relay import error:', e));
    } catch (e) {
      console.warn('PeerJS relay error:', e);
    }
  }

  private setupHubPeer(PeerClass: any, hubId: string) {
    if (this.isDestroyed) return;
    try {
      if (this.peer && !this.peer.destroyed) {
        try { this.peer.destroy(); } catch {}
      }

      const hubPeer = new PeerClass(hubId, PEER_CONFIG);
      this.peer = hubPeer;

      hubPeer.on('open', () => {
        if (this.isDestroyed) {
          hubPeer.destroy();
          return;
        }
        this.isHub = true;
        console.log('[RoomSync] Registrado como HUB principal de la sala:', hubId);

        hubPeer.on('connection', (conn: any) => {
          conn.on('open', () => {
            console.log('[RoomSync] Nuevo dispositivo conectado al HUB:', conn.peer);
            this.clientConns = this.clientConns.filter((c) => c !== conn && this.isWebRtcConnHealthy(c));
            this.clientConns.push(conn);

            // Solicitar jugadores de inmediato
            try {
              conn.send({
                roomCode: this.roomCode,
                senderId: this.instanceId,
                eventId: 'ev_req_sync_' + Date.now(),
                event: { type: 'REQUEST_PLAYERS_SYNC' },
              });
            } catch {}

            this.broadcast({ type: 'REQUEST_PLAYERS_SYNC' });
            this.flushPendingQueue();

            setTimeout(() => {
              if (!this.isDestroyed) {
                this.notifyListeners({ type: 'REQUEST_ROOM_SYNC' });
              }
            }, 250);
          });

          conn.on('data', (data: any) => {
            if (data && data.eventId) {
              const msg = data as RelayMessage;
              if (msg.senderId !== this.instanceId) {
                this.handleIncoming(msg.eventId, msg.event);
                // Retransmitir a los demás clientes conectados
                this.clientConns.forEach((c) => {
                  if (c !== conn && this.isWebRtcConnHealthy(c)) {
                    try { c.send(msg); } catch {}
                  }
                });
                // También enviar al conn secundario si está abierto
                const sec = this.tvConn || this.hubConn;
                if (sec && sec !== conn && this.isWebRtcConnHealthy(sec)) {
                  try { sec.send(msg); } catch {}
                }
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

      hubPeer.on('disconnected', () => {
        if (!this.isDestroyed && !hubPeer.destroyed) {
          try { hubPeer.reconnect(); } catch {}
        }
      });

      hubPeer.on('error', (err: any) => {
        if (err?.type === 'unavailable-id') {
          console.log(`[RoomSync] Hub ID ${hubId} ya en uso, reconectando como cliente...`);
          try { hubPeer.destroy(); } catch {}
          this.connectToHubAsClient(PeerClass, hubId, 'hub');
        } else {
          console.warn('[RoomSync] Error de hubPeer:', err?.type || err);
        }
      });
    } catch (e) {
      console.warn('[RoomSync] setupHubPeer error:', e);
    }
  }

  private connectSecondaryClient(PeerClass: any, targetHubId: string) {
    if (this.isDestroyed) return;
    try {
      if (this.secondaryPeer && !this.secondaryPeer.destroyed) {
        try { this.secondaryPeer.destroy(); } catch {}
      }
      const clientPeer = new PeerClass(PEER_CONFIG);
      this.secondaryPeer = clientPeer;

      clientPeer.on('open', () => {
        if (this.isDestroyed) {
          clientPeer.destroy();
          return;
        }

        const conn = clientPeer.connect(targetHubId, { reliable: true });
        if (this.role === 'host') {
          this.tvConn = conn;
        } else {
          this.hubConn = conn;
        }

        conn.on('open', () => {
          console.log('[RoomSync] Conexión puente secundaria establecida con:', targetHubId);
          this.flushPendingQueue();
          if (this.role === 'tv') {
            try {
              conn.send({
                roomCode: this.roomCode,
                senderId: this.instanceId,
                eventId: 'ev_req_room_' + Date.now(),
                event: { type: 'REQUEST_ROOM_SYNC' },
              });
            } catch {}
          }
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
          if (this.role === 'host') this.tvConn = null;
          else this.hubConn = null;
          this.scheduleSecondaryReconnect(PeerClass, targetHubId);
        });

        conn.on('error', () => {
          if (this.role === 'host') this.tvConn = null;
          else this.hubConn = null;
          this.scheduleSecondaryReconnect(PeerClass, targetHubId);
        });
      });

      clientPeer.on('error', (err: any) => {
        if (err?.type === 'peer-unavailable') {
          this.scheduleSecondaryReconnect(PeerClass, targetHubId, 3500);
        } else {
          console.warn('[RoomSync] Error en secondaryPeer:', err?.type || err);
          this.scheduleSecondaryReconnect(PeerClass, targetHubId);
        }
      });
    } catch (e) {
      console.warn('[RoomSync] connectSecondaryClient error:', e);
    }
  }

  private connectPlayerClients(PeerClass: any, hostHubId: string, tvHubId: string) {
    if (this.isDestroyed) return;
    try {
      if (this.peer && !this.peer.destroyed) {
        try { this.peer.destroy(); } catch {}
      }
      const clientPeer = new PeerClass(PEER_CONFIG);
      this.peer = clientPeer;
      this.isHub = false;

      clientPeer.on('open', () => {
        if (this.isDestroyed) {
          clientPeer.destroy();
          return;
        }

        // 1. Conexión a Host Hub
        this.setupPlayerConn(clientPeer, hostHubId, 'host');

        // 2. Conexión a TV Hub
        this.setupPlayerConn(clientPeer, tvHubId, 'tv');
      });

      clientPeer.on('disconnected', () => {
        if (!this.isDestroyed && !clientPeer.destroyed) {
          try { clientPeer.reconnect(); } catch {}
        }
      });

      clientPeer.on('error', (err: any) => {
        if (err?.type === 'peer-unavailable') {
          // Ignorar fallo puntual, el reconectador por temporizador se encarga
        } else {
          console.warn('[RoomSync] Error en clientPeer:', err?.type || err);
        }
      });

      this.startHeartbeat();
    } catch (e) {
      console.warn('[RoomSync] connectPlayerClients error:', e);
    }
  }

  private setupPlayerConn(clientPeer: any, hubId: string, type: 'host' | 'tv') {
    if (this.isDestroyed || !clientPeer || clientPeer.destroyed) return;
    try {
      const conn = clientPeer.connect(hubId, { reliable: true });
      if (type === 'host') this.hubConn = conn;
      else this.tvConn = conn;

      conn.on('open', () => {
        console.log(`[RoomSync] Jugador conectado con ${type} HUB:`, hubId);
        this.flushPendingQueue();
        try {
          conn.send({
            roomCode: this.roomCode,
            senderId: this.instanceId,
            eventId: 'ev_req_room_' + Date.now(),
            event: { type: 'REQUEST_ROOM_SYNC' },
          });
        } catch {}
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
        if (type === 'host') {
          this.hubConn = null;
          this.scheduleHubReconnect(this.PeerClassRef, hubId);
        } else {
          this.tvConn = null;
          this.scheduleSecondaryReconnect(this.PeerClassRef, hubId);
        }
      });

      conn.on('error', () => {
        if (type === 'host') {
          this.hubConn = null;
          this.scheduleHubReconnect(this.PeerClassRef, hubId);
        } else {
          this.tvConn = null;
          this.scheduleSecondaryReconnect(this.PeerClassRef, hubId);
        }
      });
    } catch {}
  }

  private connectToHubAsClient(PeerClass: any, hubId: string, targetType: 'hub' | 'tv' = 'hub') {
    if (this.isDestroyed) return;
    try {
      if (this.peer && !this.peer.destroyed) {
        try { this.peer.destroy(); } catch {}
      }
      const clientPeer = new PeerClass(PEER_CONFIG);
      this.peer = clientPeer;
      this.isHub = false;

      clientPeer.on('open', () => {
        if (this.isDestroyed) {
          clientPeer.destroy();
          return;
        }

        const conn = clientPeer.connect(hubId, { reliable: true });
        if (targetType === 'tv') this.tvConn = conn;
        else this.hubConn = conn;

        conn.on('open', () => {
          console.log('[RoomSync] Conectado con HUB exitosamente:', hubId);
          this.flushPendingQueue();
          try {
            conn.send({
              roomCode: this.roomCode,
              senderId: this.instanceId,
              eventId: 'ev_req_room_' + Date.now(),
              event: { type: 'REQUEST_ROOM_SYNC' },
            });
          } catch {}
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
          if (targetType === 'tv') this.tvConn = null;
          else this.hubConn = null;
          this.scheduleHubReconnect(PeerClass, hubId);
        });

        conn.on('error', () => {
          if (targetType === 'tv') this.tvConn = null;
          else this.hubConn = null;
          this.scheduleHubReconnect(PeerClass, hubId);
        });
      });

      clientPeer.on('disconnected', () => {
        if (!this.isDestroyed && !clientPeer.destroyed) {
          try { clientPeer.reconnect(); } catch {
            this.scheduleHubReconnect(PeerClass, hubId);
          }
        }
      });

      clientPeer.on('error', (err: any) => {
        if (err?.type === 'peer-unavailable') {
          this.scheduleHubReconnect(PeerClass, hubId, 3000);
        } else {
          console.warn('[RoomSync] Error en clientPeer:', err?.type || err);
          this.scheduleHubReconnect(PeerClass, hubId);
        }
      });

      this.startHeartbeat();
    } catch {}
  }

  private scheduleHubReconnect(PeerClass: any, hubId: string, delayMs = 2000) {
    if (this.isDestroyed || this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (!this.isDestroyed && !this.isWebRtcConnHealthy(this.hubConn)) {
        if (this.hubConn) {
          try { this.hubConn.close(); } catch {}
          this.hubConn = null;
        }
        if (this.role === 'player') {
          if (this.peer && !this.peer.destroyed) {
            this.setupPlayerConn(this.peer, hubId, 'host');
          } else {
            const { hostHubId, tvHubId } = this.getHubIds();
            this.connectPlayerClients(PeerClass, hostHubId, tvHubId);
          }
        } else {
          this.connectToHubAsClient(PeerClass, hubId, 'hub');
        }
      }
    }, delayMs);
  }

  private scheduleSecondaryReconnect(PeerClass: any, hubId: string, delayMs = 2500) {
    if (this.isDestroyed || this.secondaryReconnectTimeout) return;
    this.secondaryReconnectTimeout = setTimeout(() => {
      this.secondaryReconnectTimeout = null;
      if (!this.isDestroyed) {
        if (this.role === 'player') {
          if (!this.isWebRtcConnHealthy(this.tvConn)) {
            if (this.tvConn) {
              try { this.tvConn.close(); } catch {}
              this.tvConn = null;
            }
            if (this.peer && !this.peer.destroyed) {
              this.setupPlayerConn(this.peer, hubId, 'tv');
            } else {
              const { hostHubId, tvHubId } = this.getHubIds();
              this.connectPlayerClients(PeerClass, hostHubId, tvHubId);
            }
          }
        } else if (this.role === 'host' || this.role === 'tv') {
          const targetConn = this.role === 'host' ? this.tvConn : this.hubConn;
          if (!this.isWebRtcConnHealthy(targetConn)) {
            if (targetConn) {
              try { targetConn.close(); } catch {}
              if (this.role === 'host') this.tvConn = null;
              else this.hubConn = null;
            }
            this.connectSecondaryClient(PeerClass, hubId);
          }
        }
      }
    }, delayMs);
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      if (this.isDestroyed) return;

      const pingMsg = {
        roomCode: this.roomCode,
        senderId: this.instanceId,
        eventId: 'ping_' + Date.now(),
        event: { type: 'PING' as const },
      };

      if (this.isHub && this.clientConns.length > 0) {
        this.clientConns = this.clientConns.filter((c) => this.isWebRtcConnHealthy(c));
        this.clientConns.forEach((c) => {
          try { c.send(pingMsg); } catch {}
        });
      }

      const { hostHubId, tvHubId } = this.getHubIds();

      if (this.hubConn) {
        if (this.isWebRtcConnHealthy(this.hubConn)) {
          try { this.hubConn.send(pingMsg); } catch {}
        } else if (this.PeerClassRef) {
          this.scheduleHubReconnect(this.PeerClassRef, hostHubId, 600);
        }
      }

      if (this.tvConn) {
        if (this.isWebRtcConnHealthy(this.tvConn)) {
          try { this.tvConn.send(pingMsg); } catch {}
        } else if (this.PeerClassRef) {
          this.scheduleSecondaryReconnect(this.PeerClassRef, tvHubId, 600);
        }
      }
    }, 4000);
  }

  private flushPendingQueue() {
    if (this.pendingQueue.length === 0) return;
    const toSend = [...this.pendingQueue];
    let anySent = false;

    if (this.isHub && this.clientConns.length > 0) {
      this.clientConns.forEach((c) => {
        if (this.isWebRtcConnHealthy(c)) {
          toSend.forEach((msg) => {
            try { c.send(msg); anySent = true; } catch {}
          });
        }
      });
    }
    if (this.hubConn && this.isWebRtcConnHealthy(this.hubConn)) {
      toSend.forEach((msg) => {
        try { this.hubConn.send(msg); anySent = true; } catch {}
      });
    }
    if (this.tvConn && this.isWebRtcConnHealthy(this.tvConn)) {
      toSend.forEach((msg) => {
        try { this.tvConn.send(msg); anySent = true; } catch {}
      });
    }

    if (anySent) {
      this.pendingQueue = [];
    }
  }

  private enqueuePending(queue: RelayMessage[], message: RelayMessage) {
    queue.push(message);
    if (queue.length > 40) {
      queue.shift();
    }
  }

  onEvent(callback: (event: RoomSyncEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  subscribe(callback: (event: RoomSyncEvent) => void) {
    return this.onEvent(callback);
  }

  receiveFromSameTab(eventId: string, event: RoomSyncEvent): void {
    this.handleIncoming(eventId, event, true);
  }

  private handleIncoming(eventId: string, event: RoomSyncEvent, fromLocal = false) {
    if (event.type === 'PING') return; // Ignorar pings de latido

    if (this.processedEventIds.has(eventId)) return;
    this.processedEventIds.add(eventId);

    if (this.processedEventIds.size > 300) {
      const first = Array.from(this.processedEventIds)[0];
      this.processedEventIds.delete(first);
    }

    if (!fromLocal) {
      if (this.localChannel) {
        try {
          this.localChannel.postMessage({
            roomCode: this.roomCode,
            senderId: this.instanceId,
            eventId,
            event,
          });
        } catch {}
      }

      SHARED_INSTANCES.forEach((inst) => {
        if (inst !== this && inst.roomCode === this.roomCode && !inst.getIsDestroyed()) {
          inst.receiveFromSameTab(eventId, event);
        }
      });
    }

    if (event.type === 'PLAYERS_CLEAR') {
      this.lastSyncedPlayerHashes.clear();
    }

    if (
      this.cloudRelay &&
      (event.type === 'REQUEST_ROOM_SYNC' ||
        event.type === 'PLAYER_JOINED' ||
        event.type === 'PLAYER_UPDATED')
    ) {
      this.cloudRelay.resetDeduplication();
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

    if (event.type === 'PLAYERS_CLEAR') {
      this.lastSyncedPlayerHashes.clear();
    }

    // Actualizar estado de presencia local para Supabase
    if (this.role === 'host') {
      if (event.type === 'ROOM_UPDATE') {
        this.hostPresenceState = {
          ...this.hostPresenceState,
          role: 'host',
          room: { ...(this.hostPresenceState?.room || {}), ...event.payload },
        };
        this.trackHostPresenceThrottled();
      } else if (event.type === 'TEAMS_UPDATE') {
        this.hostPresenceState = {
          ...this.hostPresenceState,
          role: 'host',
          teams: event.payload,
        };
        this.trackHostPresenceThrottled();
      } else if (event.type === 'SWITCH_GAME') {
        this.hostPresenceState = {
          ...this.hostPresenceState,
          role: 'host',
          room: {
            ...(this.hostPresenceState?.room || {}),
            status: event.payload.status,
            current_game: event.payload.current_game,
            active_game_id: event.payload.game_id || this.hostPresenceState?.room?.active_game_id,
            game_phase: event.payload.game_phase || 'briefing',
          },
        };
        this.trackHostPresenceThrottled();
      } else if (event.type === 'GAME_PHASE_UPDATE') {
        this.hostPresenceState = {
          ...this.hostPresenceState,
          role: 'host',
          room: {
            ...(this.hostPresenceState?.room || {}),
            game_phase: event.payload.phase,
          },
        };
        this.trackHostPresenceThrottled();
      } else if (event.type === 'PRESENTATION_SLIDE') {
        this.hostPresenceState = {
          ...this.hostPresenceState,
          role: 'host',
          room: {
            ...(this.hostPresenceState?.room || {}),
            status: 'presentation',
            presentation_slide: event.payload.slide,
          },
        };
        this.trackHostPresenceThrottled();
      } else if (event.type === 'RETURN_TO_LOBBY') {
        this.hostPresenceState = {
          ...this.hostPresenceState,
          role: 'host',
          room: {
            ...(this.hostPresenceState?.room || {}),
            status: 'lobby',
          },
        };
        this.trackHostPresenceThrottled();
      }
    } else if (this.role === 'player') {
      if (event.type === 'PLAYER_JOINED' || event.type === 'PLAYER_UPDATED') {
        this.playerPresenceState = { role: 'player', player: event.payload };
        if (this.supabaseChannel && this.isSupabaseSubscribed) {
          try {
            this.supabaseChannel.track(this.playerPresenceState).catch(() => {});
          } catch {}
        }
      }
    }

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

    // 2. Enviar por BroadcastChannel (pestañas locales) y otras instancias en la misma pestaña
    if (this.localChannel) {
      try {
        this.localChannel.postMessage(message);
      } catch {}
    }
    SHARED_INSTANCES.forEach((inst) => {
      if (inst !== this && inst.roomCode === this.roomCode && !inst.getIsDestroyed()) {
        inst.receiveFromSameTab(eventId, event);
      }
    });

    // 3. Enviar por Supabase Realtime si está activo
    if (this.supabaseChannel) {
      if (this.isSupabaseSubscribed) {
        try {
          this.supabaseChannel.send({
            type: 'broadcast',
            event: 'STATE_EVENT',
            payload: message,
          });
        } catch {
          this.enqueuePending(this.pendingSupabaseQueue, message);
        }
      } else {
        this.enqueuePending(this.pendingSupabaseQueue, message);
      }
    }

    // 4. Enviar por PeerJS WebRTC P2P (Dual-Hub)
    let webrtcSent = false;
    if (this.isHub && this.clientConns.length > 0) {
      this.clientConns.forEach((c) => {
        if (this.isWebRtcConnHealthy(c)) {
          try {
            c.send(message);
            webrtcSent = true;
          } catch {}
        }
      });
    }
    if (this.hubConn && this.isWebRtcConnHealthy(this.hubConn)) {
      try {
        this.hubConn.send(message);
        webrtcSent = true;
      } catch {}
    }
    if (this.tvConn && this.isWebRtcConnHealthy(this.tvConn)) {
      try {
        this.tvConn.send(message);
        webrtcSent = true;
      } catch {}
    }
    if (!webrtcSent) {
      this.enqueuePending(this.pendingQueue, message);
    }

    // 5. Enviar por Cloud WebSocket Relay (ntfy.sh WSS TCP 443)
    if (this.cloudRelay) {
      try {
        this.cloudRelay.send(message);
      } catch {}
    }

    // 6. Notificar a oyentes locales
    this.notifyListeners(event);
  }

  emit(event: RoomSyncEvent) {
    this.broadcast(event);
  }

  getIsDestroyed(): boolean {
    return this.isDestroyed;
  }

  destroy() {
    this.isDestroyed = true;
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.secondaryReconnectTimeout) clearTimeout(this.secondaryReconnectTimeout);
    if (this.supabaseRetryTimeout) clearTimeout(this.supabaseRetryTimeout);
    if (this.connectTimeout) clearTimeout(this.connectTimeout);
    if (this.hostPresenceTrackTimeout) clearTimeout(this.hostPresenceTrackTimeout);
    if (this.cloudRelay) {
      this.cloudRelay.destroy();
      this.cloudRelay = null;
    }

    const key = `${this.roomCode}_${this.role}`;
    if (SHARED_INSTANCES.get(key) === this) {
      SHARED_INSTANCES.delete(key);
    }

    if (typeof window !== 'undefined') {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      }
      window.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('pageshow', this.handleVisibilityChange);
      window.removeEventListener('focus', this.handleVisibilityChange);
      window.removeEventListener('online', this.handleVisibilityChange);
    }
    if (this.localChannel) {
      this.localChannel.close();
      this.localChannel = null;
    }
    if (this.supabaseChannel) {
      try {
        if (this.isSupabaseSubscribed) {
          this.supabaseChannel.untrack().catch(() => {});
        }
        supabase.removeChannel(this.supabaseChannel);
      } catch {}
      this.supabaseChannel = null;
    }
    if (this.hubConn) {
      try { this.hubConn.close(); } catch {}
      this.hubConn = null;
    }
    if (this.tvConn) {
      try { this.tvConn.close(); } catch {}
      this.tvConn = null;
    }
    if (this.clientConns.length > 0) {
      this.clientConns.forEach((c) => {
        try { c.close(); } catch {}
      });
      this.clientConns = [];
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch {}
      this.peer = null;
    }
    if (this.secondaryPeer) {
      try { this.secondaryPeer.destroy(); } catch {}
      this.secondaryPeer = null;
    }
    this.listeners = [];
  }
}

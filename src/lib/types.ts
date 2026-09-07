export type RoomStatus = 'lobby' | 'playing' | 'paused' | 'podium' | 'ended';
export type MinigameType = 'buzzer' | 'challenges' | 'duel';

export interface Room {
  id: string;
  code: string;
  host_token: string;
  status: RoomStatus;
  active_teams_count: number;
  current_game?: MinigameType | null;
  active_game_id?: string | null;
  title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  room_id: string;
  team_index: number;
  name: string;
  theme: string;
  color_hex: string;
  color_tw: string;
  score: number;
  is_active: boolean;
}

export interface Player {
  id: string;
  room_id: string;
  team_id: string | null;
  team_index?: number | null;
  nickname: string;
  session_token: string;
  is_connected: boolean;
  is_captain?: boolean;
  joined_at: string;
}

export interface CaptainGamble {
  teamId: string;
  teamName: string;
  playerName: string;
  gameId: string;
  timestamp: number;
}

export interface CaptainDuelState {
  isActive: boolean;
  title: string;
  winnerTeamId?: string | null;
  winnerPlayerName?: string | null;
}

export interface TeamRepresentative {
  teamId: string;
  representativePlayerId: string;
  representativeName: string;
}

export interface SecretCard {
  title: string;
  category: string;
  forbiddenWords?: string[];
  instructions?: string;
  actorPlayerId?: string;
}

export interface GameState {
  id: string;
  room_id: string;
  round_number: number;
  buzzer_locked: boolean;
  buzzer_winner_team_id: string | null;
  buzzer_winner_player_id: string | null;
  buzzer_winner_name?: string | null;
  buzzer_pressed_at: string | null;
  timer_seconds: number | null;
  timer_ends_at: string | null;
  secret_card: SecretCard | null;
}

export interface BuzzerPressPayload {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  teamColorHex: string;
  teamIndex: number;
  clientTimestamp: number;
}

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles } from 'lucide-react';
import { GameIcon } from '../GameIcon';
import { TwemojiText } from '../TwemojiText';
import { TeamScoreCard } from '../TeamScoreCard';
import { getTeamTheme } from '../../lib/teamThemes';
import { generateAvatarDataUri } from '../../lib/dicebear';
import { TEAMS_CATALOG } from '../../lib/constants';
import { Team, Player } from '../../lib/types';
import { PowerCardsState } from '../../lib/powerCards';

export interface TvLobbyProps {
  joinUrl: string;
  players: Player[];
  activeTeams: Team[];
  unassignedPlayers: Player[];
  powerCards: PowerCardsState | null;
  roomCode?: string;
}

/**
 * TvLobby: Pantalla pasiva de TV para el salón de espera / lobby.
 * Diseñada para pantallas de TV sin interacción directa (no clicable):
 * - Al inicio del show (0 jugadores): Muestra un banner destacado de bienvenida con QR grande para el escaneo inicial.
 * - Con jugadores conectados (> 0): Los equipos ocupan el 100% del ancho del plató, y el QR pasa a un widget compacto
 *   en la barra superior, reservado únicamente para reconexiones o incorporaciones tardías.
 */
export const TvLobby: React.FC<TvLobbyProps> = ({
  joinUrl,
  players,
  activeTeams,
  unassignedPlayers,
  powerCards,
  roomCode,
}) => {
  // Al inicio del show (0 jugadores), se prioriza la visibilidad de acceso para los primeros aspirantes
  const isStartOfShow = players.length === 0;
  const maxLobbyScore = Math.max(...activeTeams.map((t) => t.score || 0), 0);

  return (
    <section className="flex-1 flex flex-col gap-4 my-2 z-10 w-full min-h-0 select-none">
      {/* 1. ESTADO DE INICIO DEL SHOW (0 Jugadores): Banner limpio con QR protagonista */}
      {isStartOfShow ? (
        <div className="w-full bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 shadow-deco-gold backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 hell-card-frame">
          <div className="flex-1 text-left space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-broadway uppercase tracking-wider text-gold-gradient">
              ¡Escanea para Entrar!
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-base sm:text-lg font-vintage font-bold text-amber-100">
              <span className="bg-[#14141e] border border-[#d4af37]/40 px-4 py-1.5 rounded-xl">
                📱 1. Escanea el QR
              </span>
              <span className="bg-[#14141e] border border-[#d4af37]/40 px-4 py-1.5 rounded-xl">
                🎭 2. Crea tu avatar
              </span>
              <span className="bg-[#14141e] border border-[#d4af37]/40 px-4 py-1.5 rounded-xl">
                🛡️ 3. Elige equipo
              </span>
            </div>
          </div>

          {/* Código QR grande para escaneo inicial */}
          <div className="flex items-center gap-5 shrink-0">
            {roomCode && (
              <div className="bg-[#14141e] border-2 border-[#d4af37]/50 px-5 py-3 rounded-2xl text-center shadow-lg">
                <span className="text-xs uppercase font-vintage text-amber-200/70 block tracking-widest">SALA</span>
                <span className="font-broadway text-gold-gradient text-4xl tracking-widest block">{roomCode}</span>
              </div>
            )}
            <div className="p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)] border-4 border-[#d4af37]">
              {joinUrl ? (
                <QRCodeSVG value={joinUrl} size={156} level="H" />
              ) : (
                <div className="w-[156px] h-[156px] bg-[#14141e] border border-[#d4af37]/30 animate-pulse rounded-lg" />
              )}
            </div>
          </div>
        </div>
      ) : unassignedPlayers.length > 0 ? (
        /* 2. JUGADORES ELIGIENDO EQUIPO: Solo se muestra si hay alguien pendiente de elegir bando */
        <div className="w-full bg-[#0c0c14]/90 border border-amber-400/50 rounded-2xl px-4 py-2.5 flex items-center justify-center gap-3 backdrop-blur-md shrink-0 shadow-md">
          <div className="flex items-center gap-1.5 text-sm sm:text-base uppercase font-broadway text-amber-300 shrink-0">
            <GameIcon name="Lightning" size={18} color="#d4af37" weight="fill" glow="#d4af37" />
            <span>Eligiendo equipo ({unassignedPlayers.length}):</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
            {unassignedPlayers.map((p) => (
              <div
                key={p.id}
                className="bg-[#14141e] border border-[#d4af37]/40 px-3 py-1 rounded-xl text-sm sm:text-base font-bold text-amber-100 flex items-center gap-2 shrink-0 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-black/90 border border-[#d4af37]/30 overflow-hidden shrink-0">
                  <img
                    src={generateAvatarDataUri(p.avatar_seed || p.nickname, (p.avatar_style as any) || 'avataaars')}
                    alt={p.nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                {p.badge_emoji && <TwemojiText className="text-sm">{p.badge_emoji}</TwemojiText>}
                <span className="font-vintage truncate max-w-[120px]">{p.nickname}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* 3. COLUMNAS DE EQUIPOS DINÁMICAS (2 A 6): OCUPANDO EL 100% DEL ANCHO DEL ESCENARIO */}
      <div
        className="w-full flex-1 grid gap-4 min-h-0"
        style={{
          gridTemplateColumns: `repeat(${Math.max(activeTeams.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {activeTeams.map((team) => {
          const theme = getTeamTheme(team.team_index);
          const teamMembers = players.filter(
            (p) =>
              (p.team_index !== undefined && p.team_index !== null && p.team_index === team.team_index) ||
              p.team_id === team.id ||
              p.team_id === `team_${team.team_index}`
          );
          const hand = powerCards?.teamHands[team.id] || [];

          return (
            <TeamScoreCard
              key={team.id}
              team={team}
              theme={theme}
              members={teamMembers}
              powerCardsCount={hand.length}
              variant="lobby"
              maxRoomScore={maxLobbyScore}
            />
          );
        })}
      </div>
    </section>
  );
};

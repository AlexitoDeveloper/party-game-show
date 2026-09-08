import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
}

export const TvLobby: React.FC<TvLobbyProps> = ({
  joinUrl,
  players,
  activeTeams,
  unassignedPlayers,
  powerCards,
}) => {
  return (
    <section className="flex-1 grid grid-cols-12 gap-6 my-6 z-10">
      {/* PANEL QR LATERAL CON MARCO ART DÉCO */}
      <div className="col-span-3 bg-[#0c0c14]/90 border-2 border-[#d4af37]/45 rounded-3xl p-6 flex flex-col items-center justify-between backdrop-blur-xl shadow-deco-gold deco-card-frame">
        <div className="text-center w-full">
          <h2 className="text-lg font-broadway uppercase tracking-wider text-gold-gradient">Pase de Espectador</h2>
          <p className="text-xs font-vintage text-amber-100/70 mt-0.5">Escanea con tu cámara móvil para ingresar</p>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.25)] border-4 border-[#d4af37]/30 my-2">
          {joinUrl ? (
            <QRCodeSVG value={joinUrl} size={170} level="H" />
          ) : (
            <div className="w-[170px] h-[170px] bg-slate-800 animate-pulse rounded-lg" />
          )}
        </div>

        {/* CONTADOR DE JUGADORES */}
        <div className="w-full bg-[#14141e]/90 rounded-2xl p-3.5 border border-[#d4af37]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <GameIcon name="Users" size={22} color="#d4af37" glow="#d4af37" weight="fill" />
            <div>
              <span className="text-[10px] text-amber-200/70 block uppercase font-vintage font-bold">Jugadores</span>
              <span className="text-base font-broadway text-white">{players.length} conectados</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-amber-200/70 block uppercase font-vintage font-bold">Equipos</span>
            <span className="text-base font-broadway text-gold-gradient">{activeTeams.length} / {TEAMS_CATALOG.length}</span>
          </div>
        </div>

        {/* JUGADORES ENTRADOS QUE ESTÁN ELIGIENDO BANDO */}
        {unassignedPlayers.length > 0 && (
          <div className="w-full bg-amber-500/10 border-2 border-amber-400/40 rounded-2xl p-3 my-2 text-left animate-pulse">
            <span className="text-[10px] uppercase font-vintage font-bold text-amber-300 block mb-1.5 flex items-center gap-1">
              <GameIcon name="Lightning" size={14} color="#d4af37" weight="fill" glow="#d4af37" />
              <span>Recién llegados ({unassignedPlayers.length}):</span>
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {unassignedPlayers.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#0c0c14]/95 border border-[#d4af37]/40 px-2 py-1 rounded-xl text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-sm"
                >
                  <div className="w-4 h-4 rounded-md bg-slate-950 overflow-hidden shrink-0">
                    <img
                      src={generateAvatarDataUri(p.avatar_seed || p.nickname, (p.avatar_style as any) || 'avataaars')}
                      alt={p.nickname}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {p.badge_emoji && <TwemojiText className="text-[10px]">{p.badge_emoji}</TwemojiText>}
                  <span className="font-vintage">{p.nickname}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* COLUMNAS DE EQUIPOS DINÁMICAS (2 A 6) */}
      <div
        className="col-span-9 grid gap-4 h-full"
        style={{ gridTemplateColumns: `repeat(${activeTeams.length}, minmax(0, 1fr))` }}
      >
        {(() => {
          const maxLobbyScore = Math.max(...activeTeams.map((t) => t.score || 0), 0);
          return activeTeams.map((team) => {
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
          });
        })()}
      </div>
    </section>
  );
};

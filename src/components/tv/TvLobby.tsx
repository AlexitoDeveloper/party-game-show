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
      {/* 1. ESTADO DE INICIO DEL SHOW (0 Jugadores): Banner de bienvenida con QR protagonista */}
      {isStartOfShow ? (
        <div className="w-full bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 shadow-deco-gold backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 hell-card-frame">
          {/* Información y pasos */}
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/50 text-amber-300 text-xs uppercase font-broadway tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Convocatoria Abierta • Comienza la Velada</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-broadway uppercase tracking-wider text-gold-gradient">
              ¡Bienvenidos al Speakeasy Game Show!
            </h2>
            <p className="text-xs sm:text-sm font-vintage text-amber-100/80 mt-1 max-w-xl">
              Escanea el pase con la cámara de tu móvil para ingresar a la sala. Personaliza tu avatar, escribe tu apodo y únete al bando que prefieras.
            </p>

            <div className="flex items-center gap-6 mt-3 text-xs font-vintage text-amber-200/80">
              <div className="flex items-center gap-1.5">
                <span className="font-broadway text-amber-400">1.</span> Abre tu cámara
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-broadway text-amber-400">2.</span> Escanea el pase
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-broadway text-amber-400">3.</span> ¡Elige tu equipo!
              </div>
              {roomCode && (
                <div className="bg-[#14141e] border border-[#d4af37]/40 px-3 py-0.5 rounded-lg font-broadway text-gold-gradient text-sm tracking-widest">
                  SALA: {roomCode}
                </div>
              )}
            </div>
          </div>

          {/* Código QR grande para escaneo inicial */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)] border-4 border-[#d4af37]">
              {joinUrl ? (
                <QRCodeSVG value={joinUrl} size={150} level="H" />
              ) : (
                <div className="w-[150px] h-[150px] bg-[#14141e] border border-[#d4af37]/30 animate-pulse rounded-lg" />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 2. ESTADO ACTIVO (Jugadores conectados): Barra superior compacta para que los equipos tengan 100% de protagonismo */
        <div className="w-full bg-[#0c0c14]/90 border border-[#d4af37]/40 rounded-2xl px-4 py-2 flex items-center justify-between gap-4 backdrop-blur-md shrink-0 shadow-md">
          {/* Métricas del Salón */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-[#14141e]/90 border border-[#d4af37]/30 px-3 py-1.5 rounded-xl">
              <GameIcon name="Users" size={18} color="#d4af37" glow="#d4af37" weight="fill" />
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-vintage text-amber-200/70 block">Jugadores</span>
                <span className="text-sm font-broadway text-white">{players.length} conectados</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#14141e]/90 border border-[#d4af37]/30 px-3 py-1.5 rounded-xl">
              <GameIcon name="Shield" size={18} color="#d4af37" glow="#d4af37" weight="fill" />
              <div className="leading-tight">
                <span className="text-[10px] uppercase font-vintage text-amber-200/70 block">Equipos</span>
                <span className="text-sm font-broadway text-gold-gradient">{activeTeams.length} / {TEAMS_CATALOG.length}</span>
              </div>
            </div>
          </div>

          {/* Aspirantes eligiendo bando */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            {unassignedPlayers.length > 0 ? (
              <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-400/50 rounded-xl px-3 py-1 animate-pulse max-w-xl overflow-hidden">
                <div className="flex items-center gap-1 text-xs uppercase font-vintage font-bold text-amber-300 shrink-0">
                  <GameIcon name="Lightning" size={14} color="#d4af37" weight="fill" glow="#d4af37" />
                  <span>Eligiendo equipo ({unassignedPlayers.length}):</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {unassignedPlayers.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#0c0c14]/90 border border-[#d4af37]/40 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-200 flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      <div className="w-4 h-4 rounded-full bg-black/90 border border-[#d4af37]/30 overflow-hidden shrink-0">
                        <img
                          src={generateAvatarDataUri(p.avatar_seed || p.nickname, (p.avatar_style as any) || 'avataaars')}
                          alt={p.nickname}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {p.badge_emoji && <TwemojiText className="text-xs">{p.badge_emoji}</TwemojiText>}
                      <span className="font-vintage truncate max-w-[90px]">{p.nickname}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs font-vintage text-amber-100/60 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Salón de Convocatoria en directo • Esperando que el anfitrión comience el show</span>
              </div>
            )}
          </div>

          {/* Mini QR Pasivo para reconexión o nuevos invitados (Sin ocupar espacio lateral) */}
          {joinUrl && (
            <div className="flex items-center gap-2 bg-[#14141e]/90 border border-[#d4af37]/45 px-2.5 py-1 rounded-xl shadow shrink-0">
              <div className="p-1 bg-white rounded-lg shadow-sm shrink-0">
                <QRCodeSVG value={joinUrl} size={48} level="M" />
              </div>
              <div className="leading-tight text-left pr-1">
                <span className="text-[11px] uppercase font-broadway text-amber-300 tracking-wider block">
                  ¿Reconectar?
                </span>
                <span className="text-[10px] font-vintage text-slate-300 block">
                  Escanea el pase
                </span>
              </div>
            </div>
          )}
        </div>
      )}

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

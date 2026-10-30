import React from 'react';
import { Sliders, Minus, Plus, UserCheck, Trash2, RefreshCw } from 'lucide-react';
import { Room, Team, Player } from '../../lib/types';
import { TEAMS_CATALOG } from '../../lib/constants';

export interface HostTeamsScoreboardProps {
  room: Room;
  activeTeams: Team[];
  teams: Team[];
  players: Player[];
  onTeamCountChange: (count: number) => void;
  onScoreChange: (teamId: string, delta: number) => void;
  onSetCaptain: (teamId: string, playerId: string) => void;
  onClearPlayers: () => void;
  onRescanPlayers: () => void;
}

export const HostTeamsScoreboard: React.FC<HostTeamsScoreboardProps> = ({
  room,
  activeTeams,
  teams,
  players,
  onTeamCountChange,
  onScoreChange,
  onClearPlayers,
  onRescanPlayers,
}) => {
  return (
    <div className="space-y-4">
      <section className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-3xl p-4 shadow-deco-gold space-y-3.5 hell-card-frame">
        {/* CABECERA COMPACTA: NÚMERO DE EQUIPOS */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#d4af37]/30">
          <div className="flex items-center gap-2 min-w-0">
            <Sliders className="w-4 h-4 text-[#d4af37] shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-broadway uppercase tracking-wide text-gold-gradient truncate">
                Marcador y Equipos Activos
              </h2>
              <span className="text-[11px] text-amber-200/70 font-vintage block">
                Ajusta de 2 a 6 equipos y suma/resta puntos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#07070a] p-1 rounded-xl border border-[#d4af37]/40 shrink-0">
            <button
              disabled={room.active_teams_count <= 2}
              onClick={() => onTeamCountChange(room.active_teams_count - 1)}
              className="p-1.5 bg-[#14141e] text-amber-200 border border-[#d4af37]/30 rounded-lg disabled:opacity-30 active:scale-95"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-base font-broadway w-5 text-center text-gold-gradient">
              {room.active_teams_count}
            </span>
            <button
              disabled={room.active_teams_count >= TEAMS_CATALOG.length}
              onClick={() => onTeamCountChange(room.active_teams_count + 1)}
              className="p-1.5 bg-[#14141e] text-amber-200 border border-[#d4af37]/30 rounded-lg disabled:opacity-30 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* TARJETAS COMPACTAS DE PUNTUACIÓN POR EQUIPO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeTeams.map((team) => {
            const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
            const teamMembers = players.filter(
              (p) => p.team_id === team.id || p.team_index === team.team_index
            );

            return (
              <div
                key={team.id}
                className={`p-3 rounded-2xl border ${cat.twBorder} bg-[#07070a]/95 flex flex-col justify-between gap-2 shadow-sm`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.twBg} shrink-0`} />
                      <span className={`text-sm font-broadway uppercase truncate ${cat.twText}`}>
                        {team.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-100/60 font-vintage block truncate mt-0.5">
                      {teamMembers.length > 0
                        ? teamMembers.map((m) => m.nickname).join(', ')
                        : 'Sin jugadores aún'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-broadway text-gold-gradient leading-none">
                      {team.score}
                    </span>
                    <span className="text-[10px] text-amber-300/70 block font-vintage font-bold">
                      PTS
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-[#d4af37]/20">
                  <button
                    onClick={() => onScoreChange(team.id, -1)}
                    className="bg-red-600/20 hover:bg-red-600/35 text-red-300 text-xs font-broadway font-black py-2 rounded-xl border border-red-500/40 active:scale-95"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => onScoreChange(team.id, 1)}
                    className="bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 text-xs font-broadway font-black py-2 rounded-xl border border-blue-500/40 active:scale-95"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => onScoreChange(team.id, 2)}
                    className="bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 text-xs font-broadway font-black py-2 rounded-xl border border-emerald-500/40 active:scale-95"
                  >
                    +2
                  </button>
                  <button
                    onClick={() => onScoreChange(team.id, 5)}
                    className="bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 text-xs font-broadway font-black py-2 rounded-xl border border-amber-500/40 active:scale-95"
                  >
                    +5
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LISTA COMPACTA DE JUGADORES CONECTADOS */}
      <section className="bg-[#0c0c14]/95 border border-[#d4af37]/40 rounded-3xl p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <UserCheck className="w-4 h-4 text-[#d4af37] shrink-0" />
            <h3 className="text-xs font-broadway uppercase tracking-wider text-gold-gradient truncate">
              Jugadores Conectados ({players.length})
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onRescanPlayers}
              className="text-xs text-amber-200 bg-[#14141e] border border-[#d4af37]/40 px-2.5 py-1 rounded-xl font-vintage font-bold flex items-center gap-1 active:scale-95"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sincronizar</span>
            </button>
            <button
              onClick={onClearPlayers}
              className="text-xs text-red-300 bg-red-950/50 border border-red-500/40 px-2.5 py-1 rounded-xl font-vintage font-bold flex items-center gap-1 active:scale-95"
            >
              <Trash2 className="w-3 h-3" />
              <span>Vaciar</span>
            </button>
          </div>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-3 border border-dashed border-[#d4af37]/30 rounded-xl text-amber-100/60 text-xs font-vintage">
            Esperando jugadores...
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {players.map((p) => {
              const assignedTeam = teams.find(
                (t) => t.id === p.team_id || t.team_index === p.team_index
              );
              const teamCatalog = assignedTeam
                ? TEAMS_CATALOG.find((c) => c.index === assignedTeam.team_index)
                : null;

              return (
                <div
                  key={p.id}
                  className="border px-2.5 py-1 rounded-xl flex items-center gap-1.5 bg-[#14141e] border-[#d4af37]/30 text-xs"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      teamCatalog ? teamCatalog.twBg : 'bg-amber-400/40'
                    }`}
                  />
                  <span className="font-vintage font-bold text-white truncate max-w-[100px]">
                    {p.nickname}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};


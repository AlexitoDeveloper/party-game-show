import React from 'react';
import { Sliders, Minus, Plus, Users, Crown, UserCheck, Trash2, RefreshCw } from 'lucide-react';
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
  onSetCaptain,
  onClearPlayers,
  onRescanPlayers,
}) => {
  return (
    <div className="space-y-6">
      {/* CONFIGURACIÓN DINÁMICA DE EQUIPOS & MARCADOR GENERAL */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold">Número de Equipos Dinámicos</h2>
              <p className="text-xs text-slate-400">Ajusta según las personas que asistan (2 a 6)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800 p-1.5 rounded-2xl border border-slate-700 w-fit">
            <button
              disabled={room.active_teams_count <= 2}
              onClick={() => onTeamCountChange(room.active_teams_count - 1)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl disabled:opacity-30 active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-black w-8 text-center text-amber-400 font-mono">
              {room.active_teams_count}
            </span>
            <button
              disabled={room.active_teams_count >= TEAMS_CATALOG.length}
              onClick={() => onTeamCountChange(room.active_teams_count + 1)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl disabled:opacity-30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MARCADOR DE EQUIPOS CON GESTIÓN DE CAPITANES */}
        <div className="pt-3 border-t border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeTeams.map((team) => {
              const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
              const teamMembers = players.filter((p) => p.team_id === team.id || p.team_index === team.team_index);

              return (
                <div
                  key={team.id}
                  className={`p-4 rounded-2xl border ${cat.twBorder} bg-slate-900/90 flex flex-col justify-between shadow-md`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Equipo {team.team_index}</span>
                      <span className={`text-base font-black uppercase ${cat.twText}`}>{team.name}</span>
                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                        {teamMembers.length} {teamMembers.length === 1 ? 'jugador' : 'jugadores'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black font-mono text-white">{team.score}</span>
                      <span className="text-[10px] text-slate-400 block font-bold">PTS</span>
                    </div>
                  </div>

                  {/* Lista de Miembros con Selector de Capitán */}
                  {teamMembers.length > 0 && (
                    <div className="my-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 w-full flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>Miembros:</span>
                      </span>
                      {teamMembers.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => onSetCaptain(team.id, m.id)}
                          title={m.is_captain ? 'Capitán activo (Clic para desasignar o deshacer capitanía)' : 'Nombrar Capitán a este jugador'}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
                            m.is_captain
                              ? 'bg-amber-400 hover:bg-red-500 hover:text-white text-slate-950 font-black shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <Crown className={`w-3 h-3 ${m.is_captain ? 'fill-current' : 'text-slate-400'}`} />
                          <span>{m.nickname}</span>
                          {m.is_captain && <span className="text-[9px] opacity-80 ml-0.5">✕</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-1.5 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => onScoreChange(team.id, 5)}
                      className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-black py-2 rounded-xl border border-amber-500/30 active:scale-95"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => onScoreChange(team.id, 2)}
                      className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-black py-2 rounded-xl border border-emerald-500/30 active:scale-95"
                    >
                      +2
                    </button>
                    <button
                      onClick={() => onScoreChange(team.id, 1)}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-black py-2 rounded-xl border border-blue-500/30 active:scale-95"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => onScoreChange(team.id, -1)}
                      className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-black py-2 rounded-xl border border-red-500/30 active:scale-95"
                    >
                      -1
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LISTA DE JUGADORES EN VIVO DETECTADOS */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 truncate">
              <span className="hidden sm:inline">Jugadores Detectados</span>
              <span className="sm:hidden">Jugadores</span> ({players.length})
            </h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onClearPlayers}
              className="text-[11px] text-red-400 hover:text-red-300 border border-red-500/30 px-2 py-1 rounded-lg font-semibold transition-all active:scale-95 flex items-center gap-1"
              title="Vaciar lista de jugadores"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Vaciar</span>
            </button>
            <button
              onClick={onRescanPlayers}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold border border-slate-700 px-2 py-1 rounded-lg"
              title="Re-escanear jugadores"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Re-escanear</span>
            </button>
          </div>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
            Aún no ha entrado ningún jugador. Los nombres aparecerán aquí al instante en que introduzcan su alias.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {players.map((p) => {
              const assignedTeam = teams.find((t) => t.id === p.team_id || t.team_index === p.team_index);
              const teamCatalog = assignedTeam ? TEAMS_CATALOG.find((c) => c.index === assignedTeam.team_index) : null;

              return (
                <div
                  key={p.id}
                  className={`border px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 shadow-sm transition-all ${
                    p.is_captain
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                      : 'bg-slate-800/90 border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${teamCatalog ? teamCatalog.twBg : 'bg-slate-500 animate-pulse'}`} />
                  <span className="text-xs font-bold text-white flex items-center gap-1 truncate max-w-[110px] sm:max-w-none">
                    {p.nickname}
                    {p.is_captain && <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    {teamCatalog ? `(${teamCatalog.name})` : '(Sin bando)'}
                  </span>
                  {assignedTeam && (
                    <button
                      onClick={() => onSetCaptain(assignedTeam.id, p.id)}
                      title={p.is_captain ? 'Capitán activo (Clic para desasignar o deshacer)' : 'Nombrar Capitán de su equipo'}
                      className={`ml-1 px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all active:scale-95 shrink-0 ${
                        p.is_captain
                          ? 'bg-amber-400 hover:bg-red-500 hover:text-white text-slate-950 shadow-sm'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      <Crown className={`w-3 h-3 ${p.is_captain ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline">{p.is_captain ? 'Quitar Cap ✕' : 'Nombrar Cap'}</span>
                      <span className="sm:hidden">{p.is_captain ? '✕' : 'Cap'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

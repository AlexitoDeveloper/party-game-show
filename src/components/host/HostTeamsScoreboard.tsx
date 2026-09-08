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
      <section className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 shadow-deco-gold hell-card-frame">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#d4af37] to-[#8a6a1a] text-slate-950 rounded-2xl shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-broadway uppercase tracking-wide text-gold-gradient">Número de Equipos Dinámicos</h2>
              <p className="text-xs text-amber-100/70 font-vintage">Ajusta según las personas que asistan (2 a 6 bandos clandestinos)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#07070a] p-1.5 rounded-2xl border border-[#d4af37]/40 w-fit">
            <button
              disabled={room.active_teams_count <= 2}
              onClick={() => onTeamCountChange(room.active_teams_count - 1)}
              className="p-2 bg-[#14141e] hover:bg-[#1f1f2e] text-amber-200 border border-[#d4af37]/30 rounded-xl disabled:opacity-30 active:scale-95 transition-all shadow-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-2xl font-broadway w-8 text-center text-gold-gradient">
              {room.active_teams_count}
            </span>
            <button
              disabled={room.active_teams_count >= TEAMS_CATALOG.length}
              onClick={() => onTeamCountChange(room.active_teams_count + 1)}
              className="p-2 bg-[#14141e] hover:bg-[#1f1f2e] text-amber-200 border border-[#d4af37]/30 rounded-xl disabled:opacity-30 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MARCADOR DE EQUIPOS CON GESTIÓN DE CAPITANES */}
        <div className="pt-3 border-t border-[#d4af37]/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeTeams.map((team) => {
              const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
              const teamMembers = players.filter((p) => p.team_id === team.id || p.team_index === team.team_index);

              return (
                <div
                  key={team.id}
                  className={`p-4 rounded-3xl border-2 ${cat.twBorder} bg-[#0c0c14]/95 flex flex-col justify-between shadow-deco-gold hell-card-frame`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-vintage font-bold text-amber-300/80 block">Equipo {team.team_index}</span>
                      <span className={`text-base font-broadway uppercase tracking-wide ${cat.twText}`}>{team.name}</span>
                      <span className="text-[11px] text-amber-100/70 font-vintage block mt-0.5">
                        {teamMembers.length} {teamMembers.length === 1 ? 'jugador' : 'jugadores'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-broadway text-gold-gradient drop-shadow-sm">{team.score}</span>
                      <span className="text-[10px] text-amber-300/70 block font-vintage font-bold">PTS</span>
                    </div>
                  </div>

                  {/* Lista de Miembros con Selector de Capitán */}
                  {teamMembers.length > 0 && (
                    <div className="my-2 p-2 bg-[#07070a]/90 rounded-2xl border border-[#d4af37]/30 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] uppercase font-vintage font-bold text-amber-300/70 w-full flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#d4af37]" />
                        <span>Miembros:</span>
                      </span>
                      {teamMembers.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => onSetCaptain(team.id, m.id)}
                          title={m.is_captain ? 'Capitán activo (Clic para desasignar o deshacer capitanía)' : 'Nombrar Capitán a este jugador'}
                          className={`px-2 py-1 rounded-xl text-[10px] font-vintage font-bold flex items-center gap-1 transition-all active:scale-95 ${
                            m.is_captain
                              ? 'bg-gold-gradient hover:bg-red-500 hover:text-white text-slate-950 font-black shadow-md border border-[#f5eedb]/40'
                              : 'bg-[#14141e] hover:bg-[#1f1f2e] text-amber-200 border border-[#d4af37]/30'
                          }`}
                        >
                          <Crown className={`w-3 h-3 ${m.is_captain ? 'fill-current text-slate-950' : 'text-amber-400'}`} />
                          <span>{m.nickname}</span>
                          {m.is_captain && <span className="text-[9px] opacity-80 ml-0.5">✕</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-1.5 pt-2 border-t border-[#d4af37]/30">
                    <button
                      onClick={() => onScoreChange(team.id, 5)}
                      className="flex-1 bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 text-xs font-broadway font-black py-2 rounded-xl border border-amber-500/40 active:scale-95 shadow-sm"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => onScoreChange(team.id, 2)}
                      className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 text-xs font-broadway font-black py-2 rounded-xl border border-emerald-500/40 active:scale-95 shadow-sm"
                    >
                      +2
                    </button>
                    <button
                      onClick={() => onScoreChange(team.id, 1)}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 text-xs font-broadway font-black py-2 rounded-xl border border-blue-500/40 active:scale-95 shadow-sm"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => onScoreChange(team.id, -1)}
                      className="flex-1 bg-red-600/20 hover:bg-red-600/35 text-red-300 text-xs font-broadway font-black py-2 rounded-xl border border-red-500/40 active:scale-95 shadow-sm"
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
      <section className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 shadow-deco-gold hell-card-frame">
        <div className="flex items-center justify-between mb-4 gap-2 border-b border-[#d4af37]/30 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-gradient-to-br from-[#d4af37] to-[#8a6a1a] text-slate-950 rounded-xl shadow-sm">
              <UserCheck className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-broadway uppercase tracking-wider text-gold-gradient truncate">
              <span className="hidden sm:inline">Jugadores Detectados en la Sala</span>
              <span className="sm:hidden">Jugadores</span> ({players.length})
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClearPlayers}
              className="text-[11px] text-red-300 hover:text-white bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 px-3 py-1 rounded-xl font-vintage font-bold transition-all active:scale-95 flex items-center gap-1 shadow-sm"
              title="Vaciar lista de jugadores"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Vaciar</span>
            </button>
            <button
              onClick={onRescanPlayers}
              className="text-[11px] text-amber-200 hover:text-white bg-[#14141e] hover:bg-[#1f1f2e] border border-[#d4af37]/40 px-3 py-1 rounded-xl font-vintage font-bold flex items-center gap-1 shadow-sm"
              title="Re-escanear jugadores"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Re-escanear</span>
            </button>
          </div>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-[#d4af37]/30 rounded-2xl text-amber-100/60 text-xs font-vintage">
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
                  className={`border px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm transition-all ${
                    p.is_captain
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-[#14141e] border-[#d4af37]/30 text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${teamCatalog ? teamCatalog.twBg : 'bg-amber-400/40 animate-pulse'}`} />
                  <span className="text-xs font-vintage font-bold text-white flex items-center gap-1 truncate max-w-[110px] sm:max-w-none">
                    {p.nickname}
                    {p.is_captain && <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                  </span>
                  <span className="text-[10px] text-amber-200/60 font-vintage truncate">
                    {teamCatalog ? `(${teamCatalog.name})` : '(Sin bando)'}
                  </span>
                  {assignedTeam && (
                    <button
                      onClick={() => onSetCaptain(assignedTeam.id, p.id)}
                      title={p.is_captain ? 'Capitán activo (Clic para desasignar o deshacer)' : 'Nombrar Capitán de su equipo'}
                      className={`ml-1 px-2 py-0.5 rounded-lg text-[10px] font-vintage font-black flex items-center gap-1 transition-all active:scale-95 shrink-0 ${
                        p.is_captain
                          ? 'bg-gold-gradient hover:bg-red-500 hover:text-white text-slate-950 shadow-sm border border-[#f5eedb]/30'
                          : 'bg-[#07070a] hover:bg-[#201628] text-amber-300 border border-[#d4af37]/30'
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

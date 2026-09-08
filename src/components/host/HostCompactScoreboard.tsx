import React from 'react';
import { Users, Crown } from 'lucide-react';
import { Team, Player } from '../../lib/types';
import { TEAMS_CATALOG } from '../../lib/constants';

interface HostCompactScoreboardProps {
  activeTeams: Team[];
  players: Player[];
  onSetCaptain: (teamId: string, playerId: string) => void;
  onScoreChange: (teamId: string, delta: number) => void;
}

export const HostCompactScoreboard: React.FC<HostCompactScoreboardProps> = ({
  activeTeams,
  players,
  onSetCaptain,
  onScoreChange,
}) => {
  return (
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
                    title={
                      m.is_captain
                        ? 'Capitán activo (Clic para desasignar o deshacer capitanía)'
                        : 'Nombrar Capitán a este jugador'
                    }
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
  );
};

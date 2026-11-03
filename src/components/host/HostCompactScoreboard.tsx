import React from 'react';
import { Users } from 'lucide-react';
import { Team, Player } from '../../lib/types';
import { TEAMS_CATALOG } from '../../lib/constants';

interface HostCompactScoreboardProps {
  activeTeams: Team[];
  players: Player[];
  onScoreChange: (teamId: string, delta: number) => void;
}

export const HostCompactScoreboard: React.FC<HostCompactScoreboardProps> = ({
  activeTeams,
  players,
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
            className={`p-4 rounded-3xl border-2 ${cat.twBorder} bg-[#0c0c14]/95 flex flex-col justify-between shadow-deco-gold hell-card-frame`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs uppercase font-vintage font-bold text-amber-300/80 block">Equipo {team.team_index}</span>
                <span className={`text-base font-broadway uppercase tracking-wide ${cat.twText}`}>{team.name}</span>
                <span className="text-xs text-amber-100/70 font-vintage block mt-0.5">
                  {teamMembers.length} {teamMembers.length === 1 ? 'jugador' : 'jugadores'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-broadway text-gold-gradient drop-shadow-sm">{team.score}</span>
                <span className="text-xs text-amber-300/70 block font-vintage font-bold">PTS</span>
              </div>
            </div>

            {/* Lista de Miembros */}
            {teamMembers.length > 0 && (
              <div className="my-2 p-2 bg-[#07070a]/90 rounded-2xl border border-[#d4af37]/30 flex flex-wrap gap-1.5 items-center">
                <span className="text-xs uppercase font-vintage font-bold text-amber-300/70 w-full flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#d4af37]" />
                  <span>Miembros:</span>
                </span>
                {teamMembers.map((m) => (
                  <div
                    key={m.id}
                    className="px-2.5 py-1 rounded-xl text-xs font-vintage font-bold flex items-center gap-1 bg-[#14141e] text-amber-200 border border-[#d4af37]/30"
                  >
                    <span>{m.nickname}</span>
                  </div>
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
  );
};

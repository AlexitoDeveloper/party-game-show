import React from 'react';
import { Plus, Minus, Trophy, Beer } from 'lucide-react';
import { Team } from '../../../lib/types';
import { TEAMS_CATALOG } from '../../../lib/constants';

export interface HostBeerPongControlsProps {
  activeTeams: Team[];
  roundHits: Record<string, number>;
  onScoreChange: (teamId: string, delta: number) => void;
  setRoundHits: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export const HostBeerPongControls: React.FC<HostBeerPongControlsProps> = ({
  activeTeams,
  roundHits,
  onScoreChange,
  setRoundHits,
}) => {
  const handleAddCup = (teamId: string) => {
    onScoreChange(teamId, 1);
    setRoundHits((prev) => ({
      ...prev,
      [teamId]: (prev[teamId] || 0) + 1,
    }));
  };

  const handleRemoveCup = (teamId: string) => {
    const current = roundHits[teamId] || 0;
    if (current <= 0) return;
    onScoreChange(teamId, -1);
    setRoundHits((prev) => ({
      ...prev,
      [teamId]: Math.max(0, current - 1),
    }));
  };

  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-3xl p-5 sm:p-6 shadow-deco-gold space-y-4 hell-card-frame">
      {/* CABECERA DE LA PRUEBA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#d4af37]/30 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Beer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">
              Beer Pong — Marcador Rápido de Vasos
            </h3>
            <span className="text-[11px] font-vintage text-amber-200/70">
              Control en vivo de vasos encestados por equipo
            </span>
          </div>
        </div>
        <div className="text-xs font-vintage font-bold text-amber-300 bg-amber-500/15 border border-[#d4af37]/40 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5">
          <span>🎯</span>
          <span>+1 acierto por vaso encestado</span>
        </div>
      </div>

      {/* PARRILLA DE EQUIPOS CON CONTADOR Y BOTONES DE TIRO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {activeTeams.map((team) => {
          const catalog = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
          const cups = roundHits[team.id] || 0;

          return (
            <div
              key={team.id}
              className="bg-[#07070a]/90 border border-[#d4af37]/40 hover:border-amber-400/70 rounded-2xl p-4 flex flex-col justify-between transition-all shadow-md"
            >
              {/* Info Equipo */}
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${catalog.twBg} shadow-sm`} />
                  <span className="text-xs font-broadway text-white uppercase tracking-wide truncate max-w-[110px]">
                    {team.name}
                  </span>
                </div>
                <span className="text-[10px] font-vintage text-amber-200/70 bg-black/40 px-2 py-0.5 rounded-lg border border-[#d4af37]/20">
                  Total: {team.score} pts
                </span>
              </div>

              {/* Contador de vasos */}
              <div className="flex items-center justify-center gap-2 py-3 bg-[#14141e]/80 rounded-xl border border-[#d4af37]/25 mb-3">
                <span className="text-3xl font-broadway text-gold-gradient">{cups}</span>
                <span className="text-xs font-vintage font-bold text-amber-200 uppercase tracking-wider">
                  {cups === 1 ? 'Vaso' : 'Vasos'} 🥤
                </span>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddCup(team.id)}
                  className="flex-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 hover:border-emerald-400 text-emerald-200 text-xs font-broadway font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                  title="Anotar vaso encestado (+1 acierto, +1 pt)"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>+1 Vaso</span>
                </button>

                <button
                  onClick={() => handleRemoveCup(team.id)}
                  disabled={cups <= 0}
                  className="bg-red-950/40 hover:bg-red-900/60 disabled:opacity-30 disabled:pointer-events-none border border-red-500/40 text-red-300 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                  title="Deshacer vaso marcado por error (-1)"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* NOTA AL PIE / PODIO */}
      <div className="flex items-center justify-between text-xs font-vintage text-amber-200/70 bg-[#14141e]/60 px-4 py-2 rounded-xl border border-[#d4af37]/20">
        <span className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Al finalizar el torneo, pulsa <strong>"Terminar Prueba y Asignar Podio"</strong> para premiar al 1.º, 2.º y 3.º según los vasos.</span>
        </span>
      </div>
    </div>
  );
};

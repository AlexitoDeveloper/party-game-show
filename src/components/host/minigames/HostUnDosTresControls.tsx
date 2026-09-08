import React from 'react';
import { Zap, Timer, Check, Skull } from 'lucide-react';
import { UnDosTresChallenge } from '../../../lib/unDosTresData';
import { Team } from '../../../lib/types';

export interface HostUnDosTresControlsProps {
  currentUdtChallenge: UnDosTresChallenge;
  aliveTeams: Team[];
  activeTeams: Team[];
  currentUdtTeam: Team | undefined;
  onResetUdtRound: () => void;
  onStartUdtTimer: () => void;
  onPassUdtRound: () => void;
  onEliminateUdtTeam: () => void;
}

export const HostUnDosTresControls: React.FC<HostUnDosTresControlsProps> = ({
  currentUdtChallenge,
  aliveTeams,
  activeTeams,
  currentUdtTeam,
  onResetUdtRound,
  onStartUdtTimer,
  onPassUdtRound,
  onEliminateUdtTeam,
}) => {
  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-3xl p-6 shadow-deco-gold space-y-5 deco-card-frame">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d4af37]/30 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#d4af37]" />
          <span className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">
            1, 2, 3 ¿Ya? — Nivel {currentUdtChallenge.levelNumber} ({currentUdtChallenge.level})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-vintage font-bold text-amber-200/80">
            Supervivientes: {aliveTeams.length}/{activeTeams.length}
          </span>
          <button
            onClick={onResetUdtRound}
            className="px-2.5 py-1 bg-[#14141e] hover:bg-[#1a1a28] text-amber-200 rounded-xl text-xs font-vintage font-bold border border-[#d4af37]/30 shadow-sm"
          >
            Reset Ronda
          </button>
        </div>
      </div>

      {/* RETO ACTIVO Y RESPUESTAS MODELO PARA EL HOST */}
      <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl p-4 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-broadway text-amber-400">
            {currentUdtChallenge.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-gold-gradient text-slate-950 font-broadway font-black text-xs shadow-sm">
            Turno: {currentUdtTeam?.name}
          </span>
        </div>

        <h3 className="text-lg font-broadway text-amber-50">
          {currentUdtChallenge.prompt}
        </h3>

        <div>
          <span className="text-[10px] uppercase font-vintage font-bold text-amber-200/70 block mb-1">
            Ejemplos válidos para comprobar al vuelo:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentUdtChallenge.examples.map((ex, eIdx) => (
              <span
                key={eIdx}
                className="px-2.5 py-0.5 rounded-lg bg-[#14141e] border border-[#d4af37]/30 text-[11px] text-amber-200 font-vintage font-bold"
              >
                {ex}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CONTROLES DEL TEMPORIZADOR Y ELIMINACIÓN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={onStartUdtTimer}
          className="p-3.5 rounded-2xl bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-xs uppercase flex items-center justify-center gap-2 shadow-deco-gold active:scale-95 border border-[#f5eedb]/40"
        >
          <Timer className="w-4 h-4" />
          <span>⏱️ Iniciar 5 Segundos</span>
        </button>
        <button
          onClick={onPassUdtRound}
          className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-broadway font-black text-xs uppercase flex items-center justify-center gap-2 shadow-md active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>✅ Superado (Siguiente)</span>
        </button>
        <button
          onClick={onEliminateUdtTeam}
          className="p-3.5 rounded-2xl bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 font-broadway font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-md active:scale-95"
        >
          <Skull className="w-4 h-4" />
          <span>💀 Fallo (Eliminar)</span>
        </button>
      </div>
    </div>
  );
};

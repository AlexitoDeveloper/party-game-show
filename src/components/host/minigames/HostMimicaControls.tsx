import React from 'react';
import { Shuffle, Timer, Check, RotateCcw, ChevronRight } from 'lucide-react';
import { MimicaCard } from '../../../lib/mimicaData';

export interface HostMimicaControlsProps {
  currentMimicaCard: MimicaCard;
  mimicaCardIndex: number;
  mimicaCards: MimicaCard[];
  onPickRandomMimicaCard: () => void;
  mimicaIsRunning: boolean;
  mimicaTimerSeconds: number | null;
  onToggleMimicaTimer: () => void;
  mimicaHitsCount: number;
  onAddMimicaHit: () => void;
  onSubtractMimicaHit: () => void;
  onResetMimicaRound: () => void;
  onNextMimicaCard: () => void;
}

export const HostMimicaControls: React.FC<HostMimicaControlsProps> = ({
  currentMimicaCard,
  mimicaCardIndex,
  mimicaCards,
  onPickRandomMimicaCard,
  mimicaIsRunning,
  mimicaTimerSeconds,
  onToggleMimicaTimer,
  mimicaHitsCount,
  onAddMimicaHit,
  onSubtractMimicaHit,
  onResetMimicaRound,
  onNextMimicaCard,
}) => {
  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-3xl p-6 shadow-deco-gold space-y-5 deco-card-frame">
      <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎭</span>
          <span className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">
            Mímica Secreta ({mimicaCardIndex + 1}/{mimicaCards.length})
          </span>
        </div>
        <button
          onClick={onPickRandomMimicaCard}
          className="px-2.5 py-1 bg-[#14141e] hover:bg-[#1a1a28] text-amber-200 rounded-xl text-xs font-vintage font-bold border border-[#d4af37]/30 flex items-center gap-1 shadow-sm"
        >
          <Shuffle className="w-3 h-3 text-amber-400" />
          <span>Aleatorio</span>
        </button>
      </div>

      {/* TARJETA SECRETA DEL ACTOR (SOLO VISIBLE PARA EL HOST) */}
      <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl p-4 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-broadway text-amber-400">
            {currentMimicaCard.categoryEmoji} {currentMimicaCard.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-broadway font-bold border border-amber-500/30">
            Dificultad: {currentMimicaCard.difficulty}
          </span>
        </div>

        <h3 className="text-xl font-broadway text-gold-gradient">
          {currentMimicaCard.title}
        </h3>

        {currentMimicaCard.clueOrDetail && (
          <p className="text-xs text-amber-200/90 font-vintage italic bg-[#14141e] p-2.5 rounded-xl border border-[#d4af37]/30">
            💡 Cómo actuarlo: {currentMimicaCard.clueOrDetail}
          </p>
        )}
      </div>

      {/* CONTROLES DE TIEMPO Y ACIERTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <button
          onClick={onToggleMimicaTimer}
          className={`p-3.5 rounded-2xl font-broadway font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all ${
            mimicaIsRunning
              ? 'bg-amber-500 text-slate-950 animate-pulse'
              : mimicaTimerSeconds === 0
              ? 'bg-red-500 hover:bg-red-400 text-white'
              : 'bg-gold-gradient text-slate-950 border border-[#f5eedb]/40 shadow-deco-gold'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>
            {mimicaIsRunning
              ? `⏸️ Pausar (${mimicaTimerSeconds}s)`
              : mimicaTimerSeconds === 0
              ? '⏱️ Reiniciar 90s'
              : mimicaTimerSeconds && mimicaTimerSeconds < 90
              ? `▶️ Reanudar (${mimicaTimerSeconds}s)`
              : '⏱️ Iniciar 90s'}
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={onAddMimicaHit}
            className="flex-1 p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-broadway font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>🎯 +1 ({mimicaHitsCount})</span>
          </button>
          {mimicaHitsCount > 0 && (
            <button
              onClick={onSubtractMimicaHit}
              className="px-2.5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-red-300 font-black text-xs border border-slate-700 active:scale-95 transition-all"
              title="Restar 1 acierto (corrección)"
            >
              -1
            </button>
          )}
        </div>

        <button
          onClick={onResetMimicaRound}
          className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-red-950/80 text-slate-300 hover:text-red-200 border border-slate-700 hover:border-red-500/50 font-broadway font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          title="Poner a 0 los aciertos y reiniciar el cronómetro a 90s para el siguiente equipo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Ronda</span>
        </button>

        <button
          onClick={onNextMimicaCard}
          className="p-3.5 rounded-2xl bg-[#14141e] hover:bg-[#1a1a28] text-amber-200 border border-[#d4af37]/30 font-broadway font-bold text-xs uppercase flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
        >
          <span>Siguiente Tarjeta</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

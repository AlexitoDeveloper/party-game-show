import React from 'react';
import { Team } from '../../../lib/types';

interface TvMimicaGameProps {
  mimicaTimerSeconds: number | null;
  mimicaHitsCount: number;
  activeTeam?: Team;
}

export const TvMimicaGame: React.FC<TvMimicaGameProps> = ({
  mimicaTimerSeconds,
  mimicaHitsCount,
  activeTeam,
}) => {
  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-10 shadow-deco-gold relative overflow-hidden backdrop-blur-xl hell-card-frame">
      {activeTeam ? (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs sm:text-sm font-broadway font-black uppercase tracking-wider mb-3 border border-[#f5eedb]/50 shadow-md">
          <span>🎬</span> ACTUANDO EN ESCENA: {activeTeam.name}
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14141e] text-amber-200/80 text-xs sm:text-sm font-vintage font-bold uppercase tracking-wider mb-3 border border-[#d4af37]/35 shadow-md">
          <span>⏳</span> ESPERANDO AL EQUIPO ACTOR...
        </div>
      )}
      <h2 className="text-3xl sm:text-5xl font-broadway text-gold-gradient mb-6 uppercase drop-shadow-md">
        🎭 ¡PROHIBIDO HABLAR!
      </h2>

      <div className="flex items-center justify-center gap-8 sm:gap-12 my-4">
        <div
          className={`p-6 sm:p-8 rounded-3xl bg-[#07070a]/90 border-2 text-center min-w-[200px] shadow-deco-gold transition-all ${
            mimicaTimerSeconds === 0
              ? 'border-red-500 animate-bounce'
              : mimicaTimerSeconds !== null && mimicaTimerSeconds <= 10
              ? 'border-red-500 animate-pulse'
              : 'border-[#d4af37]/50'
          }`}
        >
          <span className="text-xs sm:text-sm uppercase font-broadway tracking-wider text-amber-300 block mb-2">
            Tiempo Restante
          </span>
          <div
            className={`text-7xl sm:text-8xl font-broadway drop-shadow-md ${
              mimicaTimerSeconds === 0
                ? 'text-red-500'
                : mimicaTimerSeconds !== null && mimicaTimerSeconds <= 10
                ? 'text-red-500'
                : 'text-gold-gradient'
            }`}
          >
            {mimicaTimerSeconds === 0 ? '¡FIN!' : mimicaTimerSeconds !== null ? `${mimicaTimerSeconds}s` : '90s'}
          </div>
          {mimicaTimerSeconds === 0 && (
            <span className="text-xs uppercase font-broadway font-black text-red-400 tracking-widest mt-1 block animate-pulse">
              ⏰ ¡TIEMPO AGOTADO!
            </span>
          )}
        </div>
        <div className="p-6 sm:p-8 rounded-3xl bg-[#07070a]/90 border-2 border-emerald-400/50 text-center min-w-[200px] shadow-[0_0_30px_rgba(52,211,153,0.25)]">
          <span className="text-xs sm:text-sm uppercase font-broadway tracking-wider text-emerald-300 block mb-2">
            Aciertos Ronda
          </span>
          <div className="text-7xl sm:text-8xl font-broadway text-emerald-300 drop-shadow-md">
            {mimicaHitsCount}
          </div>
        </div>
      </div>
    </div>
  );
};


import React from 'react';

interface TvMimicaGameProps {
  mimicaTimerSeconds: number | null;
  mimicaHitsCount: number;
}

export const TvMimicaGame: React.FC<TvMimicaGameProps> = ({
  mimicaTimerSeconds,
  mimicaHitsCount,
}) => {
  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-10 shadow-deco-gold relative overflow-hidden backdrop-blur-xl hell-card-frame">
      <h2 className="text-3xl sm:text-5xl font-broadway text-gold-gradient mb-6 uppercase drop-shadow-md">
        🎭 ¡PROHIBIDO HABLAR!
      </h2>

      <div className="flex items-center justify-center gap-8 sm:gap-12 my-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#07070a]/90 border-2 border-[#d4af37]/50 text-center min-w-[200px] shadow-deco-gold">
          <span className="text-xs sm:text-sm uppercase font-broadway tracking-wider text-amber-300 block mb-2">Tiempo Restante</span>
          <div className="text-7xl sm:text-8xl font-broadway text-gold-gradient drop-shadow-md">
            {mimicaTimerSeconds !== null ? `${mimicaTimerSeconds}s` : '90s'}
          </div>
        </div>
        <div className="p-6 sm:p-8 rounded-3xl bg-[#07070a]/90 border-2 border-emerald-400/50 text-center min-w-[200px] shadow-[0_0_30px_rgba(52,211,153,0.25)]">
          <span className="text-xs sm:text-sm uppercase font-broadway tracking-wider text-emerald-300 block mb-2">Aciertos Ronda</span>
          <div className="text-7xl sm:text-8xl font-broadway text-emerald-300 drop-shadow-md">
            {mimicaHitsCount}
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-deco-gold relative overflow-hidden backdrop-blur-xl hell-card-frame">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-widest mb-4 border border-[#f5eedb]/40 shadow-sm">
        <span>🎭</span> TEATRO DE CINE MUDO Y MÍMICA
      </div>
      <h2 className="text-3xl sm:text-5xl font-broadway text-gold-gradient mb-2 uppercase drop-shadow-md">
        ¡PROHIBIDO HABLAR O EMITIR SONIDOS!
      </h2>
      <p className="text-sm font-vintage text-amber-100/80 max-w-lg mx-auto mb-6">
        El actor interpreta el reto que le dio el anfitrión en su móvil. ¡Su equipo debe adivinar antes de que acabe el tiempo!
      </p>

      <div className="flex items-center justify-center gap-8 my-6">
        <div className="p-6 rounded-3xl bg-[#07070a]/90 border-2 border-[#d4af37]/40 text-center min-w-[170px] shadow-deco-gold">
          <span className="text-xs uppercase font-broadway tracking-wider text-amber-300 block mb-1">Tiempo Restante</span>
          <div className="text-6xl font-broadway text-gold-gradient drop-shadow-md">
            {mimicaTimerSeconds !== null ? `${mimicaTimerSeconds}s` : '90s'}
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-[#07070a]/90 border-2 border-emerald-400/40 text-center min-w-[170px] shadow-[0_0_30px_rgba(52,211,153,0.25)]">
          <span className="text-xs uppercase font-broadway tracking-wider text-emerald-300 block mb-1">Aciertos Ronda</span>
          <div className="text-6xl font-broadway text-emerald-300 drop-shadow-md">
            {mimicaHitsCount}
          </div>
        </div>
      </div>

      <div className="text-xs font-vintage font-bold uppercase tracking-wider text-amber-300/80">
        🤫 El presentador tiene las tarjetas secretas y controla el tiempo en su móvil
      </div>
    </div>
  );
};

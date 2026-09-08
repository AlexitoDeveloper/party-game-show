import React from 'react';
import { getBingoBallTheme, BINGO_NICKNAMES } from '../../lib/bingoUtils';

interface PlayerBingoSectionProps {
  bingoIsSpinning: boolean;
  bingoCurrentBall: number | null;
  bingoDrawnBalls: number[];
}

export const PlayerBingoSection: React.FC<PlayerBingoSectionProps> = ({
  bingoIsSpinning,
  bingoCurrentBall,
  bingoDrawnBalls,
}) => {
  return (
    <div className="my-auto w-full max-w-sm space-y-3 text-center px-1">
      <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 shadow-deco-gold backdrop-blur-xl deco-card-frame">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-gradient text-slate-950 text-[11px] font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm mb-3">
          <span>🎱</span> BINGO DE SALÓN EN VIVO
        </div>

        {/* BOLA EN PANTALLA */}
        <div className="flex flex-col items-center justify-center my-2 min-h-[140px]">
          {bingoIsSpinning ? (
            <div className="w-28 h-28 rounded-full bg-gold-gradient flex flex-col items-center justify-center shadow-deco-gold border-4 border-[#f5eedb] animate-spin">
              <span className="text-3xl">🎱</span>
            </div>
          ) : bingoCurrentBall ? (
            (() => {
              const theme = getBingoBallTheme(bingoCurrentBall);
              const nick = BINGO_NICKNAMES[bingoCurrentBall];
              return (
                <div className="flex flex-col items-center animate-bounce-short">
                  <div
                    className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 shadow-deco-gold relative select-none ${theme.bgGradient} ${theme.border} ${theme.shadow}`}
                  >
                    <div className="absolute top-2 left-4 w-6 h-3 bg-white/40 rounded-full blur-[1px] -rotate-12 pointer-events-none" />
                    <span className={`text-5xl font-broadway tracking-tighter ${theme.ballTextClass}`}>
                      {bingoCurrentBall}
                    </span>
                  </div>
                  {nick && (
                    <span className="mt-2.5 text-xs font-broadway uppercase tracking-wider text-slate-950 bg-gold-gradient border border-[#f5eedb]/40 px-3 py-1 rounded-full shadow-sm">
                      "{nick}"
                    </span>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="w-28 h-28 rounded-full bg-[#07070a]/90 border-2 border-dashed border-[#d4af37]/40 flex flex-col items-center justify-center text-amber-300/60 p-2 text-center">
              <span className="text-2xl mb-1">🎱</span>
              <span className="text-[10px] font-vintage font-bold">Esperando extracción de bola</span>
            </div>
          )}
        </div>

        {/* CONTADOR DE BOLAS */}
        <div className="mt-3 pt-3 border-t border-[#d4af37]/30 flex items-center justify-between text-xs text-amber-200/80 font-vintage">
          <span className="font-bold">Bolas extraídas:</span>
          <span className="font-broadway text-gold-gradient text-sm">
            {bingoDrawnBalls.length} <span className="text-[11px] text-amber-200/50">/ 90</span>
          </span>
        </div>

        {/* BOLAS RECIENTES */}
        {bingoDrawnBalls.length > 0 && (
          <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-vintage font-bold text-amber-300/60 mr-1">Previas:</span>
            {bingoDrawnBalls.slice(-5).reverse().map((num, idx) => {
              const ballTheme = getBingoBallTheme(num);
              return (
                <span
                  key={`${num}-${idx}`}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-broadway font-black shadow-sm ${ballTheme.bgGradient} ${ballTheme.ballTextClass} ${idx === 0 ? 'ring-2 ring-amber-400' : 'opacity-70'}`}
                >
                  {num}
                </span>
              );
            })}
          </div>
        )}

        {/* RECORDATORIO DE PREMIOS */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-left">
          <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-xl p-2 shadow-inner">
            <div className="text-[10px] font-broadway uppercase text-amber-300">📏 Línea</div>
            <div className="text-xs font-vintage font-bold text-white">+2 puntos</div>
          </div>
          <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-xl p-2 shadow-inner">
            <div className="text-[10px] font-broadway uppercase text-gold-gradient">🎱 BINGO</div>
            <div className="text-xs font-vintage font-bold text-white">+6 puntos</div>
          </div>
        </div>

        <p className="text-[11px] text-amber-200/70 mt-3 font-vintage font-semibold">
          Juega con tu cartón físico. Si completas Línea o Bingo, ¡avisa al anfitrión en directo!
        </p>
      </div>
    </div>
  );
};

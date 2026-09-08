import React from 'react';
import { BingoRoulette } from '../../BingoRoulette';
import { getBingoBallTheme } from '../../../lib/bingoUtils';

interface TvBingoGameProps {
  bingoCurrentBall: number | null;
  bingoDrawnBalls: number[];
  bingoIsSpinning: boolean;
}

export const TvBingoGame: React.FC<TvBingoGameProps> = ({
  bingoCurrentBall,
  bingoDrawnBalls,
  bingoIsSpinning,
}) => {
  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-4 sm:p-6 shadow-deco-gold relative overflow-hidden backdrop-blur-xl deco-card-frame">
      {/* CABECERA COMPACTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm">
          <span>🎰</span> RULETA Y BOMBO VIRTUAL (1 - 90)
        </div>
        <div className="flex items-center gap-2.5 text-xs font-broadway">
          <span className="px-3.5 py-1 rounded-full bg-[#14141e] text-amber-200 border border-[#d4af37]/40 shadow-sm">
            📏 Línea: +2 pts
          </span>
          <span className="px-3.5 py-1 rounded-full bg-gold-gradient text-slate-950 border border-[#f5eedb]/50 shadow-deco-gold font-black">
            🎱 BINGO: +6 pts
          </span>
        </div>
      </div>

      {/* LAYOUT EN 2 COLUMNAS PARA QUE TODO QUEPA EN PANTALLA SIN SCROLL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* COLUMNA IZQUIERDA: BOMBO / RULETA */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <BingoRoulette
            currentBall={bingoCurrentBall}
            drawnBalls={bingoDrawnBalls}
            isSpinning={bingoIsSpinning}
          />
        </div>

        {/* COLUMNA DERECHA: PANEL COMPLETO DE LOS 90 NÚMEROS (10x9, SIN SCROLL) */}
        <div className="lg:col-span-8 p-3 sm:p-4 rounded-2xl bg-[#07070a]/90 border border-[#d4af37]/40 shadow-inner flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-[11px] uppercase font-broadway tracking-wider text-amber-300">
              Panel de Números Extraídos:
            </span>
            <span className="text-[11px] font-broadway text-gold-gradient font-black">
              {bingoDrawnBalls.length} de 90 bolas
            </span>
          </div>

          {/* 10 columnas x 9 filas: los 90 números con legibilidad óptima */}
          <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
            {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
              const isDrawn = bingoDrawnBalls.includes(num);
              const isCurrent = bingoCurrentBall === num;
              const theme = getBingoBallTheme(num);
              return (
                <div
                  key={num}
                  className={`h-6 sm:h-7 rounded-md flex items-center justify-center text-[11px] sm:text-xs font-mono font-black transition-all ${
                    isCurrent
                      ? `bg-gradient-to-tr ${theme.bgGradient} ${theme.gridTextClass} scale-110 shadow-deco-gold ring-2 ring-amber-300 z-10 animate-pulse`
                      : isDrawn
                      ? `bg-gradient-to-tr ${theme.bgGradient} ${theme.gridTextClass} shadow-sm opacity-95 ${
                          theme.isLightColor ? 'border border-slate-400 font-extrabold' : ''
                        }`
                      : 'bg-[#101018] text-[#d4af37]/40 border border-[#d4af37]/15 hover:border-[#d4af37]/40'
                  }`}
                  style={!isDrawn && !isCurrent ? { borderColor: '#d4af3720' } : undefined}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { BingoRoulette } from '../../BingoRoulette';
import { getBingoBallTheme } from '../../../lib/bingoUtils';
import { BingoClaimPayload } from '../../../lib/types';
import { generateAvatarDataUri } from '../../../lib/dicebear';

interface TvBingoGameProps {
  bingoCurrentBall: number | null;
  bingoDrawnBalls: number[];
  bingoIsSpinning: boolean;
  bingoCelebration?: BingoClaimPayload | null;
  lineAwarded?: boolean;
  bingoAwarded?: boolean;
  lineWinner?: { playerName: string; teamName: string } | null;
  bingoWinner?: { playerName: string; teamName: string } | null;
}

export const TvBingoGame: React.FC<TvBingoGameProps> = ({
  bingoCurrentBall,
  bingoDrawnBalls,
  bingoIsSpinning,
  bingoCelebration,
  lineAwarded = false,
  bingoAwarded = false,
  lineWinner = null,
  bingoWinner = null,
}) => {
  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-4 sm:p-6 shadow-deco-gold relative overflow-hidden backdrop-blur-xl hell-card-frame">
      {/* BANNER GIGANTE DE CELEBRACIÓN DE CANTO EN VIVO */}
      {bingoCelebration && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-bounce-short">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gold-gradient text-slate-950 font-broadway font-black text-sm uppercase tracking-widest shadow-deco-gold border border-[#f5eedb] mb-4">
            <span>📢</span> ¡CANTO EN DIRECTO DESDE EL MÓVIL!
          </div>

          <h2 className="text-4xl sm:text-6xl font-broadway uppercase tracking-tight text-gold-gradient mb-3 drop-shadow-lg">
            {bingoCelebration.claimType === 'line' ? '📏 ¡¡LÍNEA CANTADA!!' : '🎱 ¡¡¡BINGO CANTADO!!!'}
          </h2>

          <div className="flex items-center justify-center gap-4 my-4 p-4 rounded-3xl bg-[#0a0a14] border-2 border-[#d4af37]/60 shadow-deco-gold">
            {bingoCelebration.avatarSeed && (
              <img
                src={generateAvatarDataUri(
                  bingoCelebration.avatarSeed,
                  (bingoCelebration.avatarStyle as any) || 'avataaars'
                )}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-[#d4af37] bg-slate-900 shadow-md"
              />
            )}
            <div className="text-left">
              <span className="text-2xl sm:text-3xl font-broadway text-white block">
                {bingoCelebration.playerName}
              </span>
              <span
                className="inline-block px-3 py-1 rounded-lg font-broadway font-black text-xs sm:text-sm text-slate-950 uppercase shadow-sm mt-1"
                style={{ backgroundColor: bingoCelebration.teamColorHex || '#d4af37' }}
              >
                {bingoCelebration.teamName}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl my-2">
            {bingoCelebration.numbers.map((num) => {
              const isDrawn = bingoDrawnBalls.includes(num);
              return (
                <span
                  key={num}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-broadway font-black text-sm shadow-sm border ${
                    isDrawn
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                      : 'bg-[#181824] text-amber-200/60 border-[#d4af37]/30'
                  }`}
                >
                  {num}
                </span>
              );
            })}
          </div>

          <p className="text-xs font-vintage text-amber-300/80 mt-4 uppercase tracking-widest animate-pulse">
            El Maestro de Ceremonias está comprobando el cartón en la consola del anfitrión...
          </p>
        </div>
      )}

      {/* CABECERA COMPACTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm">
          <span>🎰</span> RULETA Y BOMBO VIRTUAL (1 - 90)
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-broadway">
          <span
            className={`px-3.5 py-1 rounded-full border shadow-sm transition-all ${
              lineAwarded
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 ring-1 ring-emerald-400'
                : 'bg-[#14141e] text-amber-200 border-[#d4af37]/40'
            }`}
          >
            {lineAwarded
              ? lineWinner
                ? `✅ Línea: ${lineWinner.playerName} (${lineWinner.teamName})`
                : '✅ Línea Validada (+2 pts)'
              : '📏 Línea: +2 pts'}
          </span>
          <span
            className={`px-3.5 py-1 rounded-full border shadow-deco-gold font-black transition-all ${
              bingoAwarded
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 ring-1 ring-emerald-400'
                : 'bg-gold-gradient text-slate-950 border-[#f5eedb]/50'
            }`}
          >
            {bingoAwarded
              ? bingoWinner
                ? `🏆 BINGO: ${bingoWinner.playerName} (${bingoWinner.teamName})`
                : '🏆 BINGO Ganado (+6 pts)'
              : '🎱 BINGO: +6 pts'}
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

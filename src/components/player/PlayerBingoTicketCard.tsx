import React from 'react';
import { BingoTicket } from '../../lib/bingoTicketGenerator';
import { soundFX } from '../../lib/audio';
import { playerHaptics } from '../../lib/playerHaptics';
import { Check } from 'lucide-react';

interface PlayerBingoTicketCardProps {
  ticket: BingoTicket;
  markedNumbers: Set<number>;
  drawnBalls: number[];
  onToggleNumber: (num: number) => void;
  teamColorHex?: string;
}

const SUIT_WATERMARKS = ['♠', '♥', '♣', '♦'];

export const PlayerBingoTicketCard: React.FC<PlayerBingoTicketCardProps> = ({
  ticket,
  markedNumbers,
  drawnBalls,
  onToggleNumber,
  teamColorHex = '#d4af37',
}) => {
  const handleCellClick = (num: number) => {
    soundFX.playChipClink();
    playerHaptics.stamp();
    onToggleNumber(num);
  };

  return (
    <div className="w-full h-full flex flex-col justify-center select-none">
      {/* CUADRÍCULA 3 FILAS × 9 COLUMNAS */}
      <div className="grid grid-rows-3 grid-cols-9 gap-1 sm:gap-1.5 p-2 sm:p-3 bg-[#0a0a12]/95 border-2 border-[#d4af37]/70 rounded-2xl sm:rounded-3xl shadow-deco-gold backdrop-blur-xl hell-card-frame w-full h-full max-h-[340px]">
        {ticket.map((row, rIdx) =>
          row.map((val, cIdx) => {
            const cellKey = `cell-${rIdx}-${cIdx}`;

            // 1. CASILLA VACÍA (HUECO DEL CARTÓN)
            if (val === null) {
              const watermark = SUIT_WATERMARKS[(rIdx * 9 + cIdx) % SUIT_WATERMARKS.length];
              return (
                <div
                  key={cellKey}
                  className="rounded-lg sm:rounded-xl bg-[#06060a]/80 border border-[#d4af37]/15 flex items-center justify-center relative overflow-hidden"
                >
                  <span className="text-xs sm:text-base text-[#d4af37]/10 font-serif select-none pointer-events-none">
                    {watermark}
                  </span>
                </div>
              );
            }

            // 2. CASILLA CON NÚMERO
            const isMarked = markedNumbers.has(val);
            const isDrawn = drawnBalls.includes(val);

            return (
              <button
                key={cellKey}
                onClick={() => handleCellClick(val)}
                className={`rounded-lg sm:rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-95 cursor-pointer font-broadway font-black ${
                  isMarked
                    ? 'bg-gold-gradient text-slate-950 border-2 border-[#f5eedb] shadow-deco-gold scale-[0.98]'
                    : isDrawn
                    ? 'bg-[#18150e] text-amber-200 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-deco-gold animate-pulse'
                    : 'bg-[#12121c] text-amber-100 hover:text-white border border-[#d4af37]/35 hover:border-[#d4af37]/70'
                }`}
                style={
                  isMarked
                    ? { boxShadow: `0 0 14px ${teamColorHex}60, inset 0 2px 4px rgba(255,255,255,0.4)` }
                    : undefined
                }
              >
                {/* FICHA TACHADA DE CASINO */}
                {isMarked ? (
                  <div className="flex flex-col items-center justify-center w-full h-full relative">
                    {/* Borde estriado de ficha de poker */}
                    <div className="absolute inset-0.5 rounded-md sm:rounded-lg border border-dashed border-slate-900/40 pointer-events-none" />
                    <span className="text-base sm:text-xl md:text-2xl leading-none drop-shadow-sm">
                      {val}
                    </span>
                    <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shadow-sm">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full relative">
                    <span
                      className={`text-base sm:text-xl md:text-2xl leading-none ${
                        isDrawn ? 'text-amber-300 font-extrabold drop-shadow' : 'text-amber-100/90'
                      }`}
                    >
                      {val}
                    </span>

                    {/* INDICADOR DE BOLA SALIDA EN BOMBO */}
                    {isDrawn && (
                      <span className="absolute bottom-0.5 text-[8px] sm:text-[9px] uppercase font-vintage font-bold text-amber-400 leading-none">
                        ¡Salió!
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

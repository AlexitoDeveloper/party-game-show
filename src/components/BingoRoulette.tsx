import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBingoBallTheme, BINGO_NICKNAMES } from '../lib/bingoUtils';
import { Sparkles } from 'lucide-react';

interface BingoRouletteProps {
  currentBall: number | null;
  drawnBalls: number[];
  isSpinning?: boolean;
}

const TUMBLING_BALLS = [
  { bg: 'bg-blue-500', border: 'border-blue-300' },
  { bg: 'bg-red-500', border: 'border-red-300' },
  { bg: 'bg-yellow-400', border: 'border-yellow-200' },
  { bg: 'bg-white', border: 'border-slate-400' },
  { bg: 'bg-purple-500', border: 'border-purple-300' },
];

export const BingoRoulette: React.FC<BingoRouletteProps> = ({
  currentBall,
  drawnBalls,
  isSpinning = false,
}) => {
  const [displayedTempNum, setDisplayedTempNum] = useState<number | string>('?');

  // Número aleatorio visual durante el giro de la ruleta (sin sonido)
  useEffect(() => {
    if (!isSpinning) return;

    const interval = setInterval(() => {
      const rand = Math.floor(Math.random() * 90) + 1;
      setDisplayedTempNum(rand);
    }, 90);

    return () => clearInterval(interval);
  }, [isSpinning]);

  const ballTheme = getBingoBallTheme(currentBall);
  const nickname = currentBall ? BINGO_NICKNAMES[currentBall] : null;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* ESCENARIO COMPACTO DE RULETA Y BOMBO */}
      <div className="relative flex flex-col items-center justify-center">
        {/* LUZ DE FONDO Y GLOW RADIAL */}
        <div
          className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full blur-[60px] pointer-events-none transition-all duration-700"
          style={{
            backgroundColor: currentBall ? (ballTheme.isLightColor ? '#e2e8f0' : ballTheme.colorHex) : '#f59e0b',
            opacity: ballTheme.isLightColor ? 0.35 : 0.25,
          }}
        />

        {/* CÚPULA / JAULA GIRATORIA DE ALAMBRE DORADO ESTILO 1930 */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border-4 border-[#d4af37] bg-gradient-to-b from-[#18130a] via-[#0d0d12] to-black p-2 shadow-gold-glow flex items-center justify-center">
          {/* ARO EXTERIOR CON BOMBILLAS DE TEATRO Y FILIGRANA */}
          <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#f3e5ab]/50 pointer-events-none" />

          {/* RAYOS DE LA JAULA DE ORO EN MOVIMIENTO */}
          <motion.div
            animate={{ rotate: isSpinning ? 1800 : 0 }}
            transition={{
              duration: isSpinning ? 2.2 : 0.6,
              ease: isSpinning ? 'linear' : 'easeOut',
              repeat: isSpinning ? Infinity : 0,
            }}
            className="absolute inset-3 rounded-full border-2 border-[#d4af37]/40 flex items-center justify-center opacity-90"
          >
            {[0, 30, 60, 90, 120, 150].map((deg) => (
              <div
                key={deg}
                className="absolute w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#f3e5ab]/60 to-transparent"
                style={{ transform: `rotate(${deg}deg)` }}
              />
            ))}
          </motion.div>

          {/* CÁPSULA DE VIDRIO CON BOLITAS DE COLORES DENTRO */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#08080d]/90 border-2 border-[#d4af37]/60 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-inner">
            {/* Reflejo de cristal */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/15 rounded-full blur-lg pointer-events-none" />

            {/* BOLITAS DE LOS 5 COLORES REBOTANDO DENTRO */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {TUMBLING_BALLS.map((tBall, i) => {
                const positions = [
                  { x: 25, y: 30, delay: 0 },
                  { x: 65, y: 60, delay: 0.2 },
                  { x: 35, y: 70, delay: 0.4 },
                  { x: 60, y: 25, delay: 0.1 },
                  { x: 25, y: 55, delay: 0.3 },
                ];
                const pos = positions[i % positions.length];
                return (
                  <motion.div
                    key={i}
                    animate={
                      isSpinning
                        ? {
                            x: [0, (i % 2 === 0 ? 30 : -30), (i % 3 === 0 ? -25 : 25), 0],
                            y: [0, (i % 2 === 0 ? -30 : 30), (i % 3 === 0 ? 20 : -20), 0],
                            scale: [0.8, 1.25, 0.9, 1],
                          }
                        : { x: 0, y: 0, scale: 1 }
                    }
                    transition={{
                      duration: 0.45,
                      repeat: isSpinning ? Infinity : 0,
                      ease: 'easeInOut',
                      delay: pos.delay,
                    }}
                    className={`absolute w-4 h-4 rounded-full ${tBall.bg} shadow-sm opacity-90 border ${tBall.border}`}
                    style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
                  />
                );
              })}
            </div>

            {/* CENTRO: NÚMERO GIRANDO O LOGO BOMBO */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {isSpinning ? (
                <motion.div
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                  className="flex flex-col items-center"
                >
                  <span className="text-3xl sm:text-4xl font-black font-broadway text-gold-gradient drop-shadow-[0_0_15px_rgba(212,175,55,0.9)]">
                    {displayedTempNum}
                  </span>
                  <span className="text-[9px] uppercase font-broadway tracking-widest text-[#f3e5ab] mt-0.5 animate-pulse">
                    ¡GIRANDO!
                  </span>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-2xl text-[#d4af37]">🎱</span>
                  <span className="text-[10px] uppercase font-broadway tracking-widest text-[#f3e5ab] mt-0.5">
                    BOMBO
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SOPORTE MECÁNICO DE LATÓN */}
          <div className="absolute -bottom-3 w-20 h-4 bg-gradient-to-t from-[#1b1408] to-[#d4af37] rounded-t-lg border-t-2 border-[#f3e5ab]" />
        </div>

        {/* CANALETA / RAMPA DE SALIDA */}
        <div className="w-12 h-6 bg-gradient-to-b from-[#b87333] to-[#140e06] border-x-2 border-b-2 border-[#d4af37] rounded-b-xl shadow-md -mt-1 flex items-center justify-center">
          <div className="w-6 h-1.5 rounded-full bg-black/80" />
        </div>
      </div>

      {/* ZONA DE BOLA EXPULSADA (COMPACTA) */}
      <div className="mt-3 flex flex-col items-center min-h-[110px]">
        <AnimatePresence mode="wait">
          {isSpinning ? (
            <motion.div
              key="spinning-status"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#f3e5ab] font-vintage font-bold text-[11px] uppercase tracking-wider"
            >
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
              <span>Extrayendo bola de la suerte...</span>
            </motion.div>
          ) : currentBall !== null ? (
            <motion.div
              key={`ball-${currentBall}`}
              initial={{ opacity: 0, scale: 0.4, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="flex flex-col items-center"
            >
              {/* BOLA 3D RADIANTE CON ESMALTE Y NÚMERO BROADWAY */}
              <div
                className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr ${ballTheme.bgGradient} border-3 ${ballTheme.border} flex flex-col items-center justify-center shadow-2xl ${
                  ballTheme.isLightColor ? 'ring-2 ring-slate-400/80 shadow-white/30' : ''
                }`}
                style={{ boxShadow: `0 0 25px ${ballTheme.shadow}` }}
              >
                {/* Reflejo esférico superior */}
                <div className="absolute top-1.5 left-2.5 w-8 h-4 rounded-full bg-white/45 blur-[1px] -rotate-45 pointer-events-none" />

                {/* Número Grande con tipografía Broadway */}
                <span className={`text-3xl sm:text-4xl font-broadway font-black ${ballTheme.ballTextClass}`}>
                  {currentBall}
                </span>
              </div>

              {/* INFORMACIÓN DE LA BOLA Y APODO */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black font-broadway text-[#f3e5ab] uppercase tracking-wider">
                    ¡Bola {currentBall}!
                  </span>
                  {nickname && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#c5a059] text-[#0a0a0e] font-broadway text-[10px] uppercase shadow-md flex items-center gap-1 border border-white/40">
                      <Sparkles className="w-3 h-3" />
                      <span>{nickname}</span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 font-vintage font-bold tracking-wider">
                  Extraídas: <strong className="text-[#d4af37]">{drawnBalls.length}</strong> / 90
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="no-ball-yet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-2"
            >
              <div className="w-14 h-14 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-xl font-mono mx-auto mb-1">
                —
              </div>
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Esperando primera bola
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

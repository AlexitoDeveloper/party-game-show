import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Radio } from 'lucide-react';
import { TeamTheme } from '../lib/teamThemes';
import { GameIcon } from './GameIcon';
import { useGameAudio } from '../lib/useGameAudio';
import { playerHaptics } from '../lib/playerHaptics';

interface ArcadeBuzzerProps {
  theme: TeamTheme;
  isLocked: boolean;
  isDuelActive?: boolean;
  onPress: () => void;
  disabled?: boolean;
  isMeWinner?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

/**
 * ArcadeBuzzer: Pulsador hiper-realista estilo Ficha de Casino Clandestino & Campana de Latón 1930s.
 * Incorpora bisel estriado con palos de naipes (♠, ♥, ♣, ♦), muescas de ficha de casino,
 * rebote mecánico con resorte (spring), micro-háptica y ondas expansivas en oro.
 */
export const ArcadeBuzzer: React.FC<ArcadeBuzzerProps> = ({
  theme,
  isLocked,
  isDuelActive = false,
  onPress,
  disabled = false,
  isMeWinner = false,
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const { playBuzzer } = useGameAudio();

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isLocked || disabled) return;

    // Reproducción sonora instantánea en el móvil
    playBuzzer();

    // Vibración háptica optimizada con firma táctil
    playerHaptics.press();

    // Posición del toque para la onda ripple dorada
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples((prev) => [...prev.slice(-3), newRipple]);

    onPress();
  };

  const isDisabledState = isLocked || disabled;

  return (
    <div className="relative flex items-center justify-center p-2 select-none">
      {/* 1. Resplandor ambiental de casino */}
      {!isDisabledState && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: isDuelActive ? '#f59e0b' : theme.glowColor }}
        />
      )}

      {/* Si este jugador es el ganador de la carrera, explosión de halo dorado */}
      {isMeWinner && (
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none bg-[#ffd700]/50"
        />
      )}

      {/* 2. Chasis Exterior: Ficha de Casino de Gran Denominación con Bisel de Latón Estriado */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full arcade-buzzer-base p-3 flex items-center justify-center shadow-2xl">
        {/* Anillo de Palos de Naipes Grabados en Bajorrelieve (♠, ♥, ♣, ♦) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <span className="absolute top-1 text-xs text-[#f5eedb]/80 font-serif drop-shadow-md select-none">♠</span>
          <span className="absolute right-1.5 text-xs text-[#f5eedb]/80 font-serif drop-shadow-md select-none">♦</span>
          <span className="absolute bottom-1 text-xs text-[#f5eedb]/80 font-serif drop-shadow-md select-none">♣</span>
          <span className="absolute left-1.5 text-xs text-[#f5eedb]/80 font-serif drop-shadow-md select-none">♥</span>
        </div>

        {/* Anillo de contraste concéntrico de madera oscura y franja de muescas de ficha */}
        <div className="w-full h-full rounded-full bg-[#100c08] p-2.5 border-2 border-[#d4af37]/70 shadow-inner flex items-center justify-center relative overflow-hidden">
          {/* Muescas de ficha de casino en el perímetro */}
          <div className="absolute inset-0.5 rounded-full casino-chip-teeth opacity-25 pointer-events-none" />

          {/* 3. Botón Físico Pulsable 3D estilo Campana de Latón & Ficha */}
          <motion.button
            key={isLocked ? 'buzzer-locked' : 'buzzer-ready'}
            type="button"
            aria-disabled={isDisabledState}
            onPointerDown={handlePointerDown}
            animate={{ y: 0, scale: 1 }}
            whileTap={!isDisabledState ? { y: 7, scale: 0.95 } : undefined}
            transition={{ type: 'spring', stiffness: 550, damping: 28 }}
            className={`w-full h-full rounded-full relative overflow-hidden flex flex-col items-center justify-center p-5 border-4 transition-all duration-150 select-none ${
              isDisabledState
                ? 'bg-[#15151e] border-[#2d2d3d] opacity-65 cursor-not-allowed shadow-none'
                : isMeWinner
                ? 'bg-gold-gradient border-[#fff2b2] cursor-default shadow-[0_0_35px_rgba(255,215,0,0.8)] ring-4 ring-yellow-400/60'
                : `${theme.twBg} border-[#f3e5ab]/80 cursor-pointer active:translate-y-1`
            }`}
            style={{
              boxShadow: isDisabledState
                ? 'none'
                : isMeWinner
                ? '0 10px 25px rgba(255, 215, 0, 0.5), inset 0 3px 8px rgba(255, 255, 255, 0.8)'
                : `0 14px 0 rgba(18, 14, 9, 0.95), 0 20px 30px rgba(0, 0, 0, 0.75), inset 0 2px 6px rgba(255, 255, 255, 0.55), 0 0 0 2px #d4af37`,
            }}
          >
            {/* 4. Reflejo especular cúpula esmaltada (Dome Specular Highlight) */}
            <div className="absolute inset-0 arcade-buzzer-dome pointer-events-none rounded-full" />

            {/* 5. Ondas de impacto doradas al pulsar (Ripples) */}
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 3.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute rounded-full bg-[#f3e5ab]/60 pointer-events-none w-20 h-20"
                  style={{
                    left: r.x - 40,
                    top: r.y - 40,
                  }}
                  onAnimationComplete={() => {
                    setRipples((prev) => prev.filter((item) => item.id !== r.id));
                  }}
                />
              ))}
            </AnimatePresence>

            {/* 6. Contenido del Pulsador con Tipografía Broadway 1930 */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              {isDisabledState ? (
                <>
                  <Radio className="w-11 h-11 mb-1.5 text-slate-500 animate-pulse" />
                  <span className="text-xl sm:text-2xl font-black font-broadway uppercase tracking-widest text-slate-500">
                    BLOQUEADO
                  </span>
                </>
              ) : isMeWinner ? (
                <>
                  <span className="text-4xl mb-1 drop-shadow-md animate-bounce">👑</span>
                  <span className="text-2xl sm:text-3xl font-black font-broadway uppercase tracking-widest text-slate-950 drop-shadow-sm">
                    ¡TU TURNO!
                  </span>
                  <span className="text-[10px] font-broadway uppercase tracking-wider text-slate-900/90 font-bold mt-0.5">
                    ¡ERES EL MÁS RÁPIDO!
                  </span>
                </>
              ) : isDuelActive ? (
                <>
                  <Swords className={`w-14 h-14 mb-1.5 ${theme.twContrastText} animate-bounce drop-shadow-lg`} />
                  <span className={`text-3xl font-black font-broadway uppercase tracking-widest ${theme.twContrastText} drop-shadow-md`}>
                    ¡DUELO!
                  </span>
                </>
              ) : (
                <>
                  <GameIcon
                    name={
                      theme.index === 1
                        ? 'Drop'
                        : theme.index === 2
                        ? 'Flame'
                        : theme.index === 3
                        ? 'Lightning'
                        : theme.index === 4
                        ? 'Sparkle'
                        : theme.index === 5
                        ? 'Moon'
                        : theme.index === 6
                        ? 'Sparkle'
                        : theme.index === 7
                        ? 'Target'
                        : 'Sun'
                    }
                    size={48}
                    weight="fill"
                    glow={true}
                    className={`mb-1 ${theme.twContrastText} animate-pulse drop-shadow-lg`}
                  />
                  <span className={`text-2xl sm:text-3xl font-black font-broadway uppercase tracking-widest ${theme.twContrastText} drop-shadow-md`}>
                    ¡PULSAR!
                  </span>
                </>
              )}
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Radio } from 'lucide-react';
import { TeamTheme } from '../lib/teamThemes';
import { GameIcon } from './GameIcon';
import { useGameAudio } from '../lib/useGameAudio';

interface ArcadeBuzzerProps {
  theme: TeamTheme;
  isLocked: boolean;
  isDuelActive?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

/**
 * ArcadeBuzzer: Pulsador físico hiper-realista estilo arcade de concurso.
 * Incluye física de resorte (spring), bisel 3D, reflejo especular,
 * micro-vibración háptica (móvil) y ondas de impacto (ripple).
 */
export const ArcadeBuzzer: React.FC<ArcadeBuzzerProps> = ({
  theme,
  isLocked,
  isDuelActive = false,
  onPress,
  disabled = false,
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const { playBuzzer } = useGameAudio();

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isLocked || disabled) return;

    // Reproducción sonora instantánea en el móvil
    playBuzzer();

    // Vibración háptica en dispositivos móviles compatibles
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([35, 20, 60]);
      } catch {}
    }

    // Calcular posición del click para onda ripple
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples((prev) => [...prev.slice(-3), newRipple]);

    onPress();
  };

  const isDisabledState = isLocked || disabled;

  return (
    <div className="relative flex items-center justify-center p-4">
      {/* 1. Resplandor exterior dinámico */}
      {!isDisabledState && (
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: theme.glowColor }}
        />
      )}

      {/* 2. Chasis exterior / Anillo base (Efecto latón y caoba Art Deco biselado) */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full arcade-buzzer-base p-3.5 flex items-center justify-center shadow-2xl">
        {/* Anillo de contraste concéntrico de madera oscura y latón */}
        <div className="w-full h-full rounded-full bg-[#120e09] p-3 border-2 border-[#d4af37]/60 shadow-inner flex items-center justify-center">
          {/* 3. Botón físico pulsable 3D estilo timbre de casino */}
          <motion.button
            key={isLocked ? 'buzzer-locked' : 'buzzer-ready'}
            type="button"
            aria-disabled={isDisabledState}
            onPointerDown={handlePointerDown}
            animate={{ y: 0, scale: 1 }}
            whileTap={!isDisabledState ? { y: 8, scale: 0.96 } : undefined}
            transition={{ type: 'spring', stiffness: 600, damping: 30 }}
            className={`w-full h-full rounded-full relative overflow-hidden flex flex-col items-center justify-center p-6 border-4 transition-colors duration-150 select-none ${
              isDisabledState
                ? 'bg-[#1a1a24] border-[#2d2d3d] opacity-60 cursor-not-allowed shadow-none'
                : `${theme.twBg} border-[#f3e5ab]/70 cursor-pointer active:translate-y-1`
            }`}
            style={{
              boxShadow: isDisabledState
                ? 'none'
                : `0 14px 0 rgba(18, 14, 9, 0.9), 0 20px 30px rgba(0, 0, 0, 0.7), inset 0 2px 6px rgba(255, 255, 255, 0.55), 0 0 0 2px #d4af37`,
            }}
          >
            {/* 4. Reflejo especular cúpula (Dome Specular highlight) */}
            <div className="absolute inset-0 arcade-buzzer-dome pointer-events-none rounded-full" />

            {/* 5. Ondas de impacto doradas al pulsar */}
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  initial={{ scale: 0, opacity: 0.7 }}
                  animate={{ scale: 3.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute rounded-full bg-[#f3e5ab]/50 pointer-events-none w-20 h-20"
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

            {/* 6. Contenido del pulsador (Tipografía Broadway de 1930) */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              {isDisabledState ? (
                <>
                  <Radio className="w-12 h-12 mb-1.5 text-slate-500" />
                  <span className="text-xl sm:text-2xl font-black font-broadway uppercase tracking-widest text-slate-500">
                    BLOQUEADO
                  </span>
                </>
              ) : isDuelActive ? (
                <>
                  <Swords className={`w-14 h-14 mb-2 ${theme.twContrastText} animate-bounce drop-shadow-lg`} />
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
                    size={52}
                    weight="fill"
                    glow={true}
                    className={`mb-1.5 ${theme.twContrastText} animate-pulse drop-shadow-lg`}
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

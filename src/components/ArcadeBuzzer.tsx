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

      {/* 2. Chasis exterior / Anillo base (Efecto metálico oscuro biselado) */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full arcade-buzzer-base p-3 flex items-center justify-center">
        {/* Anillo de contraste interno */}
        <div className="w-full h-full rounded-full bg-slate-950/80 p-2.5 border-2 border-white/10 shadow-inner flex items-center justify-center">
          {/* 3. Botón físico pulsable 3D */}
          <motion.button
            type="button"
            disabled={isDisabledState}
            onPointerDown={handlePointerDown}
            animate={{ y: 0, scale: 1 }}
            whileTap={!isDisabledState ? { y: 12, scale: 0.95 } : undefined}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={`w-full h-full rounded-full relative overflow-hidden flex flex-col items-center justify-center p-6 border-4 transition-colors duration-200 select-none ${
              isDisabledState
                ? 'bg-slate-800 border-slate-700 opacity-60 cursor-not-allowed shadow-none'
                : `${theme.twBg} border-white/40 cursor-pointer`
            }`}
            style={{
              boxShadow: isDisabledState
                ? 'none'
                : `0 14px 0 rgba(0, 0, 0, 0.55), 0 20px 25px rgba(0, 0, 0, 0.5), inset 0 2px 6px rgba(255, 255, 255, 0.45)`,
            }}
          >
            {/* 4. Reflejo especular cúpula (Dome Specular highlight) */}
            <div className="absolute inset-0 arcade-buzzer-dome pointer-events-none rounded-full" />

            {/* 5. Ondas de impacto (Ripples) al pulsar */}
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 3.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute rounded-full bg-white/40 pointer-events-none w-20 h-20"
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

            {/* 6. Contenido del pulsador (Icono y texto de alto contraste) */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              {isDisabledState ? (
                <>
                  <Radio className="w-14 h-14 mb-2 text-slate-500" />
                  <span className="text-2xl font-black font-arcade uppercase tracking-wider text-slate-500">
                    BLOQUEADO
                  </span>
                </>
              ) : isDuelActive ? (
                <>
                  <Swords className={`w-14 h-14 mb-2 ${theme.twContrastText} animate-bounce drop-shadow-md`} />
                  <span className={`text-3xl font-black font-arcade uppercase tracking-wider ${theme.twContrastText} drop-shadow-sm`}>
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
                    size={56}
                    weight="fill"
                    glow={true}
                    className={`mb-2 ${theme.twContrastText} animate-pulse drop-shadow-md`}
                  />
                  <span className={`text-3xl sm:text-4xl font-black font-arcade uppercase tracking-wider ${theme.twContrastText} drop-shadow-sm`}>
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

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Crown, Target, Zap, RotateCcw, X } from 'lucide-react';
import { PowerCard, getCardImageUrl } from '../../lib/powerCards';
import { DecoProceduralSpandrel } from '../deco/DecoProceduralSpandrel';
import { CoinBurstCelebration } from '../particles/CoinBurstCelebration';
import { soundFX } from '../../lib/audio';

interface CinematicCardPlayRevealProps {
  activeAnimation: {
    type: 'deal' | 'play';
    teamName: string;
    card: PowerCard;
    targetName?: string;
    teamId?: string;
    teamColorHex?: string;
    teamThemeIndex?: number;
    sensoryLimitation?: string;
    recoveredCard?: PowerCard;
  } | null;
  onDismiss?: () => void;
  isHost?: boolean;
  onReturnToTeam?: (teamId: string, cardId: string) => void;
}

export const CinematicCardPlayReveal: React.FC<CinematicCardPlayRevealProps> = ({
  activeAnimation,
  onDismiss,
  isHost = false,
  onReturnToTeam,
}) => {
  const [hasLanded, setHasLanded] = useState(false);
  const [triggerCoinBurst, setTriggerCoinBurst] = useState(0);

  useEffect(() => {
    if (activeAnimation) {
      setHasLanded(false);
      // Disparar sonido cinemático y ráfaga al aterrizar la carta (a los 280ms)
      const timer = setTimeout(() => {
        setHasLanded(true);
        setTriggerCoinBurst(Date.now());
        soundFX.playCardSlam();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [activeAnimation]);

  if (!activeAnimation) return null;

  const { card, teamName, teamColorHex, targetName, sensoryLimitation, recoveredCard, type } = activeAnimation;
  const imageUrl = getCardImageUrl(card.id);
  const glowColor = card.glowColorHex || '#d4af37';
  const accentColor = teamColorHex || '#f59e0b';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#060403]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-3 sm:p-6 select-none overflow-hidden"
      >
        {/* Rayos dorados giratorios de fondo estilo Art Déco (Círculo de 250vmax que cubre toda la pantalla al girar sin cortes laterales) */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div
            className="w-[250vmax] h-[250vmax] min-w-[250vmax] min-h-[250vmax] rounded-full opacity-10 animate-[spin_80s_linear_infinite] flex-shrink-0"
            style={{
              background:
                'repeating-conic-gradient(from 0deg, #d4af37 0deg 10deg, transparent 10deg 20deg)',
            }}
          />
        </div>

        {/* Resplandor radial atmosférico */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${glowColor}33 0%, transparent 70%)`,
          }}
        />

        {/* Explosión de Fichas de Casino y Destellos de Oro al Impactar */}
        {hasLanded && (
          <CoinBurstCelebration
            active={hasLanded}
            trigger={triggerCoinBurst}
            originX={window.innerWidth / 2}
            originY={window.innerHeight / 2}
            count={50}
          />
        )}

        {/* Onda expansiva dorada (Shockwave ring perfectamente centrada) */}
        {hasLanded && (
          <motion.div
            initial={{ scale: 0.1, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-4 border-[#ffd700] pointer-events-none shadow-[0_0_60px_#ffd700]"
          />
        )}

        {/* Temblor de pantalla sutil en el impacto */}
        <motion.div
          animate={
            hasLanded
              ? {
                  x: [0, -8, 8, -5, 5, -2, 2, 0],
                  y: [0, 4, -4, 3, -3, 1, 0],
                }
              : {}
          }
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative max-w-lg w-full flex flex-col items-center space-y-4 z-10"
        >
          {/* CABECERA MARQUEE: EQUIPO QUE LANZA LA CARTA */}
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 22 }}
            className="w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-md"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: accentColor,
              boxShadow: `0 0 35px ${accentColor}40`,
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border"
                style={{ backgroundColor: `${accentColor}30`, borderColor: accentColor }}
              >
                <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div className="min-w-0 text-left">
                <span className="text-[10px] sm:text-xs uppercase font-broadway tracking-widest block text-amber-200/80">
                  {type === 'deal' ? 'Naipe Repartido a' : '¡Naipe de Poder Jugado!'}
                </span>
                <h3 className="text-lg sm:text-2xl font-broadway uppercase text-white truncate drop-shadow-md">
                  {teamName}
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-black/70 border border-amber-400/50 text-[11px] font-vintage text-amber-300 uppercase tracking-wider font-bold shrink-0">
              ★ {card.rarity} ★
            </span>
          </motion.div>

          {/* CARTA CON ENTRADA CINEMÁTICA DE IMPACTO (SLAM DIRECTO SIN FLIP QUE DEJE LATERALES NEGROS) */}
          <motion.div
            initial={{ scale: 2.4, y: -60, opacity: 0, rotateZ: -10 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotateZ: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              mass: 0.85,
            }}
            className="relative w-[240px] sm:w-[280px] h-[350px] sm:h-[400px] rounded-3xl p-3 bg-[#0a0604] border-4 border-[#d4af37] shadow-[0_0_60px_rgba(212,175,55,0.4)] flex flex-col justify-between overflow-hidden group"
          >
            {/* Esquinas procedurales doradas */}
            <DecoProceduralSpandrel size={34} position="top-left" />
            <DecoProceduralSpandrel size={34} position="top-right" />
            <DecoProceduralSpandrel size={30} position="bottom-left" />
            <DecoProceduralSpandrel size={30} position="bottom-right" />

            {/* Ilustración Grande a Sangre de la Carta */}
            <div className="w-full h-full rounded-2xl overflow-hidden bg-black/90 border border-amber-500/40 relative flex items-center justify-center">
              <img
                src={imageUrl}
                alt={card.name}
                className="w-full h-full object-cover object-center pointer-events-none select-none"
              />

              {/* Sello de foil y resplandor dinámico que cruza el naipe */}
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: [0, 0.6, 0] }}
                transition={{ repeat: Infinity, repeatDelay: 2.5, duration: 1.5, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent pointer-events-none transform -skew-x-12"
              />
            </div>
          </motion.div>

          {/* FICHA INFERIOR CON NOMBRE, TIMING Y EFECTO COMPLETO */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="w-full bg-[#120b06]/95 border-2 border-[#d4af37]/60 rounded-2xl p-4 shadow-deco-gold backdrop-blur-md text-center space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <h2 className="text-base sm:text-lg font-broadway uppercase tracking-wider text-gold-gradient">
                {card.name}
              </h2>
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/40 text-amber-300 font-vintage font-bold">
                {card.timing}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-amber-100/90 font-body leading-relaxed px-2">
              {card.description}
            </p>

            {/* AVISO DE OBJETIVO SI APLICA */}
            {targetName && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-950/80 border border-red-500/60 text-xs font-vintage text-red-200 font-bold shadow-md">
                <Target className="w-3.5 h-3.5 text-red-400" />
                <span>Objetivo: <strong className="text-white underline">{targetName}</strong></span>
              </div>
            )}

            {/* LIMITACIÓN SENSORIAL (SI ES EL CUARTO MONO) */}
            {sensoryLimitation && (
              <div className="bg-purple-950/80 border border-purple-400/60 p-2.5 rounded-xl text-center shadow-md">
                <span className="text-[10px] uppercase font-vintage text-purple-300 font-bold block">
                  🌀 Limitación Sensorial Impuesta:
                </span>
                <p className="text-xs sm:text-sm font-broadway text-white mt-0.5">
                  {sensoryLimitation}
                </p>
              </div>
            )}

            {/* CARTA RECUPERADA (SI ES VIAJE EN EL TIEMPO) */}
            {recoveredCard && (
              <div className="bg-amber-950/80 border border-amber-400/60 p-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-vintage text-amber-300 font-bold block">
                  ⏳ Carta Rescatada del Pasado:
                </span>
                <span className="text-xs font-broadway text-amber-100">
                  {recoveredCard.name}
                </span>
              </div>
            )}

            {/* CONTROLES / PIE */}
            <div className="pt-2 border-t border-[#d4af37]/25 flex items-center justify-between gap-2">
              {isHost ? (
                <div className="w-full flex gap-2">
                  {onReturnToTeam && activeAnimation.teamId && (
                    <button
                      type="button"
                      onClick={() => onReturnToTeam(activeAnimation.teamId!, card.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-vintage uppercase font-bold flex items-center justify-center gap-1 active:scale-95 transition-all hover:bg-amber-900"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Anular y Devolver</span>
                    </button>
                  )}
                  {onDismiss && (
                    <button
                      type="button"
                      onClick={onDismiss}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black font-broadway font-black text-xs uppercase flex items-center justify-center gap-1 shadow-deco-gold active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cerrar de Pantalla</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full flex items-center justify-center gap-1.5 text-[11px] text-amber-300/80 font-vintage uppercase tracking-wider animate-pulse">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Control de Sala: El Anfitrión gestionará este efecto</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

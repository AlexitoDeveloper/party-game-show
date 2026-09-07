import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PowerCard } from '../lib/powerCards';

interface PowerCardViewProps {
  card: PowerCard;
  size?: 'sm' | 'md' | 'lg';
  isClickable?: boolean;
  onClick?: () => void;
  showRule?: boolean;
  className?: string;
}

export default function PowerCardView({
  card,
  size = 'md',
  isClickable = false,
  onClick,
  showRule = true,
  className = '',
}: PowerCardViewProps) {
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [card.id]);

  const imageSrc = `/cards/${card.id}.jpg`;

  // Proporción estándar de naipe 2:3 optimizada para móvil y TV
  const sizeClasses =
    size === 'sm'
      ? 'w-28 h-42 sm:w-32 sm:h-48 rounded-xl'
      : size === 'lg'
      ? 'w-72 sm:w-88 h-[440px] sm:h-[530px] rounded-3xl'
      : 'w-56 sm:w-64 h-[350px] sm:h-[390px] rounded-2xl';

  const glowShadow =
    size === 'lg'
      ? `0 25px 60px -15px rgba(0,0,0,0.95), 0 0 50px ${card.glowColorHex}66`
      : `0 12px 30px -8px rgba(0,0,0,0.85), 0 0 30px ${card.glowColorHex}44`;

  return (
    <motion.div
      whileTap={isClickable ? { scale: 0.96 } : undefined}
      onClick={isClickable ? onClick : undefined}
      className={`relative select-none flex-shrink-0 cursor-${
        isClickable ? 'pointer' : 'default'
      } ${sizeClasses} ${className}`}
      style={{
        boxShadow: glowShadow,
      }}
    >
      <div className="w-full h-full rounded-[inherit] overflow-hidden relative bg-slate-950 border-2 sm:border-3 border-amber-400/80 shadow-2xl flex flex-col justify-between">
        {!imageError ? (
          <img
            src={imageSrc}
            alt={card.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover select-none pointer-events-none rounded-[inherit]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-between p-3.5 bg-gradient-to-b from-slate-900 via-[#1e1308] to-slate-950 text-center border-2 border-amber-400/60 rounded-[inherit]">
            <div className="bg-amber-400/20 border border-amber-400/50 rounded-xl py-1.5 px-2">
              <span className="text-xs font-black font-serif uppercase tracking-wider text-amber-300">
                {card.name}
              </span>
            </div>
            <div className="my-auto flex flex-col items-center">
              <span className="text-5xl drop-shadow-lg">{card.emoji}</span>
              <span className="text-[10px] text-amber-200/80 font-bold uppercase mt-2">
                ★ {card.rarity} ★
              </span>
            </div>
            {showRule && size !== 'sm' && (
              <div className="bg-black/70 border border-amber-400/30 p-2.5 rounded-xl">
                <p className="text-[11px] text-amber-100/90 font-serif leading-snug">
                  {card.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botón táctil para móvil */}
        {isClickable && (
          <div className="absolute inset-x-2.5 bottom-2.5 z-20">
            <div className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 border border-amber-200 text-slate-950 font-black text-xs uppercase tracking-widest text-center shadow-2xl shadow-amber-500/50 active:scale-95 transition-transform">
              👑 Toca para Jugar
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

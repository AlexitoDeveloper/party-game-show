import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PowerCard, getCardImageUrl } from '../lib/powerCards';

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
  const [tilt, setTilt] = useState({ x: 0, y: 0, shineX: 50, shineY: 50 });

  React.useEffect(() => {
    setImageError(false);
  }, [card.id]);

  const imageSrc = getCardImageUrl(card.id);

  // Proporción estándar de naipe 2:3 optimizada para móvil y TV
  const sizeClasses =
    size === 'sm'
      ? 'w-28 h-42 sm:w-32 sm:h-48 rounded-xl'
      : size === 'lg'
      ? 'w-72 sm:w-88 h-[440px] sm:h-[530px] rounded-3xl'
      : 'w-56 sm:w-64 h-[350px] sm:h-[390px] rounded-2xl';

  const glowShadow =
    size === 'lg'
      ? `0 30px 70px -10px rgba(0,0,0,0.95), 0 0 50px ${card.glowColorHex}66, inset 0 0 0 2px #d4af37`
      : `0 16px 36px -8px rgba(0,0,0,0.85), 0 0 30px ${card.glowColorHex}44, inset 0 0 0 1px #d4af37`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setTilt({
      x: rotateX,
      y: rotateY,
      shineX: (x / rect.width) * 100,
      shineY: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, shineX: 50, shineY: 50 });
  };

  return (
    <motion.div
      whileTap={isClickable ? { scale: 0.96 } : undefined}
      onClick={isClickable ? onClick : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      className={`relative select-none flex-shrink-0 cursor-${
        isClickable ? 'pointer' : 'default'
      } ${sizeClasses} ${className}`}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
        boxShadow: glowShadow,
      }}
    >
      {/* Marco Art Deco exterior de oro pulido y esquinas grabadas */}
      <div className="w-full h-full rounded-[inherit] overflow-hidden relative bg-[#0d0d12] border-2 sm:border-3 border-[#d4af37] shadow-2xl flex flex-col justify-between">
        {!imageError ? (
          <img
            src={imageSrc}
            alt={card.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover select-none pointer-events-none rounded-[inherit]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-between p-4 bg-gradient-to-b from-[#1c160c] via-[#0d0d12] to-[#140e06] text-center border border-[#d4af37]/60 rounded-[inherit]">
            <div className="bg-[#d4af37]/20 border border-[#d4af37]/50 rounded-xl py-2 px-2.5 backdrop-blur-sm">
              <span className="text-xs font-black font-broadway uppercase tracking-widest text-[#f3e5ab]">
                {card.name}
              </span>
            </div>
            <div className="my-auto flex flex-col items-center">
              <span className="text-5xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">{card.emoji}</span>
              <span className="text-[10px] text-[#d4af37] font-vintage font-bold uppercase tracking-widest mt-2">
                ★ {card.rarity} ★
              </span>
            </div>
            {showRule && size !== 'sm' && (
              <div className="bg-black/80 border border-[#d4af37]/30 p-2.5 rounded-xl">
                <p className="text-[11px] text-[#f5eedb]/90 font-editorial leading-snug">
                  {card.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reflejo metálico foil interactivo sobre el naipe */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 rounded-[inherit] mix-blend-overlay transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255, 255, 255, 0.8) 0%, rgba(212, 175, 55, 0.4) 30%, transparent 70%)`,
          }}
        />

        {/* Botón táctil para móvil estilo sello de casino */}
        {isClickable && (
          <div className="absolute inset-x-3 bottom-3 z-20">
            <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#c5a059] border border-white/60 text-[#0a0a0e] font-broadway text-xs uppercase tracking-widest text-center shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-1.5">
              <span>👑</span>
              <span>Toca para Jugar</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

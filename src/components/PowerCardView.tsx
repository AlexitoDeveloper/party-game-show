import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PowerCard, getCardImageUrl } from '../lib/powerCards';
import { DecoProceduralSpandrel } from './deco/DecoProceduralSpandrel';
import { ThreeCardViewer } from './3d/ThreeCardViewer';

interface PowerCardViewProps {
  card: PowerCard;
  size?: 'sm' | 'md' | 'lg' | 'presentation';
  isClickable?: boolean;
  onClick?: () => void;
  showRule?: boolean;
  className?: string;
  enable3dInspect?: boolean;
  priority?: boolean;
  disableTilt?: boolean;
}

export default function PowerCardView({
  card,
  size = 'md',
  isClickable = false,
  onClick,
  showRule = true,
  className = '',
  enable3dInspect = false,
  priority = false,
  disableTilt = false,
}: PowerCardViewProps) {
  const [imageError, setImageError] = useState(false);
  const [show3dModal, setShow3dModal] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, shineX: 50, shineY: 50 });

  React.useEffect(() => {
    setImageError(false);
  }, [card.id]);

  const imageSrc = getCardImageUrl(card.id);
  const shouldTilt = !disableTilt && size !== 'presentation';

  // Proporción estándar de naipe 2:3 optimizada para móvil y TV
  const sizeClasses =
    size === 'sm'
      ? 'w-28 h-[168px] sm:w-32 sm:h-[192px] rounded-xl'
      : size === 'presentation'
      ? 'w-56 sm:w-64 md:w-72 lg:w-[310px] h-[336px] sm:h-[384px] md:h-[432px] lg:h-[465px] rounded-2xl'
      : size === 'lg'
      ? 'w-72 sm:w-88 h-[440px] sm:h-[530px] rounded-3xl'
      : 'w-48 sm:w-60 h-[300px] sm:h-[370px] rounded-2xl';

  const glowShadow =
    size === 'lg'
      ? `0 30px 70px -10px rgba(0,0,0,0.95), 0 0 50px ${card.glowColorHex}66, inset 0 0 0 2px #d4af37`
      : `0 16px 36px -8px rgba(0,0,0,0.85), 0 0 30px ${card.glowColorHex}44, inset 0 0 0 1px #d4af37`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldTilt) return;
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
    if (!shouldTilt) return;
    setTilt({ x: 0, y: 0, shineX: 50, shineY: 50 });
  };

  return (
    <motion.div
      whileTap={isClickable ? { scale: 0.96 } : undefined}
      onClick={isClickable ? onClick : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={
        shouldTilt
          ? {
              rotateX: tilt.x,
              rotateY: tilt.y,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }
          : undefined
      }
      className={`relative select-none flex-shrink-0 cursor-${
        isClickable ? 'pointer' : 'default'
      } ${sizeClasses} ${className}`}
      style={{
        perspective: shouldTilt ? 1000 : undefined,
        transformStyle: shouldTilt ? 'preserve-3d' : undefined,
        boxShadow: glowShadow,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Marco Art Deco exterior de oro pulido y esquinas grabadas */}
      <div className="w-full h-full rounded-[inherit] overflow-hidden relative bg-[#0d0d12] border-2 sm:border-3 border-[#d4af37] shadow-2xl flex flex-col justify-between">
        {/* Procedural Art Deco Corner Spandrels */}
        <DecoProceduralSpandrel size={size === 'sm' ? 18 : 32} position="top-left" />
        <DecoProceduralSpandrel size={size === 'sm' ? 18 : 32} position="top-right" />
        <DecoProceduralSpandrel size={size === 'sm' ? 18 : 32} position="bottom-left" />
        <DecoProceduralSpandrel size={size === 'sm' ? 18 : 32} position="bottom-right" />

        {!imageError ? (
          <img
            src={imageSrc}
            alt={card.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover select-none pointer-events-none rounded-[inherit]"
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            style={{
              backfaceVisibility: 'hidden',
            }}
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

        {/* Reflejo metálico foil interactivo sobre el naipe con filtro SVG */}
        <div
          className="absolute inset-0 pointer-events-none opacity-35 rounded-[inherit] mix-blend-overlay transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255, 255, 255, 0.85) 0%, rgba(212, 175, 55, 0.45) 35%, transparent 70%)`,
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

        {/* Botón discreto para abrir visor 3D táctil */}
        {enable3dInspect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShow3dModal(true);
            }}
            className="absolute top-2.5 right-2.5 z-30 px-2 py-0.5 rounded-full bg-black/70 border border-[#d4af37]/70 text-[#f3e5ab] text-[10px] font-vintage tracking-wider hover:bg-black active:scale-95"
          >
            3D 🔍
          </button>
        )}
      </div>

      {/* Modal Visor 3D Táctil */}
      {show3dModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShow3dModal(false);
          }}
        >
          <div
            className="relative w-full max-w-sm flex flex-col items-center bg-[#130c08] border-2 border-[#d4af37] rounded-2xl p-4 shadow-[0_0_50px_rgba(212,175,55,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShow3dModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-200 flex items-center justify-center text-sm font-bold active:scale-95"
            >
              ✕
            </button>

            <h3 className="text-lg font-broadway text-amber-300 mb-1">
              {card.name}
            </h3>
            <p className="text-xs text-amber-200/70 font-vintage uppercase tracking-widest mb-3">
              {card.rarity} · Volteo & Tacto 3D
            </p>

            <ThreeCardViewer
              frontImageUrl={imageSrc}
              name={card.name}
              rarity={card.rarity as any}
              className="w-full"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

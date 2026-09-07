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
  const imageSrc = `/cards/${card.id}.jpg`;

  // Dimensiones según tamaño (proporción de naipe 2:3)
  const sizeClasses =
    size === 'sm'
      ? 'w-24 h-36 rounded-xl'
      : size === 'lg'
      ? 'w-72 sm:w-80 h-[430px] sm:h-[480px] rounded-3xl'
      : 'w-48 sm:w-56 h-[290px] sm:h-[340px] rounded-2xl';

  const glowShadow =
    size === 'lg'
      ? `0 25px 60px -15px rgba(0,0,0,0.9), 0 0 50px ${card.glowColorHex}66`
      : `0 12px 30px -8px rgba(0,0,0,0.7), 0 0 25px ${card.glowColorHex}44`;

  return (
    <motion.div
      whileHover={
        isClickable
          ? { scale: 1.05, rotateY: 5, rotateX: -5, zIndex: 20 }
          : size === 'lg'
          ? { scale: 1.02 }
          : undefined
      }
      whileTap={isClickable ? { scale: 0.96 } : undefined}
      onClick={isClickable ? onClick : undefined}
      className={`relative select-none flex-shrink-0 cursor-${
        isClickable ? 'pointer' : 'default'
      } ${sizeClasses} ${className}`}
      style={{
        perspective: 1000,
        boxShadow: glowShadow,
      }}
    >
      {/* CONTENEDOR DE LA CARTA CON BORDE DORADO Y RELIEVE */}
      <div className="w-full h-full rounded-[inherit] overflow-hidden relative bg-slate-900 border-2 sm:border-4 border-amber-400/90 shadow-2xl flex flex-col justify-between">
        {/* ARTE ILUSTRADO DE ALTA DEFINICIÓN */}
        {!imageError ? (
          <img
            src={imageSrc}
            alt={card.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="lazy"
          />
        ) : (
          /* FALLBACK VECTORIAL EN CASO DE FALLO */
          <div className="w-full h-full flex flex-col justify-between p-3 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-center">
            <div className="bg-amber-400/20 border border-amber-400/40 rounded-lg py-1">
              <span className="text-xs font-black font-arcade text-amber-300 uppercase">
                {card.name}
              </span>
            </div>
            <div className="my-auto flex flex-col items-center">
              <span className="text-5xl drop-shadow-md">{card.emoji}</span>
            </div>
            {showRule && size !== 'sm' && (
              <p className="text-[10px] text-slate-200 font-medium bg-black/60 p-2 rounded-lg">
                {card.description}
              </p>
            )}
          </div>
        )}

        {/* LÁMINA HOLOGRÁFICA REFLEJO DIAGONAL */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* MARCADOR DE TIPO / ACCIÓN EN MODO PEQUEÑO O MEDIANO */}
        {isClickable && (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-md rounded-lg py-1 px-2 text-center border border-amber-400/50 shadow-lg pointer-events-none">
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
              Toca para Jugar
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

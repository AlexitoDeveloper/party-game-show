import React from 'react';
import { motion } from 'framer-motion';
import { PowerCard, RARITY_METADATA } from '../lib/powerCards';

interface PowerCardViewProps {
  card: PowerCard;
  size?: 'sm' | 'md' | 'lg';
  isClickable?: boolean;
  onClick?: () => void;
  showRule?: boolean;
  className?: string;
}

// Ornamentos vectoriales SVG estilo filigrana dorada de Everdell
const CornerFiligree = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-400/80 pointer-events-none fill-current ${className}`}
  >
    <path d="M2 2 C12 2, 20 10, 20 20 C20 12, 28 4, 30 2 C28 14, 20 22, 20 30 C18 20, 10 18, 2 2 Z" />
    <circle cx="8" cy="8" r="1.5" />
  </svg>
);

const LeafFlourish = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 40 12" className={`w-8 h-2.5 text-amber-400/70 fill-current ${className}`}>
    <path d="M0 6 Q10 0 20 6 Q30 12 40 6 Q30 0 20 6 Q10 12 0 6 Z" />
    <circle cx="20" cy="6" r="2" />
  </svg>
);

// Gemas facetadas de rareza con brillo especular de joyería
const RarityGemstone = ({ rarity, size }: { rarity: PowerCard['rarity']; size: 'sm' | 'md' | 'lg' }) => {
  const meta = RARITY_METADATA[rarity];

  const gemConfig = {
    Común: {
      outer: 'from-emerald-400 via-emerald-600 to-emerald-950',
      inner: 'from-emerald-200 to-emerald-500',
      glow: 'rgba(16, 185, 129, 0.7)',
      border: 'border-emerald-300/80',
    },
    Rara: {
      outer: 'from-blue-400 via-blue-600 to-indigo-950',
      inner: 'from-sky-200 to-blue-500',
      glow: 'rgba(59, 130, 246, 0.7)',
      border: 'border-blue-300/80',
    },
    Épica: {
      outer: 'from-fuchsia-400 via-purple-600 to-purple-950',
      inner: 'from-pink-200 to-purple-500',
      glow: 'rgba(168, 85, 247, 0.8)',
      border: 'border-purple-300/80',
    },
    Legendaria: {
      outer: 'from-amber-300 via-amber-500 to-orange-950',
      inner: 'from-yellow-100 via-amber-300 to-amber-600',
      glow: 'rgba(245, 158, 11, 0.9)',
      border: 'border-amber-200',
    },
  }[rarity];

  const diameter = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const innerDiameter = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="relative flex items-center justify-center">
      {/* Halo radiante de la gema */}
      <div
        className="absolute rounded-full blur-md opacity-80"
        style={{
          width: size === 'lg' ? '3rem' : '2.2rem',
          height: size === 'lg' ? '3rem' : '2.2rem',
          background: gemConfig.glow,
        }}
      />
      {/* Montura dorada esculpida */}
      <div
        className={`${diameter} rounded-full bg-gradient-to-b from-amber-200 via-amber-600 to-amber-950 p-[2px] shadow-lg flex items-center justify-center ring-1 ring-amber-400/60`}
      >
        {/* Faceta de gema */}
        <div
          className={`${innerDiameter} rounded-full bg-gradient-to-br ${gemConfig.outer} relative overflow-hidden flex items-center justify-center shadow-inner`}
        >
          {/* Reflejo especular blanco de cristal */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/70 via-white/20 to-transparent rounded-t-full pointer-events-none" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/90 absolute top-1 left-1.5 blur-[0.5px]" />
          {/* Centelleo legendario */}
          {rarity === 'Legendaria' && (
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="absolute inset-0 border border-yellow-200/40 rounded-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Formateador tipográfico de texto de reglas con badges para valores numéricos
const FormattedRuleText = ({ text }: { text: string }) => {
  // Resalta valores como +10, +8, +3, +2, −5, −3, −2, −1, 1.º, 2.º, x2
  const parts = text.split(
    /(\+\d+|\−\d+|-\d+|x2|1\.º|2\.º|3\.º|4\.º|5\.º|🥇|🥈|🥉)/g
  );

  return (
    <span className="leading-snug inline">
      {parts.map((part, i) => {
        if (part.startsWith('+') || part === 'x2') {
          return (
            <span
              key={i}
              className="inline-block mx-0.5 px-1.5 py-0.2 rounded-md font-black text-[11px] bg-emerald-800 text-emerald-100 border border-emerald-600/80 shadow-sm"
            >
              {part}
            </span>
          );
        }
        if (part.startsWith('−') || part.startsWith('-')) {
          return (
            <span
              key={i}
              className="inline-block mx-0.5 px-1.5 py-0.2 rounded-md font-black text-[11px] bg-red-800 text-red-100 border border-red-600/80 shadow-sm"
            >
              {part}
            </span>
          );
        }
        if (part === '🥇' || part === '🥈' || part === '🥉') {
          return (
            <span key={i} className="inline-block mx-0.5 text-sm align-middle">
              {part}
            </span>
          );
        }
        if (/^[1-5]\.º$/.test(part)) {
          return (
            <span
              key={i}
              className="inline-block mx-0.5 px-1 py-0.2 rounded font-black text-[10px] bg-amber-900/80 text-amber-200 border border-amber-600/60"
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

export default function PowerCardView({
  card,
  size = 'md',
  isClickable = false,
  onClick,
  showRule = true,
  className = '',
}: PowerCardViewProps) {
  const meta = RARITY_METADATA[card.rarity] || RARITY_METADATA['Común'];

  // Dimensiones según tamaño (proporción Everdell naipes 2:3)
  const sizeClasses =
    size === 'sm'
      ? 'w-32 h-48 rounded-xl'
      : size === 'lg'
      ? 'w-80 sm:w-96 h-[520px] sm:h-[570px] rounded-3xl'
      : 'w-64 sm:w-72 h-[410px] sm:h-[440px] rounded-2xl';

  const glowShadow =
    size === 'lg'
      ? `0 30px 70px -15px rgba(0,0,0,0.95), 0 0 60px ${card.glowColorHex}66, inset 0 0 25px rgba(0,0,0,0.6)`
      : `0 15px 35px -8px rgba(0,0,0,0.85), 0 0 35px ${card.glowColorHex}44, inset 0 0 15px rgba(0,0,0,0.5)`;

  const targetLabel =
    card.requiresTarget === 'team'
      ? '👥 Equipo rival'
      : card.requiresTarget === 'player'
      ? '👤 Jugador rival'
      : card.requiresTarget === 'card'
      ? '⏳ Recuperar del descarte'
      : '✨ Para tu equipo';

  return (
    <motion.div
      whileHover={
        isClickable
          ? { scale: 1.05, rotateY: 4, rotateX: -4, zIndex: 20 }
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
      {/* MARCO EXTERIOR DE MADERA NOBLE Y ORO TALLADO (ESTILO EVERDELL) */}
      <div className="w-full h-full rounded-[inherit] overflow-hidden relative bg-gradient-to-b from-[#2a1708] via-[#1c0f05] to-[#120902] border-[3px] sm:border-[4px] border-[#9c783e] shadow-2xl flex flex-col p-1.5 sm:p-2">
        {/* Filigranas doradas en las 4 esquinas del marco */}
        <CornerFiligree className="absolute top-1 left-1" />
        <CornerFiligree className="absolute top-1 right-1 rotate-90" />
        <CornerFiligree className="absolute bottom-1 right-1 rotate-180" />
        <CornerFiligree className="absolute bottom-1 left-1 -rotate-90" />

        {/* CINTA INTERIOR BISELADA */}
        <div className="w-full h-full rounded-[inherit] relative flex flex-col justify-between border border-[#d4af37]/60 overflow-hidden bg-gradient-to-b from-[#180e06] via-[#241306] to-[#120902]">
          
          {/* ================================================================= */}
          {/* 1. CABECERA: MEDALLÓN DE GEMA DE RAREZA + TÍTULO EVERDELL */}
          {/* ================================================================= */}
          <div className="relative pt-2 pb-1.5 px-3 flex flex-col items-center border-b border-[#9c783e]/50 bg-gradient-to-b from-black/60 via-[#261608]/80 to-black/70">
            {/* Medallón central de gema con resplandor */}
            <div className="flex items-center justify-between w-full">
              {/* Rótulo de rareza a la izquierda */}
              <div className="flex items-center gap-1">
                <RarityGemstone rarity={card.rarity} size={size} />
                <div className="flex flex-col text-left">
                  <span
                    className={`font-black font-serif uppercase tracking-widest ${
                      size === 'sm' ? 'text-[8px]' : 'text-[9px]'
                    }`}
                    style={{
                      color: card.rarityColorHex,
                      textShadow: `0 0 10px ${card.glowColorHex}80`,
                    }}
                  >
                    {card.rarity}
                  </span>
                  <span className="text-[7px] text-amber-200/60 uppercase tracking-wider hidden sm:block">
                    Mazo Común
                  </span>
                </div>
              </div>

              {/* Distintivo de timing/momento a la derecha */}
              <div
                className={`px-2 py-0.5 rounded-full border text-[8px] sm:text-[9px] font-bold font-serif ${meta.pillColor} shadow-sm backdrop-blur-sm`}
              >
                {card.timing}
              </div>
            </div>

            {/* Nombre de la carta en tipografía clásica con sombra profunda */}
            <div className="w-full text-center mt-1">
              <h2
                className={`font-black font-serif text-amber-100 uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-1 ${
                  size === 'sm'
                    ? 'text-[11px]'
                    : size === 'lg'
                    ? 'text-xl sm:text-2xl'
                    : 'text-sm sm:text-base'
                }`}
              >
                {card.name}
              </h2>
              {size !== 'sm' && (
                <div className="flex items-center justify-center gap-1.5 mt-0.5 opacity-80">
                  <LeafFlourish className="scale-75" />
                  <span className="text-[10px] text-amber-300/80 font-serif italic tracking-wide">
                    {card.tagline}
                  </span>
                  <LeafFlourish className="scale-75 -scale-x-75" />
                </div>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* 2. VENTANA DE ARTE CAMAFEO FANTASÍA (ICONO 3D + ATMÓSFERA EVERDELL) */}
          {/* ================================================================= */}
          <div
            className={`relative mx-2 sm:mx-3 my-1 rounded-xl sm:rounded-2xl border-2 border-[#b8934a]/80 overflow-hidden shadow-inner flex flex-col items-center justify-center bg-gradient-to-b ${
              card.rarity === 'Legendaria'
                ? 'from-amber-950 via-yellow-950/60 to-slate-950'
                : card.rarity === 'Épica'
                ? 'from-purple-950 via-fuchsia-950/50 to-slate-950'
                : card.rarity === 'Rara'
                ? 'from-blue-950 via-indigo-950/50 to-slate-950'
                : 'from-emerald-950 via-stone-900 to-slate-950'
            } ${size === 'sm' ? 'h-16' : size === 'lg' ? 'h-40 sm:h-48' : 'h-24 sm:h-28'}`}
          >
            {/* Halo místico de fondo */}
            <div
              className="absolute w-24 h-24 sm:w-36 sm:h-36 rounded-full blur-2xl opacity-60 pointer-events-none"
              style={{ background: card.glowColorHex }}
            />

            {/* Runas de fondo sutiles */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/60 pointer-events-none" />

            {/* Icono temático 3D central */}
            <motion.div
              animate={
                card.rarity === 'Legendaria'
                  ? { y: [-2, 2, -2], scale: [1, 1.05, 1] }
                  : { y: [-1, 1, -1] }
              }
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="relative z-10 flex items-center justify-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
            >
              <span
                className={`${
                  size === 'sm'
                    ? 'text-3xl'
                    : size === 'lg'
                    ? 'text-6xl sm:text-7xl'
                    : 'text-4xl sm:text-5xl'
                }`}
              >
                {card.emoji}
              </span>
            </motion.div>

            {/* Sello de objetivo en la esquina de la ventana */}
            <div className="absolute bottom-1 right-2 z-10">
              <span className="text-[9px] font-bold text-amber-200/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-amber-400/40">
                {targetLabel}
              </span>
            </div>
          </div>

          {/* ================================================================= */}
          {/* 3. PERGAMINO DE REGLAS EN TINTA OSCURA (ESTILO EVERDELL) */}
          {/* ================================================================= */}
          {showRule && (
            <div
              className={`relative mx-2 sm:mx-3 mb-2 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col justify-between border-2 border-[#a68042] shadow-lg ${
                size === 'sm' ? 'flex-1' : ''
              }`}
              style={{
                background:
                  'linear-gradient(180deg, #fdf8eb 0%, #f6edd4 40%, #eddab2 100%)',
                color: '#28170b',
                boxShadow:
                  'inset 0 1px 3px rgba(255,255,255,0.8), inset 0 -3px 6px rgba(100,60,20,0.25), 0 4px 10px rgba(0,0,0,0.5)',
              }}
            >
              {/* Marco interno del pergamino */}
              <div className="w-full h-full border border-[#b39158]/50 rounded-lg p-1.5 sm:p-2 flex flex-col justify-between">
                <div className="flex-1 flex items-center justify-center text-center">
                  <p
                    className={`font-serif font-semibold text-[#2a1708] tracking-tight ${
                      size === 'sm'
                        ? 'text-[9px] leading-tight line-clamp-4'
                        : size === 'lg'
                        ? 'text-sm sm:text-base leading-relaxed'
                        : 'text-[11px] sm:text-xs leading-snug'
                    }`}
                  >
                    <FormattedRuleText text={card.description} />
                  </p>
                </div>

                {/* Pie decorativo del pergamino con numeración y edición */}
                {size !== 'sm' && (
                  <div className="border-t border-[#b39158]/40 pt-1 mt-1 flex items-center justify-between text-[8px] sm:text-[9px] text-[#6b4c2b] font-serif uppercase tracking-wider">
                    <span>Everdell Arena</span>
                    <span className="font-bold text-[#8a5d28]">★ {card.rarity} ★</span>
                    <span>Edición Show</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LÁMINA HOLOGRÁFICA / BRILLO AL PASAR EL RATÓN */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* ACCIÓN INTERACTIVA PARA EL JUGADOR */}
          {isClickable && (
            <div className="absolute inset-x-3 bottom-3 z-30">
              <div className="w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 border border-amber-200 text-slate-950 font-black text-xs uppercase tracking-widest text-center shadow-xl shadow-amber-500/40">
                👑 Toca para Jugar
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

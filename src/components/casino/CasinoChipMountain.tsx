import React, { useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TeamTheme } from '../../lib/teamThemes';
import { soundFX } from '../../lib/audio';

interface CasinoChipMountainProps {
  score: number;
  theme: TeamTheme;
  className?: string;
  maxColumns?: number;
}

interface ChipData {
  id: string;
  color: string;
  edgeColor: string;
  accentColor: string;
  label: string;
  value: number;
  jitterX: number;
}

/**
 * Dibuja una ficha de casino individual en perspectiva isométrica / 2.5D con SVG
 */
const CasinoChip2D: React.FC<{
  chip: ChipData;
  index: number;
}> = ({ chip, index }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0, scale: 0.75 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 24,
        delay: Math.min(index * 0.025, 0.35),
      }}
      className="relative select-none"
      style={{
        width: 42,
        height: 15,
        marginTop: -10, // Solapamiento vertical de la pila
        transform: `translateX(${chip.jitterX}px)`,
      }}
    >
      <svg
        viewBox="0 0 42 15"
        className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`edgeGrad_${chip.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={chip.edgeColor} stopOpacity="0.75" />
            <stop offset="50%" stopColor={chip.color} />
            <stop offset="100%" stopColor={chip.edgeColor} stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id={`faceGrad_${chip.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={chip.color} />
            <stop offset="100%" stopColor={chip.edgeColor} />
          </linearGradient>
        </defs>

        {/* Borde / Canto cilíndrico de la ficha (3D Thickness) */}
        <path
          d="M 1 5.5 A 20 5.2 0 0 0 41 5.5 L 41 9.5 A 20 5.2 0 0 1 1 9.5 Z"
          fill={`url(#edgeGrad_${chip.id})`}
          stroke="#000000"
          strokeWidth="0.5"
        />

        {/* Marcas de borde cilíndrico (rayas blancas/doradas de casino en el canto) */}
        <path d="M 7 7.5 L 7 11.5" stroke={chip.accentColor} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 15 9.2 L 15 13.2" stroke={chip.accentColor} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 27 9.2 L 27 13.2" stroke={chip.accentColor} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 35 7.5 L 35 11.5" stroke={chip.accentColor} strokeWidth="1.8" strokeLinecap="round" />

        {/* Cara superior elíptica */}
        <ellipse
          cx="21"
          cy="5.5"
          rx="20"
          ry="5.2"
          fill={`url(#faceGrad_${chip.id})`}
          stroke={chip.accentColor}
          strokeWidth="0.9"
        />

        {/* Marcas de contraste Art Déco sobre la cara superior */}
        <ellipse
          cx="21"
          cy="5.5"
          rx="15.5"
          ry="3.9"
          fill="none"
          stroke={chip.accentColor}
          strokeWidth="0.7"
          strokeDasharray="3, 2.2"
        />

        {/* Medallón central de la ficha */}
        <ellipse
          cx="21"
          cy="5.5"
          rx="10"
          ry="2.7"
          fill="#0a0a0f"
          stroke="#ffd700"
          strokeWidth="0.6"
        />

        {/* Emblema o valor central */}
        <text
          x="21"
          y="6.8"
          textAnchor="middle"
          fontSize="4.8"
          fontWeight="bold"
          fontFamily="sans-serif"
          fill="#ffd700"
        >
          {chip.label}
        </text>
      </svg>
    </motion.div>
  );
};

export const CasinoChipMountain: React.FC<CasinoChipMountainProps> = ({
  score,
  theme,
  className = '',
  maxColumns = 5,
}) => {
  const prevScoreRef = useRef(score);

  // Reproducir sonido de fichas cuando la puntuación aumenta
  useEffect(() => {
    if (score > prevScoreRef.current) {
      soundFX.playChipClink();
    }
    prevScoreRef.current = score;
  }, [score]);

  // Generación de columnas y fichas según la puntuación actual
  const { columns, totalChips } = useMemo(() => {
    if (score <= 0) {
      return { columns: [], totalChips: 0 };
    }

    // Cantidad total de fichas en la montaña:
    // Puntuaciones típicas: 5, 10, 20, 30, 50, 100, 200 pts
    const chipCount = Math.min(
      32,
      Math.max(1, Math.round(score / 4.5))
    );

    // Número de columnas activas (1 a 5) según la puntuación
    let numCols = 1;
    if (score >= 80) numCols = 5;
    else if (score >= 45) numCols = 4;
    else if (score >= 25) numCols = 3;
    else if (score >= 10) numCols = 2;

    numCols = Math.min(numCols, maxColumns);

    // Pesos relativos de altura para cada columna formando una pirámide/montaña
    // Columna central más alta, laterales escalonadas
    const profile =
      numCols === 1
        ? [1.0]
        : numCols === 2
        ? [0.55, 0.45]
        : numCols === 3
        ? [0.28, 0.44, 0.28]
        : numCols === 4
        ? [0.18, 0.35, 0.32, 0.15]
        : [0.12, 0.23, 0.35, 0.20, 0.10]; // 5 columnas en forma de pirámide

    // Distribuir fichas por columna
    const cols: ChipData[][] = Array.from({ length: numCols }, () => []);

    for (let i = 0; i < chipCount; i++) {
      // Elegir columna basada en el perfil piramidal
      let bestCol = 0;
      let minRatio = Infinity;

      for (let c = 0; c < numCols; c++) {
        const expected = profile[c] * chipCount;
        const current = cols[c].length;
        const ratio = current / Math.max(0.1, expected);
        if (ratio < minRatio) {
          minRatio = ratio;
          bestCol = c;
        }
      }

      // Determinar denominación y color de la ficha
      // Fichas superiores o de alta puntuación son doradas o del color del equipo
      let color = '#b91c1c'; // Rojo 10 pts por defecto
      let edgeColor = '#7f1d1d';
      let accentColor = '#ffffff';
      let label = '10';
      let value = 10;

      if (score >= 70 && (i >= chipCount - 4 || i % 4 === 0)) {
        // Ficha Dorada Corona
        color = '#eab308';
        edgeColor = '#a16207';
        accentColor = '#fef08a';
        label = '👑';
        value = 50;
      } else if (i % 3 === 0) {
        // Ficha del Color del Equipo
        color = theme.primaryHex || '#2563eb';
        edgeColor = theme.surfaceHex || '#1e3a8a';
        accentColor = theme.accentHex || '#93c5fd';
        label = '★';
        value = 25;
      } else if (i % 5 === 0) {
        // Ficha Esmeralda
        color = '#059669';
        edgeColor = '#064e3b';
        accentColor = '#6ee7b7';
        label = '5';
        value = 5;
      }

      // Pequeño jitter horizontal orgánico (±1.5px)
      const jitterX = Math.sin(i * 4.3 + bestCol * 2.1) * 1.4;

      cols[bestCol].push({
        id: `chip_${bestCol}_${cols[bestCol].length}_${i}`,
        color,
        edgeColor,
        accentColor,
        label,
        value,
        jitterX,
      });
    }

    return { columns: cols, totalChips: chipCount };
  }, [score, theme, maxColumns]);

  if (score <= 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-2 relative ${className}`}>
        <div className="w-full max-w-[220px] h-9 rounded-2xl bg-[#09090e]/90 border border-[#d4af37]/25 flex items-center justify-center shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-[#d4af37]/10 to-transparent pointer-events-none" />
          <span className="text-[10px] uppercase font-vintage tracking-wider text-amber-200/50 flex items-center gap-1.5 font-bold">
            <span>🪙</span>
            <span>Tapete de Fichas (0 pts)</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-end select-none ${className}`}>
      {/* Resplandor atmosférico de fondo que aumenta con la puntuación */}
      <div
        className="absolute -bottom-2 inset-x-0 h-28 pointer-events-none transition-all duration-700 blur-xl opacity-35"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${theme.glowColor || theme.accentHex || '#d4af37'} 0%, transparent 75%)`,
        }}
      />

      {/* Base de fieltro de mesa de casino Art Déco */}
      <div className="relative w-full max-w-[260px] mx-auto flex items-end justify-center gap-1 sm:gap-1.5 px-3 pt-3 pb-1.5 bg-gradient-to-b from-[#14120e]/85 to-[#070605]/95 rounded-2xl border border-[#d4af37]/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.7)]">
        {/* Reflejo superior de paño verde/dorado */}
        <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent" />

        {/* Columnas de fichas apiladas formando la montaña */}
        {columns.map((col, colIdx) => (
          <div
            key={colIdx}
            className="flex flex-col-reverse items-center justify-start z-10"
            style={{
              zIndex: 10 + (colIdx === Math.floor(columns.length / 2) ? 5 : 2),
            }}
          >
            {col.map((chip, chipIdx) => (
              <CasinoChip2D key={chip.id} chip={chip} index={chipIdx + colIdx * 2} />
            ))}
          </div>
        ))}
      </div>

      {/* Etiqueta compacta de recuento de fichas */}
      <div className="mt-1.5 flex items-center gap-1 z-10">
        <span className="text-[10px] font-vintage uppercase tracking-widest text-[#f3e5ab]/90 font-bold drop-shadow-sm">
          🪙 {totalChips} {totalChips === 1 ? 'ficha acumulada' : 'fichas acumuladas'}
        </span>
      </div>
    </div>
  );
};

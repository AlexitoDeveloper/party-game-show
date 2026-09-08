import React, { useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TeamTheme } from '../../lib/teamThemes';
import { soundFX } from '../../lib/audio';

export interface HellOfADealChipDef {
  id: string;
  name: string;
  imageUrl: string;
  value: number;
  accentColor: string;
  rimBase: string;
  goldColor: string;
}

export const HELL_OF_A_DEAL_CHIPS: HellOfADealChipDef[] = [
  {
    id: 'devil',
    name: 'Hell of a Deal Imp',
    imageUrl: '/chips/chip_devil.jpg',
    value: 10, // Ficha mayor: 10 puntos (Carmesí y Oro)
    accentColor: '#991b1b',
    rimBase: '#0d0d12',
    goldColor: '#d4af37',
  },
  {
    id: 'bomba',
    name: 'Ticking Time Bomb',
    imageUrl: '/chips/chip_bomba.jpg',
    value: 5, // Ficha media-alta: 5 puntos (Verde Esmeralda)
    accentColor: '#166534',
    rimBase: '#0d0d12',
    goldColor: '#d4af37',
  },
  {
    id: 'ace',
    name: 'The Big Boss Ace',
    imageUrl: '/chips/chip_ace.jpg',
    value: 2, // Ficha media: 2 puntos (Azul Medianoche)
    accentColor: '#1e3a8a',
    rimBase: '#0d0d12',
    goldColor: '#d4af37',
  },
  {
    id: 'dice',
    name: 'Lucky Roll Dice',
    imageUrl: '/chips/chip_dice.jpg',
    value: 1, // Ficha base: 1 punto (Ámbar Dorado)
    accentColor: '#b45309',
    rimBase: '#0d0d12',
    goldColor: '#eab308',
  },
];

interface ChipInstance {
  id: string;
  chipDef: HellOfADealChipDef;
  jitterX: number;
}

interface CasinoChipMountainProps {
  score: number;
  theme: TeamTheme;
  className?: string;
  maxColumns?: number;
  isLobby?: boolean;
  maxRoomScore?: number;
}

/**
 * Calcula la altura máxima de columna (número de fichas apiladas) para una puntuación dada.
 */
const calculateTallestColumn = (scoreVal: number, maxCols: number = 4): number => {
  if (scoreVal <= 0) return 0;
  let rem = Math.floor(scoreVal);
  const dCount = Math.floor(rem / 10);
  rem %= 10;
  const bCount = Math.floor(rem / 5);
  rem %= 5;
  const aCount = Math.floor(rem / 2);
  rem %= 2;
  const diCount = rem;
  const total = dCount + bCount + aCount + diCount;
  if (total <= 0) return 0;
  const cols = Math.min(maxCols, Math.max(1, Math.min(total, 4)));
  return Math.ceil(total / cols);
};

/**
 * Ficha individual Hell of a Deal en perspectiva isométrica 2.5D.
 * La cara superior proyecta la ilustración real del personaje (Diablo, Bomba, As, Dados),
 * y el canto cilíndrico reproduce las muescas de oro y esmalte Art Déco.
 */
const CasinoChip2D: React.FC<{
  chip: ChipInstance;
  index: number;
}> = ({ chip, index }) => {
  const { chipDef, jitterX } = chip;
  const clipId = `clip_${chip.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

  return (
    <motion.div
      initial={{ y: -16, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 24,
        delay: Math.min(index * 0.03, 0.3),
      }}
      className="relative select-none pointer-events-none"
      style={{
        width: 48,
        height: 17,
        marginTop: -11, // Solapamiento vertical para formar la pila física
        transform: `translateX(${jitterX}px)`,
      }}
    >
      <svg
        viewBox="0 0 48 17"
        className="w-full h-full drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)]"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <ellipse cx="24" cy="6.2" rx="23" ry="5.8" />
          </clipPath>
          <linearGradient id={`edge_${clipId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#08080a" />
            <stop offset="35%" stopColor={chipDef.accentColor} />
            <stop offset="50%" stopColor={chipDef.goldColor} />
            <stop offset="65%" stopColor={chipDef.accentColor} />
            <stop offset="100%" stopColor="#08080a" />
          </linearGradient>
        </defs>

        {/* Canto cilíndrico Art Déco de la ficha (Espesor 3D) */}
        <path
          d="M 1 6.2 A 23 5.8 0 0 0 47 6.2 L 47 11.2 A 23 5.8 0 0 1 1 11.2 Z"
          fill={`url(#edge_${clipId})`}
          stroke="#050508"
          strokeWidth="0.6"
        />

        {/* Muescas doradas Art Déco en el canto */}
        <path d="M 8 8.2 L 8 13.0" stroke={chipDef.goldColor} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 16 10.2 L 16 15.0" stroke={chipDef.goldColor} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 24 11.0 L 24 15.6" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M 32 10.2 L 32 15.0" stroke={chipDef.goldColor} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 40 8.2 L 40 13.0" stroke={chipDef.goldColor} strokeWidth="1.8" strokeLinecap="round" />

        {/* Fondo de la cara superior */}
        <ellipse
          cx="24"
          cy="6.2"
          rx="23"
          ry="5.8"
          fill={chipDef.rimBase}
          stroke={chipDef.goldColor}
          strokeWidth="0.9"
        />

        {/* Imagen auténtica Hell of a Deal con recorte elíptico */}
        <image
          href={chipDef.imageUrl}
          x="1"
          y="0.4"
          width="46"
          height="11.6"
          preserveAspectRatio="none"
          clipPath={`url(#${clipId})`}
        />

        {/* Bisel dorado y halo de pan de oro superior */}
        <ellipse
          cx="24"
          cy="6.2"
          rx="23"
          ry="5.8"
          fill="none"
          stroke={chipDef.goldColor}
          strokeWidth="0.8"
        />
      </svg>
    </motion.div>
  );
};

export const CasinoChipMountain: React.FC<CasinoChipMountainProps> = ({
  score,
  theme,
  className = '',
  maxColumns = 4,
  maxRoomScore = 0,
}) => {
  const prevScoreRef = useRef(score);

  // Sonido de tintineo de fichas al subir de puntuación
  useEffect(() => {
    if (score > prevScoreRef.current) {
      soundFX.playChipClink();
    }
    prevScoreRef.current = score;
  }, [score]);

  // Cálculo de la altura común del background del tapete adaptado al equipo con más fichas
  const uniformTrayHeight = useMemo(() => {
    const highestScore = Math.max(score, maxRoomScore || 0);
    const maxChipsInHighestStack = calculateTallestColumn(highestScore, maxColumns);
    // Altura base: 52px. Cada ficha adicional en la columna más alta añade 6px
    if (maxChipsInHighestStack <= 1) {
      return 52;
    }
    return 17 + (maxChipsInHighestStack - 1) * 6 + 22;
  }, [score, maxRoomScore, maxColumns]);

  // Desglose de denominaciones de poker y mezcla orgánica de fichas en columnas
  const { columns, totalChips, denominationBreakdown } = useMemo(() => {
    if (score <= 0) {
      return { columns: [], totalChips: 0, denominationBreakdown: [] };
    }

    let rem = Math.floor(score);
    const dCount = Math.floor(rem / 10);
    rem %= 10;
    const bCount = Math.floor(rem / 5);
    rem %= 5;
    const aCount = Math.floor(rem / 2);
    rem %= 2;
    const diCount = rem;

    const breakdown: { chipDef: HellOfADealChipDef; count: number }[] = [];
    if (dCount > 0) breakdown.push({ chipDef: HELL_OF_A_DEAL_CHIPS[0], count: dCount });
    if (bCount > 0) breakdown.push({ chipDef: HELL_OF_A_DEAL_CHIPS[1], count: bCount });
    if (aCount > 0) breakdown.push({ chipDef: HELL_OF_A_DEAL_CHIPS[2], count: aCount });
    if (diCount > 0) breakdown.push({ chipDef: HELL_OF_A_DEAL_CHIPS[3], count: diCount });

    // Recopilar todas las fichas individuales del equipo
    const chipPiles: HellOfADealChipDef[][] = [
      Array.from({ length: dCount }, () => HELL_OF_A_DEAL_CHIPS[0]),
      Array.from({ length: bCount }, () => HELL_OF_A_DEAL_CHIPS[1]),
      Array.from({ length: aCount }, () => HELL_OF_A_DEAL_CHIPS[2]),
      Array.from({ length: diCount }, () => HELL_OF_A_DEAL_CHIPS[3]),
    ].filter((p) => p.length > 0);

    // Intercalar las fichas para que los personajes y colores se mezclen orgánicamente
    const mixedChips: HellOfADealChipDef[] = [];
    const totalCount = dCount + bCount + aCount + diCount;
    let cycle = 0;
    while (mixedChips.length < totalCount) {
      for (let p = 0; p < chipPiles.length; p++) {
        const c = chipPiles[(cycle + p) % chipPiles.length].pop();
        if (c) mixedChips.push(c);
      }
      cycle++;
    }

    // Determinar número de columnas activas (1 a 4) según la cantidad de fichas
    const numCols = Math.min(maxColumns, Math.max(1, Math.min(mixedChips.length, 4)));
    const cols: ChipInstance[][] = Array.from({ length: numCols }, () => []);

    // Distribución piramidal equilibrada
    const profile =
      numCols === 1
        ? [1.0]
        : numCols === 2
        ? [0.5, 0.5]
        : numCols === 3
        ? [0.28, 0.44, 0.28]
        : [0.18, 0.32, 0.32, 0.18];

    mixedChips.forEach((chipDef, i) => {
      let bestCol = 0;
      let minRatio = Infinity;
      for (let c = 0; c < numCols; c++) {
        const expected = profile[c] * mixedChips.length;
        const current = cols[c].length;
        const ratio = current / Math.max(0.1, expected);
        if (ratio < minRatio) {
          minRatio = ratio;
          bestCol = c;
        }
      }

      const jitterX = Math.sin(i * 3.7 + bestCol * 2.3) * 1.3;
      cols[bestCol].push({
        id: `chip_${bestCol}_${cols[bestCol].length}_${i}_${chipDef.id}`,
        chipDef,
        jitterX,
      });
    });

    return { columns: cols, totalChips: totalCount, denominationBreakdown: breakdown };
  }, [score, maxColumns]);

  return (
    <div className={`relative flex flex-col items-center justify-end select-none ${className}`}>
      {/* Resplandor atmosférico de paño de casino que crece con los puntos */}
      <div
        className="absolute -bottom-2 inset-x-0 h-24 pointer-events-none transition-all duration-700 blur-xl opacity-35"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${theme.glowColor || theme.accentHex || '#d4af37'} 0%, transparent 75%)`,
        }}
      />

      {/* Base de fieltro de mesa de casino Art Déco con ALTURA UNIFORME para todas las tarjetas */}
      <div
        className="relative w-full max-w-[260px] mx-auto flex items-end justify-center gap-1.5 sm:gap-2 px-3 pt-3 pb-2 bg-gradient-to-b from-[#14120e]/90 to-[#070605]/95 rounded-2xl border border-[#d4af37]/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.7)] transition-[height] duration-500 ease-out overflow-hidden"
        style={{
          minHeight: `${uniformTrayHeight}px`,
          height: `${uniformTrayHeight}px`,
        }}
      >
        {/* Reflejo superior de paño dorado */}
        <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent z-20" />

        {score <= 0 ? (
          /* Tapete vacío unificado para tarjetas con 0 puntos */
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="absolute inset-0 bg-radial from-[#d4af37]/5 to-transparent" />
            <span className="text-[10px] uppercase font-vintage tracking-wider text-amber-200/40 flex items-center gap-1.5 font-bold">
              <span>🪙</span>
              <span>Tapete de Fichas (0 pts)</span>
            </span>
          </div>
        ) : (
          /* Columnas con fichas de poker MEZCLADAS naturalmente */
          columns.map((col, colIdx) => (
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
          ))
        )}
      </div>

      {/* Resumen total uniforme y desglose de fichas */}
      <div className="mt-1.5 flex flex-col items-center justify-center gap-1 z-10 px-1 text-center w-full min-h-[34px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-vintage uppercase tracking-wider text-[#f3e5ab] font-bold drop-shadow-sm flex items-center gap-1">
            <span>🪙</span>
            <span>
              {score} {score === 1 ? 'punto' : 'puntos'}
            </span>
            {score > 0 && (
              <span className="text-[#f3e5ab]/60 font-normal text-[9.5px]">
                ({totalChips} {totalChips === 1 ? 'ficha' : 'fichas'})
              </span>
            )}
          </span>
        </div>

        {/* Insignias de denominación poker presentes en el montón */}
        {score > 0 && denominationBreakdown.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-1">
            {denominationBreakdown.map((item) => (
              <span
                key={item.chipDef.id}
                className="px-1.5 py-0.2 rounded text-[8.5px] font-vintage font-bold border tracking-tight"
                style={{
                  backgroundColor: `${item.chipDef.accentColor}30`,
                  borderColor: `${item.chipDef.goldColor}60`,
                  color: item.chipDef.goldColor,
                }}
                title={`${item.count} × ${item.chipDef.value} pts (${item.chipDef.name})`}
              >
                {item.count > 1 ? `${item.count}×` : ''}{item.chipDef.value} pts
              </span>
            ))}
          </div>
        ) : (
          <div className="text-[9px] font-vintage text-amber-200/30 italic">
            Esperando primera ronda
          </div>
        )}
      </div>
    </div>
  );
};


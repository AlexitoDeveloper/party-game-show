import React from 'react';

interface HellCasinoBackgroundProps {
  children?: React.ReactNode;
  showPokerSuits?: boolean;
  intensity?: 'subtle' | 'medium' | 'high';
  className?: string;
}

export const HellCasinoBackground: React.FC<HellCasinoBackgroundProps> = ({
  children,
  showPokerSuits = true,
  intensity = 'medium',
  className = '',
}) => {
  const opacityClass =
    intensity === 'subtle' ? 'opacity-20' : intensity === 'high' ? 'opacity-45' : 'opacity-30';

  return (
    <div className={`relative min-h-screen bg-black hell-casino-bg text-white overflow-x-hidden ${className}`}>
      {/* CAPA 1: ARCOS DE VIDRIERA ART DECÓ (STAINED GLASS) CON RAYOS RADIANTES Y ROSA CENTRAL */}
      <div className={`pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden ${opacityClass}`}>
        <svg
          viewBox="0 0 1000 1000"
          className="w-[140vw] h-[140vw] max-w-[1500px] max-h-[1500px] -translate-y-12 animate-[spin_240s_linear_infinite]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="glassGoldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#8b0000" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glassCrimsonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#5c0612" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Resplandor central */}
          <circle cx="500" cy="500" r="480" fill="url(#glassCrimsonGlow)" />
          <circle cx="500" cy="500" r="300" fill="url(#glassGoldGlow)" />

          {/* Arcos concéntricos Art Decó con dobles líneas */}
          <circle cx="500" cy="500" r="480" stroke="#d4af37" strokeWidth="2.5" strokeDasharray="16 8" opacity="0.6" />
          <circle cx="500" cy="500" r="460" stroke="#b91c1c" strokeWidth="1.5" opacity="0.5" />
          <circle cx="500" cy="500" r="400" stroke="#d4af37" strokeWidth="2" opacity="0.7" />
          <circle cx="500" cy="500" r="380" stroke="#8b0000" strokeWidth="1" strokeDasharray="6 6" opacity="0.5" />
          <circle cx="500" cy="500" r="300" stroke="#d4af37" strokeWidth="3" opacity="0.8" />
          <circle cx="500" cy="500" r="280" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
          <circle cx="500" cy="500" r="200" stroke="#d4af37" strokeWidth="2.5" strokeDasharray="8 4" opacity="0.75" />
          <circle cx="500" cy="500" r="120" stroke="#f3e5ab" strokeWidth="3" opacity="0.9" />

          {/* Rayos geométricos de la vidriera (24 radios) */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            return (
              <line
                key={i}
                x1="500"
                y1="500"
                x2="500"
                y2="20"
                transform={`rotate(${angle} 500 500)`}
                stroke={i % 2 === 0 ? '#d4af37' : '#991b1b'}
                strokeWidth={i % 4 === 0 ? '2' : '1'}
                strokeDasharray={i % 2 === 0 ? undefined : '4 4'}
                opacity={i % 2 === 0 ? 0.65 : 0.4}
              />
            );
          })}
        </svg>
      </div>

      {/* CAPA 2: LOS 4 PALOS DE LA BARAJA EN LAS 4 ESQUINAS (♠, ♥, ♣, ♦) */}
      {showPokerSuits && (
        <div className="pointer-events-none fixed inset-0 z-0 p-4 sm:p-6 flex flex-col justify-between select-none">
          {/* Fila superior: Picas (izq) y Corazones (der) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 opacity-25 hover:opacity-50 transition-opacity">
              <span className="text-xl sm:text-2xl text-amber-400 font-serif drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">♠</span>
              <span className="hidden sm:inline text-[9px] font-broadway uppercase tracking-widest text-[#d4af37]/60">Spades</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-25 hover:opacity-50 transition-opacity">
              <span className="hidden sm:inline text-[9px] font-broadway uppercase tracking-widest text-red-500/60">Hearts</span>
              <span className="text-xl sm:text-2xl text-red-600 font-serif drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">♥</span>
            </div>
          </div>

          {/* Fila inferior: Tréboles (izq) y Rombos (der) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 opacity-25 hover:opacity-50 transition-opacity">
              <span className="text-xl sm:text-2xl text-amber-400 font-serif drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">♣</span>
              <span className="hidden sm:inline text-[9px] font-broadway uppercase tracking-widest text-[#d4af37]/60">Clubs</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-25 hover:opacity-50 transition-opacity">
              <span className="hidden sm:inline text-[9px] font-broadway uppercase tracking-widest text-red-500/60">Diamonds</span>
              <span className="text-xl sm:text-2xl text-red-600 font-serif drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">♦</span>
            </div>
          </div>
        </div>
      )}

      {/* CAPA 3: VIÑETA Y GRANO VINTAGE RUBBER HOSE */}
      <div className="pointer-events-none fixed inset-0 z-0 rubber-hose-vignette" />
      <div className="pointer-events-none fixed inset-0 z-0 film-grain-overlay opacity-30" />

      {/* CONTENIDO REAL DE LA APLICACIÓN */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

import React from 'react';

interface VintageFilmOverlayProps {
  isActive: boolean;
  intensity?: 'subtle' | 'vintage' | 'heavy';
}

export const VintageFilmOverlay: React.FC<VintageFilmOverlayProps> = ({
  isActive,
  intensity = 'vintage',
}) => {
  if (!isActive) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none"
    >
      {/* 1. PARPADEO LUMÍNICO DE PROYECTOR DE ARCO DE CARBÓN */}
      <div className="absolute inset-0 celluloid-projector-active bg-amber-900/[0.04] mix-blend-color" />

      {/* 2. VIÑETEADO DE LENTE CURVADA DE CÁMARA 1930s */}
      <div className="absolute inset-0 celluloid-vignette" />

      {/* 3. LÍNEAS DE ARAÑAZO DE CELULOIDE VERTICALES QUE CORREN */}
      <div
        className="absolute top-0 bottom-0 w-[1.5px] bg-amber-100/35 blur-[0.5px]"
        style={{
          animation: 'filmScratchMove 0.8s steps(1) infinite',
          left: '15%',
        }}
      />
      <div
        className="absolute top-0 bottom-0 w-[1px] bg-black/40 blur-[0.3px]"
        style={{
          animation: 'filmScratchMove 1.4s steps(1) infinite reverse',
          left: '42%',
        }}
      />
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-amber-200/25 blur-[0.6px]"
        style={{
          animation: 'filmScratchMove 2.1s steps(1) infinite',
          left: '73%',
        }}
      />

      {/* 4. MOTAS DE POLVO Y PELUSA EN CELULOIDE */}
      <div
        className="absolute w-2.5 h-2.5 rounded-full bg-black/50 blur-[0.7px]"
        style={{
          top: '28%',
          left: '34%',
          animation: 'filmDustFloat 4s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-1.5 h-1.5 rounded-full bg-amber-100/40 blur-[0.4px]"
        style={{
          top: '65%',
          left: '81%',
          animation: 'filmDustFloat 5.5s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute w-2 h-2 rounded-full bg-black/40 blur-[0.5px]"
        style={{
          top: '12%',
          left: '58%',
          animation: 'filmDustFloat 3.8s ease-in-out infinite',
        }}
      />

      {/* 5. TINTE Y GRANO ANALÓGICO SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-35 mix-blend-overlay">
        <filter id="celluloid-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#celluloid-grain)" />
      </svg>
    </div>
  );
};

export default VintageFilmOverlay;

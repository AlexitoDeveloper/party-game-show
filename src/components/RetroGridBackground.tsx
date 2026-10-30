import React from 'react';

interface RetroGridBackgroundProps {
  activeTeamColor?: string;
  className?: string;
  showParticles?: boolean;
}

/**
 * RetroGridBackground: Fondo escénico Art Déco / Speakeasy 1930s ultra-optimizado para Smart TVs (60 FPS).
 * Utiliza gradientes radiales nativos sin filtros SVG feTurbulence ni desenfoques gaussianos pesados en CPU/GPU.
 */
export const RetroGridBackground: React.FC<RetroGridBackgroundProps> = ({
  activeTeamColor,
  className = '',
}) => {
  const glowColor = activeTeamColor || '#d4af37';

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#07070a] select-none ${className}`}>
      {/* 1. Abanico Sunburst Art Déco geométrico de fondo */}
      <div className="absolute inset-0 deco-sunburst-bg opacity-30 pointer-events-none" />

      {/* 2. Resplandor reactivo al color del equipo activo mediante gradiente radial nativo (0 coste de blur) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 28%, ${glowColor}33 0%, transparent 55%), radial-gradient(circle at 50% 95%, rgba(212, 175, 55, 0.14) 0%, transparent 50%)`,
        }}
      />

      {/* 3. Viñeta radial oscura de speakeasy para focalizar el escenario */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-[#07070a]/90 pointer-events-none" />
    </div>
  );
};



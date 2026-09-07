import React from 'react';
import { motion } from 'framer-motion';

interface RetroGridBackgroundProps {
  activeTeamColor?: string;
  className?: string;
}

/**
 * RetroGridBackground: Fondo escénico Art Déco / Speakeasy 1930s acelerado por GPU,
 * con abanico sunburst dorado, halos de latón y grano analógico de celuloide.
 */
export const RetroGridBackground: React.FC<RetroGridBackgroundProps> = ({
  activeTeamColor,
  className = '',
}) => {
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#07070a] select-none ${className}`}>
      {/* 1. Abanico Sunburst Art Déco geométrico de fondo */}
      <div className="absolute inset-0 deco-sunburst-bg opacity-30 pointer-events-none" />

      {/* 2. Resplandor reactivo al color del equipo activo (focos de plató) */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[550px] rounded-full blur-[150px] transition-colors duration-1000 opacity-20 pointer-events-none"
        style={{
          backgroundColor: activeTeamColor || '#d4af37',
        }}
      />

      {/* 3. Halo inferior cálido de latón / bronce de proscenio */}
      <div className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] rounded-full bg-[#d4af37]/10 blur-[140px] pointer-events-none" />

      {/* 4. Viñeta radial oscura de speakeasy para focalizar el escenario */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-[#07070a]/90 pointer-events-none" />

      {/* 5. Luces volumétricas en esquinas superiores de cine clásico */}
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-16 -left-16 w-96 h-96 rounded-full bg-amber-500/15 blur-[110px] pointer-events-none"
      />
      <motion.div
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className="absolute -top-16 -right-16 w-96 h-96 rounded-full bg-amber-300/15 blur-[110px] pointer-events-none"
      />

      {/* 6. Textura de celuloide / grano analógico sutil */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay"
        style={{ filter: 'url(#vintage-grain)' }}
      />
    </div>
  );
};


import React from 'react';
import { motion } from 'framer-motion';

interface RetroGridBackgroundProps {
  activeTeamColor?: string;
  className?: string;
}

/**
 * RetroGridBackground: Fondo retro arcade con perspectiva 3D acelerada por GPU,
 * líneas de cuadrícula en fuga hacia el horizonte y halos ambientales de plató.
 */
export const RetroGridBackground: React.FC<RetroGridBackgroundProps> = ({
  activeTeamColor,
  className = '',
}) => {
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#030712] select-none ${className}`}>
      {/* 1. Halo ambiental reactivo al color del equipo activo */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] transition-colors duration-1000 opacity-25"
        style={{
          backgroundColor: activeTeamColor || '#3B82F6',
        }}
      />

      {/* 2. Resplandor de base para profundidad escénica */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[950px] h-[400px] rounded-full bg-indigo-950/20 blur-[130px]" />

      {/* 3. Rejilla Retro con perspectiva acelerada por GPU */}
      <div className="retro-grid-bg">
        <div className="retro-grid-lines retro-grid-drift opacity-60" />
      </div>

      {/* 4. Viñeta radial oscura para enfocar el contenido central */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/80" />

      {/* 5. Luces volumétricas en esquinas superiores con oscilación sutil */}
      <motion.div
        animate={{ opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px]"
      />
      <motion.div
        animate={{ opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className="absolute -top-12 -right-12 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]"
      />
    </div>
  );
};

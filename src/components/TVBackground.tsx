import React from 'react';
import { motion } from 'framer-motion';

interface TVBackgroundProps {
  activeTeamColor?: string;
  glowOpacity?: number;
}

/**
 * TVBackground: Fondo de plató retro-futurista con rejilla de perspectiva,
 * halos ambientales y partículas flotantes discretas sin sobrecargar la CPU.
 */
export const TVBackground: React.FC<TVBackgroundProps> = ({
  activeTeamColor,
  glowOpacity = 0.25,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#030712]">
      {/* 1. Halo central ambiental */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] transition-colors duration-1000"
        style={{
          backgroundColor: activeTeamColor || '#1E1B4B', // Indigo profundo por defecto o color del equipo activo
          opacity: glowOpacity,
        }}
      />

      {/* 2. Resplandor secundario inferior para dar profundidad */}
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-blue-950/20 blur-[120px]" />

      {/* 3. Rejilla Retro con máscara radial */}
      <div className="retro-grid-bg">
        <div className="retro-grid-lines retro-grid-drift opacity-60" />
      </div>

      {/* 4. Viñeta radial oscura para enfocar la atención en el centro de la pantalla */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/80" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#030712]/40 to-[#030712]/90" />

      {/* 5. Luces de escenario en las esquinas superiores */}
      <motion.div
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-10 -left-10 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px]"
      />
      <motion.div
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className="absolute -top-10 -right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]"
      />
    </div>
  );
};

import React from 'react';

interface BorderBeamProps {
  className?: string;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
}

/**
 * BorderBeam: Efecto de haz de luz rotatorio de alta precisión sobre los bordes de tarjetas arcade.
 * Proporciona un resplandor dinámico sin parpadeo.
 */
export const BorderBeam: React.FC<BorderBeamProps> = ({
  className = '',
  duration = 6,
  colorFrom = '#3B82F6',
  colorTo = '#60A5FA',
}) => {
  return (
    <div className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-0 ${className}`}>
      <div
        className="absolute inset-[-150%] animate-beam-rotate opacity-75"
        style={
          {
            '--beam-duration': `${duration}s`,
            background: `conic-gradient(from 0deg, transparent 0 320deg, ${colorFrom} 345deg, ${colorTo} 360deg)`,
          } as React.CSSProperties
        }
      />
    </div>
  );
};

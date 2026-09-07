import React from 'react';

interface DecoProceduralSpandrelProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
  className?: string;
  color?: string;
  accentColor?: string;
  variant?: 'fan' | 'stepped' | 'sunburst';
}

export const DecoProceduralSpandrel: React.FC<DecoProceduralSpandrelProps> = ({
  position = 'top-left',
  size = 48,
  className = '',
  color = '#d4af37',
  accentColor = '#f59e0b',
  variant = 'fan',
}) => {
  // Determine rotation/mirroring based on corner position
  const getTransform = () => {
    switch (position) {
      case 'top-right':
        return 'scale(-1, 1)';
      case 'bottom-left':
        return 'scale(1, -1)';
      case 'bottom-right':
        return 'scale(-1, -1)';
      default:
        return 'none';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-right':
        return 'bottom-0 right-0';
      default:
        return 'top-0 left-0';
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`absolute pointer-events-none z-10 ${getPositionClasses()} ${className}`}
      style={{ transform: getTransform() }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {variant === 'fan' && (
        <g stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.85">
          {/* Outer framing lines */}
          <path d="M 0 0 L 100 0 L 100 14 L 14 14 L 14 100 L 0 100 Z" fill={color} fillOpacity="0.15" />
          <path d="M 0 0 L 96 0" strokeWidth="3" />
          <path d="M 0 0 L 0 96" strokeWidth="3" />

          {/* Stepped Art Deco Chevrons */}
          <path d="M 4 28 L 28 28 L 28 4" stroke={accentColor} strokeWidth="1.5" />
          <path d="M 6 44 L 44 44 L 44 6" stroke={color} strokeWidth="1" />
          <path d="M 8 60 L 60 60 L 60 8" stroke={accentColor} strokeWidth="1" strokeDasharray="3 2" />

          {/* Concentric Golden Ray Arcs */}
          <path d="M 0 75 A 75 75 0 0 1 75 0" stroke={color} strokeWidth="1.5" />
          <path d="M 0 50 A 50 50 0 0 1 50 0" stroke={accentColor} strokeWidth="2" />
          <path d="M 0 25 A 25 25 0 0 1 25 0" stroke={color} strokeWidth="2.5" />

          {/* Radiating sunburst rays from corner */}
          <line x1="0" y1="0" x2="35" y2="12" stroke={color} strokeWidth="1" opacity="0.7" />
          <line x1="0" y1="0" x2="28" y2="28" stroke={accentColor} strokeWidth="1.8" />
          <line x1="0" y1="0" x2="12" y2="35" stroke={color} strokeWidth="1" opacity="0.7" />

          {/* Corner diamond gem accent */}
          <polygon points="6,6 12,2 18,6 12,10" fill={accentColor} stroke={color} strokeWidth="1" />
        </g>
      )}

      {variant === 'stepped' && (
        <g stroke={color} strokeWidth="2" fill="none">
          {/* Stepped ziggurat frame */}
          <path d="M 0 0 L 90 0 L 90 12 L 70 12 L 70 24 L 50 24 L 50 44 L 24 44 L 24 70 L 12 70 L 12 90 L 0 90 Z" fill={color} fillOpacity="0.12" strokeWidth="2" />
          <path d="M 4 4 L 80 4 L 80 10 L 62 10 L 62 20 L 44 20 L 44 38 L 20 38 L 20 62 L 10 62 L 10 80 L 4 80 Z" stroke={accentColor} strokeWidth="1" />
          <circle cx="16" cy="16" r="4" fill={color} />
          <line x1="0" y1="0" x2="55" y2="55" stroke={accentColor} strokeWidth="1.5" />
        </g>
      )}

      {variant === 'sunburst' && (
        <g stroke={color} strokeWidth="1.5" fill="none">
          <circle cx="0" cy="0" r="80" stroke={color} strokeWidth="1" opacity="0.4" />
          <circle cx="0" cy="0" r="55" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="30" stroke={color} strokeWidth="2" />
          <line x1="0" y1="0" x2="85" y2="0" strokeWidth="2.5" />
          <line x1="0" y1="0" x2="80" y2="22" />
          <line x1="0" y1="0" x2="72" y2="42" stroke={accentColor} strokeWidth="2" />
          <line x1="0" y1="0" x2="60" y2="60" strokeWidth="2.5" />
          <line x1="0" y1="0" x2="42" y2="72" stroke={accentColor} strokeWidth="2" />
          <line x1="0" y1="0" x2="22" y2="80" />
          <line x1="0" y1="0" x2="0" y2="85" strokeWidth="2.5" />
        </g>
      )}
    </svg>
  );
};

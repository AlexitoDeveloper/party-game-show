import React from 'react';
import {
  Trophy,
  Lightning,
  Flame,
  Timer,
  Skull,
  Target,
  Crown,
  Sparkle,
  Sword,
  Bomb,
  DiceFive,
  Users,
  Television,
  Radio,
  Moon,
  Sun,
  Drop,
  WarningCircle,
  CheckCircle,
  Eye,
  Heart,
  Shield,
  MusicNotes,
  IconProps,
  IconWeight,
} from '@phosphor-icons/react';

export type GameIconName =
  | 'Trophy'
  | 'Lightning'
  | 'Flame'
  | 'Timer'
  | 'Skull'
  | 'Target'
  | 'Crown'
  | 'Sparkle'
  | 'Sword'
  | 'Swords'
  | 'Bomb'
  | 'Dice'
  | 'Users'
  | 'Tv'
  | 'Radio'
  | 'Moon'
  | 'Sun'
  | 'Drop'
  | 'Droplets'
  | 'Warning'
  | 'Check'
  | 'Eye'
  | 'Heart'
  | 'Shield'
  | 'Music';

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  Trophy,
  Lightning,
  Flame,
  Timer,
  Skull,
  Target,
  Crown,
  Sparkle,
  Sword,
  Swords: Sword,
  Bomb,
  Dice: DiceFive,
  Users,
  Tv: Television,
  Radio,
  Moon,
  Sun,
  Drop,
  Droplets: Drop,
  Warning: WarningCircle,
  Check: CheckCircle,
  Eye,
  Heart,
  Shield,
  Music: MusicNotes,
};

export interface GameIconProps {
  name: GameIconName | string;
  size?: number | string;
  color?: string;
  weight?: IconWeight;
  glow?: boolean | string;
  className?: string;
}

/**
 * GameIcon: Wrapper sobre Phosphor Icons con estética Arcade Neón (weight="fill" por defecto).
 * Soporta prop `glow` para resplandor lumínico tipo tubo de neón o LED de plató.
 */
export const GameIcon: React.FC<GameIconProps> = ({
  name,
  size = 24,
  color,
  weight = 'fill',
  glow = false,
  className = '',
}) => {
  const IconComponent = ICON_MAP[name] || Sparkle;

  const glowStyle: React.CSSProperties = glow
    ? {
        filter: typeof glow === 'string'
          ? `drop-shadow(0 0 8px ${glow}) drop-shadow(0 0 16px ${glow})`
          : 'drop-shadow(0 0 8px currentColor) drop-shadow(0 0 14px currentColor)',
      }
    : {};

  return (
    <span
      className={`inline-flex items-center justify-center transition-all ${className}`}
      style={glowStyle}
    >
      <IconComponent size={size} color={color} weight={weight} />
    </span>
  );
};

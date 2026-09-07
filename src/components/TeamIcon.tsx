import React from 'react';
import { Droplets, Flame, Zap, Sparkles, Moon, FlaskConical, Orbit, Sun } from 'lucide-react';

interface TeamIconProps {
  index: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TeamIcon: React.FC<TeamIconProps> = ({ index, className = 'w-4 h-4', style }) => {
  switch (index) {
    case 1:
      return <Droplets className={className} style={style} />;
    case 2:
      return <Flame className={className} style={style} />;
    case 3:
      return <Zap className={className} style={style} />;
    case 4:
      return <Sparkles className={className} style={style} />;
    case 5:
      return <Moon className={className} style={style} />;
    case 6:
      return <FlaskConical className={className} style={style} />;
    case 7:
      return <Orbit className={className} style={style} />;
    case 8:
      return <Sun className={className} style={style} />;
    default:
      return <Sparkles className={className} style={style} />;
  }
};

export default TeamIcon;

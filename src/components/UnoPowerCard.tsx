import React from 'react';
import PowerCardView from './PowerCardView';
import { PowerCard } from '../lib/powerCards';

interface UnoPowerCardProps {
  card: PowerCard;
  size?: 'sm' | 'md' | 'lg';
  isClickable?: boolean;
  onClick?: () => void;
  showRule?: boolean;
  className?: string;
}

export default function UnoPowerCard(props: UnoPowerCardProps) {
  return <PowerCardView {...props} />;
}
export { PowerCardView };

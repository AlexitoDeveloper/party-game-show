import React, { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

interface NumberTickerProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * NumberTicker: Contador con física de amortiguación elástica tipo tragaperras/marcador de concurso.
 * Actualiza los números en tiempo real mediante el motor de animación de Framer Motion.
 */
export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const motionVal = useMotionValue(value);
  const springVal = useSpring(motionVal, {
    damping: 24,
    stiffness: 110,
    mass: 0.8,
  });
  const displayVal = useTransform(springVal, (current) => Math.round(current));
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    return displayVal.on('change', (latest) => {
      if (spanRef.current) {
        spanRef.current.textContent = `${prefix}${latest}${suffix}`;
      }
    });
  }, [displayVal, prefix, suffix]);

  return (
    <span ref={spanRef} className={`inline-block tabular-nums font-mono ${className}`}>
      {prefix}{value}{suffix}
    </span>
  );
};

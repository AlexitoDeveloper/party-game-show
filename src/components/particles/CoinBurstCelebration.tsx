import React, { useEffect, useRef } from 'react';

interface CoinParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  scaleX: number;
  vScaleX: number;
  size: number;
  color: string;
  borderColor: string;
  label: string;
  alpha: number;
  gravity: number;
}

interface CoinBurstCelebrationProps {
  active?: boolean;
  trigger?: number;
  originX?: number;
  originY?: number;
  count?: number;
  onComplete?: () => void;
  className?: string;
}

export const CoinBurstCelebration: React.FC<CoinBurstCelebrationProps> = ({
  active = true,
  trigger,
  originX: propOriginX,
  originY: propOriginY,
  count = 35,
  onComplete,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particles: CoinParticle[] = [];
    const originX = propOriginX ?? width / 2;
    const originY = propOriginY ?? height * 0.65;

    const colors = [
      { fill: '#d4af37', border: '#fef08a', label: '🪙' },
      { fill: '#b45309', border: '#fde68a', label: '★' },
      { fill: '#eab308', border: '#ffffff', label: '10' },
      { fill: '#991b1b', border: '#facc15', label: '♠' },
    ];

    for (let i = 0; i < count; i++) {
      const type = colors[i % colors.length];
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5; // Fountain upward spread
      const speed = Math.random() * 14 + 10;

      particles.push({
        x: originX + (Math.random() - 0.5) * 40,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        scaleX: 1,
        vScaleX: (Math.random() * 0.1 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 8 + 14,
        color: type.fill,
        borderColor: type.border,
        label: type.label,
        alpha: 1,
        gravity: 0.45,
      });
    }

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRot;
        p.scaleX = Math.cos(p.rotation * 2);

        if (p.y > height - 20) {
          p.vy *= -0.4; // Bounce on floor
          p.vx *= 0.8;
          p.alpha -= 0.03;
        }

        if (p.alpha > 0.01) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(p.scaleX, 1);
          ctx.globalAlpha = Math.max(0, p.alpha);

          // Draw Coin Body
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Border & Edge
          ctx.strokeStyle = p.borderColor;
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Symbol
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.floor(p.size * 0.9)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.label, 0, 0);

          ctx.restore();
        }
      }

      if (aliveCount > 0) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [active, trigger, count, onComplete, propOriginX, propOriginY]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      aria-hidden="true"
    />
  );
};

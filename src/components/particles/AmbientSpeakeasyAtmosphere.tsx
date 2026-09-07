import React, { useEffect, useRef } from 'react';

interface AmbientSpeakeasyAtmosphereProps {
  particleCount?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulseSpeed: number;
  color: string;
}

export const AmbientSpeakeasyAtmosphere: React.FC<AmbientSpeakeasyAtmosphereProps> = ({
  particleCount = 45,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Warm speakeasy color palette: gold dust, brass, warm ember
    const colors = [
      'rgba(212, 175, 55, ',  // Deco Gold
      'rgba(245, 158, 11, ',  // Amber
      'rgba(254, 243, 199, ', // Pale Champagne
      'rgba(180, 83, 9, ',    // Copper Ember
    ];

    const particles: Particle[] = [];
    const count = Math.min(particleCount, window.innerWidth < 640 ? 30 : 60);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.0 + 0.8,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -Math.random() * 0.45 - 0.1, // Gently floating upwards like warm club dust
        opacity: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      // Pause if tab is hidden (battery preservation for mobile)
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.speedX * delta * 60;
        p.y += p.speedY * delta * 60;
        p.opacity += Math.sin(currentTime * 0.002 * p.pulseSpeed) * 0.005;

        // Wrap around screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw particle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.1, Math.min(0.8, p.opacity))})`;
        ctx.shadowColor = '#d4af37';
        ctx.shadowBlur = p.radius * 3;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for performance
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
};

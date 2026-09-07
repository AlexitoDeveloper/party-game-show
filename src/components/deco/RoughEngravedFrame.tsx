import React, { useEffect, useRef } from 'react';
import rough from 'roughjs';

interface RoughEngravedFrameProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  strokeColor?: string;
  fillHatchColor?: string;
  hatchAngle?: number;
  hatchGap?: number;
  roughness?: number;
  bowing?: number;
  strokeWidth?: number;
  inset?: number;
  children?: React.ReactNode;
}

export const RoughEngravedFrame: React.FC<RoughEngravedFrameProps> = ({
  width = '100%',
  height = '100%',
  className = '',
  strokeColor = '#d4af37',
  fillHatchColor = '#b38728',
  hatchAngle = -45,
  hatchGap = 8,
  roughness = 1.1,
  bowing = 1.2,
  strokeWidth = 1.5,
  inset = 6,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rect.width;
      const h = rect.height;

      if (w === 0 || h === 0) return;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const rc = rough.canvas(canvas);

      // 1. Outer vintage engraved border with mild bowing
      rc.rectangle(2, 2, w - 4, h - 4, {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        roughness: roughness,
        bowing: bowing,
      });

      // 2. Inner stepped border with cross-hatch vintage copperplate shading
      if (w > inset * 3 && h > inset * 3) {
        rc.rectangle(inset, inset, w - inset * 2, h - inset * 2, {
          stroke: fillHatchColor,
          strokeWidth: Math.max(1, strokeWidth - 0.5),
          fill: fillHatchColor,
          fillStyle: 'cross-hatch',
          hachureAngle: hatchAngle,
          hachureGap: hatchGap,
          fillWeight: 0.6,
          roughness: roughness * 0.8,
        });

        // 3. Four corner engraved diagonal accents
        const cLen = Math.min(18, Math.floor(Math.min(w, h) / 5));
        rc.line(inset, inset + cLen, inset + cLen, inset, {
          stroke: strokeColor,
          strokeWidth: strokeWidth + 0.5,
          roughness: roughness,
        });
        rc.line(w - inset, inset + cLen, w - inset - cLen, inset, {
          stroke: strokeColor,
          strokeWidth: strokeWidth + 0.5,
          roughness: roughness,
        });
        rc.line(inset, h - inset - cLen, inset + cLen, h - inset, {
          stroke: strokeColor,
          strokeWidth: strokeWidth + 0.5,
          roughness: roughness,
        });
        rc.line(w - inset, h - inset - cLen, w - inset - cLen, h - inset, {
          stroke: strokeColor,
          strokeWidth: strokeWidth + 0.5,
          roughness: roughness,
        });
      }
    };

    updateCanvas();

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateCanvas);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [strokeColor, fillHatchColor, hatchAngle, hatchGap, roughness, bowing, strokeWidth, inset]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

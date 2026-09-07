import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCasinoChipProps {
  value?: string | number;
  color?: string;
  size?: number; // pixel diameter
  onClick?: () => void;
  className?: string;
}

export const ThreeCasinoChip: React.FC<ThreeCasinoChipProps> = ({
  value = '10',
  color = '#c2410c', // Vintage carmine/clay red
  size = 64,
  onClick,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isSpinning = useRef(false);
  const rotationVelocity = useRef(0);
  const meshRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 2.5, 3.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    // 3. Chip Group
    const chipGroup = new THREE.Group();
    meshRef.current = chipGroup;
    scene.add(chipGroup);

    // Cylinder Chip Mesh
    const chipRadius = 1.0;
    const chipHeight = 0.16;
    const cylinderGeo = new THREE.CylinderGeometry(chipRadius, chipRadius, chipHeight, 32);

    // Procedural Chip Rim & Face Texture
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 256;
    faceCanvas.height = 256;
    const fctx = faceCanvas.getContext('2d');
    if (fctx) {
      // Base color ring
      fctx.fillStyle = color;
      fctx.fillRect(0, 0, 256, 256);

      // Art Deco striped chip rim accents (12 stripes)
      fctx.fillStyle = '#fef3c7';
      for (let i = 0; i < 12; i++) {
        fctx.beginPath();
        fctx.arc(128, 128, 128, (i * Math.PI) / 6, (i * Math.PI) / 6 + 0.18);
        fctx.lineTo(128, 128);
        fctx.fill();
      }

      // Inner inlay circle
      fctx.fillStyle = '#120b08';
      fctx.beginPath();
      fctx.arc(128, 128, 85, 0, Math.PI * 2);
      fctx.fill();

      // Gold inlay rim
      fctx.strokeStyle = '#d4af37';
      fctx.lineWidth = 6;
      fctx.stroke();

      // Value text
      fctx.fillStyle = '#fef3c7';
      fctx.font = '900 48px sans-serif';
      fctx.textAlign = 'center';
      fctx.textBaseline = 'middle';
      fctx.fillText(String(value), 128, 128);
    }

    const faceTexture = new THREE.CanvasTexture(faceCanvas);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1f1915,
      metalness: 0.3,
      roughness: 0.4,
    });

    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      metalness: 0.4,
      roughness: 0.3,
    });

    // Cylinder materials: [side, top, bottom]
    const chipMesh = new THREE.Mesh(cylinderGeo, [bodyMat, faceMat, faceMat]);
    chipGroup.add(chipMesh);

    // Initial slight tilt for 3D visibility
    chipGroup.rotation.x = 0.45;
    chipGroup.rotation.y = 0.2;

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isSpinning.current) {
        chipGroup.rotation.y += rotationVelocity.current;
        rotationVelocity.current *= 0.94;
        if (Math.abs(rotationVelocity.current) < 0.01) {
          isSpinning.current = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      cylinderGeo.dispose();
      bodyMat.dispose();
      faceMat.dispose();
      faceTexture.dispose();
      renderer.dispose();
    };
  }, [value, color, size]);

  const handleInteraction = () => {
    isSpinning.current = true;
    rotationVelocity.current = 0.45;
    if (onClick) onClick();
  };

  return (
    <div
      ref={mountRef}
      onClick={handleInteraction}
      className={`cursor-pointer hover:scale-105 active:scale-95 transition-transform inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title={`Ficha ${value}`}
    />
  );
};

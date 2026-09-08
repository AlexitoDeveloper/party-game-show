import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCasinoChipProps {
  value?: string | number;
  color?: string;
  size?: number; // pixel diameter
  onClick?: () => void;
  className?: string;
  chipType?: 'devil' | 'bomba' | 'ace' | 'dice';
}

const CHIP_IMAGE_MAP: Record<string, string> = {
  devil: '/chips/chip_devil.jpg',
  bomba: '/chips/chip_bomba.jpg',
  ace: '/chips/chip_ace.jpg',
  dice: '/chips/chip_dice.jpg',
};

export const ThreeCasinoChip: React.FC<ThreeCasinoChipProps> = ({
  value = '10',
  color = '#c2410c', // Vintage carmine/clay red
  size = 64,
  onClick,
  className = '',
  chipType,
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.4);
    rimLight.position.set(-2, 1, -2);
    scene.add(rimLight);

    // 3. Chip Group
    const chipGroup = new THREE.Group();
    meshRef.current = chipGroup;
    scene.add(chipGroup);

    // Cylinder Chip Mesh
    const chipRadius = 1.0;
    const chipHeight = 0.18;
    const cylinderGeo = new THREE.CylinderGeometry(chipRadius, chipRadius, chipHeight, 36);

    // Determinar textura Hell of a Deal
    const resolvedType =
      chipType ||
      (String(value).includes('5')
        ? 'bomba'
        : String(value).includes('2')
        ? 'ace'
        : String(value).includes('1') && !String(value).includes('10')
        ? 'dice'
        : 'devil');

    const textureLoader = new THREE.TextureLoader();
    const faceTexture = textureLoader.load(CHIP_IMAGE_MAP[resolvedType] || '/chips/chip_devil.jpg');
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    faceTexture.generateMipmaps = true;
    faceTexture.minFilter = THREE.LinearMipmapLinearFilter;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0c0b0a,
      metalness: 0.2,
      roughness: 0.45,
    });

    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      metalness: 0.22,
      roughness: 0.35,
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

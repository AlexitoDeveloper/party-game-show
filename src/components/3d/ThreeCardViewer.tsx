import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface ThreeCardViewerProps {
  frontImageUrl: string;
  name: string;
  rarity?: string;
  aspectRatio?: number; // default 1.4 for playing card
  className?: string;
  autoRotate?: boolean;
  onFlip?: (isFlipped: boolean) => void;
}

export const ThreeCardViewer: React.FC<ThreeCardViewerProps> = ({
  frontImageUrl,
  name,
  rarity = 'Rara',
  aspectRatio = 1.4,
  className = '',
  autoRotate = false,
  onFlip,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const isFlippedRef = useRef(false);
  const isInteractingRef = useRef(false);
  const targetRotationY = useRef(0);
  const targetRotationX = useRef(0);
  const currentRotationY = useRef(0);
  const currentRotationX = useRef(0);
  const touchStartPos = useRef({ x: 0, y: 0 });

  // Keep ref synchronized with state
  useEffect(() => {
    isFlippedRef.current = isFlipped;
  }, [isFlipped]);

  // Get accent gold color by rarity
  const getFoilColor = useCallback(() => {
    const norm = String(rarity || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (norm.includes('legend')) return 0xffd700;
    if (norm.includes('epic')) return 0x9d4edd;
    if (norm.includes('rar')) return 0xd4af37;
    return 0xcd7f32;
  }, [rarity]);

  const handleFlip = useCallback(() => {
    const nextState = !isFlippedRef.current;
    setIsFlipped(nextState);
    targetRotationY.current = nextState ? Math.PI : 0;
    if (onFlip) onFlip(nextState);
  }, [onFlip]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Fixed dimension calculation to prevent 0-sized canvas
    const width = Math.max(260, container.clientWidth || 280);
    const height = Math.max(360, container.clientHeight || Math.round(width * aspectRatio));

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3.6;

    // 2. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      console.error('WebGLRenderer could not be initialized:', err);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Clear any previous canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting: Iluminación de estudio difusa y limpia (sin focos directos que deslumbren)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const studioLight = new THREE.DirectionalLight(0xfffbf0, 1.2);
    studioLight.position.set(2, 4, 3);
    scene.add(studioLight);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.0);
    rimLight.position.set(-2, -3, -2);
    scene.add(rimLight);

    // 4. Back Face Texture
    const backCanvas = document.createElement('canvas');
    backCanvas.width = 512;
    backCanvas.height = 716;
    const bctx = backCanvas.getContext('2d');
    if (bctx) {
      bctx.fillStyle = '#120b08';
      bctx.fillRect(0, 0, 512, 716);

      bctx.strokeStyle = '#d4af37';
      bctx.lineWidth = 14;
      bctx.strokeRect(20, 20, 472, 676);

      bctx.strokeStyle = '#aa771c';
      bctx.lineWidth = 4;
      bctx.strokeRect(36, 36, 440, 644);

      bctx.save();
      bctx.translate(256, 358);
      bctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
      bctx.lineWidth = 2;
      for (let i = 0; i < 36; i++) {
        bctx.rotate((Math.PI * 2) / 36);
        bctx.beginPath();
        bctx.moveTo(0, 0);
        bctx.lineTo(0, 300);
        bctx.stroke();
      }
      bctx.fillStyle = '#0d0907';
      bctx.beginPath();
      bctx.arc(0, 0, 90, 0, Math.PI * 2);
      bctx.fill();
      bctx.strokeStyle = '#d4af37';
      bctx.lineWidth = 6;
      bctx.stroke();

      bctx.fillStyle = '#d4af37';
      bctx.font = 'bold 36px serif';
      bctx.textAlign = 'center';
      bctx.textBaseline = 'middle';
      bctx.fillText('1930', 0, 0);
      bctx.restore();
    }
    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;

    // 5. Front Face Texture with fallback
    const frontCanvas = document.createElement('canvas');
    frontCanvas.width = 512;
    frontCanvas.height = 716;
    const fctx = frontCanvas.getContext('2d');
    if (fctx) {
      fctx.fillStyle = '#140d08';
      fctx.fillRect(0, 0, 512, 716);
      fctx.strokeStyle = '#d4af37';
      fctx.lineWidth = 14;
      fctx.strokeRect(20, 20, 472, 676);
      fctx.strokeStyle = '#aa771c';
      fctx.lineWidth = 4;
      fctx.strokeRect(36, 36, 440, 644);

      fctx.fillStyle = '#fef3c7';
      fctx.font = 'bold 34px serif';
      fctx.textAlign = 'center';
      fctx.textBaseline = 'middle';
      fctx.fillText(name || 'Naipe', 256, 358);
    }
    const fallbackTexture = new THREE.CanvasTexture(frontCanvas);
    fallbackTexture.colorSpace = THREE.SRGBColorSpace;
    let frontTexture: THREE.Texture = fallbackTexture;

    // 6. Geometry & Materials
    const cardWidth = 2.0;
    const cardHeight = cardWidth * aspectRatio;
    const cardThickness = 0.04;
    const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardThickness);

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: getFoilColor(),
      metalness: 0.95,
      roughness: 0.15,
    });

    const frontMaterial = new THREE.MeshBasicMaterial({
      map: fallbackTexture,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      metalness: 0.85,
      roughness: 0.25,
    });

    const materials = [
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      frontMaterial,
      backMaterial,
    ];

    const cardMesh = new THREE.Mesh(cardGeometry, materials);
    scene.add(cardMesh);

    // Asynchronously load real front image
    if (frontImageUrl && frontImageUrl.trim() !== '') {
      const loader = new THREE.TextureLoader();
      loader.load(
        frontImageUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          frontTexture = tex;
          frontMaterial.map = tex;
          frontMaterial.needsUpdate = true;
          renderer.render(scene, camera);
        },
        undefined,
        (err) => {
          console.warn('Could not load front card image in ThreeCardViewer, keeping fallback:', frontImageUrl, err);
        }
      );
    }

    // 7. Render Loop
    let animFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      currentRotationY.current += (targetRotationY.current - currentRotationY.current) * 0.1;
      currentRotationX.current += (targetRotationX.current - currentRotationX.current) * 0.1;

      cardMesh.rotation.y = currentRotationY.current;
      cardMesh.rotation.x = currentRotationX.current;

      if (!isInteractingRef.current && !isFlippedRef.current) {
        const time = clock.getElapsedTime();
        cardMesh.position.y = Math.sin(time * 1.5) * 0.05;
        if (autoRotate) {
          cardMesh.rotation.y += Math.sin(time * 0.8) * 0.005;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = Math.max(260, container.clientWidth || 280);
      const nh = Math.max(360, container.clientHeight || Math.round(nw * aspectRatio));
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      cardGeometry.dispose();
      materials.forEach((m) => m.dispose());
      frontTexture.dispose();
      backTexture.dispose();
      renderer.dispose();
    };
  }, [frontImageUrl, name, aspectRatio, autoRotate, getFoilColor]);

  // Touch & Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isInteractingRef.current = true;
    touchStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteractingRef.current) return;
    const deltaX = (e.clientX - touchStartPos.current.x) / 120;
    const deltaY = (e.clientY - touchStartPos.current.y) / 120;

    const baseRotationY = isFlippedRef.current ? Math.PI : 0;
    targetRotationY.current = baseRotationY + Math.max(-0.6, Math.min(0.6, deltaX));
    targetRotationX.current = Math.max(-0.4, Math.min(0.4, -deltaY));
  };

  const handlePointerUp = () => {
    isInteractingRef.current = false;
    targetRotationY.current = isFlippedRef.current ? Math.PI : 0;
    targetRotationX.current = 0;
  };

  return (
    <div className={`relative flex flex-col items-center select-none w-full ${className}`}>
      {/* 3D Canvas Container */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full max-w-[300px] h-[360px] cursor-grab active:cursor-grabbing touch-none relative rounded-2xl overflow-hidden bg-[#0c0805]/80"
        title="Arrastra con el dedo para inclinar en 3D"
      />

      {/* Control Bar */}
      <div className="flex items-center gap-3 mt-3">
        <button
          type="button"
          onClick={handleFlip}
          className="px-4 py-2 bg-gradient-to-b from-[#2a1d0f] to-[#140e07] border border-[#d4af37]/70 hover:border-[#ffd700] rounded-full text-xs font-vintage tracking-wider text-amber-200 shadow-deco-gold flex items-center gap-2 active:scale-95 transition-all"
        >
          <span className="text-amber-400">🪙</span>
          <span>{isFlipped ? 'Ver Anverso' : 'Dar la Vuelta 3D'}</span>
        </button>

        <span className="text-[10px] text-amber-400/70 font-vintage tracking-wider uppercase">
          Arrastra para inclinar
        </span>
      </div>
    </div>
  );
};

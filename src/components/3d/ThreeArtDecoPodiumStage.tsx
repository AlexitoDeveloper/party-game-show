import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeArtDecoPodiumStageProps {
  className?: string;
  winnerColorHex?: string;
}

export const ThreeArtDecoPodiumStage: React.FC<ThreeArtDecoPodiumStageProps> = ({
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Escena y Cámara
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0908, 0.022);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);

    // 2. Renderizador WebGL
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // 3. Iluminación de Estudio de Casino Vintage (Equilibrada, con Destellos Físicos y Negros Puros)
    const ambientLight = new THREE.AmbientLight(0xfffaea, 1.05);
    scene.add(ambientLight);

    // Luz principal cálida de escena (Key Light)
    const mainLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    mainLight.position.set(6, 12, 9);
    scene.add(mainLight);

    // Contraluz de borde dorado (Rim Light) que hace brillar los cantos y biseles físicos en 3D
    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.3);
    rimLight.position.set(-8, 3, -3);
    scene.add(rimLight);

    // Luz de relleno suave (Fill Light) para dar profundidad tridimensional sin lavar colores
    const fillLight = new THREE.DirectionalLight(0xb0c4de, 0.65);
    fillLight.position.set(-5, -4, 6);
    scene.add(fillLight);

    // 4. Generador de Textura de Desgaste y Biseles Físicos EXCLUSIVO para los Cantos (Rim)
    const createWornRimBumpMap = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 512, 64);

        // Granulado fino de arcilla en el canto
        const imgData = ctx.getImageData(0, 0, 512, 64);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const grain = (Math.random() - 0.5) * 24;
          data[i] = Math.min(255, Math.max(0, 128 + grain));
          data[i + 1] = data[i];
          data[i + 2] = data[i];
        }
        ctx.putImageData(imgData, 0, 0);

        // Biseles en los cantos superior e inferior (redondeado físico de la ficha)
        const gradTop = ctx.createLinearGradient(0, 0, 0, 9);
        gradTop.addColorStop(0, 'rgba(60, 60, 60, 0.6)');
        gradTop.addColorStop(1, 'rgba(128, 128, 128, 0)');
        ctx.fillStyle = gradTop;
        ctx.fillRect(0, 0, 512, 9);

        const gradBottom = ctx.createLinearGradient(0, 55, 0, 64);
        gradBottom.addColorStop(0, 'rgba(128, 128, 128, 0)');
        gradBottom.addColorStop(1, 'rgba(60, 60, 60, 0.6)');
        ctx.fillStyle = gradBottom;
        ctx.fillRect(0, 55, 512, 9);

        // Arañazos transversales sutiles en el canto
        ctx.lineWidth = 1;
        for (let s = 0; s < 30; s++) {
          const rx = Math.random() * 512;
          const ry = Math.random() * 64;
          ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(50, 50, 50, 0.4)' : 'rgba(215, 215, 215, 0.3)';
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + (Math.random() - 0.5) * 16, ry + (Math.random() - 0.5) * 12);
          ctx.stroke();
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      return tex;
    };

    const wornRimBump = createWornRimBumpMap();

    // 5. Carga de las 4 Texturas Auténticas Hell of a Deal con sRGB y Filtrado Anisotrópico Máximo
    const textureLoader = new THREE.TextureLoader();
    const chipFaceUrls = [
      '/chips/chip_devil.jpg', // $1,000 Hell of a Deal - Imp Devil con carta ardiendo
      '/chips/chip_bomba.jpg', // $500 Ticking Time - Bomba de dibujo animado esmeralda
      '/chips/chip_ace.jpg',   // $250 The Big Boss - As de Picas gángster azul real
      '/chips/chip_dice.jpg',  // $100 Lucky Roll - Dados bailarines ámbar cálido
    ];

    const chipFaceTextures = chipFaceUrls.map((url) => {
      const tex = textureLoader.load(url);
      tex.colorSpace = THREE.SRGBColorSpace; // Calibración de color idéntica al Lobby (negros puros y colores vivos)
      tex.anisotropy = maxAnisotropy;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    });

    // 6. Creador de Cantos Art Déco con Oro Envejecido, Negro Obsidiana y Tonos Joya
    const createArtDecoRimTexture = (accentColor: string, goldColor: string = '#d4af37') => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Base negra obsidiana
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, 512, 64);

        // Filetes superior e inferior de oro antiguo
        ctx.fillStyle = goldColor;
        ctx.fillRect(0, 0, 512, 5);
        ctx.fillRect(0, 59, 512, 5);

        // 8 Bloques Art Déco de muescas de casino con ribete dorado
        const segments = 8;
        const segW = 512 / segments;

        for (let s = 0; s < segments; s++) {
          const startX = s * segW;
          // Bloque de color joya central
          ctx.fillStyle = accentColor;
          ctx.fillRect(startX + 10, 9, segW - 20, 46);

          // Borde dorado fino del bloque
          ctx.strokeStyle = goldColor;
          ctx.lineWidth = 3;
          ctx.strokeRect(startX + 10, 9, segW - 20, 46);

          // Línea dorada vertical central en el bloque
          ctx.fillStyle = goldColor;
          ctx.fillRect(startX + (segW / 2) - 2, 14, 4, 36);

          // Motivo de rombo Art Déco en el espacio negro
          ctx.beginPath();
          const midX = startX + segW;
          ctx.moveTo(midX, 22);
          ctx.lineTo(midX + 4, 32);
          ctx.lineTo(midX, 42);
          ctx.lineTo(midX - 4, 32);
          ctx.closePath();
          ctx.fill();
        }
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
      tex.anisotropy = maxAnisotropy;
      return tex;
    };

    // Paletas de Canto que combinan con cada ficha
    const rimConfigs = [
      { accent: '#881337', gold: '#d4af37' }, // Carmesí oscuro para el Diablo $1,000
      { accent: '#14532d', gold: '#d4af37' }, // Verde esmeralda para la Bomba $500
      { accent: '#1e3a8a', gold: '#d4af37' }, // Azul medianoche para el As Gángster $250
      { accent: '#78350f', gold: '#eab308' }, // Ámbar burdeos para los Dados $100
    ];

    const rimTextures = rimConfigs.map((cfg) => createArtDecoRimTexture(cfg.accent, cfg.gold));

    // Dimensiones de ficha ligeramente mayores para máxima nitidez visual de la ilustración
    const chipRadius = 1.15;
    const chipHeight = 0.24;
    const chipGeo = new THREE.CylinderGeometry(chipRadius, chipRadius, chipHeight, 48);

    // 7. Materiales PBR Físicos con Cara Nítida (Sin ruidos de relieve que emborronen el dibujo) y Canto con Desgaste
    const materialsMap = chipFaceTextures.map((faceTex, idx) => {
      const rimTex = rimTextures[idx];

      // Cara cristalina con el dibujo auténtico de 1930 sin ruido de relieve
      const faceMat = new THREE.MeshStandardMaterial({
        map: faceTex,
        roughness: 0.28,
        metalness: 0.08,
      });

      // Canto biselado con relieve táctil de ficha de casino
      const rimMat = new THREE.MeshStandardMaterial({
        map: rimTex,
        bumpMap: wornRimBump,
        bumpScale: 0.024,
        roughness: 0.35,
        metalness: 0.20,
      });

      return {
        materials: [rimMat, faceMat, faceMat] as THREE.Material[],
        faceMat,
        rimMat,
        faceTex,
        rimTex,
      };
    });

    // Función constructora para crear una ficha 3D física realista
    const createRubberHoseChipMesh = (matIdx: number) => {
      const matSet = materialsMap[matIdx % materialsMap.length];
      const chipMesh = new THREE.Mesh(chipGeo, matSet.materials);
      return chipMesh;
    };

    // 8. MONTAÑAS Y PILAS DE FICHAS DE DIBUJO ANIMADO EN LAS ESQUINAS INFERIORES
    const stacksGroup = new THREE.Group();
    scene.add(stacksGroup);

    const stackDefinitions = [
      // Flanco izquierdo: montaña armoniosa de fichas
      { x: -8.0, z: 0.5, count: 12, colorIdx: 0 },
      { x: -9.2, z: -0.2, count: 16, colorIdx: 1 },
      { x: -6.8, z: 1.2, count: 9, colorIdx: 2 },
      { x: -10.2, z: -1.0, count: 18, colorIdx: 3 },
      { x: -8.6, z: 1.8, count: 10, colorIdx: 4 },
      { x: -7.4, z: -0.6, count: 14, colorIdx: 0 },

      // Flanco derecho: montaña armoniosa de fichas
      { x: 8.0, z: 0.5, count: 12, colorIdx: 1 },
      { x: 9.2, z: -0.2, count: 16, colorIdx: 0 },
      { x: 6.8, z: 1.2, count: 9, colorIdx: 3 },
      { x: 10.2, z: -1.0, count: 18, colorIdx: 2 },
      { x: 8.6, z: 1.8, count: 11, colorIdx: 4 },
      { x: 7.4, z: -0.6, count: 14, colorIdx: 1 },
    ];

    const baseY = -5.4;

    stackDefinitions.forEach((def) => {
      for (let i = 0; i < def.count; i++) {
        const chip = createRubberHoseChipMesh((def.colorIdx + Math.floor(i / 4)) % materialsMap.length);
        const rotY = Math.sin(i * 1.8) * 0.2 + (i * 0.45);
        const offsetX = Math.sin(i * 2.1) * 0.03;
        const offsetZ = Math.cos(i * 1.7) * 0.03;

        chip.position.set(def.x + offsetX, baseY + i * (chipHeight * 0.98), def.z + offsetZ);
        chip.rotation.y = rotY;
        stacksGroup.add(chip);
      }
    });

    // Fichas caídas / tumbadas en primer plano
    const looseChipsData = [
      { x: -6.2, y: baseY + 0.1, z: 2.2, rx: 1.1, rz: 0.25, ry: -0.4, colorIdx: 0 },
      { x: -7.5, y: baseY + 0.18, z: 2.6, rx: 1.3, rz: -0.3, ry: 0.2, colorIdx: 1 },
      { x: -8.8, y: baseY + 0.12, z: 2.8, rx: 1.0, rz: 0.15, ry: 0.8, colorIdx: 2 },
      { x: -5.4, y: baseY + 0.1, z: 1.4, rx: 0.8, rz: 0.4, ry: -0.2, colorIdx: 3 },
      { x: 6.2, y: baseY + 0.1, z: 2.2, rx: 1.1, rz: -0.25, ry: 0.4, colorIdx: 1 },
      { x: 7.5, y: baseY + 0.18, z: 2.6, rx: 1.3, rz: 0.3, ry: -0.2, colorIdx: 0 },
      { x: 8.8, y: baseY + 0.12, z: 2.8, rx: 1.0, rz: -0.15, ry: -0.8, colorIdx: 4 },
      { x: 5.4, y: baseY + 0.1, z: 1.4, rx: 0.8, rz: -0.4, ry: 0.2, colorIdx: 2 },
    ];

    looseChipsData.forEach((ld) => {
      const loose = createRubberHoseChipMesh(ld.colorIdx);
      loose.position.set(ld.x, ld.y, ld.z);
      loose.rotation.x = ld.rx;
      loose.rotation.y = ld.ry;
      loose.rotation.z = ld.rz;
      stacksGroup.add(loose);
    });

    // 9. LLUVIA CONTINUA DE FICHAS RUBBER HOSE CON REBOTE ELÁSTICO
    const fallingChipsGroup = new THREE.Group();
    scene.add(fallingChipsGroup);

    interface FallingChip {
      mesh: THREE.Mesh;
      baseScale: number;
      fallSpeed: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
      squashSpeed: number;
      squashOffset: number;
      wobbleSpeed: number;
      wobbleOffset: number;
      initialX: number;
    }

    const fallingCount = 42;
    const fallingChips: FallingChip[] = [];

    for (let i = 0; i < fallingCount; i++) {
      const mesh = createRubberHoseChipMesh(i % materialsMap.length);
      let posX: number = (i % 2 === 0) ? -10.8 + Math.random() * 5.2 : 5.6 + Math.random() * 5.2;
      const posY = -8.5 + ((i * 1.35) % 19);
      const posZ = 0.5 + (Math.random() - 0.5) * 3.8;

      mesh.position.set(posX, posY, posZ);
      mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
      const baseScale = 0.9 + Math.random() * 0.45;
      mesh.scale.set(baseScale, baseScale, baseScale);

      fallingChipsGroup.add(mesh);
      fallingChips.push({
        mesh,
        baseScale,
        fallSpeed: 0.95 + Math.random() * 1.05, // Caída suave y pausada (~1 unidad por segundo)
        rotSpeedX: (Math.random() - 0.5) * 1.1,
        rotSpeedY: (Math.random() - 0.5) * 1.3,
        rotSpeedZ: (Math.random() - 0.5) * 0.8,
        squashSpeed: 1.4 + Math.random() * 0.9,
        squashOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.7 + Math.random() * 0.8,
        wobbleOffset: Math.random() * Math.PI * 2,
        initialX: posX,
      });
    }

    // 10. Loop de Animación
    let animationId: number;
    let clock = new THREE.Clock();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05); // Límite para evitar saltos al cambiar de pestaña
      const elapsedTime = clock.getElapsedTime();
      fallingChips.forEach((chip) => {
        chip.mesh.position.y -= chip.fallSpeed * delta;
        chip.mesh.rotation.x += chip.rotSpeedX * delta;
        chip.mesh.rotation.y += chip.rotSpeedY * delta;
        chip.mesh.rotation.z += chip.rotSpeedZ * delta;
        chip.mesh.position.x = chip.initialX + Math.sin(elapsedTime * chip.wobbleSpeed + chip.wobbleOffset) * 0.32;
        const squash = Math.sin(elapsedTime * chip.squashSpeed + chip.squashOffset) * 0.12;
        chip.mesh.scale.set(chip.baseScale * (1 - squash * 0.6), chip.baseScale * (1 + squash), chip.baseScale * (1 - squash * 0.6));
        if (chip.mesh.position.y < -9.8) {
          chip.mesh.position.y = 9.8 + Math.random() * 2.5;
          chip.initialX = Math.random() > 0.5 ? -10.8 + Math.random() * 5.2 : 5.6 + Math.random() * 5.2;
        }
      });
      camera.position.x = Math.sin(elapsedTime * 0.2) * 0.25;
      camera.position.y = Math.cos(elapsedTime * 0.25) * 0.12;
      camera.lookAt(0, -0.5, 0);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      chipGeo.dispose();
      wornRimBump.dispose();
      materialsMap.forEach((m) => {
        m.faceMat.dispose();
        m.rimMat.dispose();
        m.faceTex.dispose();
        m.rimTex.dispose();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      style={{ opacity: 1 }}
    />
  );
};

export default ThreeArtDecoPodiumStage;

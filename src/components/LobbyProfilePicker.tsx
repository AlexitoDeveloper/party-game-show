import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DiceFive, Sparkle, Camera, Image as ImageIcon, ArrowCounterClockwise, CircleNotch } from '@phosphor-icons/react';
import { generateAvatarDataUri, generateRandomSeed, isCustomAvatar, processGalleryImage, DiceBearStyle } from '../lib/dicebear';

export interface LobbyProfilePickerProps {
  nickname: string;
  avatarSeed: string;
  onAvatarSeedChange: (seed: string) => void;
  avatarStyle?: DiceBearStyle;
  onAvatarStyleChange?: (style: DiceBearStyle) => void;
  className?: string;
}

/**
 * LobbyProfilePicker: Selector de avatar para el jugador.
 * Permite:
 * 1. Subir una imagen o fotografía real desde la galería del móvil/PC recortada y optimizada al instante.
 * 2. Generar avatares vectoriales dinámicos de DiceBear (Persona, Aventura, Emoji).
 */
export const LobbyProfilePicker: React.FC<LobbyProfilePickerProps> = ({
  nickname,
  avatarSeed,
  onAvatarSeedChange,
  avatarStyle = 'avataaars',
  onAvatarStyleChange,
  className = '',
}) => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentSeed = avatarSeed || nickname || 'Alex';
  const hasCustomPhoto = useMemo(() => isCustomAvatar(currentSeed), [currentSeed]);

  const avatarDataUri = useMemo(() => {
    return generateAvatarDataUri(currentSeed, avatarStyle);
  }, [currentSeed, avatarStyle]);

  const triggerHaptic = (ms: number | number[] = 30) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const handleRandomizeSeed = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic(25);
    setErrorMessage(null);
    onAvatarSeedChange(generateRandomSeed());
  };

  const handleRevertToGenerated = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic(30);
    setErrorMessage(null);
    onAvatarSeedChange(generateRandomSeed());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Procesa, respeta orientación EXIF de móvil, recorta 1:1 y comprime a JPEG ~12KB
      const dataUri = await processGalleryImage(file, 200, 0.82);
      triggerHaptic([40, 30, 40]);
      onAvatarSeedChange(dataUri);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al procesar la imagen del móvil');
    } finally {
      setIsProcessing(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleTriggerGallery = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic(20);
    galleryInputRef.current?.click();
  };

  const handleTriggerCamera = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic(20);
    cameraInputRef.current?.click();
  };

  return (
    <div className={`bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* 1. Input para Galería / Álbum de Fotos del móvil (iOS Fototeca / Android Galería) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Seleccionar imagen desde galería móvil"
      />

      {/* 2. Input para Cámara directa de móvil (Selfie instantáneo con capture=user) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Tomar selfie con la cámara del móvil"
      />

      <div className="flex items-center gap-4">
        {/* Avatar grande con marco táctil para móvil */}
        <div className="relative shrink-0">
          <motion.div
            key={currentSeed + avatarStyle}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`w-20 h-20 rounded-2xl bg-slate-950 border-2 ${
              hasCustomPhoto ? 'border-amber-400 shadow-amber-500/25' : 'border-indigo-500/50 shadow-indigo-500/10'
            } p-0.5 shadow-inner overflow-hidden flex items-center justify-center relative group cursor-pointer active:scale-95 transition-transform`}
            onClick={handleTriggerGallery}
            title="Toca para elegir foto de tu galería"
          >
            <img
              src={avatarDataUri}
              alt="Avatar de Jugador"
              className="w-full h-full object-cover rounded-xl"
            />

            {/* Overlay táctil en móvil */}
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-0.5 rounded-xl">
              <Camera size={20} weight="fill" className="text-amber-300" />
              <span>Galería</span>
            </div>

            {/* Spinner de procesamiento en móvil */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center rounded-xl p-1 text-center">
                <CircleNotch size={22} weight="bold" className="text-amber-400 animate-spin mb-1" />
                <span className="text-[9px] font-bold text-amber-200 uppercase">Ajustando...</span>
              </div>
            )}
          </motion.div>

          {/* Insignia táctil en esquina del avatar */}
          <button
            type="button"
            onClick={handleTriggerGallery}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-700 hover:border-amber-400 flex items-center justify-center shadow-md text-amber-400 active:scale-90 transition-transform"
            title="Abrir galería de fotos"
          >
            {hasCustomPhoto ? (
              <ImageIcon size={14} weight="fill" />
            ) : (
              <Camera size={14} weight="bold" />
            )}
          </button>
        </div>

        {/* Controles de Avatar adaptados a pantalla móvil */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase font-black tracking-widest text-slate-400 flex items-center gap-1">
              <Sparkle size={12} weight="fill" className="text-amber-400" />
              <span>{hasCustomPhoto ? 'FOTO PERSONAL' : 'TU AVATAR'}</span>
            </span>

            {/* Selector rápido de estilo DiceBear (solo si no es foto propia) */}
            {!hasCustomPhoto && onAvatarStyleChange && (
              <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    onAvatarStyleChange('avataaars');
                  }}
                  className={`px-2 py-0.5 text-xs font-black uppercase rounded transition-all ${
                    avatarStyle === 'avataaars' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Persona
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    onAvatarStyleChange('adventurer');
                  }}
                  className={`px-2 py-0.5 text-xs font-black uppercase rounded transition-all ${
                    avatarStyle === 'adventurer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Aventura
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    onAvatarStyleChange('funEmoji');
                  }}
                  className={`px-2 py-0.5 text-xs font-black uppercase rounded transition-all ${
                    avatarStyle === 'funEmoji' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Emoji
                </button>
              </div>
            )}
          </div>

          <p className="text-xs font-bold text-white truncate mb-2">
            {nickname ? nickname : 'Escribe tu nombre arriba'}
          </p>

          {/* Botones de acción optimizados para pulsación táctil (Android/iOS) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Botón 1: Galería del móvil */}
            <button
              type="button"
              onClick={handleTriggerGallery}
              disabled={isProcessing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/50 text-xs font-bold text-indigo-200 active:scale-95 transition-all shadow-sm"
              title="Elige una foto de la galería de tu teléfono"
            >
              <ImageIcon size={15} weight="fill" className="text-indigo-400" />
              <span>Galería</span>
            </button>

            {/* Botón 2: Cámara directa de móvil para Selfie */}
            <button
              type="button"
              onClick={handleTriggerCamera}
              disabled={isProcessing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-amber-200 active:scale-95 transition-all shadow-sm"
              title="Tómate una foto o selfie ahora mismo con tu móvil"
            >
              <Camera size={15} weight="fill" className="text-amber-400" />
              <span>Cámara</span>
            </button>

            {/* Si tiene foto personalizada: Botón para volver a avatares vectoriales */}
            {hasCustomPhoto ? (
              <button
                type="button"
                onClick={handleRevertToGenerated}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 active:scale-95 transition-all shadow-sm"
                title="Quitar foto y usar un avatar ilustrado"
              >
                <ArrowCounterClockwise size={14} weight="bold" className="text-amber-400" />
                <span>Avatar</span>
              </button>
            ) : (
              /* Si no tiene foto: Botón de dados para aleatorizar aspecto */
              <button
                type="button"
                onClick={handleRandomizeSeed}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600/80 text-xs font-bold text-slate-200 active:scale-95 transition-all shadow-sm"
              >
                <DiceFive size={15} weight="fill" className="text-amber-400 animate-spin-slow" />
                <span>Azar</span>
              </button>
            )}
          </div>

          {/* Mensaje de error si falla procesamiento en el móvil */}
          {errorMessage && (
            <p className="text-[11px] font-semibold text-rose-400 mt-1.5">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


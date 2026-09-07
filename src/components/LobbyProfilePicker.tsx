import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DiceFive, Sparkle } from '@phosphor-icons/react';
import { generateAvatarDataUri, generateRandomSeed, DiceBearStyle } from '../lib/dicebear';

export interface LobbyProfilePickerProps {
  nickname: string;
  avatarSeed: string;
  onAvatarSeedChange: (seed: string) => void;
  avatarStyle?: DiceBearStyle;
  onAvatarStyleChange?: (style: DiceBearStyle) => void;
  className?: string;
}

/**
 * LobbyProfilePicker: Selector de avatar único para el jugador.
 * Genera avatares dinámicos basados en ilustraciones humanas (avataaars) o emojis festivos,
 * sin necesidad de seleccionar emblemas adicionales.
 */
export const LobbyProfilePicker: React.FC<LobbyProfilePickerProps> = ({
  nickname,
  avatarSeed,
  onAvatarSeedChange,
  avatarStyle = 'avataaars',
  onAvatarStyleChange,
  className = '',
}) => {
  const currentSeed = avatarSeed || nickname || 'Alex';

  const avatarDataUri = useMemo(() => {
    return generateAvatarDataUri(currentSeed, avatarStyle);
  }, [currentSeed, avatarStyle]);

  const handleRandomizeSeed = (e: React.MouseEvent) => {
    e.preventDefault();
    onAvatarSeedChange(generateRandomSeed());
  };

  return (
    <div className={`bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl backdrop-blur-xl ${className}`}>
      <div className="flex items-center gap-4">
        {/* Avatar grande con marco neón sutil */}
        <div className="relative shrink-0">
          <motion.div
            key={currentSeed + avatarStyle}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-indigo-500/50 p-1 shadow-inner overflow-hidden flex items-center justify-center shadow-indigo-500/10"
          >
            <img
              src={avatarDataUri}
              alt="Avatar de Jugador"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>

        {/* Controles de Avatar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1">
              <Sparkle size={12} weight="fill" className="text-amber-400" />
              <span>TU AVATAR</span>
            </span>

            {/* Selector rápido de estilo */}
            {onAvatarStyleChange && (
              <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => onAvatarStyleChange('avataaars')}
                  className={`px-2 py-0.5 text-[9px] font-black uppercase rounded transition-all ${
                    avatarStyle === 'avataaars' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Persona
                </button>
                <button
                  type="button"
                  onClick={() => onAvatarStyleChange('adventurer')}
                  className={`px-2 py-0.5 text-[9px] font-black uppercase rounded transition-all ${
                    avatarStyle === 'adventurer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Aventura
                </button>
                <button
                  type="button"
                  onClick={() => onAvatarStyleChange('funEmoji')}
                  className={`px-2 py-0.5 text-[9px] font-black uppercase rounded transition-all ${
                    avatarStyle === 'funEmoji' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Emoji
                </button>
              </div>
            )}
          </div>

          <p className="text-xs font-bold text-white truncate mb-2.5">
            {nickname ? nickname : 'Escribe tu nombre arriba'}
          </p>

          {/* Botón de dados para aleatorizar aspecto */}
          <button
            type="button"
            onClick={handleRandomizeSeed}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600/80 text-xs font-bold text-slate-200 active:scale-95 transition-all shadow-sm"
          >
            <DiceFive size={17} weight="fill" className="text-amber-400 animate-spin-slow" />
            <span>Cambiar aspecto</span>
          </button>
        </div>
      </div>
    </div>
  );
};

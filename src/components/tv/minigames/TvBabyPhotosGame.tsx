import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';
import { BabyPhotoItem } from '../../../lib/babyPhotosData';
import { BuzzerPressPayload } from '../../../lib/types';
import { DiceBearStyle, generateAvatarDataUri } from '../../../lib/dicebear';
import { TwemojiText } from '../../TwemojiText';

export interface TvBabyPhotosGameProps {
  currentBabyPhoto: BabyPhotoItem;
  babyPhotoIndex: number;
  babyPhotosCount: number;
  babyPhotoRevealed: boolean;
  buzzerLocked?: boolean;
  buzzerWinner?: BuzzerPressPayload | null;
}

export const TvBabyPhotosGame: React.FC<TvBabyPhotosGameProps> = ({
  currentBabyPhoto,
  babyPhotoIndex,
  babyPhotosCount,
  babyPhotoRevealed,
  buzzerLocked,
  buzzerWinner,
}) => {
  const winnerSeed = buzzerWinner?.avatarSeed || buzzerWinner?.playerName || 'player';
  const winnerStyle = (buzzerWinner?.avatarStyle || 'avataaars') as DiceBearStyle;
  const winnerEmoji = buzzerWinner?.badgeEmoji;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full bg-[#0c0c14]/90 border-2 border-[#d4af37]/50 rounded-3xl p-4 sm:p-5 shadow-deco-gold relative overflow-hidden backdrop-blur-xl hell-card-frame">
        {/* Cabecera: Número de foto y regla anti-infracción */}
        <div className="flex items-center justify-between gap-2.5 mb-3 z-20 relative">
          <div className="bg-[#07070a]/90 backdrop-blur-md border border-[#d4af37]/50 px-4 py-1.5 rounded-2xl flex items-center gap-2 text-sm font-broadway font-bold text-amber-300 shadow-lg">
            <Camera className="w-4 h-4 text-amber-400" />
            <span className="uppercase">FOTO {babyPhotoIndex + 1} / {babyPhotosCount}</span>
          </div>

          <div className="bg-[#380b12]/90 border border-red-500/50 px-4 py-1.5 rounded-2xl flex items-center gap-2 text-sm font-vintage font-bold text-red-200 shadow-lg">
            <span>🚫 Propia foto: −2 pts</span>
          </div>
        </div>

        {/* MARCO DE LA FOTO PROYECTADA (ESTILO DAGUERROTIPO / RETRATO DE ÉPOCA) */}
        <div className="relative flex items-center justify-center min-h-[280px] max-h-[420px] rounded-2xl overflow-hidden bg-black border-4 border-[#d4af37]/40 shadow-inner p-2.5">
          <motion.img
            key={`${currentBabyPhoto.id}_${babyPhotoIndex}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            src={currentBabyPhoto.imageUrl}
            alt="Foto de Bebé"
            className="max-h-[340px] md:max-h-[390px] w-auto max-w-full object-contain rounded-xl shadow-2xl sepia-[0.15]"
          />

          {/* Luz sutil de linterna mágica / proyector de época */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-400/15 blur-3xl pointer-events-none" />
        </div>

        {/* REVELACIÓN SUTIL DE ACIERTO SIN TAPAR LA FOTO */}
        {babyPhotoRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#07070a] to-emerald-950/90 border-2 border-emerald-400/80 text-center shadow-2xl"
          >
            <span className="text-xs uppercase font-broadway font-black tracking-widest text-emerald-300 block mb-0.5">
              🎉 ¡IDENTIDAD DESCUBIERTA!
            </span>
            <div className="text-2xl sm:text-3xl font-broadway text-emerald-200 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
              {currentBabyPhoto.personName && !currentBabyPhoto.personName.startsWith('Participante #')
                ? currentBabyPhoto.personName
                : '¡Respuesta Correcta! (+2 pts)'}
            </div>
            {buzzerWinner && (
              <div className="mt-2 text-xs text-amber-300/80 font-vintage">
                Identificado por: <strong className="text-white">{buzzerWinner.playerName}</strong> ({buzzerWinner.teamName})
              </div>
            )}
          </motion.div>
        )}

        {/* Turno activo de respuesta cuando alguien pulsa el timbre */}
        <AnimatePresence mode="wait">
          {buzzerLocked && buzzerWinner && !babyPhotoRevealed && (
            <motion.div
              key="buzzer-active-baby"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 w-full p-3.5 sm:p-4 rounded-2xl border-2 bg-[#07070a]/95 backdrop-blur-md flex items-center justify-between shadow-xl"
              style={{
                borderColor: buzzerWinner.teamColorHex || '#d4af37',
                boxShadow: `0 0 25px ${buzzerWinner.teamColorHex || '#d4af37'}40`,
              }}
            >
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-black border-2 shadow-md flex items-center justify-center p-0.5"
                    style={{ borderColor: buzzerWinner.teamColorHex || '#d4af37' }}
                  >
                    <img
                      src={generateAvatarDataUri(winnerSeed, winnerStyle)}
                      alt={buzzerWinner.playerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {winnerEmoji ? (
                    <div className="absolute -top-1.5 -right-1.5 text-xs bg-black/90 rounded-full px-1 py-0.5 border border-[#d4af37]/60 shadow">
                      <TwemojiText>{winnerEmoji}</TwemojiText>
                    </div>
                  ) : null}
                </div>

                <div className="text-left">
                  <span className="text-xs uppercase font-broadway tracking-wider text-amber-300 block">
                    ⚡ ¡Pulsó primero: {buzzerWinner.playerName}!
                  </span>
                  <div
                    className="text-xl sm:text-2xl font-broadway"
                    style={{ color: buzzerWinner.teamColorHex || '#f5eedb' }}
                  >
                    {buzzerWinner.teamName}
                  </div>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-vintage font-bold text-amber-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>Respondiendo...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Crown } from 'lucide-react';
import { BabyPhotoItem } from '../../../lib/babyPhotosData';
import { BuzzerPressPayload } from '../../../lib/types';

export interface TvBabyPhotosGameProps {
  currentBabyPhoto: BabyPhotoItem;
  babyPhotoIndex: number;
  babyPhotosCount: number;
  babyPhotoRevealed: boolean;
  buzzerLocked?: boolean;
  buzzerWinner?: BuzzerPressPayload | null;
  isWinnerCaptain?: boolean;
}

export const TvBabyPhotosGame: React.FC<TvBabyPhotosGameProps> = ({
  currentBabyPhoto,
  babyPhotoIndex,
  babyPhotosCount,
  babyPhotoRevealed,
  buzzerLocked,
  buzzerWinner,
  isWinnerCaptain,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full bg-[#0c0c14]/90 border-2 border-[#d4af37]/50 rounded-3xl p-6 sm:p-8 shadow-deco-gold relative overflow-hidden backdrop-blur-xl deco-card-frame">
        {/* Cabecera: Número de foto, categoría y regla anti-infracción */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 z-20 relative">
          <div className="bg-[#07070a]/90 backdrop-blur-md border border-[#d4af37]/50 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-vintage font-bold text-amber-300 shadow-lg">
            <Camera className="w-4 h-4 text-amber-400" />
            <span className="font-broadway uppercase">FOTO {babyPhotoIndex + 1} DE {babyPhotosCount}</span>
            <span className="text-[#d4af37]/40">•</span>
            <span className="text-amber-100/80 font-medium">¿Famoso o Concursante? 🕵️</span>
          </div>

          <div className="bg-[#380b12]/90 border border-red-500/50 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-vintage font-bold text-red-200 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>🚫 ¡Si es tu propia foto NO pulses! (−2 pts)</span>
          </div>
        </div>

        {/* MARCO DE LA FOTO PROYECTADA (ESTILO DAGUERROTIPO / RETRATO DE ÉPOCA) */}
        <div className="relative flex items-center justify-center min-h-[300px] max-h-[420px] rounded-2xl overflow-hidden bg-black border-4 border-[#d4af37]/40 shadow-inner p-3">
          <motion.img
            key={`${currentBabyPhoto.id}_${babyPhotoIndex}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            src={currentBabyPhoto.imageUrl}
            alt="Foto de Bebé"
            className="max-h-[350px] md:max-h-[390px] w-auto max-w-full object-contain rounded-xl shadow-2xl sepia-[0.15]"
          />

          {/* Luz sutil de linterna mágica / proyector de época */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-400/15 blur-3xl pointer-events-none" />
        </div>

        {/* OVERLAY: REVELADO DE IDENTIDAD */}
        <AnimatePresence>
          {babyPhotoRevealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#07070a]/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-6 text-center deco-card-frame"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-widest mb-3 border border-[#f5eedb]/50 shadow-deco-gold">
                🎉 ¡IDENTIDAD REVELADA!
              </div>
              <h2 className="text-4xl md:text-6xl font-broadway uppercase text-gold-gradient drop-shadow-[0_0_35px_rgba(212,175,55,0.6)]">
                {currentBabyPhoto.personName}
              </h2>
              {currentBabyPhoto.ownerPlayerName ? (
                <div className="mt-3 inline-block bg-[#380b12]/90 border border-red-500/50 px-4 py-1.5 rounded-xl text-xs font-vintage font-bold text-red-200">
                  👤 ¡Foto de <strong className="text-white font-broadway">{currentBabyPhoto.ownerPlayerName}</strong>! (¡No podía pulsar!)
                </div>
              ) : null}
              {currentBabyPhoto.hint && (
                <p className="mt-4 text-xs md:text-sm text-amber-100/80 italic max-w-md bg-[#0c0c14] px-4 py-2 rounded-xl border border-[#d4af37]/30 font-vintage">
                  💡 Pista: "{currentBabyPhoto.hint}"
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OVERLAY DEL BUZZER CUANDO ALGUIEN PULSA */}
      <AnimatePresence>
        {buzzerLocked && buzzerWinner && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="mt-4 w-full bg-slate-900/95 border-2 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderColor: buzzerWinner.teamColorHex }}
          >
            <div className="flex items-center gap-3 text-left">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-md"
                style={{ backgroundColor: buzzerWinner.teamColorHex }}
              >
                ⚡
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                  ¡HA PULSADO PRIMERO!
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-lg font-black text-white">
                    {buzzerWinner.playerName}{' '}
                    <span style={{ color: buzzerWinner.teamColorHex }}>({buzzerWinner.teamName})</span>
                  </span>
                  {isWinnerCaptain && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400 text-amber-300 text-xs font-black">
                      <Crown className="w-3 h-3 fill-amber-400 text-amber-400" /> CAPITÁN
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Indicador pasivo en TV */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Esperando veredicto del Anfitrión en su mando...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

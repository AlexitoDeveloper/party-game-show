import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerDoubleOrNothingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PlayerDoubleOrNothingModal: React.FC<PlayerDoubleOrNothingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 select-none"
        >
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/20">
              ⭐
            </div>
            <div>
              <h3 className="text-xl font-black uppercase text-white font-arcade">
                ¡Doble o Nada del Capitán!
              </h3>
              <p className="text-xs text-amber-300/90 font-bold mt-1">
                1 único uso por partida
              </p>
            </div>
            <p className="text-xs text-slate-300">
              Como Capitán, apuestas en esta prueba. Si tu equipo puntúa, ¡se <strong>duplican</strong> los puntos conseguidos! Pero si falláis, recibiréis penalización.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
              >
                🔥 ¡Apostar Doble!
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

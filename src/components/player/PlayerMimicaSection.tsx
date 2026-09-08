import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface PlayerMimicaSectionProps {
  gameTitle: string;
  secretCardVisible: boolean;
  onToggleSecretCard: () => void;
}

export const PlayerMimicaSection: React.FC<PlayerMimicaSectionProps> = ({
  gameTitle,
  secretCardVisible,
  onToggleSecretCard,
}) => {
  return (
    <div className="my-auto w-full max-w-sm space-y-3 text-center px-1">
      <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 shadow-deco-gold backdrop-blur-xl deco-card-frame">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-gradient text-slate-950 text-[11px] font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm mb-3">
          <span>🎭</span> TEATRO DE CINE MUDO
        </div>
        <h3 className="text-lg font-broadway uppercase text-gold-gradient mb-1">{gameTitle}</h3>
        <p className="text-xs font-vintage text-amber-100/80 mb-3">
          Atento a tus 2 compañeros que actúan en el centro de la sala. ¡No se puede hablar ni emitir sonidos!
        </p>

        <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl p-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-vintage font-bold text-amber-200">¿Eres actor de tu equipo?</span>
            <button
              onClick={onToggleSecretCard}
              className="text-xs text-slate-950 font-broadway font-black flex items-center gap-1 bg-gold-gradient px-2.5 py-1 rounded-lg border border-[#f5eedb]/50 shadow-sm active:scale-95"
            >
              {secretCardVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{secretCardVisible ? 'Ocultar' : 'Ver Despacho'}</span>
            </button>
          </div>

          {secretCardVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-[#d4af37]/30 text-xs font-vintage text-amber-100"
            >
              <div className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-[#d4af37] font-broadway text-[10px] uppercase mb-1">
                TELEGRAMA SECRETO
              </div>
              <p className="font-bold text-amber-200 mb-1">Solicita al anfitrión tu palabra o tarjeta secreta.</p>
              <p className="text-[11px] text-red-300 font-bold">🚫 ¡Totalmente prohibido hablar, susurrar o emitir ruidos!</p>
            </motion.div>
          )}
        </div>

        <div className="text-[11px] text-amber-300/70 font-vintage font-medium mt-2">
          El anfitrión controlará el tiempo y asignará los puntos al terminar.
        </div>
      </div>
    </div>
  );
};

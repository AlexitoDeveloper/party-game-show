import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Sparkles } from 'lucide-react';
import { GameIcon } from '../GameIcon';

export interface TvQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  joinUrl: string;
  roomCode?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Modal Art Déco a pantalla completa para visualizar el código QR en alta definición.
 * Permite a cualquier jugador en el plató escanear desde el sofá tanto para unirse como para reconectar.
 */
export const TvQrModal: React.FC<TvQrModalProps> = ({
  isOpen,
  onClose,
  joinUrl,
  roomCode,
  title = 'Pase de Espectador • Speakeasy',
  subtitle = 'Escanea con tu cámara móvil para ingresar o reconectar',
}) => {
  // Manejo de tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo difuminado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Tarjeta Art Déco dorada */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg bg-[#0c0c14] border-2 border-[#d4af37] rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(212,175,55,0.35)] hell-card-frame text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#14141e] border border-[#d4af37]/40 text-amber-200/80 hover:text-white hover:border-[#d4af37] transition-all cursor-pointer"
              title="Cerrar (Esc)"
              aria-label="Cerrar modal de código QR"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/50 text-amber-300 text-xs uppercase font-broadway tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Conexión de Jugadores</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-broadway uppercase tracking-wider text-gold-gradient">
                {title}
              </h3>
              <p className="text-xs sm:text-sm font-vintage text-amber-100/75 max-w-sm">
                {subtitle}
              </p>
            </div>

            {/* Marco del Código QR */}
            <div className="inline-block p-4 sm:p-5 bg-white rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.3)] border-4 border-[#d4af37] my-2">
              {joinUrl ? (
                <QRCodeSVG value={joinUrl} size={240} level="H" />
              ) : (
                <div className="w-[240px] h-[240px] bg-[#14141e] border border-[#d4af37]/30 animate-pulse rounded-lg flex items-center justify-center text-amber-200/50 font-vintage text-sm">
                  Generando pase...
                </div>
              )}
            </div>

            {/* Código de Sala */}
            {roomCode && (
              <div className="mt-4 flex items-center justify-center gap-3 bg-[#14141e]/90 border border-[#d4af37]/40 rounded-2xl py-2 px-5 max-w-xs mx-auto">
                <span className="text-xs uppercase font-vintage text-amber-200/70 font-bold tracking-widest">
                  SALA:
                </span>
                <span className="text-3xl font-broadway tracking-widest text-gold-gradient drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]">
                  {roomCode}
                </span>
              </div>
            )}

            {/* Instrucciones de Reconexión / Entrada */}
            <div className="mt-5 grid grid-cols-3 gap-2 text-left bg-[#14141e]/60 border border-[#d4af37]/20 rounded-2xl p-3">
              <div className="flex items-start gap-1.5">
                <span className="text-[#d4af37] font-broadway text-xs">1.</span>
                <span className="text-[11px] font-vintage text-slate-300 leading-tight">
                  Apunta con la cámara
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[#d4af37] font-broadway text-xs">2.</span>
                <span className="text-[11px] font-vintage text-slate-300 leading-tight">
                  Abre el enlace del pase
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[#d4af37] font-broadway text-xs">3.</span>
                <span className="text-[11px] font-vintage text-slate-300 leading-tight">
                  ¡Reanuda o elige bando!
                </span>
              </div>
            </div>

            {/* Botón cerrar inferior */}
            <div className="mt-5">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#b38f2a] text-black font-broadway uppercase tracking-wider rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                Volver a la Pantalla de Espera
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

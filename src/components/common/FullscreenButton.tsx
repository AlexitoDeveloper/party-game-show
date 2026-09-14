import React, { useState } from 'react';
import { Maximize2, Minimize2, Info, X, Share } from 'lucide-react';
import { useFullscreen } from '../../hooks/useFullscreen';

interface FullscreenButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
  label,
}) => {
  const { isFullscreen, isSupported, isStandalone, toggleFullscreen } = useFullscreen();
  const [showIosModal, setShowIosModal] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Si la API no está soportada (típico en iPhone Safari), mostramos el modal explicativo
    if (!isSupported && !isStandalone) {
      setShowIosModal(true);
      return;
    }

    const success = await toggleFullscreen();
    if (!success && !isStandalone) {
      // Si falló el request (por ejemplo permisos en Safari), mostrar modal de ayuda
      setShowIosModal(true);
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onPointerDown={(e) => e.stopPropagation()}
        className={`rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 select-none ${
          isFullscreen
            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/60 shadow-[0_0_10px_rgba(212,175,55,0.3)]'
            : 'bg-[#0e0e16] hover:bg-[#151522] text-amber-300/80 hover:text-amber-100 border border-[#d4af37]/40 hover:border-[#d4af37] shadow-sm'
        } ${showLabel ? 'px-2.5 py-1.5 h-auto' : sizeClasses[size]} ${className}`}
        title={
          isFullscreen
            ? 'Salir del modo pantalla completa'
            : 'Pantalla completa (ocultar barras del navegador)'
        }
        aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
      >
        {isFullscreen ? (
          <Minimize2 className={`${iconSizes[size]} text-amber-400 shrink-0`} />
        ) : (
          <Maximize2 className={`${iconSizes[size]} text-amber-300 shrink-0`} />
        )}

        {showLabel && (
          <span className="font-broadway text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap">
            {label || (isFullscreen ? 'Ventana' : 'Pantalla Completa')}
          </span>
        )}
      </button>

      {/* MODAL GUÍA PARA iOS / SAFARI (cuando Fullscreen API no está soportada nativamente) */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e16] border-2 border-[#d4af37] rounded-3xl p-5 max-w-sm w-full text-center space-y-4 shadow-deco-gold animate-scaleUp text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#d4af37]/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <h4 className="text-sm font-broadway uppercase text-gold-gradient font-black">
                  Pantalla Completa en iOS
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="p-1 rounded-lg text-amber-300/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-vintage text-amber-200/90 leading-relaxed">
              Apple Safari en iPhone restringe la pantalla completa automática en páginas web. Para ocultar el header y footer del navegador:
            </p>

            <div className="space-y-2.5 text-xs font-vintage bg-[#141420] p-3 rounded-2xl border border-[#d4af37]/25">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gold-gradient text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Pulsa el botón <strong>Compartir</strong> <Share className="inline w-3.5 h-3.5 text-amber-400" /> en la barra inferior de Safari.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gold-gradient text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Elige <strong>"Añadir a pantalla de inicio"</strong> 📲.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gold-gradient text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Ábrela desde tu pantalla: ¡se abrirá <strong>100% a pantalla completa</strong> sin barras!
                </span>
              </div>
            </div>

            <div className="text-[11px] font-vintage text-amber-300/80 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                También puedes pulsar <strong>"aA"</strong> en Safari y seleccionar <em>"Ocultar barra de herramientas"</em>.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowIosModal(false)}
              className="w-full py-2.5 rounded-xl bg-gold-gradient text-slate-950 font-broadway font-black text-xs uppercase tracking-wider shadow-deco-gold active:scale-95 transition-all"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

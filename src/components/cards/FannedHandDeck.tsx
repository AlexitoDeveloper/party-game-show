import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Crown, Eye } from 'lucide-react';
import { PowerCard, getCardImageUrl } from '../../lib/powerCards';
import { DecoProceduralSpandrel } from '../deco/DecoProceduralSpandrel';
import { ThreeCardViewer } from '../3d/ThreeCardViewer';

interface FannedHandDeckProps {
  cards: PowerCard[];
  onPlayCard: (card: PowerCard) => void;
  disabled?: boolean;
}

export const FannedHandDeck: React.FC<FannedHandDeckProps> = ({
  cards,
  onPlayCard,
  disabled = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [inspectingCard, setInspectingCard] = useState<PowerCard | null>(null);
  const [confirmPlayCard, setConfirmPlayCard] = useState<PowerCard | null>(null);

  if (!cards || cards.length === 0) {
    return (
      <div className="py-8 text-center text-amber-300/60 font-vintage tracking-wider text-xs">
        No tienes naipes en mano en este momento.
      </div>
    );
  }

  // Ensure activeIndex is valid
  const safeIndex = Math.min(activeIndex, cards.length - 1);
  const activeCard = cards[safeIndex] || cards[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full flex flex-col items-center select-none pt-2 pb-3 overflow-hidden">
      {/* Carrusel 3D Coverflow Container */}
      <div className="relative w-full max-w-[360px] h-[350px] sm:h-[380px] flex items-center justify-center perspective-[1000px] touch-pan-y">
        {/* Flecha Izquierda */}
        {cards.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1 z-40 w-9 h-9 rounded-full bg-[#160e08]/90 border border-[#d4af37]/60 text-amber-200 flex items-center justify-center shadow-deco-gold active:scale-90 transition-all hover:bg-amber-950"
            aria-label="Carta anterior"
          >
            <ChevronLeft className="w-5 h-5 text-amber-300" />
          </button>
        )}

        {/* Cartas en formación Coverflow */}
        <div className="relative w-full h-full flex items-center justify-center">
          {cards.map((card, idx) => {
            const offset = idx - safeIndex;
            const isCenter = offset === 0;

            // Hide cards beyond immediate neighbors if deck is large
            const isVisible = isCenter || Math.abs(offset) === 1 || cards.length <= 3;
            if (!isVisible) return null;

            // Geometry calculations for 3D depth
            const translateX = offset * 115;
            const scale = isCenter ? 1.05 : 0.82;
            const rotateY = offset * -22;
            const zIndex = isCenter ? 30 : 20 - Math.abs(offset);
            const opacity = isCenter ? 1 : 0.5;
            const imageUrl = getCardImageUrl(card.id);

            // Rarity border tones
            const isLegendary = card.rarity === 'Legendaria' || (card.rarity as any) === 'legendaria';
            const isEpic = card.rarity === 'Épica' || (card.rarity as any) === 'epica';
            const isRare = card.rarity === 'Rara' || (card.rarity as any) === 'rara';

            const borderClass = isLegendary
              ? 'border-[#ffd700] shadow-[0_0_35px_rgba(255,215,0,0.5)] ring-2 ring-yellow-400/40'
              : isEpic
              ? 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)] ring-1 ring-purple-400/30'
              : isRare
              ? 'border-[#d4af37] shadow-deco-gold ring-1 ring-amber-400/30'
              : 'border-amber-700/60 shadow-xl';

            return (
              <motion.div
                key={card.id || idx}
                drag={isCenter ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.35}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 30 || info.velocity.x > 150) {
                    handlePrev();
                  } else if (info.offset.x < -30 || info.velocity.x < -150) {
                    handleNext();
                  }
                }}
                onClick={() => {
                  if (!isCenter) {
                    setActiveIndex(idx);
                  } else {
                    setInspectingCard(card);
                  }
                }}
                animate={{
                  x: translateX,
                  scale,
                  rotateY,
                  opacity,
                  zIndex,
                }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className={`absolute w-[230px] sm:w-[250px] h-[335px] sm:h-[365px] cursor-grab active:cursor-grabbing rounded-3xl p-2.5 flex flex-col justify-between overflow-hidden bg-[#0a0604] border-3 ${borderClass} transition-shadow group`}
                style={{
                  transformStyle: 'preserve-3d',
                  touchAction: 'pan-y',
                }}
              >
                {/* Art Deco Corner Spandrels */}
                <DecoProceduralSpandrel size={30} position="top-left" />
                <DecoProceduralSpandrel size={30} position="top-right" />
                <DecoProceduralSpandrel size={26} position="bottom-left" />
                <DecoProceduralSpandrel size={26} position="bottom-right" />

                {/* Ilustración Grande de la Carta a Sangre Completa */}
                <div className="w-full h-full rounded-2xl overflow-hidden bg-black/90 border border-amber-500/30 relative flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />

                  {/* Sello de foil y resplandor sutil */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/10 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Flecha Derecha */}
        {cards.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1 z-40 w-9 h-9 rounded-full bg-[#160e08]/90 border border-[#d4af37]/60 text-amber-200 flex items-center justify-center shadow-deco-gold active:scale-90 transition-all hover:bg-amber-950"
            aria-label="Siguiente carta"
          >
            <ChevronRight className="w-5 h-5 text-amber-300" />
          </button>
        )}
      </div>

      {/* Indicadores de Paginación */}
      {cards.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2 mb-3">
          {cards.map((c, i) => (
            <button
              key={c.id || i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`transition-all rounded-full ${
                i === safeIndex
                  ? 'w-5 h-2 bg-gradient-to-r from-amber-400 to-yellow-500 shadow-deco-gold'
                  : 'w-2 h-2 bg-amber-900/60 hover:bg-amber-700'
              }`}
              aria-label={`Ver carta ${i + 1}`}
            />
          ))}
          <span className="text-[11px] font-vintage text-amber-300/80 ml-2">
            {safeIndex + 1} de {cards.length}
          </span>
        </div>
      )}

      {/* Ficha de Detalles y Acciones (Efecto Completo y Botones) */}
      <div className="w-full max-w-sm px-2">
        <div className="bg-[#140d07]/90 border border-[#d4af37]/50 rounded-2xl p-3.5 shadow-deco-gold backdrop-blur-md flex flex-col items-center text-center space-y-3">
          <div className="w-full flex items-center justify-between border-b border-amber-500/20 pb-1.5">
            <span className="text-xs font-broadway uppercase tracking-wider text-gold-gradient">
              {activeCard.name}
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/40 text-amber-300 font-vintage font-bold">
              {activeCard.timing}
            </span>
          </div>

          <p className="text-xs text-amber-100/90 font-body leading-relaxed px-1">
            {activeCard.description}
          </p>

          {/* Botonera de Acciones: Inspección 3D y Jugar Carta */}
          <div className="w-full flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setInspectingCard(activeCard)}
              className="py-2.5 px-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 hover:bg-amber-900/60 font-broadway text-xs uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
              title="Inspeccionar carta en 3D interactivo"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Girar 3D</span>
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setConfirmPlayCard(activeCard)}
              className={`flex-1 py-2.5 px-3 rounded-xl font-broadway font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                disabled
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 shadow-deco-gold hover:brightness-110 border border-[#f5eedb]/40'
              }`}
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>{disabled ? 'Solo Capitán' : 'Jugar Carta'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación para Evitar Lanzamientos Accidentales */}
      <AnimatePresence>
        {confirmPlayCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-[#130c08] border-2 border-[#d4af37] rounded-2xl p-5 shadow-[0_0_50px_rgba(212,175,55,0.4)] text-center space-y-4"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-2xl">
                🃏
              </div>

              <h3 className="text-base font-broadway text-amber-200 uppercase tracking-wider">
                ¿Jugar {confirmPlayCard.name}?
              </h3>

              <p className="text-xs text-amber-100/80 font-body leading-relaxed">
                Esta carta se activará inmediatamente en la pantalla de televisión para todos los jugadores.
              </p>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmPlayCard(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#24170c] border border-amber-500/40 text-xs font-vintage text-amber-300 active:scale-95 uppercase font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const toPlay = confirmPlayCard;
                    setConfirmPlayCard(null);
                    onPlayCard(toPlay);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black font-broadway font-black text-xs uppercase shadow-deco-gold active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visor 3D Táctil de Inspección */}
      <AnimatePresence>
        {inspectingCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
            onClick={() => setInspectingCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="relative w-full max-w-sm flex flex-col items-center bg-[#130c08] border-2 border-[#d4af37] rounded-2xl p-4 shadow-[0_0_50px_rgba(212,175,55,0.4)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setInspectingCard(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-950/90 border border-amber-500/50 text-amber-200 flex items-center justify-center text-sm font-bold active:scale-95"
              >
                ✕
              </button>

              <h3 className="text-base font-broadway text-amber-300 mb-0.5">
                {inspectingCard.name}
              </h3>
              <p className="text-[11px] text-amber-200/70 font-vintage uppercase tracking-widest mb-3">
                {inspectingCard.rarity} · Inspección 3D con Foil Dorado
              </p>

              <ThreeCardViewer
                frontImageUrl={getCardImageUrl(inspectingCard.id)}
                name={inspectingCard.name}
                rarity={inspectingCard.rarity}
                className="w-full"
              />

              <div className="mt-4 w-full flex gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    const toPlay = inspectingCard;
                    setInspectingCard(null);
                    setConfirmPlayCard(toPlay);
                  }}
                  className={`w-full py-2.5 rounded-xl font-broadway font-black text-xs uppercase tracking-wider shadow-deco-gold active:scale-95 ${
                    disabled
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black'
                  }`}
                >
                  {disabled ? 'Solo el Capitán puede Jugar' : `Jugar "${inspectingCard.name}"`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Check, Crown, X, Sparkles, ShieldCheck } from 'lucide-react';
import { Player, TeamRepresentative } from '../../lib/types';
import { generateAvatarDataUri, DiceBearStyle } from '../../lib/dicebear';
import { soundFX } from '../../lib/audio';

interface CaptainRepSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: Player[];
  currentRep?: TeamRepresentative | null;
  maxRepresentatives: number;
  gameTitle: string;
  gameEmoji: string;
  onConfirm: (selectedPlayerIds: string[], selectedPlayerNames: string[]) => void;
}

export const CaptainRepSelectorModal: React.FC<CaptainRepSelectorModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  currentRep,
  maxRepresentatives,
  gameTitle,
  gameEmoji,
  onConfirm,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Inicializar selección con los representantes actuales si existen
  useEffect(() => {
    if (isOpen) {
      if (currentRep?.representativePlayerIds && currentRep.representativePlayerIds.length > 0) {
        setSelectedIds(currentRep.representativePlayerIds.slice(0, maxRepresentatives));
      } else if (currentRep?.representativePlayerId) {
        setSelectedIds([currentRep.representativePlayerId]);
      } else {
        setSelectedIds([]);
      }
    }
  }, [isOpen, currentRep, maxRepresentatives]);

  if (!isOpen) return null;

  const togglePlayer = (pId: string) => {
    try {
      if (navigator.vibrate) navigator.vibrate(15);
      soundFX.playTick();
    } catch {}

    setSelectedIds((prev) => {
      if (prev.includes(pId)) {
        return prev.filter((id) => id !== pId);
      }
      if (prev.length >= maxRepresentatives) {
        // Si el límite es 1, cambiar directamente al nuevo
        if (maxRepresentatives === 1) {
          return [pId];
        }
        return prev;
      }
      return [...prev, pId];
    });
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) return;
    try {
      if (navigator.vibrate) navigator.vibrate([20, 30, 40]);
      soundFX.playSuccess();
    } catch {}

    const selectedPlayers = teamMembers.filter((m) => selectedIds.includes(m.id));
    const ids = selectedPlayers.map((m) => m.id);
    const names = selectedPlayers.map((m) => m.nickname);
    onConfirm(ids, names);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#0c0c14] border-2 border-[#d4af37]/60 rounded-3xl p-5 shadow-deco-gold hell-card-frame overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Cabecera Art Déco */}
          <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/25">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{gameEmoji}</span>
              <div>
                <h3 className="text-base font-broadway uppercase tracking-wider text-gold-gradient leading-tight">
                  Designar Representantes
                </h3>
                <p className="text-[10px] font-vintage text-amber-200/70">
                  Prueba: <span className="font-bold text-amber-100">{gameTitle}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#151522] border border-[#d4af37]/30 text-amber-200 hover:text-white flex items-center justify-center text-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Banner de regla de selección */}
          <div className="mt-3 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/40 border border-[#d4af37]/35 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] font-vintage text-amber-100/90 font-bold">
                {maxRepresentatives === 1
                  ? 'Elige al campeón de tu equipo para este reto'
                  : `Elige hasta ${maxRepresentatives} representantes para competir`}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-broadway font-black ${
              selectedIds.length === maxRepresentatives
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                : selectedIds.length > 0
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                : 'bg-stone-800 text-stone-400'
            }`}>
              {selectedIds.length} / {maxRepresentatives}
            </span>
          </div>

          {/* Lista táctil de miembros del equipo */}
          <div className="my-3 overflow-y-auto pr-1 space-y-2 flex-1 max-h-[48vh] select-none">
            {teamMembers.length === 0 ? (
              <div className="py-8 text-center text-amber-200/50 text-xs font-vintage">
                No hay compañeros asignados a tu equipo aún.
              </div>
            ) : (
              teamMembers.map((member) => {
                const isSelected = selectedIds.includes(member.id);
                const isMaxReached = selectedIds.length >= maxRepresentatives && !isSelected;
                const avatarUri = generateAvatarDataUri(
                  member.avatar_seed || member.nickname,
                  (member.avatar_style as DiceBearStyle) || 'avataaars'
                );

                return (
                  <motion.div
                    key={member.id}
                    whileTap={{ scale: isMaxReached ? 1 : 0.98 }}
                    onClick={() => !isMaxReached && togglePlayer(member.id)}
                    className={`relative p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/25 border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                        : isMaxReached
                        ? 'bg-[#101018]/50 border-stone-800/60 opacity-40 cursor-not-allowed'
                        : 'bg-[#12121c]/90 border-[#d4af37]/25 hover:border-[#d4af37]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-full border border-[#d4af37]/40 overflow-hidden bg-black/60 shrink-0">
                        <img
                          src={avatarUri}
                          alt={member.nickname}
                          className="w-full h-full object-cover"
                        />
                        {member.is_captain && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                            <Crown className="w-2.5 h-2.5 text-slate-950 fill-slate-950" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-broadway text-amber-100 truncate">
                            {member.nickname}
                          </span>
                          {member.is_captain && (
                            <span className="text-[9px] font-vintage uppercase text-amber-400/90 font-bold">
                              (Capitán)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-vintage text-amber-200/50 block">
                          {isSelected ? '⭐ En el Ruedo' : 'En el Banquillo'}
                        </span>
                      </div>
                    </div>

                    {/* Checkbox circular táctil */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-gold-gradient border-amber-300 text-slate-950 shadow-sm'
                          : 'border-[#d4af37]/40 bg-black/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Botón de acción */}
          <div className="pt-2 border-t border-[#d4af37]/25 flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-2xl bg-[#151522] border border-[#d4af37]/30 text-amber-200 text-xs font-vintage font-bold uppercase hover:bg-[#1f1f30] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className={`w-2/3 py-2.5 rounded-2xl text-xs font-broadway uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                selectedIds.length > 0
                  ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold hover:brightness-110'
                  : 'bg-stone-800 border border-stone-700 text-stone-500 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirmar ({selectedIds.length})</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

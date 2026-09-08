import React from 'react';
import { Volume2 } from 'lucide-react';

interface HostQuickSoundStripProps {
  onPlaySoundEffect: (type: string) => void;
  onOpenSoundboardTab: () => void;
}

export const HostQuickSoundStrip: React.FC<HostQuickSoundStripProps> = ({
  onPlaySoundEffect,
  onOpenSoundboardTab,
}) => {
  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/40 rounded-2xl p-2 flex items-center justify-between gap-1 shadow-deco-gold">
      <div className="flex items-center gap-1.5 pl-1.5 text-[11px] font-vintage font-bold text-amber-300 whitespace-nowrap">
        <Volume2 className="w-3.5 h-3.5 text-[#d4af37]" />
        <span className="hidden sm:inline">Efectos:</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={() => onPlaySoundEffect('fail')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-500/40 text-red-300 font-broadway font-black text-xs active:scale-95 transition-all flex items-center gap-1 shadow-sm"
          title="Fallo / Error"
        >
          <span className="text-base sm:text-sm">❌</span>
          <span className="hidden sm:inline">Fallo</span>
        </button>
        <button
          onClick={() => onPlaySoundEffect('success')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 font-broadway font-black text-xs active:scale-95 transition-all flex items-center gap-1 shadow-sm"
          title="Acierto"
        >
          <span className="text-base sm:text-sm">🎯</span>
          <span className="hidden sm:inline">Acierto</span>
        </button>
        <button
          onClick={() => onPlaySoundEffect('victory')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300 font-broadway font-black text-xs active:scale-95 transition-all flex items-center gap-1 shadow-sm"
          title="Victoria"
        >
          <span className="text-base sm:text-sm">🏆</span>
          <span className="hidden sm:inline">Victoria</span>
        </button>
        <button
          onClick={() => onPlaySoundEffect('drumroll')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 font-broadway font-black text-xs active:scale-95 transition-all flex items-center gap-1 shadow-sm"
          title="Redoble"
        >
          <span className="text-base sm:text-sm">🥁</span>
          <span className="hidden sm:inline">Redoble</span>
        </button>
        <button
          onClick={() => onPlaySoundEffect('applause')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/70 border border-blue-500/40 text-blue-300 font-broadway font-black text-xs active:scale-95 transition-all flex items-center gap-1 shadow-sm"
          title="Aplausos"
        >
          <span className="text-base sm:text-sm">👏</span>
          <span className="hidden sm:inline">Aplausos</span>
        </button>
      </div>
      <button
        onClick={onOpenSoundboardTab}
        className="text-[11px] text-amber-200/80 hover:text-amber-300 font-vintage font-bold px-2 py-1 transition-colors whitespace-nowrap"
        title="Ver todos los efectos"
      >
        <span className="hidden sm:inline">Todos</span>
        <span>→</span>
      </button>
    </div>
  );
};

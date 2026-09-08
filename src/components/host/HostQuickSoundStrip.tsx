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
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-2 flex items-center justify-between gap-1 shadow-md">
      <div className="flex items-center gap-1 pl-1 text-[11px] font-bold text-slate-400 whitespace-nowrap">
        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Sonidos:</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={() => onPlaySoundEffect('fail')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-500/40 text-red-300 font-black text-xs active:scale-95 transition-all flex items-center gap-1"
          title="Fallo / Error"
        >
          <span className="text-base sm:text-sm">❌</span>
          <span className="hidden sm:inline">Fallo</span>
        </button>
        <button
          onClick={() => onPlaySoundEffect('success')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 font-black text-xs active:scale-95 transition-all flex items-center gap-1"
          title="Acierto"
        >
          <span className="text-base sm:text-sm">🎯</span>
          <span className="hidden sm:inline">Acierto</span>
        </button>
        <button
          onClick={() => onPlaySoundEffect('victory')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300 font-black text-xs active:scale-95 transition-all flex items-center gap-1"
          title="Victoria"
        >
          <span className="text-base sm:text-sm">🏆</span>
          <span className="hidden sm:inline">Victoria</span>
        </button>
        <button
          onClick={() => onPlaySoundEffect('drumroll')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 font-black text-xs active:scale-95 transition-all flex items-center gap-1"
          title="Redoble"
        >
          <span className="text-base sm:text-sm">🥁</span>
          <span className="hidden sm:inline">Redoble</span>
        </button>
        <button
          onClick={() => onPlaySoundEffect('applause')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/70 border border-blue-500/40 text-blue-300 font-black text-xs active:scale-95 transition-all flex items-center gap-1"
          title="Aplausos"
        >
          <span className="text-base sm:text-sm">👏</span>
          <span className="hidden sm:inline">Aplausos</span>
        </button>
      </div>
      <button
        onClick={onOpenSoundboardTab}
        className="text-[11px] text-slate-400 hover:text-amber-400 font-bold px-1.5 py-1 transition-colors whitespace-nowrap"
        title="Ver todos los efectos"
      >
        <span className="hidden sm:inline">Todos</span>
        <span>→</span>
      </button>
    </div>
  );
};

import React from 'react';

interface HellCasinoSuitsDividerProps {
  className?: string;
  label?: string;
}

export const HellCasinoSuitsDivider: React.FC<HellCasinoSuitsDividerProps> = ({
  className = '',
  label,
}) => {
  return (
    <div className={`flex items-center justify-center gap-3 select-none my-3 ${className}`}>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-[#b91c1c]/80" />
      <div className="flex items-center gap-2 px-2.5 py-1 bg-black/90 border border-[#d4af37]/50 rounded-full shadow-[0_0_12px_rgba(212,175,55,0.2)]">
        <span className="text-xs text-amber-400 font-serif">♠</span>
        <span className="text-xs text-red-500 font-serif">♥</span>
        {label && (
          <span className="text-[10px] font-broadway uppercase tracking-widest text-amber-200/90 px-1 font-bold">
            {label}
          </span>
        )}
        <span className="text-xs text-amber-400 font-serif">♣</span>
        <span className="text-xs text-red-500 font-serif">♦</span>
      </div>
      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#d4af37]/60 to-[#b91c1c]/80" />
    </div>
  );
};

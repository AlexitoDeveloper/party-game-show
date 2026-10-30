import React from 'react';
import { motion } from 'framer-motion';
import { GameDefinition, GAMES_CATALOG } from '../../lib/games';
import { GameCoverImage } from '../common/GameCoverImage';

import { Team, TeamRepresentative } from '../../lib/types';

interface TvGameBriefingCardProps {
  game: GameDefinition;
  teamRepresentatives?: Record<string, TeamRepresentative>;
  activeTeams?: Team[];
}

export const TvGameBriefingCard: React.FC<TvGameBriefingCardProps> = ({
  game,
}) => {
  const gameIndex = React.useMemo(() => {
    const idx = GAMES_CATALOG.findIndex((g) => g.id === game.id);
    return idx >= 0 ? idx : 0;
  }, [game.id]);

  const actionOptions = React.useMemo(
    () => game.scoringOptions.filter((opt) => opt.type !== 'podium'),
    [game.scoringOptions]
  );

  const podiumOptions = React.useMemo(
    () => game.scoringOptions.filter((opt) => opt.type === 'podium'),
    [game.scoringOptions]
  );

  const cleanLabel = (text: string) => text.replace(/\s*\([+-]?\d+.*?\)$/i, '').trim();

  return (
    <motion.div
      key={game.id}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full h-full flex-1 flex flex-col justify-between items-center min-h-0 overflow-hidden select-none"
    >
      {/* 1. MARQUESINA ART DÉCO SUPERIOR LIMPIA */}
      <div className="w-full shrink-0 mb-2 flex items-center justify-between bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 px-5 py-2.5 rounded-2xl shadow-deco-gold backdrop-blur-md gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8a6a1a] text-slate-950 font-broadway flex items-center justify-center text-2xl font-black shrink-0 shadow-lg border border-[#f5eedb]/40">
            {gameIndex + 1}
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm uppercase font-vintage tracking-widest text-amber-300 font-bold block">
              {game.category}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-broadway uppercase tracking-wide text-gold-gradient leading-tight truncate">
              {game.title}
            </h2>
          </div>
        </div>

        <span className="text-sm sm:text-base bg-[#14141e]/95 text-amber-200 border border-[#d4af37]/60 px-4 py-1.5 rounded-xl font-broadway uppercase tracking-wider shrink-0 shadow-md">
          {game.engine === 'buzzer' ? '⚡ Pulsador Rápido' : game.engine === 'duel' ? '⚔️ Duelo de Mesa' : '🎲 Reto en Vivo'}
        </span>
      </div>

      {/* 2. ESCENARIO CENTRAL FLEXIBLE: ADAPTADO AL ALTO EXACTO DISPONIBLE */}
      <div className="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden my-auto py-0.5">
        <div className="relative h-full max-h-full max-w-5xl w-full flex items-center justify-center rounded-2xl sm:rounded-3xl p-1 bg-gradient-to-b from-[#2a1c0d]/40 via-[#0a0a10] to-[#12080a]/40 border-2 sm:border-3 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.2)] hell-card-frame overflow-hidden">
          {/* Esquinas ornamentales con palos de póker */}
          <span className="absolute top-2 left-3.5 text-sm text-[#d4af37]/70 font-serif select-none z-10">♠</span>
          <span className="absolute top-2 right-3.5 text-sm text-red-500/80 font-serif select-none z-10">♥</span>
          <span className="absolute bottom-2 left-3.5 text-sm text-[#d4af37]/70 font-serif select-none z-10">♣</span>
          <span className="absolute bottom-2 right-3.5 text-sm text-red-500/80 font-serif select-none z-10">♦</span>

          {/* Portada Horizontal sin recortes adaptada al espacio restante */}
          <div className="w-full h-full max-h-full flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-[#07070a]">
            <GameCoverImage
              game={game}
              gameIndex={gameIndex}
              className="w-full h-full max-h-full"
              showArtDecoFrame={false}
              priority
              objectFit="contain"
            />
          </div>
        </div>
      </div>

      {/* 3. BARRA INFERIOR COMPACTA CON PUNTUACIONES GRANDES Y RESUMIDAS */}
      <div className="w-full shrink-0 mt-2 flex items-center justify-center bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 px-4 py-2 rounded-xl shadow-deco-gold backdrop-blur-md">
        <div className="flex items-center gap-4 overflow-x-auto max-w-full py-0.5 justify-center flex-wrap">
          {actionOptions.length > 0 && (
            <div className="flex items-center gap-2 flex-nowrap">
              {actionOptions.map((opt) => (
                <span
                  key={opt.id}
                  className="bg-[#12121c] text-amber-100 text-sm sm:text-base font-vintage font-bold px-3 py-1 rounded-xl border border-[#d4af37]/40 flex items-center gap-2 shadow-sm whitespace-nowrap"
                >
                  <span>{cleanLabel(opt.label)}</span>
                  <span className="text-emerald-400 font-broadway font-black text-base sm:text-lg">{opt.badge}</span>
                </span>
              ))}
            </div>
          )}

          {actionOptions.length > 0 && podiumOptions.length > 0 && (
            <div className="h-5 w-px bg-[#d4af37]/50 shrink-0" />
          )}

          {podiumOptions.length > 0 && (
            <div className="bg-[#12121c] border border-[#d4af37]/40 px-3.5 py-1 rounded-xl flex items-center gap-2.5 text-sm sm:text-base font-vintage font-bold text-amber-100 whitespace-nowrap">
              <span className="text-amber-400 font-broadway uppercase">🏆 Podio:</span>
              <span className="font-broadway text-amber-300">
                🥇+5 · 🥈+3 · 🥉+2 · 4º+1
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

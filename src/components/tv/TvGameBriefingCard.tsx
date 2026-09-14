import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy } from 'lucide-react';
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
  teamRepresentatives = {},
  activeTeams = [],
}) => {
  const isRepGame = ['solo', 'duo', 'delegates'].includes(game.participantsMode);
  const hasAnyReps = Object.keys(teamRepresentatives).some((k) => {
    const r = teamRepresentatives[k];
    return (r.representativePlayerIds && r.representativePlayerIds.length > 0) || !!r.representativePlayerId;
  });

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
      {/* 1. MARQUESINA ART DÉCO SUPERIOR (COMPACTA) */}
      <div className="w-full shrink-0 mb-1 flex items-center justify-between bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 px-4 py-1.5 rounded-2xl shadow-deco-gold backdrop-blur-md gap-3">
        {/* Identificador del juego y título */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8a6a1a] text-slate-950 font-broadway flex items-center justify-center text-sm font-black shrink-0 shadow border border-[#f5eedb]/30">
            {gameIndex + 1}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-vintage tracking-widest text-amber-300 font-bold">
                {game.category}
              </span>
              <span className="text-[9px] bg-black/80 text-amber-200 border border-[#d4af37]/40 px-2 py-0.2 rounded-full font-vintage font-bold">
                {game.engine === 'buzzer' ? '⚡ Pulsador Rápido' : game.engine === 'duel' ? '⚔️ Duelo de Mesa' : '🎲 Reto Presencial'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-broadway uppercase tracking-wide text-gold-gradient leading-tight truncate">
              {game.title}
            </h2>
          </div>
        </div>

        {/* Modalidad de Participación */}
        <div className="flex items-center gap-2 bg-[#14141e]/90 border border-[#d4af37]/40 px-3 py-1 rounded-xl shrink-0 shadow-inner">
          <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-broadway text-amber-300 font-bold block">
              {game.participantsLabel}
            </span>
            <span className="text-[10px] font-vintage text-amber-100/70 block leading-tight hidden lg:inline">
              {game.participantsDescription}
            </span>
          </div>
        </div>
      </div>

      {/* 1B. TIRA DE REPRESENTANTES DESIGNADOS POR BANDO */}
      {isRepGame && activeTeams.length > 0 && (
        <div className="w-full shrink-0 mb-1 bg-[#0c0c14]/90 border border-[#d4af37]/35 px-4 py-1.5 rounded-xl flex items-center justify-between gap-2 overflow-x-auto shadow-sm">
          <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-broadway uppercase shrink-0">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Representantes al Ruedo:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {activeTeams.map((team) => {
              const rep = teamRepresentatives[team.id];
              const names = rep?.representativeNames?.length
                ? rep.representativeNames
                : rep?.representativeName
                ? [rep.representativeName]
                : [];
              return (
                <div key={team.id} className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-[#d4af37]/30 text-[10px]">
                  <span className={`w-2 h-2 rounded-full ${team.color_tw}`} />
                  <span className="font-vintage text-amber-100 font-bold">{team.name}:</span>
                  <span className="font-broadway text-amber-300">
                    {names.length > 0 ? names.join(', ') : <span className="text-amber-200/50 italic">Capitán eligiendo...</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ESCENARIO CENTRAL FLEXIBLE: ADAPTADO AL ALTO EXACTO DISPONIBLE */}
      <div className="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden my-auto py-0.5">
        <div className="relative h-full max-h-full max-w-5xl w-full flex items-center justify-center rounded-2xl sm:rounded-3xl p-1 bg-gradient-to-b from-[#2a1c0d]/40 via-[#0a0a10] to-[#12080a]/40 border-2 sm:border-3 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.2)] hell-card-frame overflow-hidden">
          {/* Esquinas ornamentales con palos de póker */}
          <span className="absolute top-1.5 left-3 text-xs text-[#d4af37]/70 font-serif select-none z-10">♠</span>
          <span className="absolute top-1.5 right-3 text-xs text-red-500/80 font-serif select-none z-10">♥</span>
          <span className="absolute bottom-1.5 left-3 text-xs text-[#d4af37]/70 font-serif select-none z-10">♣</span>
          <span className="absolute bottom-1.5 right-3 text-xs text-red-500/80 font-serif select-none z-10">♦</span>

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

      {/* 3. BARRA INFERIOR COMPACTA CON PUNTUACIONES SEPARADAS */}
      <div className="w-full shrink-0 mt-1 flex items-center justify-center bg-[#0c0c14]/95 border border-[#d4af37]/40 px-3.5 py-1.5 rounded-xl shadow-deco-gold backdrop-blur-md">
        <div className="flex items-center gap-3 overflow-x-auto max-w-full py-0.5 justify-center flex-wrap">
          {/* SECCIÓN 1: PUNTUACIÓN DE LA PRUEBA */}
          {actionOptions.length > 0 && (
            <div className="flex items-center gap-1.5 flex-nowrap">
              <span className="text-[10px] uppercase font-broadway text-amber-400 font-bold flex items-center gap-1 bg-[#14141e] border border-[#d4af37]/35 px-2 py-0.5 rounded-md shrink-0">
                🎯 Prueba:
              </span>
              <div className="flex items-center gap-1">
                {actionOptions.map((opt) => (
                  <span
                    key={opt.id}
                    className="bg-[#12121c] text-amber-100 text-[10px] font-vintage font-bold px-2 py-0.5 rounded-md border border-[#d4af37]/25 flex items-center gap-1 shadow-sm whitespace-nowrap"
                  >
                    <span>{cleanLabel(opt.label)}</span>
                    <span className="text-emerald-400 font-broadway font-black">{opt.badge}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Separador vertical si ambos existen */}
          {actionOptions.length > 0 && podiumOptions.length > 0 && (
            <div className="h-4 w-px bg-[#d4af37]/40 shrink-0" />
          )}

          {/* SECCIÓN 2: PUNTUACIÓN POR CLASIFICACIÓN */}
          {podiumOptions.length > 0 && (
            <div className="flex items-center gap-1.5 flex-nowrap">
              <span className="text-[10px] uppercase font-broadway text-amber-400 font-bold flex items-center gap-1 bg-[#14141e] border border-[#d4af37]/35 px-2 py-0.5 rounded-md shrink-0">
                🏆 Clasificación:
              </span>
              <div className="flex items-center gap-1">
                {podiumOptions.map((opt) => (
                  <span
                    key={opt.id}
                    className="bg-[#12121c] text-amber-100 text-[10px] font-vintage font-bold px-2 py-0.5 rounded-md border border-[#d4af37]/25 flex items-center gap-1 shadow-sm whitespace-nowrap"
                  >
                    <span>{cleanLabel(opt.label)}</span>
                    <span className="text-amber-300 font-broadway font-black">{opt.badge}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

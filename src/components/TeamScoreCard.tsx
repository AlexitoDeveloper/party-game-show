import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { TeamTheme } from '../lib/teamThemes';
import { BorderBeam } from './BorderBeam';
import CountUp from 'react-countup';
import { GameIcon } from './GameIcon';
import { TwemojiText } from './TwemojiText';
import { generateAvatarDataUri } from '../lib/dicebear';
import { CasinoChipMountain } from './casino/CasinoChipMountain';

export interface TeamMemberInfo {
  id: string;
  nickname: string;
  is_captain?: boolean;
  avatar_seed?: string;
  avatar_style?: string;
  badge_emoji?: string;
}

export interface TeamActiveEffects {
  hasDouble?: boolean;
  hasBomb?: boolean;
  hasGamble?: boolean;
  hasShield?: boolean;
  hasSentence?: boolean;
  hasCurse?: boolean;
  hasRussianRoulette?: boolean;
}

interface TeamScoreCardProps {
  team: {
    id: string;
    name: string;
    score: number;
    team_index: number;
  };
  theme: TeamTheme;
  members?: TeamMemberInfo[];
  powerCardsCount?: number;
  variant?: 'lobby' | 'scoreboard';
  activeEffects?: TeamActiveEffects;
  isLeader?: boolean;
  className?: string;
}

/**
 * TeamScoreCard: Tarjeta de equipo multifunción para Plató de TV.
 * Modos: 'lobby' (tarjeta vertical rica) y 'scoreboard' (marcador horizontal compacto para juego activo).
 */
export const TeamScoreCard: React.FC<TeamScoreCardProps> = ({
  team,
  theme,
  members = [],
  powerCardsCount = 0,
  variant = 'lobby',
  activeEffects = {},
  isLeader = false,
  className = '',
}) => {
  const IconComponent = theme.icon;

  // MODO MARCADOR COMPACTO PARA EL FOOTER DURANTE LAS PRUEBAS
  if (variant === 'scoreboard') {
    const teamCaptain = members.find((m) => m.is_captain);

    return (
      <div
        className={`bg-[#0d0d14]/90 border border-[#d4af37]/40 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-md ${
          isLeader ? 'ring-2 ring-[#d4af37] shadow-gold-glow' : ''
        } ${className}`}
      >
        {/* Adorno biselado Art Deco */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />

        <div className="flex flex-col truncate min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <GameIcon
              name={
                theme.index === 1
                  ? 'Drop'
                  : theme.index === 2
                  ? 'Flame'
                  : theme.index === 3
                  ? 'Lightning'
                  : theme.index === 4
                  ? 'Sparkle'
                  : theme.index === 5
                  ? 'Moon'
                  : theme.index === 6
                  ? 'Sparkle'
                  : theme.index === 7
                  ? 'Target'
                  : 'Sun'
              }
              size={16}
              color={theme.accentHex}
              weight="fill"
              glow={theme.accentHex}
              className="shrink-0"
            />
            <span className={`text-xs font-black font-broadway uppercase tracking-wide truncate ${theme.twText}`}>
              {team.name}
            </span>
            {powerCardsCount > 0 && (
              <span className="text-[10px] bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/40 px-1.5 py-0.5 rounded-md font-bold font-mono shadow-sm">
                🃏{powerCardsCount}
              </span>
            )}
            {activeEffects.hasDouble && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded-md font-black animate-pulse">
                x2
              </span>
            )}
            {activeEffects.hasGamble && (
              <span className="text-[10px] bg-amber-500/30 text-amber-300 border border-amber-400/60 px-1.5 py-0.5 rounded-md font-black animate-pulse flex items-center gap-0.5 shadow-sm shadow-amber-500/30">
                ⭐x2
              </span>
            )}
            {activeEffects.hasBomb && (
              <span className="text-[10px] bg-orange-500/30 text-orange-300 border border-orange-500/60 px-1.5 py-0.5 rounded-md font-black animate-pulse shadow-sm shadow-orange-500/30" title="Bomba activa">
                💣
              </span>
            )}
            {activeEffects.hasShield && (
              <span className="text-[10px] bg-blue-500/30 text-blue-300 border border-blue-400/60 px-1.5 py-0.5 rounded-md font-black animate-pulse shadow-sm shadow-blue-500/30" title="Escudo protector">
                🛡️
              </span>
            )}
            {activeEffects.hasSentence && (
              <span className="text-[10px] bg-red-700/40 text-red-300 border border-red-500/60 px-1.5 py-0.5 rounded-md font-black animate-pulse" title="La Sentencia activa">
                💀
              </span>
            )}
            {activeEffects.hasRussianRoulette && (
              <span className="text-[10px] bg-purple-500/30 text-purple-300 border border-purple-400/60 px-1.5 py-0.5 rounded-md font-black animate-pulse" title="Ruleta Rusa">
                🎰
              </span>
            )}
            {activeEffects.hasCurse && (
              <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-600/70 px-1.5 py-0.5 rounded-md font-black animate-pulse" title="Mano con Maldición (-1 pt por ronda)">
                ☠️
              </span>
            )}
          </div>
          {teamCaptain && (
            <span className="text-[10px] text-[#f3e5ab]/80 font-vintage font-bold truncate flex items-center gap-1 mt-0.5">
              <Crown className="w-2.5 h-2.5 fill-[#d4af37] text-[#d4af37] shrink-0" />
              {teamCaptain.nickname}
            </span>
          )}
        </div>
        <div className="text-right whitespace-nowrap pl-2 font-broadway text-base text-gold-gradient">
          <CountUp end={team.score} duration={0.9} preserveValue suffix=" PTS" />
        </div>
      </div>
    );
  }

  // MODO LOBBY: TARJETA DE ALTO IMPACTO CINEMATOGRÁFICO
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl p-[3px] shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${theme.lobbyBorderClass} ${className}`}
    >
      {/* Luz perimetral dinámica tipo BorderBeam */}
      <BorderBeam colorFrom={theme.primaryHex} colorTo={theme.accentHex} duration={7} />

      {/* Contenedor interior con desenfoque de cristal oscuro */}
      <div className="bg-slate-950/90 rounded-[21px] p-4 flex flex-col justify-between h-full backdrop-blur-xl relative z-10">
        <div>
          {/* CABECERA: ICONO, NÚMERO Y NOMBRE COMPLETO */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-10 h-10 rounded-2xl bg-slate-900/95 border border-slate-700/60 flex items-center justify-center shadow-md shrink-0"
                style={{
                  boxShadow: `0 0 12px ${theme.glowColor}`,
                }}
              >
                <GameIcon
                  name={
                    theme.index === 1
                      ? 'Drop'
                      : theme.index === 2
                      ? 'Flame'
                      : theme.index === 3
                      ? 'Lightning'
                      : theme.index === 4
                      ? 'Sparkle'
                      : theme.index === 5
                      ? 'Moon'
                      : theme.index === 6
                      ? 'Sparkle'
                      : theme.index === 7
                      ? 'Target'
                      : 'Sun'
                  }
                  size={22}
                  color={theme.accentHex}
                  weight="fill"
                  glow={theme.glowColor}
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-vintage font-bold text-[#c5a059] tracking-widest block">
                  Equipo {team.team_index}
                </span>
                <h3 className={`text-xl font-black font-broadway uppercase tracking-wider ${theme.twText} truncate leading-tight`}>
                  {team.name}
                </h3>
              </div>
            </div>

            {/* Indicador discreto del color oficial */}
            <span
              className={`w-4 h-4 rounded-full ${theme.twBg} shrink-0 border-2 border-[#d4af37]/60 shadow-md`}
            />
          </div>

          {/* MARCADOR DE PUNTUACIÓN - PLACA DE LATÓN GRABADA */}
          <div className="my-3 py-3 px-4 rounded-2xl bg-brass-plate flex items-center justify-between shadow-xl">
            <div>
              <span className="text-[9px] uppercase font-vintage font-bold tracking-widest text-[#c5a059] block">
                PUNTUACIÓN
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-4xl font-black font-broadway text-gold-gradient leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                  <CountUp end={team.score} duration={1.2} preserveValue />
                </span>
                <span className="text-[11px] font-black text-[#d4af37] font-broadway">PTS</span>
              </div>
            </div>
          </div>

          {/* CARTAS DE PODER ASIGNADAS (MÁXIMO 3) */}
          <div className="mb-2 py-2 px-3 rounded-xl bg-[#0a0a0f] border border-[#d4af37]/40 flex items-center justify-between">
            <span className="text-[10px] uppercase font-vintage font-bold text-[#f3e5ab] flex items-center gap-1.5">
              <span>🃏 Cartas de Poder:</span>
            </span>
            <span className="text-xs font-black font-mono text-[#f3e5ab] bg-[#d4af37]/20 border border-[#d4af37]/50 px-2 py-0.5 rounded-lg shadow-sm">
              {powerCardsCount} / 3
            </span>
          </div>

          {/* LISTA DE JUGADORES / MIEMBROS DEL EQUIPO (Máx 4-5 jugadores) */}
          <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[165px] pr-1">
            {members.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold flex items-center justify-between transition-all ${
                  m.is_captain
                    ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-200 shadow-md'
                    : 'bg-slate-800/90 border border-slate-700/60 text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-md bg-slate-950 border border-slate-700/80 shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                    <img
                      src={generateAvatarDataUri(m.avatar_seed || m.nickname, (m.avatar_style as any) || 'avataaars')}
                      alt={m.nickname}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {m.badge_emoji && (
                    <TwemojiText className="text-xs shrink-0">{m.badge_emoji}</TwemojiText>
                  )}
                  {m.is_captain && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                  <span className="truncate">{m.nickname}</span>
                </div>
                {m.is_captain ? (
                  <span className="text-[9px] font-black uppercase text-amber-300 bg-black/50 px-1.5 py-0.5 rounded border border-amber-400/30 shrink-0">
                    CAPITÁN
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                )}
              </div>
            ))}
            {members.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                Esperando reclutas...
              </div>
            )}
          </div>
        </div>

        {/* PARTE INFERIOR: MONTAÑA DE FICHAS DE CASINO QUE CRECE EN LA BASE */}
        <div className="relative mt-2 pt-2 border-t border-slate-800/80 flex flex-col items-center">
          <CasinoChipMountain score={team.score} theme={theme} className="w-full mb-1.5" />

          {/* PIE DE TARJETA: TOTAL JUGADORES */}
          <div className="w-full text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {members.length} {members.length === 1 ? 'jugador' : 'jugadores'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

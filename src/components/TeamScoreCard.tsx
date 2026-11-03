import React from 'react';
import { motion } from 'framer-motion';
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
  avatar_seed?: string;
  avatar_style?: string;
  badge_emoji?: string;
}

export interface TeamActiveEffects {
  hasDouble?: boolean;
  hasBomb?: boolean;
  hasShield?: boolean;
  hasSentence?: boolean;
  hasCurse?: boolean;
  hasRussianRoulette?: boolean;
  hasPhoenix?: boolean;
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
  maxRoomScore?: number;
  customScore?: number;
  scoreSuffix?: string;
  subtitleScore?: string;
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
  maxRoomScore = 0,
  customScore,
  scoreSuffix,
  subtitleScore,
}) => {
  const IconComponent = theme.icon;

  // MODO MARCADOR COMPACTO PARA EL FOOTER DURANTE LAS PRUEBAS
  if (variant === 'scoreboard') {
    const cleanSuffix = scoreSuffix !== undefined ? scoreSuffix.trim() : 'PTS';

    return (
      <div
        className={`bg-[#0d0d14]/90 border border-[#d4af37]/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1.5 shadow-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-md ${
          isLeader ? 'ring-2 ring-[#d4af37] shadow-gold-glow' : ''
        } ${className}`}
      >
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
            <span className={`text-xs sm:text-sm font-black font-broadway uppercase tracking-wide truncate ${theme.twText}`}>
              {team.name}
            </span>
          </div>

          {/* Iconos de cartas y efectos activos sin texto redundante */}
          {(powerCardsCount > 0 ||
            activeEffects.hasDouble ||
            activeEffects.hasBomb ||
            activeEffects.hasShield ||
            activeEffects.hasSentence ||
            activeEffects.hasRussianRoulette ||
            activeEffects.hasCurse ||
            activeEffects.hasPhoenix ||
            subtitleScore) && (
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              {subtitleScore && (
                <span className="text-[11px] text-amber-200/80 font-broadway uppercase tracking-wider whitespace-nowrap">
                  {subtitleScore}
                </span>
              )}
              {powerCardsCount > 0 && (
                <span className="text-[10px] bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/40 px-1 py-0.2 rounded font-bold font-mono">
                  🃏{powerCardsCount}
                </span>
              )}
              {activeEffects.hasDouble && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1 py-0.2 rounded font-black animate-pulse">
                  x2
                </span>
              )}
              {activeEffects.hasBomb && <span className="text-[10px] animate-pulse">💣</span>}
              {activeEffects.hasShield && <span className="text-[10px] animate-pulse">🛡️</span>}
              {activeEffects.hasSentence && <span className="text-[10px] animate-pulse">💀</span>}
              {activeEffects.hasRussianRoulette && <span className="text-[10px] animate-pulse">🎰</span>}
              {activeEffects.hasCurse && <span className="text-[10px] animate-pulse">☠️</span>}
              {activeEffects.hasPhoenix && (
                <span className="text-[10px] bg-amber-600/40 text-amber-200 border border-amber-400/80 px-1 py-0.2 rounded font-black animate-pulse">
                  🔥x3
                </span>
              )}
            </div>
          )}
        </div>

        <div className="text-right whitespace-nowrap pl-1.5 flex items-baseline justify-end gap-1 shrink-0">
          <span className="font-broadway text-xl sm:text-2xl font-black text-gold-gradient leading-none">
            <CountUp
              end={customScore !== undefined ? customScore : team.score}
              duration={0.6}
              preserveValue
            />
          </span>
          {cleanSuffix.length > 0 && (
            <span className="text-[10px] font-broadway uppercase tracking-wider text-amber-200/70 shrink-0">
              {cleanSuffix}
            </span>
          )}
        </div>
      </div>
    );
  }

  // MODO LOBBY: TARJETA LIMPIA CENTRADA EN JUGADORES Y PUNTOS
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl p-[3px] shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${theme.lobbyBorderClass} ${className}`}
    >
      <BorderBeam colorFrom={theme.primaryHex} colorTo={theme.accentHex} duration={7} />

      <div className="bg-slate-950/90 rounded-[21px] p-4 flex flex-col justify-between h-full backdrop-blur-xl relative z-10">
        <div className="flex-1 flex flex-col min-h-0">
          {/* CABECERA UNIFICADA: NOMBRE DEL EQUIPO + PUNTOS + CARTAS */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-11 h-11 rounded-2xl bg-slate-900/95 border border-slate-700/60 flex items-center justify-center shadow-md shrink-0"
                style={{ boxShadow: `0 0 12px ${theme.glowColor}` }}
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
                  size={24}
                  color={theme.accentHex}
                  weight="fill"
                  glow={theme.glowColor}
                />
              </div>
              <h3 className={`text-xl sm:text-2xl font-black font-broadway uppercase tracking-wider ${theme.twText} truncate leading-tight`}>
                {team.name}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {powerCardsCount > 0 && (
                <span className="text-sm font-black font-mono text-[#f3e5ab] bg-[#d4af37]/20 border border-[#d4af37]/50 px-2.5 py-1 rounded-xl">
                  🃏 {powerCardsCount}
                </span>
              )}
              <div className="px-3 py-1 rounded-xl bg-brass-plate flex items-baseline gap-1 shadow-md">
                <span className="text-2xl sm:text-3xl font-black font-broadway text-gold-gradient leading-none">
                  <CountUp end={team.score} duration={1.2} preserveValue />
                </span>
                <span className="text-xs font-black text-[#d4af37] font-broadway">PTS</span>
              </div>
            </div>
          </div>

          {/* LISTA DE JUGADORES PROTAGONISTA (AVATARES Y NOMBRES GRANDES) */}
          <div className="mt-3 space-y-2 overflow-y-auto flex-1 pr-1">
            {members.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl px-3.5 py-2 flex items-center justify-between transition-all bg-slate-900/90 border border-slate-700/60 text-slate-100"
              >
                <div className="flex items-center gap-3 truncate min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-[#d4af37]/40 shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                    <img
                      src={generateAvatarDataUri(m.avatar_seed || m.nickname, (m.avatar_style as any) || 'avataaars')}
                      alt={m.nickname}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {m.badge_emoji && (
                    <TwemojiText className="text-base shrink-0">{m.badge_emoji}</TwemojiText>
                  )}
                  <span className="text-base sm:text-lg font-bold truncate">{m.nickname}</span>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="h-full min-h-[90px] flex items-center justify-center text-slate-500 text-base font-vintage italic">
                Sin jugadores
              </div>
            )}
          </div>
        </div>

        {/* MONTAÑA DE FICHAS EN LA BASE (SOLO SI HAY PUNTOS EN JUEGO) */}
        {maxRoomScore > 0 && (
          <div className="relative mt-2 pt-2 border-t border-slate-800/80 flex flex-col items-center shrink-0">
            <CasinoChipMountain
              score={team.score}
              theme={theme}
              isLobby={variant === 'lobby'}
              maxRoomScore={maxRoomScore}
              className="w-full"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};


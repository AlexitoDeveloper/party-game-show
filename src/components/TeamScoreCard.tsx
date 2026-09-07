import React from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { TeamTheme } from '../lib/teamThemes';
import { BorderBeam } from './BorderBeam';
import CountUp from 'react-countup';
import { GameIcon } from './GameIcon';
import { TwemojiText } from './TwemojiText';
import { generateAvatarDataUri } from '../lib/dicebear';

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
        className={`bg-slate-900/85 border ${theme.twBorder} rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-lg transition-all duration-300 relative overflow-hidden ${
          isLeader ? 'ring-2 ring-amber-400/70 shadow-amber-500/20' : ''
        } ${className}`}
      >
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
            <span className={`text-xs font-black uppercase truncate ${theme.twText}`}>
              {team.name}
            </span>
            {powerCardsCount > 0 && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 rounded-md font-bold font-mono">
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
              <span className="text-[10px] bg-orange-500/30 text-orange-300 border border-orange-500/60 px-1.5 py-0.5 rounded-md font-black animate-pulse shadow-sm shadow-orange-500/30">
                💣
              </span>
            )}
          </div>
          {teamCaptain && (
            <span className="text-[10px] text-amber-300/90 font-bold truncate flex items-center gap-1 mt-0.5">
              <Crown className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
              {teamCaptain.nickname}
            </span>
          )}
        </div>
        <div className="text-right whitespace-nowrap pl-2 font-mono text-sm font-black text-white">
          <CountUp end={team.score} duration={0.9} preserveValue suffix=" pts" />
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
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                  Equipo {team.team_index}
                </span>
                <h3 className={`text-lg font-black uppercase ${theme.twText} truncate leading-tight`}>
                  {team.name}
                </h3>
              </div>
            </div>

            {/* Indicador discreto del color oficial */}
            <span
              className={`w-3.5 h-3.5 rounded-full ${theme.twBg} shrink-0 ${
                theme.index === 4 ? 'border border-slate-300' : theme.index === 5 ? 'border border-zinc-400' : ''
              }`}
            />
          </div>

          {/* MARCADOR DE PUNTUACIÓN */}
          <div className="my-3 py-2.5 px-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">
                PUNTUACIÓN
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-4xl font-black font-mono text-white leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  <CountUp end={team.score} duration={1.2} preserveValue />
                </span>
                <span className="text-[11px] font-black text-amber-400 font-arcade">PTS</span>
              </div>
            </div>
          </div>

          {/* CARTAS DE PODER ASIGNADAS (MÁXIMO 3) */}
          <div className="mb-2 py-1.5 px-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <span>🃏 Cartas de Poder:</span>
            </span>
            <span className="text-xs font-black font-mono text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-lg">
              {powerCardsCount} / 3
            </span>
          </div>

          {/* LISTA DE JUGADORES / MIEMBROS DEL EQUIPO */}
          <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[290px] pr-1">
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
              <div className="text-center py-8 text-slate-500 text-xs italic">
                Esperando reclutas...
              </div>
            )}
          </div>
        </div>

        {/* PIE DE TARJETA: TOTAL JUGADORES */}
        <div className="pt-2.5 border-t border-slate-800/80 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {members.length} {members.length === 1 ? 'jugador' : 'jugadores'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

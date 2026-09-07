import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Crown } from '@phosphor-icons/react';
import { generateAvatarDataUri, DiceBearStyle } from '../lib/dicebear';
import { TwemojiText } from './TwemojiText';
import { GameIcon } from './GameIcon';
import { getTeamTheme } from '../lib/teamThemes';

export interface LobbyPlayerCardProps {
  nickname: string;
  avatarSeed?: string;
  avatarStyle?: DiceBearStyle;
  badgeEmoji?: string;
  teamIndex: number;
  isCaptain?: boolean;
  score?: number;
  className?: string;
}

/**
 * LobbyPlayerCard: Tarjeta de jugador en el lobby o partida.
 * Combina:
 * 1. Avatar dinámico vectorial de DiceBear (estilo 'avataaars' o 'adventurer')
 * 2. Emblema personal con Twemoji SVG unificado
 * 3. Icono oficial del equipo con Phosphor Icons y resplandor neón LED
 * 4. Insignia de Capitán y puntuación
 */
export const LobbyPlayerCard: React.FC<LobbyPlayerCardProps> = ({
  nickname,
  avatarSeed,
  avatarStyle = 'avataaars',
  badgeEmoji,
  teamIndex,
  isCaptain = false,
  score,
  className = '',
}) => {
  const theme = getTeamTheme(teamIndex);

  // Avatar dinámico basado en seed o nickname
  const avatarDataUri = useMemo(() => {
    return generateAvatarDataUri(avatarSeed || nickname, avatarStyle);
  }, [avatarSeed, nickname, avatarStyle]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`relative rounded-2xl p-3 bg-slate-900/90 border-2 transition-all flex items-center justify-between gap-3 shadow-lg backdrop-blur-md ${
        isCaptain
          ? 'border-amber-400/80 shadow-amber-500/15 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900'
          : `${theme.twBorder} shadow-black/40`
      } ${className}`}
    >
      {/* 1. SECCIÓN IZQUIERDA: AVATAR DE DICEBEAR + EMBLEMA TWEMOJI */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700/80 p-0.5 overflow-hidden flex items-center justify-center shadow-inner">
            <img
              src={avatarDataUri}
              alt={nickname}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Distintivo de Twemoji en la esquina inferior */}
          {badgeEmoji && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
              <TwemojiText className="text-xs">{badgeEmoji}</TwemojiText>
            </div>
          )}
        </div>

        {/* 2. NOMBRE DE JUGADOR Y STATUS */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            {isCaptain && (
              <Crown size={15} weight="fill" className="text-amber-400 shrink-0 animate-pulse" />
            )}
            <span className="text-sm font-black text-white truncate tracking-wide">
              {nickname}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {theme.name}
            </span>
            {isCaptain && (
              <span className="text-[8px] font-black uppercase text-amber-300 bg-amber-400/15 border border-amber-400/40 px-1 py-0.2 rounded tracking-wider">
                CAPITÁN
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN DERECHA: ICONO PHOSPHOR DEL EQUIPO CON GLOW NEÓN */}
      <div className="flex items-center gap-2 shrink-0">
        {score !== undefined && (
          <span className="text-xs font-black font-mono text-white bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
            {score} pts
          </span>
        )}

        <div
          className="w-8 h-8 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center shadow-sm"
          style={{
            boxShadow: `0 0 10px ${theme.glowColor}`,
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
            size={18}
            color={theme.accentHex}
            weight="fill"
            glow={theme.accentHex}
          />
        </div>
      </div>
    </motion.div>
  );
};

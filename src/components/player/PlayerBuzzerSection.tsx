import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert } from 'lucide-react';
import { ArcadeBuzzer } from '../ArcadeBuzzer';
import { CaptainDuelState, BuzzerPressPayload, Player } from '../../lib/types';
import { getTeamTheme } from '../../lib/teamThemes';

interface PlayerBuzzerSectionProps {
  isBanned: boolean;
  bannedShake: boolean;
  onBannedClick: () => void;
  captainDuel?: CaptainDuelState | null;
  player: Player | null;
  selectedTeamIndex: number;
  isLocked: boolean;
  onBuzzerClick: () => void;
  isMeWinner: boolean;
  winner: BuzzerPressPayload | null;
  isBenchMode?: boolean;
  representativeNames?: string[];
}

export const PlayerBuzzerSection: React.FC<PlayerBuzzerSectionProps> = ({
  isBanned,
  bannedShake,
  onBannedClick,
  captainDuel,
  player,
  selectedTeamIndex,
  isLocked,
  onBuzzerClick,
  isMeWinner,
  winner,
  isBenchMode = false,
  representativeNames = [],
}) => {
  return (
    <div className="my-auto flex flex-col items-center w-full">
      {isBanned ? (
        /* PULSADOR SELLADO CON CADENAS DE HIERRO Y CANDADO DE LATÓN */
        <motion.div
          animate={bannedShake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          onClick={onBannedClick}
          className="relative w-64 h-64 rounded-full bg-[#150808] border-8 border-red-900 flex flex-col items-center justify-center p-5 text-center shadow-2xl cursor-pointer select-none group active:scale-95 transition-transform overflow-hidden deco-card-frame"
          title="¡Toca para intentar forcejear el candado!"
        >
          {/* FONDO METÁLICO CON RAYAS DE PELIGRO */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(185,28,28,0.15)_0px,rgba(185,28,28,0.15)_15px,transparent_15px,transparent_30px)]" />

          {/* CADENAS DE HIERRO CRUZADAS */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-7 bg-gradient-to-r from-stone-900 via-stone-700 to-stone-900 border-y-2 border-stone-950 rotate-45 shadow-2xl flex items-center justify-around px-2 z-10">
            <span className="text-xs opacity-70">⛓️</span>
            <span className="text-[9px] font-broadway uppercase tracking-widest text-stone-300 font-black">BLOQUEADO</span>
            <span className="text-xs opacity-70">⛓️</span>
          </div>
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-7 bg-gradient-to-r from-stone-900 via-stone-700 to-stone-900 border-y-2 border-stone-950 -rotate-45 shadow-2xl flex items-center justify-around px-2 z-10">
            <span className="text-xs opacity-70">⛓️</span>
            <span className="text-[9px] font-broadway uppercase tracking-widest text-stone-300 font-black">CLAUSURA</span>
            <span className="text-xs opacity-70">⛓️</span>
          </div>

          {/* CANDADO DE LATÓN MACIZO EN RELIEVE */}
          <div className="relative z-20 w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-[#b38f2a] to-amber-900 border-4 border-[#f5eedb] flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform">
            <Lock className="w-10 h-10 text-slate-950 fill-slate-950" />
            <span className="text-[9px] font-broadway uppercase tracking-widest text-slate-950 font-black mt-0.5">
              SELLADO
            </span>
          </div>

          <div className="relative z-20 mt-3 bg-black/90 px-3 py-1 rounded-full border border-red-500/60 shadow-md">
            <span className="text-[10px] font-broadway uppercase text-red-300 tracking-wider">
              ¡TOCA PARA FORCEJEAR!
            </span>
          </div>
        </motion.div>
      ) : isBenchMode ? (
        <div className="w-64 h-64 rounded-full bg-[#0c0c14]/95 border-8 border-amber-600/40 flex flex-col items-center justify-center p-5 text-center shadow-deco-gold opacity-90 deco-card-frame">
          <span className="text-3xl mb-1">🍿</span>
          <span className="text-sm font-broadway uppercase text-gold-gradient tracking-wide">
            EN EL BANQUILLO
          </span>
          <span className="text-[11px] font-vintage text-amber-200/80 font-bold mt-1 max-w-[190px] leading-tight">
            Asesora a tu equipo en la mesa
          </span>
          {representativeNames && representativeNames.length > 0 && (
            <div className="mt-2 px-2.5 py-1 rounded-full bg-[#161622] border border-[#d4af37]/30 max-w-[200px]">
              <span className="text-[9px] font-broadway text-amber-300 block truncate">
                ⭐ {representativeNames.join(', ')}
              </span>
            </div>
          )}
        </div>
      ) : captainDuel?.isActive && !player?.is_captain ? (
        <div className="w-64 h-64 rounded-full bg-[#0c0c14]/95 border-8 border-[#d4af37]/50 flex flex-col items-center justify-center p-6 text-center shadow-deco-gold opacity-85 deco-card-frame">
          <ShieldAlert className="w-12 h-12 text-[#d4af37] mb-2" />
          <span className="text-sm font-broadway uppercase text-gold-gradient">
            DUELO DE CAPITANES
          </span>
          <span className="text-[11px] font-vintage text-amber-200/80 font-bold mt-1 max-w-[170px]">
            Solo tu Capitán 👑 puede presionar en este reto
          </span>
        </div>
      ) : (
        <ArcadeBuzzer
          theme={getTeamTheme(selectedTeamIndex)}
          isLocked={isLocked}
          isDuelActive={captainDuel?.isActive}
          onPress={onBuzzerClick}
          isMeWinner={isMeWinner}
        />
      )}

      {/* ESTADO EN TIEMPO REAL CON ALTURA FIJA PARA EVITAR DESPLAZAMIENTOS */}
      <div className="mt-4 h-14 flex items-center justify-center text-center px-2">
        {isBenchMode ? (
          <span className="text-xs font-vintage font-bold text-amber-300/70 uppercase tracking-wider block">
            Tus compañeros tienen el pulsador en el ruedo
          </span>
        ) : isLocked ? (
          isMeWinner ? (
            <span className="text-sm font-broadway text-gold-gradient uppercase tracking-wider block drop-shadow-md">
              🎉 ¡HAS SIDO EL MÁS RÁPIDO! RESPONDE AHORA
            </span>
          ) : (
            <span className="text-xs font-vintage font-bold text-amber-200/70 uppercase tracking-wider block">
              Otro equipo ha pulsado primero ({winner?.teamName})
            </span>
          )
        ) : (
          <span className="text-xs font-vintage font-bold text-amber-300/80 uppercase tracking-widest block">
            Mantén el dedo listo sobre el timbre de bronce
          </span>
        )}
      </div>
    </div>
  );
};

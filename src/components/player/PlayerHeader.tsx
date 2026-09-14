import React, { useState } from 'react';
import { Crown, LogOut, Radio, Trophy } from 'lucide-react';
import { Player, Team } from '../../lib/types';
import { TeamCatalogItem } from '../../lib/constants';
import { DiceBearStyle, generateAvatarDataUri } from '../../lib/dicebear';
import { TwemojiText } from '../TwemojiText';
import { FullscreenButton } from '../common/FullscreenButton';

interface PlayerHeaderProps {
  roomCode: string;
  isJoined: boolean;
  player: Player | null;
  nickname: string;
  avatarSeed: string;
  avatarStyle: DiceBearStyle;
  selectedTeam: TeamCatalogItem | null;
  activeTeams: Team[];
  onLogout: () => void;
}

/**
 * PlayerHeader: Cabecera Art Déco para el dispositivo móvil del jugador.
 * Incluye placa de latón con código de sala, medallón de avatar, corona de capitán,
 * marcador de puntos en vivo y botón de salida con modal de confirmación.
 */
export const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  roomCode,
  isJoined,
  player,
  nickname,
  avatarSeed,
  avatarStyle,
  selectedTeam,
  activeTeams,
  onLogout,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Obtener puntos actuales del equipo del jugador
  const teamScore = React.useMemo(() => {
    if (!selectedTeam) return 0;
    const currentTeam = activeTeams.find((t) => t.team_index === selectedTeam.index);
    return currentTeam?.score ?? 0;
  }, [selectedTeam, activeTeams]);

  return (
    <>
      <header className="flex items-center justify-between border-b-2 border-[#d4af37]/35 pb-2.5 z-20 relative select-none">
        {/* LADO IZQUIERDO: PLACA DE SALA */}
        <div className="flex items-center gap-2">
          <div className="bg-[#0e0e16]/90 border border-[#d4af37]/50 rounded-xl px-2.5 py-1 shadow-inner">
            <span className="text-[9px] uppercase font-vintage tracking-widest text-amber-200/60 block leading-none">
              SALA
            </span>
            <span className="text-xl font-broadway text-gold-gradient block leading-tight font-black">
              {roomCode}
            </span>
          </div>

          {/* MARCADOR DE PUNTOS EN VIVO DE LA MESA */}
          {isJoined && selectedTeam && (
            <div className="bg-[#121008] border border-[#d4af37]/40 rounded-xl px-2 py-1 flex items-center gap-1.5 shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <div className="leading-tight">
                <span className="text-[8px] font-vintage uppercase text-amber-300/70 block">PUNTOS</span>
                <span className="text-xs font-broadway font-black text-white">{teamScore}</span>
              </div>
            </div>
          )}
        </div>

        {/* LADO DERECHO: PERFIL DEL JUGADOR, CAPITÁN, PANTALLA COMPLETA Y SALIDA */}
        {isJoined ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Medallón de Avatar con Corona si es Capitán */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[#0c0c14] border-2 border-[#d4af37] p-0.5 overflow-hidden flex items-center justify-center shadow-deco-gold">
                <img
                  src={generateAvatarDataUri(
                    player?.avatar_seed || avatarSeed || nickname,
                    (player?.avatar_style as any) || avatarStyle
                  )}
                  alt="Avatar"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Insignia de Capitán de la Mesa */}
              {player?.is_captain && (
                <div
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold-gradient border-2 border-slate-950 flex items-center justify-center shadow-lg animate-bounce"
                  title="¡Eres el Capitán de tu Bando!"
                >
                  <Crown className="w-3 h-3 text-slate-950 fill-slate-950" />
                </div>
              )}

              {/* Badge Emoji */}
              {player?.badge_emoji && !player?.is_captain && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0c0c14] border border-[#d4af37] flex items-center justify-center shadow">
                  <TwemojiText className="text-[10px]">{player.badge_emoji}</TwemojiText>
                </div>
              )}
            </div>

            {/* Datos del Jugador y Equipo */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-1">
                {player?.is_captain && (
                  <span className="text-[9px] font-broadway uppercase tracking-wider text-amber-400 font-bold">
                    CAPITÁN
                  </span>
                )}
                <span className="text-[9px] uppercase font-vintage tracking-widest text-amber-200/60 block leading-tight">
                  MESA
                </span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span className="text-sm font-broadway uppercase tracking-wide text-white font-black truncate max-w-[70px] xs:max-w-[85px] sm:max-w-[110px]">
                  {nickname}
                </span>
                {selectedTeam && (
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${selectedTeam.twBg} ring-1 ring-white/40`}
                    title={selectedTeam.name}
                  />
                )}
              </div>
            </div>

            {/* Acciones: Pantalla Completa y Salida */}
            <div className="flex items-center gap-1 ml-0.5">
              <FullscreenButton size="md" />
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="w-8 h-8 rounded-xl bg-[#141010] border border-red-900/60 text-red-400 hover:text-red-200 flex items-center justify-center active:scale-95 transition-all"
                title="Salir de la mesa"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-vintage font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden xs:inline">Sintonizando...</span>
            </div>
            <FullscreenButton size="md" />
          </div>
        )}
      </header>

      {/* DIÁLOGO MODAL DE CONFIRMACIÓN DE SALIDA */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e16] border-2 border-[#d4af37] rounded-3xl p-5 max-w-xs w-full text-center space-y-3 shadow-deco-gold animate-scaleUp">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-950/70 border border-red-500/50 flex items-center justify-center text-red-400 text-xl">
              🚪
            </div>
            <h4 className="text-base font-broadway uppercase text-gold-gradient">¿Abandonar el Speakeasy?</h4>
            <p className="text-xs font-vintage text-amber-200/80">
              Si sales ahora perderás tu conexión con tu mesa y tu turno de juego en curso.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 font-broadway text-xs uppercase"
              >
                Permanecer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onLogout();
                }}
                className="py-2.5 rounded-xl bg-red-800 text-white font-broadway text-xs uppercase hover:bg-red-700 shadow-md"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

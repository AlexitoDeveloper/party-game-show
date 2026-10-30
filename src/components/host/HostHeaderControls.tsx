import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tv,
  Users,
  CheckCircle2,
  Trophy,
  LogOut,
  ArrowLeft,
  Crown,
  Award,
  Play,
  Cast,
} from 'lucide-react';
import { Room } from '../../lib/types';
import { GameDefinition, GAMES_CATALOG } from '../../lib/games';
import { FullscreenButton } from '../common/FullscreenButton';
import { HostTvCastModal } from './HostTvCastModal';

interface HostHeaderControlsProps {
  room: Room;
  roomCode: string;
  playersCount: number;
  activeGame: GameDefinition;
  podiumPage: 'podium' | 'medals';
  onFinishTest: () => void;
  onFinishShowAndShowGazette: () => void;
  onReturnToLobby: () => void;
  onSetPodiumPage: (page: 'podium' | 'medals') => void;
  onSelectGame: (game: GameDefinition) => void;
  onSetPresentationSlide: (slide: number) => void;
}

export const HostHeaderControls: React.FC<HostHeaderControlsProps> = ({
  room,
  roomCode,
  playersCount,
  activeGame,
  podiumPage,
  onFinishTest,
  onFinishShowAndShowGazette,
  onReturnToLobby,
  onSetPodiumPage,
  onSelectGame,
  onSetPresentationSlide,
}) => {
  const navigate = useNavigate();
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);

  const handleExitRoom = () => {
    const confirmed = window.confirm(
      '¿Seguro que deseas salir de la sala de control del anfitrión y volver al menú principal? La sesión permanecerá activa en la TV.'
    );
    if (confirmed) {
      navigate('/');
    }
  };

  return (
    <div className="space-y-2">
      <header className="flex items-center justify-between bg-[#0c0c14]/95 border border-[#d4af37]/40 px-3 py-2 rounded-2xl gap-2 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-lg font-broadway uppercase tracking-wider text-gold-gradient truncate">
            {roomCode}
          </h1>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-broadway uppercase tracking-wider shrink-0 ${
              room.status === 'lobby'
                ? 'bg-amber-500/15 text-amber-300 border border-[#d4af37]/40'
                : room.status === 'presentation'
                ? 'bg-gold-gradient text-slate-950 font-black'
                : room.status === 'podium' || room.status === 'ended'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {room.status === 'lobby'
              ? 'Lobby'
              : room.status === 'presentation'
              ? 'Diapositivas'
              : room.status === 'podium' || room.status === 'ended'
              ? 'Podio'
              : activeGame.emoji + ' En Juego'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div
            className="bg-[#14141e] border border-[#d4af37]/30 px-2 py-1 rounded-xl text-xs font-vintage font-bold flex items-center gap-1 text-amber-300"
            title="Jugadores conectados"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-broadway">{playersCount}</span>
          </div>

          <button
            onClick={() => setIsCastModalOpen(true)}
            className="bg-[#14141e] hover:bg-[#1c1c2a] border border-[#d4af37]/40 px-2.5 py-1 rounded-xl text-xs font-broadway text-amber-200 flex items-center gap-1.5 transition-all active:scale-95"
            title="Transmitir sala a Smart TV (LG webOS / TCL / Cast)"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span>TV</span>
          </button>

          {room.status !== 'lobby' && (
            <button
              onClick={onReturnToLobby}
              className="bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/40 text-amber-200 font-broadway text-xs px-2 py-1 rounded-xl flex items-center gap-1 active:scale-95 transition-all"
              title="Volver al Lobby de espera"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Lobby</span>
            </button>
          )}

          <FullscreenButton size="sm" showLabel={false} />

          <button
            onClick={handleExitRoom}
            className="p-1.5 rounded-xl bg-[#14141e] hover:bg-red-950/40 border border-[#d4af37]/30 hover:border-red-500/50 text-amber-200/60 hover:text-red-300 transition-all shrink-0"
            title="Salir al menú principal"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* MANDO COMPACTO DE DIAPOSITIVAS CUANDO ESTÁ EN PRESENTACIÓN */}
      {room.status === 'presentation' && (
        <div className="p-2.5 bg-[#0c0c14]/95 border border-[#d4af37]/50 rounded-2xl flex items-center justify-between gap-2 shadow-deco-gold">
          <div className="grid grid-cols-2 gap-1.5 flex-1">
            <button
              onClick={() => onSetPresentationSlide(0)}
              className={`py-2 px-2.5 rounded-xl border text-xs font-broadway uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                (room.presentation_slide || 0) === 0
                  ? 'bg-gold-gradient text-slate-950 border-[#f5eedb] font-black'
                  : 'bg-[#14141e] text-amber-200/70 border-[#d4af37]/30'
              }`}
            >
              <span>🏆</span>
              <span className="truncate">1. Juegos</span>
            </button>
            <button
              onClick={() => onSetPresentationSlide(1)}
              className={`py-2 px-2.5 rounded-xl border text-xs font-broadway uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                (room.presentation_slide || 0) === 1
                  ? 'bg-gold-gradient text-slate-950 border-[#f5eedb] font-black'
                  : 'bg-[#14141e] text-amber-200/70 border-[#d4af37]/30'
              }`}
            >
              <span>🃏</span>
              <span className="truncate">2. Cartas</span>
            </button>
          </div>
          <button
            onClick={() => onSelectGame(GAMES_CATALOG[0])}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-broadway font-black text-xs uppercase px-3 py-2 rounded-xl flex items-center gap-1 shadow active:scale-95 transition-all shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Juego 1</span>
          </button>
        </div>
      )}

      <HostTvCastModal
        isOpen={isCastModalOpen}
        onClose={() => setIsCastModalOpen(false)}
        roomCode={roomCode}
      />
    </div>
  );
};

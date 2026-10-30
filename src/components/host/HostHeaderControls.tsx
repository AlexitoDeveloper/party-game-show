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
  QrCode,
} from 'lucide-react';
import { Room } from '../../lib/types';
import { GameDefinition, GAMES_CATALOG } from '../../lib/games';
import { FullscreenButton } from '../common/FullscreenButton';
import { HostTvCastModal } from './HostTvCastModal';
import { Button } from '../ui';

interface HostHeaderControlsProps {
  room: Room;
  roomCode: string;
  playersCount: number;
  activeGame: GameDefinition;
  podiumPage: 'podium' | 'medals';
  isTvQrOpen?: boolean;
  onToggleTvQr?: () => void;
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
  isTvQrOpen = false,
  onToggleTvQr,
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

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCastModalOpen(true)}
            title="Transmitir sala a Smart TV (LG webOS / TCL / Cast)"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span>TV</span>
          </Button>

          {onToggleTvQr && (
            <Button
              variant={isTvQrOpen ? 'gold' : 'secondary'}
              size="sm"
              onClick={onToggleTvQr}
              title="Proyectar / Ocultar código QR en la pantalla de TV"
            >
              <QrCode className={`w-3.5 h-3.5 ${isTvQrOpen ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{isTvQrOpen ? 'Ocultar QR' : 'QR TV'}</span>
            </Button>
          )}

          {room.status !== 'lobby' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onReturnToLobby}
              title="Volver al Lobby de espera"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Lobby</span>
            </Button>
          )}

          <FullscreenButton size="sm" showLabel={false} />

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExitRoom}
            className="!p-1.5 hover:!bg-red-950/40 hover:!border-red-500/50 text-amber-200/60 hover:!text-red-300 shrink-0"
            title="Salir al menú principal"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* MANDO COMPACTO DE DIAPOSITIVAS CUANDO ESTÁ EN PRESENTACIÓN */}
      {room.status === 'presentation' && (
        <div className="p-2.5 bg-[#0c0c14]/95 border border-[#d4af37]/50 rounded-2xl flex items-center justify-between gap-2 shadow-deco-gold">
          <div className="grid grid-cols-2 gap-1.5 flex-1">
            <Button
              variant={(room.presentation_slide || 0) === 0 ? 'gold' : 'secondary'}
              size="sm"
              onClick={() => onSetPresentationSlide(0)}
              className="py-2"
            >
              <span>🏆</span>
              <span className="truncate">1. Juegos</span>
            </Button>
            <Button
              variant={(room.presentation_slide || 0) === 1 ? 'gold' : 'secondary'}
              size="sm"
              onClick={() => onSetPresentationSlide(1)}
              className="py-2"
            >
              <span>🃏</span>
              <span className="truncate">2. Cartas</span>
            </Button>
          </div>
          <Button
            variant="gold"
            size="sm"
            onClick={() => onSelectGame(GAMES_CATALOG[0])}
            className="!bg-emerald-500 hover:!bg-emerald-400 !text-slate-950 px-3 py-2 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Juego 1</span>
          </Button>
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

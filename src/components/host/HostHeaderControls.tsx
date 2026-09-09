import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Room } from '../../lib/types';
import { GameDefinition, GAMES_CATALOG } from '../../lib/games';

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

  const handleExitRoom = () => {
    const confirmed = window.confirm(
      '¿Seguro que deseas salir de la sala de control del anfitrión y volver al menú principal? La sesión permanecerá activa en la TV.'
    );
    if (confirmed) {
      navigate('/');
    }
  };

  return (
    <>
      <header className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-broadway uppercase tracking-wider text-gold-gradient truncate">
              Sala {roomCode}
            </h1>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-broadway uppercase tracking-wider ${
                room.status === 'lobby'
                  ? 'bg-amber-500/15 text-amber-300 border border-[#d4af37]/40'
                  : room.status === 'presentation'
                  ? 'bg-gold-gradient text-slate-950 font-black'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {room.status === 'lobby' ? 'Lobby' : room.status === 'presentation' ? 'Presentación' : 'En Juego'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <Link
            to={`/room/${roomCode}/tv`}
            target="_blank"
            className="bg-[#0c0c14] hover:bg-[#14141e] border-2 border-[#d4af37]/40 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-vintage font-bold text-amber-200 flex items-center gap-1.5 transition-all shadow-sm"
            title="Abrir pantalla TV"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-broadway text-xs">Abrir TV</span>
            <span className="sm:hidden font-broadway text-xs">TV</span>
          </Link>
          <div className="bg-[#0c0c14] border border-[#d4af37]/30 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-vintage font-bold flex items-center gap-1.5 text-amber-300 shadow-sm">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-broadway">{playersCount}</span>
            <span className="hidden sm:inline font-vintage">conectados</span>
          </div>
          <button
            onClick={handleExitRoom}
            className="p-2 rounded-xl bg-[#0c0c14] hover:bg-red-950/40 border border-[#d4af37]/40 hover:border-red-500/50 text-amber-200/60 hover:text-red-300 transition-all shadow-sm shrink-0"
            title="Salir de la sala (pedirá confirmación)"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400/80 hover:text-red-400" />
          </button>
        </div>
      </header>

      {/* BARRA DE ESTADO GLOBAL Y BOTÓN PRINCIPAL */}
      <div
        className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-deco-gold ${
          room.status === 'playing'
            ? 'bg-[#0c0c14]/95 border-[#d4af37]/60'
            : room.status === 'presentation'
            ? 'bg-[#120f18]/95 border-[#d4af37]/60'
            : 'bg-[#0c0c14]/90 border-[#d4af37]/35'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          <div className="text-2xl sm:text-3xl p-1.5 sm:p-2 bg-[#14141e] rounded-xl sm:rounded-2xl border border-[#d4af37]/30 flex-shrink-0 shadow-inner">
            {room.status === 'presentation'
              ? '✨'
              : room.status === 'podium' || room.status === 'ended'
              ? '🏆'
              : activeGame.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] uppercase font-vintage font-bold tracking-widest text-amber-300 block truncate">
              {room.status === 'lobby'
                ? 'SALA EN ESPERA'
                : room.status === 'presentation'
                ? 'PRESENTACIÓN EN TV'
                : room.status === 'podium' || room.status === 'ended'
                ? 'CEREMONIA DE CLAUSURA'
                : activeGame.category}
            </span>
            <span className="text-sm sm:text-base font-broadway uppercase tracking-wide text-white block truncate">
              {room.status === 'lobby'
                ? 'Lobby de Convocatoria'
                : room.status === 'presentation'
                ? ((room.presentation_slide || 0) === 1 ? 'Cartas y Rarezas' : '10 Minijuegos Show')
                : room.status === 'podium' || room.status === 'ended'
                ? 'The Speakeasy Gazette'
                : activeGame.title}
            </span>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN SEGÚN ESTADO */}
        <div className="w-full sm:w-auto flex-shrink-0">
          {room.status === 'playing' ? (
            <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
              <button
                onClick={onFinishTest}
                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-broadway text-xs uppercase px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 active:scale-95 transition-all border border-red-400/40"
                title="Finalizar prueba actual, limpiar efectos y abrir veredicto"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Finalizar Prueba</span>
                <span className="sm:hidden">Finalizar</span>
              </button>

              <button
                onClick={onFinishShowAndShowGazette}
                className="bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-xs uppercase px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 shadow-deco-gold active:scale-95 transition-all border border-[#f5eedb]/40"
                title="Proyectar portada de The Speakeasy Gazette y podio final en la TV"
              >
                <Trophy className="w-3.5 h-3.5 fill-slate-950 text-slate-950 shrink-0" />
                <span className="hidden sm:inline">Fin de Velada</span>
                <span className="sm:hidden">Periódico</span>
              </button>

              <button
                onClick={onReturnToLobby}
                className="bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/40 text-amber-200 font-broadway text-xs uppercase px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1 shadow active:scale-95 transition-all"
                title="Volver al Lobby"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden md:inline">Lobby</span>
                <span className="md:hidden">Salir</span>
              </button>
            </div>
          ) : room.status === 'podium' || room.status === 'ended' ? (
            <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
              <button
                onClick={() => onSetPodiumPage('podium')}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl font-broadway text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                  podiumPage === 'podium'
                    ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold border border-[#f5eedb]/40'
                    : 'bg-[#14141e] text-amber-200/80 border border-[#d4af37]/30 hover:text-white'
                }`}
                title="Mostrar Gran Campeón en la TV"
              >
                <Crown className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">🏆 Ver Campeón</span>
                <span className="sm:hidden">Campeón</span>
              </button>
              <button
                onClick={() => onSetPodiumPage('medals')}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl font-broadway text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                  podiumPage === 'medals'
                    ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold border border-[#f5eedb]/40'
                    : 'bg-[#14141e] text-amber-200/80 border border-[#d4af37]/30 hover:text-white'
                }`}
                title="Mostrar Medallas y Salón de la Infamia en la TV"
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">🎖️ Ver Medallas</span>
                <span className="sm:hidden">Medallas</span>
              </button>
              <button
                onClick={onReturnToLobby}
                className="bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/40 text-amber-200 font-broadway text-xs uppercase px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl flex items-center justify-center gap-1 shadow active:scale-95 transition-all"
                title="Volver al Lobby de convocatoria"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Salón</span>
              </button>
            </div>
          ) : room.status === 'presentation' ? (
            <>
              <button
                onClick={() => onSelectGame(GAMES_CATALOG[0])}
                className="bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-xs uppercase px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 shadow-deco-gold active:scale-95 transition-all border border-[#f5eedb]/40"
                title="Iniciar Prueba 1: Adivina la Canción"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span className="hidden sm:inline">Empezar Juego 1</span>
                <span className="sm:hidden">Juego 1</span>
              </button>

              <button
                onClick={onReturnToLobby}
                className="bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/40 text-amber-200 font-broadway text-xs uppercase p-2 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center gap-1 shadow active:scale-95 transition-all"
                title="Volver al Lobby"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Lobby</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectGame(GAMES_CATALOG[0])}
                className="bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-xs uppercase px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 shadow-deco-gold active:scale-95 transition-all border border-[#f5eedb]/40"
                title="Iniciar la velada con el Juego 1"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Iniciar Show</span>
              </button>

              <button
                onClick={onFinishShowAndShowGazette}
                className="bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/40 text-amber-300 hover:text-white font-broadway text-xs uppercase px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 shadow active:scale-95 transition-all"
                title="Ver portada del periódico The Speakeasy Gazette"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Ver Periódico</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MANDO REMOTO DE LA PRESENTACIÓN EN MÓVIL (CUANDO STATUS ES PRESENTATION) */}
      {room.status === 'presentation' && (
        <div className="p-3 sm:p-4 bg-[#0c0c14]/90 border-2 border-[#d4af37]/45 rounded-2xl sm:rounded-3xl space-y-3 shadow-deco-gold">
          <div className="flex items-center justify-between">
            <span className="text-xs font-broadway uppercase tracking-wider text-gold-gradient flex items-center gap-1.5">
              <span>📽️</span> Mando de Diapositivas en TV:
            </span>
            <span className="text-[11px] font-vintage text-amber-200/70">
              Diapositiva {(room.presentation_slide || 0) + 1} de 2
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSetPresentationSlide(0)}
              className={`p-2.5 sm:p-3 rounded-xl border text-xs font-broadway uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                (room.presentation_slide || 0) === 0
                  ? 'bg-gold-gradient text-slate-950 border-[#f5eedb] shadow-deco-gold font-black'
                  : 'bg-[#14141e] text-amber-200/70 border-[#d4af37]/30 hover:bg-[#1a1a28]'
              }`}
            >
              <span>🏆</span>
              <span className="truncate">1. Los 10 Minijuegos</span>
            </button>
            <button
              onClick={() => onSetPresentationSlide(1)}
              className={`p-2.5 sm:p-3 rounded-xl border text-xs font-broadway uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                (room.presentation_slide || 0) === 1
                  ? 'bg-gold-gradient text-slate-950 border-[#f5eedb] shadow-deco-gold font-black'
                  : 'bg-[#14141e] text-amber-200/70 border-[#d4af37]/30 hover:bg-[#1a1a28]'
              }`}
            >
              <span>🃏</span>
              <span className="truncate">2. Cartas y Rarezas</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

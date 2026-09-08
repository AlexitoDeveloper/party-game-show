import React from 'react';
import { Crown, Award, ArrowLeft, Sparkles, Play, Gamepad2 } from 'lucide-react';
import { Room } from '../../lib/types';
import { GAMES_CATALOG } from '../../lib/games';

interface HostStandbySectionProps {
  room: Room;
  podiumPage: 'podium' | 'medals';
  onSetPodiumPage: (page: 'podium' | 'medals') => void;
  onReturnToLobby: () => void;
  onStartPresentation: () => void;
  onSelectFirstGame: () => void;
  onOpenCatalog: () => void;
}

export const HostStandbySection: React.FC<HostStandbySectionProps> = ({
  room,
  podiumPage,
  onSetPodiumPage,
  onReturnToLobby,
  onStartPresentation,
  onSelectFirstGame,
  onOpenCatalog,
}) => {
  if (room.status === 'podium' || room.status === 'ended') {
    return (
      <div className="space-y-4">
        <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 shadow-deco-gold space-y-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gold-gradient text-slate-950 flex items-center justify-center mx-auto text-3xl shadow-deco-gold animate-bounce">
            🏆
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <span className="text-xs uppercase font-broadway tracking-widest text-amber-300 font-bold block">
              CEREMONIA DE CLAUSURA EN DIRECTO EN LA TV
            </span>
            <h3 className="text-2xl font-broadway uppercase text-gold-gradient">
              The Speakeasy Gazette (1931)
            </h3>
            <p className="text-xs font-vintage text-amber-100/80">
              La pantalla de TV está proyectando la portada de prensa de época, con el equipo ganador y el escenario 3D Art Déco animado.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSetPodiumPage('podium')}
              className={`px-5 py-3 rounded-2xl font-broadway text-xs uppercase flex items-center gap-2 transition-all shadow-md ${
                podiumPage === 'podium'
                  ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold border border-[#f5eedb]'
                  : 'bg-[#14141e] text-amber-200 border border-[#d4af37]/40 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>📰 Primera Plana: El Gran Golpe</span>
            </button>

            <button
              onClick={() => onSetPodiumPage('medals')}
              className={`px-5 py-3 rounded-2xl font-broadway text-xs uppercase flex items-center gap-2 transition-all shadow-md ${
                podiumPage === 'medals'
                  ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold border border-[#f5eedb]'
                  : 'bg-[#14141e] text-amber-200 border border-[#d4af37]/40 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>🎖️ Segunda Plana: Salón de la Infamia</span>
            </button>

            <button
              onClick={onReturnToLobby}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs uppercase flex items-center gap-2 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Volver al Salón (Lobby)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* MÓDULO INDIVIDUAL DE PRESENTACIÓN INICIAL DEL EVENTO */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-2 border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-3xl shrink-0 shadow-lg">
            📽️
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-purple-300 block">
              Paso Previo al Show
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">Presentación Oficial del Evento</h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md">
              Proyecta en la TV los 10 minijuegos y la explicación del funcionamiento de las cartas y sus 4 rarezas antes de comenzar a jugar.
            </p>
          </div>
        </div>
        <button
          onClick={onStartPresentation}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all shrink-0 border border-purple-400/40"
          title="Proyectar presentación oficial en la TV"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Proyectar Presentación</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border-2 border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl">
          📺
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-xl font-black text-white">Sala en Pantalla de Espera (Lobby)</h3>
          <p className="text-xs text-slate-400">
            La TV está proyectando el código QR y la formación de equipos. Selecciona un minijuego del catálogo para empezar a jugar.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onSelectFirstGame}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-green-500/25 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Empezar con {GAMES_CATALOG[0].title}</span>
          </button>
          <button
            onClick={onOpenCatalog}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs uppercase flex items-center gap-2 active:scale-95 transition-all"
          >
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            <span>Ver Catálogo Completo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

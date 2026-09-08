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
              className="px-5 py-3 rounded-2xl bg-[#14141e] hover:bg-[#1f1f2e] border border-[#d4af37]/40 text-amber-200 hover:text-white font-broadway text-xs uppercase flex items-center gap-2 active:scale-95 transition-all shadow-md"
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
      <div className="bg-gradient-to-r from-[#200b2e] via-[#0c0c14] to-[#160c24] border-2 border-purple-500/50 rounded-3xl p-5 sm:p-6 shadow-deco-gold flex flex-col sm:flex-row items-center justify-between gap-4 hell-card-frame">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 border border-purple-400/50 flex items-center justify-center text-3xl shrink-0 shadow-lg text-white">
            📽️
          </div>
          <div>
            <span className="text-[10px] uppercase font-broadway tracking-widest text-purple-300 block">
              Paso Previo al Show
            </span>
            <h3 className="text-base sm:text-lg font-broadway uppercase tracking-wide text-gold-gradient">Presentación Oficial del Evento</h3>
            <p className="text-xs text-amber-100/70 font-vintage mt-0.5 max-w-md">
              Proyecta en la TV los 10 minijuegos clandestinos y las reglas de las cartas de poder y sus 4 rarezas antes de comenzar a jugar.
            </p>
          </div>
        </div>
        <button
          onClick={onStartPresentation}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-700 hover:brightness-110 text-white font-broadway text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 active:scale-95 transition-all shrink-0 border border-purple-400/50"
          title="Proyectar presentación oficial en la TV"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Proyectar Presentación</span>
        </button>
      </div>

      <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-8 text-center space-y-4 shadow-deco-gold hell-card-frame">
        <div className="w-16 h-16 rounded-3xl bg-gold-gradient text-slate-950 border border-[#f5eedb]/40 flex items-center justify-center mx-auto text-3xl shadow-md">
          📺
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-xl font-broadway uppercase tracking-wide text-gold-gradient">Sala en Pantalla de Espera (Lobby)</h3>
          <p className="text-xs font-vintage text-amber-100/70">
            La TV está proyectando el código QR y la formación de equipos de casino. Selecciona un minijuego del catálogo para empezar la velada.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onSelectFirstGame}
            className="px-6 py-3 rounded-2xl bg-gold-gradient text-slate-950 font-broadway font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-deco-gold active:scale-95 transition-all border border-[#f5eedb]/50"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Empezar con {GAMES_CATALOG[0].title}</span>
          </button>
          <button
            onClick={onOpenCatalog}
            className="px-5 py-3 rounded-2xl bg-[#14141e] hover:bg-[#1f1f2e] border border-[#d4af37]/40 text-amber-200 font-broadway text-xs uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <Gamepad2 className="w-4 h-4 text-[#d4af37]" />
            <span>Ver Catálogo Completo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Gamepad2, CheckCircle2, Trophy, Sparkles } from 'lucide-react';
import { GAMES_CATALOG, GameDefinition } from '../../lib/games';
import { Room } from '../../lib/types';

interface HostGameCatalogTabProps {
  room: Room;
  onSelectGame: (game: GameDefinition) => void;
  onStartPresentation?: () => void;
  onFinishShowAndShowGazette?: () => void;
}

export const HostGameCatalogTab: React.FC<HostGameCatalogTabProps> = ({
  room,
  onSelectGame,
  onStartPresentation,
  onFinishShowAndShowGazette,
}) => {
  return (
    <div className="space-y-3">
      {/* ACCIONES ESPECIALES DE TV: PRESENTACIÓN Y PERIÓDICO FINAL */}
      {(onStartPresentation || onFinishShowAndShowGazette) && (
        <div className="grid grid-cols-2 gap-2">
          {onStartPresentation && (
            <button
              onClick={onStartPresentation}
              className="p-3 rounded-2xl bg-[#160c24] hover:bg-[#201036] border border-purple-400/50 text-purple-200 font-broadway text-xs uppercase flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate">Diapositivas TV</span>
            </button>
          )}
          {onFinishShowAndShowGazette && (
            <button
              onClick={onFinishShowAndShowGazette}
              className="p-3 rounded-2xl bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-deco-gold active:scale-95 transition-all border border-[#f5eedb]/40"
            >
              <Trophy className="w-4 h-4 fill-slate-950 shrink-0" />
              <span className="truncate">Podio / Periódico</span>
            </button>
          )}
        </div>
      )}

      {/* CATÁLOGO COMPACTO EN 2 COLUMNAS PARA MÓVIL */}
      <section className="hell-card-frame rounded-3xl p-3.5 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
          <h2 className="text-xs sm:text-sm font-broadway uppercase tracking-wider text-gold-emboss flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>10 Pruebas del Show (Toca para lanzar en TV)</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {GAMES_CATALOG.map((game, idx) => {
            const isSelected = room.active_game_id === game.id && room.status === 'playing';

            return (
              <button
                key={game.id}
                onClick={() => onSelectGame(game)}
                className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-[#d4af37] bg-gold-gradient/20 text-white shadow-deco-gold ring-1 ring-[#d4af37]'
                    : 'border-[#d4af37]/30 bg-[#07070a]/90 text-amber-100/80 hover:border-[#d4af37]/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xl">{game.emoji}</span>
                    <span className="text-[10px] font-mono text-amber-300/80 bg-black/60 px-1.5 py-0.5 rounded border border-[#d4af37]/30">
                      #{idx + 1}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-broadway uppercase text-white leading-tight line-clamp-2">
                    {game.title.replace(/^Juego \d+:\s*/i, '')}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#d4af37]/20">
                  <span className="text-amber-300/90 font-vintage truncate">
                    {game.category}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};


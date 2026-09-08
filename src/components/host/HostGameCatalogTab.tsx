import React from 'react';
import { Gamepad2, CheckCircle2 } from 'lucide-react';
import { GAMES_CATALOG, GameDefinition } from '../../lib/games';
import { Room } from '../../lib/types';

interface HostGameCatalogTabProps {
  room: Room;
  onSelectGame: (game: GameDefinition) => void;
}

export const HostGameCatalogTab: React.FC<HostGameCatalogTabProps> = ({
  room,
  onSelectGame,
}) => {
  return (
    <div className="space-y-6">
      {/* CATÁLOGO DE JUEGOS: SELECCIÓN AUTOMÁTICA DEL MOTOR */}
      <section className="hell-card-frame rounded-3xl p-6 relative overflow-hidden">
        {/* Esquinas con palos de póker */}
        <span className="absolute top-3 left-4 text-xs text-[#d4af37]/40 select-none">♠</span>
        <span className="absolute top-3 right-4 text-xs text-red-600/50 select-none">♥</span>
        <span className="absolute bottom-3 left-4 text-xs text-[#d4af37]/40 select-none">♣</span>
        <span className="absolute bottom-3 right-4 text-xs text-red-600/50 select-none">♦</span>

        <div className="flex items-center justify-between mb-4 border-b border-[#d4af37]/30 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-broadway uppercase tracking-wider text-gold-emboss flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-amber-400" />
              Catálogo de Pruebas y Desafíos
            </h2>
            <p className="text-xs font-vintage text-amber-100/70 mt-0.5 hidden sm:block">
              Elige el juego y el salón adaptará automáticamente su motor (Pulsador, Retos o Duelos) y sus reglas en la TV.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {GAMES_CATALOG.map((game) => {
            const isSelected = room.active_game_id === game.id && room.status === 'playing';

            return (
              <button
                key={game.id}
                onClick={() => onSelectGame(game)}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden active:scale-98 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#d4af37] bg-gold-gradient/15 text-white shadow-deco-gold hell-card-frame-crimson'
                    : 'border-[#d4af37]/30 bg-black/80 text-amber-100/70 hover:border-[#d4af37]/70 hover:text-white shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{game.emoji}</span>
                    <span className="text-[10px] font-broadway uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/90 border border-[#d4af37]/40 text-amber-300">
                      {game.category}
                    </span>
                  </div>

                  <h3 className="text-base font-broadway uppercase text-white">{game.title}</h3>
                  <p className="text-xs font-vintage text-amber-100/60 mt-1 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#d4af37]/20 flex items-center justify-between text-[11px] gap-1">
                  <span className="text-amber-300 font-vintage font-bold bg-[#d4af37]/15 border border-[#d4af37]/30 px-2 py-0.5 rounded-full text-[10px]">
                    {game.participantsLabel}
                  </span>
                  {isSelected && (
                    <span className="text-amber-300 font-broadway font-bold flex items-center gap-1 shrink-0 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> En Pantalla
                    </span>
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

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
      <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-indigo-400" />
              Catálogo de Minijuegos
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
              Elige el juego y el motor (Pulsador, Retos o Duelos) se adaptará automáticamente con sus reglas.
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
                    ? 'border-amber-400 bg-amber-500/15 text-white shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{game.emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {game.category}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white">{game.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{game.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] gap-1">
                  <span className="text-amber-300 font-bold bg-amber-500/10 border border-amber-400/20 px-2 py-0.5 rounded-full text-[10px]">
                    {game.participantsLabel}
                  </span>
                  {isSelected && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> En Pantalla
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

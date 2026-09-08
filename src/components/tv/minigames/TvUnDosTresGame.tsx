import React from 'react';
import { TEAMS_CATALOG } from '../../../lib/constants';
import { UnDosTresChallenge } from '../../../lib/unDosTresData';
import { Team } from '../../../lib/types';

interface TvUnDosTresGameProps {
  currentUdtChallenge: UnDosTresChallenge;
  udtCountdown: number | null;
  udtIsTimerRunning: boolean;
  activeTeams: Team[];
  udtEliminatedTeamIds: string[];
  udtActiveTeamId: string | undefined;
}

export const TvUnDosTresGame: React.FC<TvUnDosTresGameProps> = ({
  currentUdtChallenge,
  udtCountdown,
  udtIsTimerRunning,
  activeTeams,
  udtEliminatedTeamIds,
  udtActiveTeamId,
}) => {
  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-deco-gold relative overflow-hidden backdrop-blur-xl deco-card-frame">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/50 shadow-md">
          <span>⚡</span> 1, 2, 3 ¿YA? — {currentUdtChallenge.level} (Nivel {currentUdtChallenge.levelNumber})
        </div>
        <div className="text-xs font-vintage font-bold text-amber-300 uppercase tracking-wider">
          Turnos por equipo • 5 Segundos • Eliminación directa
        </div>
      </div>

      {/* TEMPORIZADOR GIGANTE DE 5 SEGUNDOS (CRONÓMETRO DE BRONCE) */}
      <div className="my-6">
        <div
          className={`text-8xl sm:text-9xl font-broadway transition-all drop-shadow-[0_0_35px_rgba(212,175,55,0.4)] ${
            udtCountdown !== null && udtCountdown <= 2
              ? 'text-red-500 animate-pulse scale-110 drop-shadow-[0_0_35px_rgba(239,68,68,0.7)]'
              : udtCountdown !== null && udtCountdown > 0
              ? 'text-gold-gradient'
              : 'text-amber-200/40'
          }`}
        >
          {udtCountdown !== null ? `${udtCountdown}s` : '5s'}
        </div>
        <p className="text-sm font-vintage font-bold uppercase tracking-wider text-amber-200/80 mt-2">
          {udtIsTimerRunning
            ? '¡Cuenta atrás en marcha! ¡Di 3 respuestas en voz alta!'
            : 'Esperando que el Anfitrión lance el tiempo'}
        </p>
      </div>

      {/* RETO ACTIVO */}
      <div className="p-6 rounded-2xl bg-[#07070a]/90 border border-[#d4af37]/40 my-4 shadow-inner">
        <span className="text-xs uppercase font-broadway font-black text-gold-gradient block mb-1">
          {currentUdtChallenge.category}
        </span>
        <h2 className="text-2xl sm:text-4xl font-broadway text-amber-50 drop-shadow-sm">
          {currentUdtChallenge.prompt}
        </h2>
      </div>

      {/* ESTADO DE LOS EQUIPOS: TURNO ACTIVO Y ELIMINADOS */}
      <div className="mt-6 pt-4 border-t border-[#d4af37]/30 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {activeTeams.map((team) => {
          const isEliminated = udtEliminatedTeamIds.includes(team.id);
          const isCurrentTurn = udtActiveTeamId === team.id;
          const catalog = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
          return (
            <div
              key={team.id}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center ${
                isEliminated
                  ? 'bg-[#07070a]/60 border-red-950/60 opacity-40'
                  : isCurrentTurn
                  ? 'bg-amber-500/20 border-amber-400 shadow-deco-gold scale-105 ring-2 ring-amber-300'
                  : 'bg-[#14141e]/90 border-[#d4af37]/30'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${catalog.twBg} mb-1 shadow`} />
              <span className="text-xs font-broadway text-white truncate max-w-full">{team.name}</span>
              <span
                className={`text-[10px] font-vintage font-black uppercase mt-1 ${
                  isEliminated ? 'text-red-400' : isCurrentTurn ? 'text-amber-300 font-bold' : 'text-amber-200/50'
                }`}
              >
                {isEliminated ? '💀 ELIMINADO' : isCurrentTurn ? '🎙️ EN JUEGO' : 'EN ESPERA'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

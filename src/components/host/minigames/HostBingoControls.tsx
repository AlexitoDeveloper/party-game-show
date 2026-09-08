import React from 'react';
import { Loader2 } from 'lucide-react';
import { getBingoBallTheme, BINGO_NICKNAMES } from '../../../lib/bingoUtils';
import { Team } from '../../../lib/types';
import { TEAMS_CATALOG } from '../../../lib/constants';

export interface HostBingoControlsProps {
  bingoDrawnBalls: number[];
  bingoCurrentBall: number | null;
  bingoIsSpinning: boolean;
  onResetBingo: () => void;
  onDrawBingoBall: () => void;
  teams: Team[];
  selectedTeamCatalog?: (typeof TEAMS_CATALOG)[0] | null;
  onScoreChange: (teamId: string, delta: number) => void;
}

export const HostBingoControls: React.FC<HostBingoControlsProps> = ({
  bingoDrawnBalls,
  bingoCurrentBall,
  bingoIsSpinning,
  onResetBingo,
  onDrawBingoBall,
  teams,
  selectedTeamCatalog,
  onScoreChange,
}) => {
  return (
    <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-3xl p-6 shadow-deco-gold space-y-5 hell-card-frame">
      <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎱</span>
          <span className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">
            Bombo Virtual de BINGO (Bolas extraídas: {bingoDrawnBalls.length}/90)
          </span>
        </div>
        <button
          onClick={onResetBingo}
          className="px-2.5 py-1 bg-[#14141e] hover:bg-[#1a1a28] text-amber-200 rounded-xl text-xs font-vintage font-bold border border-[#d4af37]/30 shadow-sm"
        >
          Reiniciar Bombo
        </button>
      </div>

      {/* BOLA ACTUAL Y ACCIÓN DE SACAR BOLA CON RULETA */}
      <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
        <div className="flex items-center gap-4">
          {(() => {
            const theme = getBingoBallTheme(bingoCurrentBall);
            const nick = bingoCurrentBall ? BINGO_NICKNAMES[bingoCurrentBall] : null;
            return (
              <>
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-tr ${theme.bgGradient} border-2 ${theme.border} ${theme.ballTextClass} font-broadway text-3xl flex items-center justify-center shadow-deco-gold transition-all ${
                    bingoIsSpinning ? 'animate-spin' : ''
                  } ${theme.isLightColor ? 'ring-2 ring-slate-400' : ''}`}
                >
                  {bingoIsSpinning ? '?' : bingoCurrentBall || '—'}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-broadway text-amber-400 block">
                    {bingoIsSpinning ? 'Ruleta en marcha...' : 'Última Bola:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-broadway text-gold-gradient">
                      {bingoIsSpinning ? '¡Girando bombo!' : bingoCurrentBall ? `Bola ${bingoCurrentBall}` : 'Ninguna bola aún'}
                    </span>
                    {nick && !bingoIsSpinning && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-gold-gradient text-slate-950 font-broadway font-black text-[10px] uppercase shadow-sm">
                        {nick}
                      </span>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        <button
          onClick={onDrawBingoBall}
          disabled={bingoIsSpinning}
          className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm uppercase font-broadway font-black flex items-center justify-center gap-2 shadow-deco-gold active:scale-95 transition-all ${
            bingoIsSpinning
              ? 'bg-[#14141e] text-amber-200/40 cursor-not-allowed border border-[#d4af37]/20'
              : 'bg-gold-gradient hover:brightness-110 text-slate-950 border border-[#f5eedb]/50'
          }`}
        >
          {bingoIsSpinning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              <span>Girando Ruleta...</span>
            </>
          ) : (
            <span>🎰 ¡Girar Ruleta y Sacar Bola!</span>
          )}
        </button>
      </div>

      {/* BOTONES DE PREMIO DIRECTO */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            const targetTeam = selectedTeamCatalog
              ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
              : teams.find((t) => t.is_active);
            if (targetTeam) {
              onScoreChange(targetTeam.id, 2);
            } else {
              alert('Selecciona un equipo primero para cantar Línea');
            }
          }}
          className="flex-1 px-4 py-3 bg-[#14141e] hover:bg-[#1a1a28] text-amber-200 border border-[#d4af37]/40 rounded-2xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>📏 Cantar Línea (+2 pts)</span>
        </button>
        <button
          onClick={() => {
            const targetTeam = selectedTeamCatalog
              ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
              : teams.find((t) => t.is_active);
            if (targetTeam) {
              onScoreChange(targetTeam.id, 6);
            } else {
              alert('Selecciona un equipo primero para cantar BINGO');
            }
          }}
          className="flex-1 px-4 py-3 bg-gold-gradient hover:brightness-110 text-slate-950 border border-[#f5eedb]/50 rounded-2xl text-xs font-broadway font-black uppercase flex items-center justify-center gap-1.5 shadow-deco-gold"
        >
          <span>🎱 ¡Cantar BINGO! (+6 pts)</span>
        </button>
      </div>
    </div>
  );
};

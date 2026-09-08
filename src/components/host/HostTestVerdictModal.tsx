import React from 'react';
import { X, Trophy, Play, ArrowLeft } from 'lucide-react';
import { Team } from '../../lib/types';
import { GameDefinition } from '../../lib/games';
import { TEAMS_CATALOG } from '../../lib/constants';
import { PowerCardsState } from '../../lib/powerCards';
import { TestVerdictCalculation } from '../../lib/testVerdict';

export interface HostTestVerdictModalProps {
  testFinishedModal: {
    gameTitle: string;
    gameId: string;
    suggestedNextGame?: GameDefinition;
  };
  onClose: () => void;
  currentVerdict: TestVerdictCalculation;
  teams: Team[];
  activeTeams: Team[];
  manualPodiumRanks: Record<string, number>;
  onSetManualPodiumRanks: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onSetRoundHits: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onApplyVerdict: () => void;
  selectedBonusTeam: string;
  onSetSelectedBonusTeam: (teamId: string) => void;
  onDealBonusCard: (teamId?: string) => void;
  powerCards: PowerCardsState;
  onClearAllActiveEffects: () => void;
  onTransferMaldicion: (sourceTeam: Team, targetTeam: Team) => void;
  onSelectNextGame: (game: GameDefinition) => void;
  onReturnToLobby: () => void;
}

export const HostTestVerdictModal: React.FC<HostTestVerdictModalProps> = ({
  testFinishedModal,
  onClose,
  currentVerdict,
  teams,
  activeTeams,
  manualPodiumRanks,
  onSetManualPodiumRanks,
  onSetRoundHits,
  onApplyVerdict,
  selectedBonusTeam,
  onSetSelectedBonusTeam,
  onDealBonusCard,
  powerCards,
  onClearAllActiveEffects,
  onTransferMaldicion,
  onSelectNextGame,
  onReturnToLobby,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto deco-card-frame">
        {/* CABECERA */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🏁</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase flex items-center gap-2">
                <span>Veredicto de la Prueba</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono">
                  {testFinishedModal.gameId === 'bingo' ? 'Bingo (+6 / +2)' : 'Podio (+5 / +3 / +2 / +1)'}
                </span>
              </h3>
              <p className="text-xs text-amber-300 font-bold">
                {testFinishedModal.gameTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABLA DE CLASIFICACIÓN Y PUNTOS AUTOMÁTICOS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Clasificación y Puntuaciones Calculadas:
            </span>
            <span className="text-[10px] text-slate-400">
              Aciertos en vivo • Podio editable
            </span>
          </div>

          <div className="space-y-2">
            {currentVerdict.results.map((res) => {
              const cat = TEAMS_CATALOG.find((c) => c.index === res.teamIndex) || TEAMS_CATALOG[0];
              const rankEmoji = res.rank === 1 ? '🥇' : res.rank === 2 ? '🥈' : res.rank === 3 ? '🥉' : '🎖️';
              return (
                <div
                  key={res.teamId}
                  className={`p-3 rounded-2xl border transition-all ${
                    res.rank === 1
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'bg-slate-950/80 border-slate-800'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                >
                  {/* POSICIÓN Y EQUIPO */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-base">{rankEmoji}</span>
                      <select
                        value={manualPodiumRanks[res.teamId] !== undefined ? manualPodiumRanks[res.teamId] : res.rank}
                        onChange={(e) => {
                          const newRank = parseInt(e.target.value, 10);
                          onSetManualPodiumRanks((prev) => ({ ...prev, [res.teamId]: newRank }));
                        }}
                        className="bg-slate-900 border border-slate-700 text-amber-300 text-xs font-black rounded-lg px-1.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
                        title="Cambiar posición en el podio manualmente"
                      >
                        <option value={1}>1.º</option>
                        <option value={2}>2.º</option>
                        <option value={3}>3.º</option>
                        <option value={4}>4.º</option>
                        <option value={5}>5.º</option>
                      </select>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${cat.twBg} shrink-0`} />
                        <span className={`text-xs font-black uppercase truncate ${cat.twText}`}>
                          {res.teamName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Marcador actual: {teams.find((t) => t.id === res.teamId)?.score || 0} pts
                      </div>
                    </div>
                  </div>

                  {/* CONTADOR DE ACIERTOS (CON + Y -) */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold mr-1">Aciertos:</span>
                      <button
                        type="button"
                        onClick={() => {
                          onSetRoundHits((prev) => ({
                            ...prev,
                            [res.teamId]: Math.max(0, (prev[res.teamId] || 0) - 1),
                          }));
                        }}
                        className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black flex items-center justify-center active:scale-95"
                        title="Restar 1 acierto"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-white font-mono w-5 text-center">
                        {res.hits}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSetRoundHits((prev) => ({
                            ...prev,
                            [res.teamId]: (prev[res.teamId] || 0) + 1,
                          }));
                        }}
                        className="w-5 h-5 rounded-md bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-black flex items-center justify-center active:scale-95"
                        title="Sumar 1 acierto"
                      >
                        +
                      </button>
                    </div>

                    {/* DESGLOSE: PUNTOS BASE + CARTAS = TOTAL */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Base: +{res.basePoints}
                        </span>
                        {res.totalCardDelta !== 0 && (
                          <span
                            className={`text-[10px] font-black font-mono block ${
                              res.totalCardDelta > 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            Cartas: {res.totalCardDelta > 0 ? `+${res.totalCardDelta}` : res.totalCardDelta}
                          </span>
                        )}
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm border flex items-center justify-center ${
                          res.finalPoints > 0
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : res.finalPoints < 0
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {res.finalPoints > 0 ? `+${res.finalPoints}` : res.finalPoints} pts
                      </div>
                    </div>
                  </div>

                  {/* BADGES DE CARTAS ACTIVAS QUE IMPACTAN A ESTE EQUIPO */}
                  {res.cardImpacts.length > 0 && (
                    <div className="w-full pt-1.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {res.cardImpacts.map((impact, impIdx) => (
                        <span
                          key={impIdx}
                          title={impact.explanation}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 cursor-help ${
                            impact.delta >= 0
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-red-500/15 text-red-300 border-red-500/30'
                          }`}
                        >
                          <span>{impact.cardEmoji}</span>
                          <span>{impact.cardName}</span>
                          <strong className={impact.delta >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                            ({impact.delta >= 0 ? `+${impact.delta}` : impact.delta})
                          </strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTÓN PRINCIPAL: APLICAR VEREDICTO */}
        <button
          onClick={onApplyVerdict}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
        >
          <Trophy className="w-5 h-5 fill-slate-950" />
          <span>
            🚀 Aplicar Veredicto al Marcador
            {currentVerdict.consumedEffectIds.length > 0 && ` (${currentVerdict.consumedEffectIds.length} cartas resueltas)`}
          </span>
        </button>

        {/* RECURSOS ADICIONALES: DAR CARTA BONUS O TRANSFERIR MALDICIÓN */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">
              Opciones complementarias:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-1">
              <span className="text-xs">🎁</span>
              <select
                value={selectedBonusTeam}
                onChange={(e) => onSetSelectedBonusTeam(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-purple-300 text-xs rounded-lg px-2 py-1 flex-1 min-w-0"
              >
                <option value="random">Equipo al azar</option>
                {activeTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onDealBonusCard(selectedBonusTeam)}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-lg active:scale-95 transition-all shrink-0"
              >
                Dar Carta
              </button>
            </div>

            {powerCards.activeEffects.length > 0 && (
              <button
                onClick={onClearAllActiveEffects}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 active:scale-95"
                title="Archivar efectos restantes"
              >
                Archivar Efectos ({powerCards.activeEffects.length})
              </button>
            )}
          </div>

          {/* LA MALDICIÓN ÉPICA: PATATA CALIENTE */}
          {(() => {
            const cursedTeams = activeTeams.filter((t) => {
              const hand = powerCards.teamHands[t.id] || [];
              return hand.includes('la_maldicion');
            });
            if (cursedTeams.length === 0) return null;
            return (
              <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/40 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-purple-300 flex items-center gap-1">
                  <span>☠️</span> La Maldición (Patata Caliente - Fallos restan x2):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cursedTeams.map((cTeam) => (
                    <button
                      key={cTeam.id}
                      onClick={() => {
                        const rivals = activeTeams.filter((t) => t.id !== cTeam.id);
                        const promptText = `¿A qué rival le pasa ${cTeam.name} La Maldición?\n${rivals.map((r, i) => `${i + 1}. ${r.name}`).join('\n')}`;
                        const chosen = prompt(promptText);
                        const idx = parseInt(chosen || '0', 10) - 1;
                        const target = rivals[idx];
                        if (target) {
                          onTransferMaldicion(cTeam, target);
                        }
                      }}
                      className="px-2.5 py-1 bg-purple-900 hover:bg-purple-800 border border-purple-400/50 text-white rounded-lg text-[10px] font-black flex items-center gap-1 shadow active:scale-95"
                      title="Pasar La Maldición a un equipo superado"
                    >
                      <span>🔄 Pasar Maldición de {cTeam.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ACCIONES DE CIERRE O SALTO AL SIGUIENTE JUEGO */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          {testFinishedModal.suggestedNextGame && (
            <button
              onClick={() => {
                const next = testFinishedModal.suggestedNextGame!;
                onClose();
                onSelectNextGame(next);
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Siguiente: {testFinishedModal.suggestedNextGame.title}</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onReturnToLobby();
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-black uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Ir al Lobby</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-black uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Cerrar Modal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

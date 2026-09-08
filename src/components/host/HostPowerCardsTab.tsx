import React from 'react';
import { Dices, RotateCcw, Zap, Trash2 } from 'lucide-react';
import { Team } from '../../lib/types';
import { TEAMS_CATALOG } from '../../lib/constants';
import { PowerCardsState, PowerCard, getPowerCardById } from '../../lib/powerCards';

export interface HostPowerCardsTabProps {
  powerCards: PowerCardsState;
  activeTeams: Team[];
  selectedBonusTeam: string;
  onSetSelectedBonusTeam: (teamId: string) => void;
  onDealInitialCards: () => void;
  onDealBonusCard: (teamId: string) => void;
  onResetPowerCards: () => void;
  onOpenDiscardModal: () => void;
  onClearAllActiveEffects: () => void;
  onRemoveActiveEffect: (effectId: string) => void;
  onScoreChange: (teamId: string, delta: number) => void;
  onInitiatePlayCard: (teamId: string, card: PowerCard) => void;
  onPlayCardDirectly: (teamId: string, cardId: string) => void;
  onRevokeCardFromTeam: (teamId: string, cardId: string) => void;
}

export const HostPowerCardsTab: React.FC<HostPowerCardsTabProps> = ({
  powerCards,
  activeTeams,
  selectedBonusTeam,
  onSetSelectedBonusTeam,
  onDealInitialCards,
  onDealBonusCard,
  onResetPowerCards,
  onOpenDiscardModal,
  onClearAllActiveEffects,
  onRemoveActiveEffect,
  onScoreChange,
  onInitiatePlayCard,
  onPlayCardDirectly,
  onRevokeCardFromTeam,
}) => {
  return (
    <div className="space-y-6">
      {/* SECCIÓN: SISTEMA DE CARTAS DE PODER PARA EQUIPOS */}
      <section className="bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🃏</span>
              <h2 className="text-base sm:text-lg font-black text-white">Cartas de Poder</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Mazo Único
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 hidden sm:block">
              Reparte cartas únicas al inicio o al finalizar pruebas. Los equipos las juegan desde sus móviles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onDealInitialCards}
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black uppercase flex items-center gap-1.5 sm:gap-2 shadow-md active:scale-95 transition-all"
            >
              <span>🃏</span>
              <span className="hidden sm:inline">Repartir 1 Carta a Todos (Inicio)</span>
              <span className="sm:hidden">Repartir a Todos</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <select
                value={selectedBonusTeam}
                onChange={(e) => onSetSelectedBonusTeam(e.target.value)}
                className="bg-slate-900 text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-700 outline-none max-w-[120px] sm:max-w-none truncate"
              >
                <option value="random">🎲 Azar</option>
                {activeTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => onDealBonusCard(selectedBonusTeam)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase flex items-center gap-1 active:scale-95 transition-all shrink-0"
                title="Repartir 1 carta bonus al finalizar una prueba"
              >
                <Dices className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dar Bonus</span>
                <span className="sm:hidden">Bonus</span>
              </button>
            </div>

            <button
              onClick={onResetPowerCards}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 active:scale-95 transition-all"
              title="Reiniciar mazo de cartas"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* METRICS DEL MAZO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">🎴</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">En Mazo Común</span>
              <span className="text-lg font-black text-indigo-400">{powerCards.deck.length} cartas</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">En Manos</span>
              <span className="text-lg font-black text-emerald-400">
                {Object.values(powerCards.teamHands).reduce((acc, h) => acc + h.length, 0)} cartas
              </span>
            </div>
          </div>

          <div
            onClick={onOpenDiscardModal}
            className="bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/50 p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all group"
            title="Ver cartas en la pila de descartes"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🪦</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block group-hover:text-amber-300">
                Descartes (Ver)
              </span>
              <span className="text-lg font-black text-slate-300">{powerCards.discardPile.length} cartas</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Efectos Activos</span>
              <span className="text-lg font-black text-amber-400">{powerCards.activeEffects.length}</span>
            </div>
          </div>
        </div>

        {/* LISTA DE EFECTOS ACTIVOS CON BOTONES DE RESOLUCIÓN */}
        {powerCards.activeEffects.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 sm:p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Efectos de Poder Activos en Esta Prueba:</span>
                <span className="sm:hidden">Efectos Activos ({powerCards.activeEffects.length}):</span>
              </span>
              <button
                onClick={onClearAllActiveEffects}
                className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow shrink-0"
                title="Caducar y descartar todos los efectos activos inmediatamente"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
                <span className="hidden sm:inline">Limpiar Efectos</span>
                <span className="sm:hidden">Limpiar</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {powerCards.activeEffects.map((eff) => {
                const team = activeTeams.find((t) => t.id === eff.sourceTeamId);
                const targetTeam = eff.targetTeamId ? activeTeams.find((t) => t.id === eff.targetTeamId) : null;
                return (
                  <div
                    key={eff.id}
                    className="bg-slate-950/95 border-2 border-amber-400/50 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs flex flex-wrap items-center gap-1.5 sm:gap-2 shadow-lg"
                  >
                    <span>{eff.cardEmoji}</span>
                    <strong className="text-white font-bold">{eff.cardName}</strong>
                    <span className="text-amber-300 font-bold">({team?.name || eff.sourceTeamName})</span>
                    {targetTeam && (
                      <span className="text-red-300 font-bold flex items-center gap-0.5">
                        <span>➔ 🎯</span>
                        <span>{targetTeam.name}</span>
                      </span>
                    )}
                    {eff.targetPlayerName && (
                      <span className="text-red-300 font-bold flex items-center gap-0.5">
                        <span>➔ 👤</span>
                        <span>{eff.targetPlayerName}</span>
                      </span>
                    )}
                    {eff.sensoryLimitation && (
                      <span className="bg-purple-950/80 border border-purple-400/50 text-purple-200 px-2 py-0.5 rounded text-[11px] font-bold">
                        {eff.sensoryLimitation}
                      </span>
                    )}

                    {/* BOTONES INTERACTIVOS SEGÚN LA CARTA */}
                    {eff.cardId === 'bomba' && eff.targetTeamId && (
                      <button
                        onClick={() => {
                          onScoreChange(eff.targetTeamId!, -3);
                          onRemoveActiveEffect(eff.id);
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[10px] shadow"
                      >
                        💣 Detonar (-3 pts)
                      </button>
                    )}

                    {eff.cardId === 'objetivo' && (
                      <button
                        onClick={() => {
                          onScoreChange(eff.sourceTeamId, 2);
                          onRemoveActiveEffect(eff.id);
                        }}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] shadow"
                      >
                        🎯 Cobrar (+2 pts)
                      </button>
                    )}

                    {eff.cardId === 'caza_lider' && (
                      <button
                        onClick={() => {
                          if (eff.targetTeamId) {
                            onScoreChange(eff.targetTeamId, -3);
                          }
                          onScoreChange(eff.sourceTeamId, 3);
                          onRemoveActiveEffect(eff.id);
                        }}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[10px] shadow"
                      >
                        👑 Destronar (-3 rival / +3 tú)
                      </button>
                    )}

                    {eff.cardId === 'ruleta_rusa' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onScoreChange(eff.sourceTeamId, 6);
                            onRemoveActiveEffect(eff.id);
                          }}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] shadow"
                        >
                          +6 pts (1º-2º)
                        </button>
                        <button
                          onClick={() => {
                            onScoreChange(eff.sourceTeamId, -4);
                            onRemoveActiveEffect(eff.id);
                          }}
                          className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[10px] shadow"
                        >
                          -4 pts (3º-5º)
                        </button>
                      </div>
                    )}

                    {eff.cardId === 'la_sentencia' && eff.targetTeamId && (
                      <button
                        onClick={() => {
                          onScoreChange(eff.targetTeamId!, -4);
                          onRemoveActiveEffect(eff.id);
                        }}
                        className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold text-[10px] shadow"
                      >
                        💀 Ejecutar (-4 pts)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INVENTARIO DE CARTAS POR EQUIPO */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Cartas en posesión de cada equipo:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeTeams.map((team) => {
              const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
              const hand = powerCards.teamHands[team.id] || [];

              return (
                <div
                  key={team.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${cat?.twBg}`} />
                      <h4 className="text-sm font-black text-white">{team.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold bg-slate-800 px-2 py-0.5 rounded-lg text-slate-300 border border-slate-700">
                      {hand.length} {hand.length === 1 ? 'carta' : 'cartas'}
                    </span>
                  </div>

                  {/* Cartas en mano */}
                  <div className="space-y-1.5 min-h-[48px]">
                    {hand.length === 0 ? (
                      <div className="text-slate-600 text-xs italic py-2">Sin cartas en mano</div>
                    ) : (
                      hand.map((cardId) => {
                        const card = getPowerCardById(cardId);
                        if (!card) return null;

                        return (
                          <div
                            key={cardId}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-lg shrink-0">{card.emoji}</span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-white truncate">{card.name}</span>
                                  <span
                                    className={`text-[8px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                                      card.rarity === 'Legendaria'
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                        : card.rarity === 'Épica'
                                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                        : card.rarity === 'Rara'
                                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    }`}
                                  >
                                    {card.rarity}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 truncate hidden sm:block">{card.tagline}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {card.id === 'la_maldicion' ? (
                                <>
                                  <button
                                    onClick={() => onScoreChange(team.id, -1)}
                                    className="px-2 py-1 rounded-lg bg-red-950/80 hover:bg-red-800 text-red-200 border border-red-500/40 text-[10px] font-black uppercase transition-all"
                                    title="Penalizar 1 punto al equipo por conservar la maldición al terminar la prueba"
                                  >
                                    💀 -1 pt
                                  </button>
                                  <button
                                    onClick={() => onPlayCardDirectly(team.id, card.id)}
                                    className="px-2 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-[10px] font-black uppercase transition-all"
                                    title="Descartar la maldición perdiendo 3 puntos"
                                  >
                                    ✕ Descartar (-3)
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => onInitiatePlayCard(team.id, card)}
                                  className="px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 text-[10px] font-black uppercase transition-all"
                                  title="Activar carta"
                                >
                                  Jugar
                                </button>
                              )}

                              <button
                                onClick={() => onRevokeCardFromTeam(team.id, card.id)}
                                className="p-1 rounded-lg bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-500/40 text-[10px] active:scale-95 transition-all"
                                title="Quitar carta de la mano y enviar al descarte"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

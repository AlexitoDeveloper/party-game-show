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
  const totalInHands = Object.values(powerCards.teamHands).reduce((acc, h) => acc + h.length, 0);

  return (
    <div className="space-y-4">
      <section className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-3xl p-4 shadow-deco-gold space-y-3.5 hell-card-frame">
        {/* CABECERA COMPACTA + ESTADO DEL MAZO EN 1 LÍNEA */}
        <div className="flex items-center justify-between gap-2 border-b border-[#d4af37]/30 pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">🃏</span>
            <div className="min-w-0">
              <h2 className="text-sm font-broadway uppercase tracking-wide text-gold-gradient truncate">
                Cartas de Poder
              </h2>
              <div className="flex items-center gap-2 text-[11px] font-vintage text-amber-200/80">
                <span>Mazo: <strong className="text-white">{powerCards.deck.length}</strong></span>
                <span>•</span>
                <span>Manos: <strong className="text-emerald-300">{totalInHands}</strong></span>
                <span>•</span>
                <button
                  onClick={onOpenDiscardModal}
                  className="underline text-amber-300 hover:text-white"
                >
                  Descartes ({powerCards.discardPile.length})
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onResetPowerCards}
            className="p-2 rounded-xl bg-[#14141e] hover:bg-[#1f1f2e] text-amber-300 border border-[#d4af37]/40 active:scale-95 transition-all shrink-0"
            title="Reiniciar mazo de cartas"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* BOTONES DE REPARTO RÁPIDO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={onDealInitialCards}
            className="py-2.5 px-3 rounded-xl bg-gold-gradient hover:brightness-110 text-slate-950 text-xs font-broadway font-black uppercase flex items-center justify-center gap-1.5 shadow-deco-gold border border-[#f5eedb]/40 active:scale-95 transition-all"
          >
            <span>🎴</span>
            <span>Repartir 1 a Todos</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#07070a] p-1 rounded-xl border border-[#d4af37]/40">
            <select
              value={selectedBonusTeam}
              onChange={(e) => onSetSelectedBonusTeam(e.target.value)}
              className="flex-1 bg-[#14141e] text-amber-200 text-xs font-vintage rounded-lg px-2 py-2 border border-[#d4af37]/30 outline-none min-w-0 truncate"
            >
              <option value="random">🎲 Equipo al Azar</option>
              {activeTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => onDealBonusCard(selectedBonusTeam)}
              className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-broadway font-black uppercase flex items-center gap-1 active:scale-95 transition-all shrink-0"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Dar 1 Carta</span>
            </button>
          </div>
        </div>

        {/* EFECTOS ACTIVOS EN LA PRUEBA ACTUAL */}
        {powerCards.activeEffects.length > 0 && (
          <div className="bg-[#140b08]/90 border border-amber-500/40 p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-broadway uppercase text-amber-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Efectos Activos ({powerCards.activeEffects.length}):</span>
              </span>
              <button
                onClick={onClearAllActiveEffects}
                className="px-2 py-1 bg-red-950/90 border border-red-500/50 text-red-200 text-[11px] font-broadway uppercase rounded-lg flex items-center gap-1 active:scale-95"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
                <span>Limpiar</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {powerCards.activeEffects.map((eff) => {
                const team = activeTeams.find((t) => t.id === eff.sourceTeamId);
                const targetTeam = eff.targetTeamId
                  ? activeTeams.find((t) => t.id === eff.targetTeamId)
                  : null;
                return (
                  <div
                    key={eff.id}
                    className="bg-[#07070a]/95 border border-[#d4af37]/50 px-2.5 py-1.5 rounded-xl text-xs flex flex-wrap items-center gap-1.5"
                  >
                    <span>{eff.cardEmoji}</span>
                    <strong className="text-white font-broadway">{eff.cardName}</strong>
                    <span className="text-amber-300 font-vintage">({team?.name || eff.sourceTeamName})</span>
                    {targetTeam && (
                      <span className="text-red-300 font-vintage font-bold">➔ {targetTeam.name}</span>
                    )}
                    {eff.targetPlayerName && (
                      <span className="text-red-300 font-vintage font-bold">➔ {eff.targetPlayerName}</span>
                    )}
                    {eff.cardId === 'bomba' && eff.targetTeamId && (
                      <button
                        onClick={() => {
                          onScoreChange(eff.targetTeamId!, -3);
                          onRemoveActiveEffect(eff.id);
                        }}
                        className="px-2 py-0.5 bg-red-600 text-white rounded-lg font-broadway text-[11px]"
                      >
                        💣 -3
                      </button>
                    )}
                    {eff.cardId === 'objetivo' && (
                      <button
                        onClick={() => {
                          onScoreChange(eff.sourceTeamId, 2);
                          onRemoveActiveEffect(eff.id);
                        }}
                        className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg font-broadway text-[11px]"
                      >
                        🎯 +2
                      </button>
                    )}
                    {eff.cardId === 'caza_lider' && (
                      <button
                        onClick={() => {
                          if (eff.targetTeamId) onScoreChange(eff.targetTeamId, -3);
                          onScoreChange(eff.sourceTeamId, 3);
                          onRemoveActiveEffect(eff.id);
                        }}
                        className="px-2 py-0.5 bg-purple-600 text-white rounded-lg font-broadway text-[11px]"
                      >
                        👑 ±3
                      </button>
                    )}
                    {eff.cardId === 'ruleta_rusa' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onScoreChange(eff.sourceTeamId, 6);
                            onRemoveActiveEffect(eff.id);
                          }}
                          className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg font-broadway text-[11px]"
                        >
                          +6
                        </button>
                        <button
                          onClick={() => {
                            onScoreChange(eff.sourceTeamId, -4);
                            onRemoveActiveEffect(eff.id);
                          }}
                          className="px-2 py-0.5 bg-red-600 text-white rounded-lg font-broadway text-[11px]"
                        >
                          -4
                        </button>
                      </div>
                    )}
                    {eff.cardId === 'la_sentencia' && eff.targetTeamId && (
                      <button
                        onClick={() => {
                          onScoreChange(eff.targetTeamId!, -4);
                          onRemoveActiveEffect(eff.id);
                        }}
                        className="px-2 py-0.5 bg-red-700 text-white rounded-lg font-broadway text-[11px]"
                      >
                        💀 -4
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MANOS DE CADA EQUIPO EN FORMATO COMPACTO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeTeams.map((team) => {
            const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
            const hand = powerCards.teamHands[team.id] || [];

            return (
              <div
                key={team.id}
                className="bg-[#07070a]/90 border border-[#d4af37]/30 rounded-2xl p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat?.twBg}`} />
                    <h4 className="text-xs font-broadway uppercase text-white">{team.name}</h4>
                  </div>
                  <span className="text-[11px] font-vintage font-bold text-amber-200/70">
                    {hand.length}/3 cartas
                  </span>
                </div>

                {hand.length === 0 ? (
                  <div className="text-amber-200/40 text-xs italic font-vintage">Sin cartas</div>
                ) : (
                  <div className="space-y-1.5">
                    {hand.map((cardId) => {
                      const card = getPowerCardById(cardId);
                      if (!card) return null;

                      return (
                        <div
                          key={cardId}
                          className="bg-[#0c0c14] border border-[#d4af37]/25 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-base shrink-0">{card.emoji}</span>
                            <span className="text-xs font-broadway text-white truncate">
                              {card.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {card.id === 'la_maldicion' ? (
                              <>
                                <button
                                  onClick={() => onScoreChange(team.id, -1)}
                                  className="px-2 py-1 rounded-lg bg-red-950 text-red-200 border border-red-500/40 text-[11px] font-broadway"
                                >
                                  💀 -1
                                </button>
                                <button
                                  onClick={() => onPlayCardDirectly(team.id, card.id)}
                                  className="px-2 py-1 rounded-lg bg-purple-950 text-purple-200 border border-purple-500/40 text-[11px] font-broadway"
                                >
                                  -3 pts
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => onInitiatePlayCard(team.id, card)}
                                className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-[#d4af37]/40 text-[11px] font-broadway uppercase"
                              >
                                Jugar
                              </button>
                            )}

                            <button
                              onClick={() => onRevokeCardFromTeam(team.id, card.id)}
                              className="px-1.5 py-1 rounded-lg bg-[#14141e] text-amber-200/60 hover:text-red-300 border border-[#d4af37]/30 text-[11px]"
                              title="Descartar carta"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

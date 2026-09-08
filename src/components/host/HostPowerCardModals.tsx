import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import { TEAMS_CATALOG } from '../../lib/constants';
import { PowerCard } from '../../lib/powerCardsCatalog';
import { PowerCardsState, getPowerCardById } from '../../lib/powerCards';
import { Team, Player } from '../../lib/types';
import PowerCardView from '../PowerCardView';

export interface HostPowerCardModalsProps {
  activeCardOnScreen: {
    card: PowerCard;
    teamId?: string;
    teamName: string;
    targetName?: string;
    sensoryLimitation?: string;
    recoveredCard?: PowerCard;
  } | null;
  onReturnCardToTeam: (teamId: string, cardId: string) => void;
  onDismissCardOnScreen: () => void;
  bankChoiceState: {
    teamId: string;
    teamName: string;
    cards: [PowerCard, PowerCard];
  } | null;
  onSelectBankChoice: (chosenCardId: string, rejectedCardId: string) => void;
  timeTravelModal: {
    teamId: string;
    teamName: string;
  } | null;
  onCloseTimeTravelModal: () => void;
  onPlayTimeTravelCard: (teamId: string, cardId: string, targetCardId: string) => void;
  discardPile: string[];
  isDiscardModalOpen: boolean;
  onCloseDiscardModal: () => void;
  returnCardModal: {
    card: PowerCard;
  } | null;
  onSetReturnCardModal: (val: { card: PowerCard } | null) => void;
  targetModalState: {
    card: PowerCard;
    teamId: string;
  } | null;
  onCloseTargetModal: () => void;
  onPlayTargetCard: (
    sourceTeamId: string,
    cardId: string,
    targetTeamId?: string,
    targetPlayerName?: string
  ) => void;
  activeTeams: Team[];
  players: Player[];
  powerCards: PowerCardsState;
}

export const HostPowerCardModals: React.FC<HostPowerCardModalsProps> = ({
  activeCardOnScreen,
  onReturnCardToTeam,
  onDismissCardOnScreen,
  bankChoiceState,
  onSelectBankChoice,
  timeTravelModal,
  onCloseTimeTravelModal,
  onPlayTimeTravelCard,
  discardPile,
  isDiscardModalOpen,
  onCloseDiscardModal,
  returnCardModal,
  onSetReturnCardModal,
  targetModalState,
  onCloseTargetModal,
  onPlayTargetCard,
  activeTeams,
  players,
  powerCards,
}) => {
  return (
    <>
      {/* BANNER FLOTANTE: CARTA PROYECTADA EN TV (ADAPTADO A MÓVIL) */}
      {activeCardOnScreen && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-md z-50 bg-slate-900/95 border-2 border-amber-400 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2 animate-bounce">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl flex-shrink-0">{activeCardOnScreen.card.emoji}</span>
            <div className="min-w-0">
              <span className="text-[9px] text-amber-400 font-black uppercase tracking-wider block truncate">
                En TV • {activeCardOnScreen.teamName}
              </span>
              <span className="text-xs sm:text-sm font-black text-white block truncate">
                {activeCardOnScreen.card.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                const teamId =
                  activeCardOnScreen.teamId ||
                  activeTeams.find((t) => t.name === activeCardOnScreen.teamName)?.id;
                if (teamId) {
                  onReturnCardToTeam(teamId, activeCardOnScreen.card.id);
                } else {
                  onDismissCardOnScreen();
                }
              }}
              className="px-2.5 sm:px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black uppercase rounded-xl shadow active:scale-95 transition-all flex items-center gap-1"
              title="Anular jugada y devolver carta a su equipo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Devolver</span>
            </button>
            <button
              onClick={onDismissCardOnScreen}
              className="p-2 sm:px-3 sm:py-2 bg-red-600 hover:bg-red-500 text-white text-[11px] sm:text-xs font-black uppercase rounded-xl shadow active:scale-95 transition-all flex items-center gap-1"
              title="Quitar de la TV"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitar</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: BANCO DE CARTAS (ELEGIR 1 DE LAS 2 ROBADAS) */}
      {bankChoiceState && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-center">
            <div>
              <span className="text-3xl">🏛️</span>
              <h3 className="text-xl font-black text-white uppercase mt-1">Banco de Cartas</h3>
              <p className="text-xs text-indigo-300 font-medium">
                Equipo: <strong className="text-white">{bankChoiceState.teamName}</strong>. Elige 1 carta para su mano. La otra volverá al mazo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
              {bankChoiceState.cards.map((c, idx) => {
                const otherCard = bankChoiceState.cards[1 - idx];
                return (
                  <div
                    key={c.id}
                    className="flex flex-col items-center gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 w-full"
                  >
                    <PowerCardView card={c} size="md" />
                    <button
                      onClick={() => onSelectBankChoice(c.id, otherCard.id)}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md active:scale-95 transition-all"
                    >
                      ✓ Quedarse con esta
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIAJE EN EL TIEMPO (RECUPERAR DEL DESCARTE) */}
      {timeTravelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏳</span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">Viaje en el Tiempo</h3>
                  <p className="text-xs text-amber-300">
                    Equipo: <strong className="text-white">{timeTravelModal.teamName}</strong>. Elige una carta descartada para recuperarla.
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseTimeTravelModal}
                className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {discardPile.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No hay cartas en la pila de descartes.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {discardPile.map((cId, idx) => {
                  const card = getPowerCardById(cId);
                  if (!card) return null;
                  return (
                    <div
                      key={`${cId}_${idx}`}
                      onClick={() => {
                        onPlayTimeTravelCard(timeTravelModal.teamId, 'viaje_tiempo', cId);
                        onCloseTimeTravelModal();
                      }}
                      className="cursor-pointer hover:scale-105 transition-transform flex flex-col items-center p-2 bg-slate-950 rounded-xl border border-slate-800 hover:border-amber-400"
                    >
                      <PowerCardView card={card} size="sm" />
                      <span className="text-[10px] font-bold text-amber-300 uppercase mt-2">
                        Recuperar ➔
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: PILA DE DESCARTES (VISUALIZADOR GENERAL) */}
      {isDiscardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪦</span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">Pila de Descartes</h3>
                  <p className="text-xs text-slate-400">
                    Total: {discardPile.length} cartas jugadas hasta ahora
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseDiscardModal}
                className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {discardPile.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No se ha descartado ninguna carta todavía.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {discardPile.map((cId, idx) => {
                  const card = getPowerCardById(cId);
                  if (!card) return null;
                  return (
                    <div
                      key={`${cId}_${idx}`}
                      className="flex flex-col items-center p-2.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2"
                    >
                      <PowerCardView card={card} size="sm" />
                      <button
                        onClick={() => onSetReturnCardModal({ card })}
                        className="w-full px-2 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 active:scale-95 transition-all shadow"
                        title="Devolver esta carta a la mano de un equipo"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>↩ Devolver a Equipo</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SELECCIONAR EQUIPO AL QUE DEVOLVER CARTA */}
      {returnCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{returnCardModal.card.emoji}</span>
                <div>
                  <h3 className="text-base font-black text-white uppercase">
                    Devolver "{returnCardModal.card.name}"
                  </h3>
                  <p className="text-xs text-amber-300">
                    Selecciona a qué equipo devolver esta carta a su mano
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSetReturnCardModal(null)}
                className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {activeTeams.map((team) => {
                const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
                const currentCards = powerCards.teamHands[team.id]?.length || 0;
                return (
                  <button
                    key={team.id}
                    onClick={() => {
                      onReturnCardToTeam(team.id, returnCardModal.card.id);
                      onSetReturnCardModal(null);
                    }}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-98 ${
                      cat?.twBorder || 'border-slate-700'
                    } bg-slate-800/80 hover:bg-slate-700/80`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3.5 h-3.5 rounded-full ${cat?.twBg || 'bg-amber-400'}`} />
                      <div className="text-left">
                        <span
                          className={`text-xs font-black uppercase block ${cat?.twText || 'text-white'}`}
                        >
                          {team.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Tiene actualmente {currentCards} {currentCards === 1 ? 'carta' : 'cartas'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      Entregar ➔
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SELECCIONAR EQUIPO O JUGADOR RIVAL OBJETIVO */}
      {targetModalState && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{targetModalState.card.emoji}</span>
                <div>
                  <h3 className="text-base font-black text-white uppercase">
                    Objetivo para "{targetModalState.card.name}"
                  </h3>
                  <p className="text-xs text-amber-300">
                    Equipo emisor:{' '}
                    <strong>
                      {activeTeams.find((t) => t.id === targetModalState.teamId)?.name}
                    </strong>
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseTargetModal}
                className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SI REQUIERE EQUIPO */}
            {targetModalState.card.requiresTarget === 'team' && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Haz clic en el equipo rival objetivo:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeTeams
                    .filter((t) => t.id !== targetModalState.teamId)
                    .map((rival) => {
                      const rivalCat = TEAMS_CATALOG.find((c) => c.index === rival.team_index);
                      const rivalMembers = players.filter(
                        (p) => p.team_id === rival.id || p.team_index === rival.team_index
                      );
                      return (
                        <button
                          key={rival.id}
                          onClick={() => {
                            onPlayTargetCard(targetModalState.teamId, targetModalState.card.id, rival.id);
                            onCloseTargetModal();
                          }}
                          className={`p-3.5 rounded-2xl border ${
                            rivalCat?.twBorder || 'border-slate-700'
                          } bg-slate-950/80 hover:scale-102 hover:shadow-lg transition-all text-left flex items-center justify-between group`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3.5 h-3.5 rounded-full ${rivalCat?.twBg}`} />
                            <div>
                              <span
                                className={`text-sm font-black uppercase ${
                                  rivalCat?.twText || 'text-white'
                                }`}
                              >
                                {rival.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-medium">
                                {rivalMembers.length} miembros • {rival.score} pts
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform uppercase">
                            Elegir ➔
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* SI REQUIERE JUGADOR */}
            {targetModalState.card.requiresTarget === 'player' && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Haz clic en el jugador rival objetivo:
                </span>
                {(() => {
                  const rivalPlayersList = players.filter(
                    (p) =>
                      p.team_id !== targetModalState.teamId &&
                      p.team_index !==
                        activeTeams.find((t) => t.id === targetModalState.teamId)?.team_index
                  );
                  if (rivalPlayersList.length === 0) {
                    return (
                      <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-center space-y-2">
                        <p className="text-xs text-slate-400">
                          No hay jugadores rivales conectados actualmente.
                        </p>
                        <input
                          type="text"
                          placeholder="Escribe el nombre del jugador rival y pulsa Enter..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              onPlayTargetCard(
                                targetModalState.teamId,
                                targetModalState.card.id,
                                undefined,
                                e.currentTarget.value.trim()
                              );
                              onCloseTargetModal();
                            }
                          }}
                        />
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {rivalPlayersList.map((p) => {
                        const pTeam = activeTeams.find(
                          (t) => t.id === p.team_id || t.team_index === p.team_index
                        );
                        const pCat = pTeam
                          ? TEAMS_CATALOG.find((c) => c.index === pTeam.team_index)
                          : null;
                        const isBaneoCard = targetModalState.card.id === 'baneo';
                        const isAlreadyBanned = (powerCards.bannedPlayerNames || []).includes(
                          p.nickname.toLowerCase().trim()
                        );
                        const isDisabled = isBaneoCard && isAlreadyBanned;

                        return (
                          <button
                            key={p.id}
                            disabled={isDisabled}
                            onClick={() => {
                              if (isDisabled) return;
                              onPlayTargetCard(
                                targetModalState.teamId,
                                targetModalState.card.id,
                                pTeam?.id,
                                p.nickname
                              );
                              onCloseTargetModal();
                            }}
                            className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between group ${
                              isDisabled
                                ? 'border-red-900/40 bg-slate-950/40 opacity-40 cursor-not-allowed'
                                : 'border-slate-800 bg-slate-950/90 hover:border-amber-400 hover:scale-102 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{isDisabled ? '🚫' : p.badge_emoji || '👤'}</span>
                              <div>
                                <span className="text-xs font-black text-white block leading-tight">
                                  {p.nickname}
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase ${
                                    pCat?.twText || 'text-slate-400'
                                  }`}
                                >
                                  {pCat?.name || pTeam?.name || 'Rival'}
                                </span>
                              </div>
                            </div>
                            {isDisabled ? (
                              <span className="text-[9px] font-bold text-red-400 bg-red-950/60 border border-red-800/50 px-1.5 py-0.5 rounded">
                                Ya baneado
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                                Elegir ➔
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

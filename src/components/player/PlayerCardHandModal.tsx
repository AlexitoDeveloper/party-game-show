import React, { useState } from 'react';
import { Crown, X } from 'lucide-react';
import { PowerCard, PowerCardsState, getPowerCardById } from '../../lib/powerCards';
import { Team, Player } from '../../lib/types';
import { TEAMS_CATALOG, TeamCatalogItem } from '../../lib/constants';
import PowerCardView from '../PowerCardView';
import { FannedHandDeck } from '../cards/FannedHandDeck';

interface PlayerCardHandModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeam: TeamCatalogItem | null;
  player: Player | null;
  myTeamCards: PowerCard[];
  activeTeams: Team[];
  myTeamId: string | null;
  rivalPlayers: Player[];
  powerCards: PowerCardsState | null;
  onPlayCard: (card: PowerCard) => void;
  onExecuteCardAction: (
    card: PowerCard,
    targetTeamId?: string,
    targetPlayerName?: string,
    targetCardId?: string
  ) => void;
  onToast: (msg: string) => void;
}

export const PlayerCardHandModal: React.FC<PlayerCardHandModalProps> = ({
  isOpen,
  onClose,
  selectedTeam,
  player,
  myTeamCards,
  activeTeams,
  myTeamId,
  rivalPlayers,
  powerCards,
  onPlayCard,
  onExecuteCardAction,
  onToast,
}) => {
  const [selectedCardToPlay, setSelectedCardToPlay] = useState<PowerCard | null>(null);
  const [targetTeamId, setTargetTeamId] = useState<string | undefined>(undefined);
  const [targetPlayerName, setTargetPlayerName] = useState<string>('');
  const [targetCardId, setTargetCardId] = useState<string | undefined>(undefined);
  const [isManualPlayerEntry, setIsManualPlayerEntry] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedCardToPlay(null);
    onClose();
  };

  const handleSelectCard = (card: PowerCard) => {
    if (card.requiresTarget) {
      setSelectedCardToPlay(card);
      setTargetTeamId(undefined);
      setTargetPlayerName('');
      setTargetCardId(undefined);
      setIsManualPlayerEntry(false);
    } else {
      onPlayCard(card);
      handleClose();
    }
  };

  const handleConfirmAction = () => {
    if (!selectedCardToPlay) return;
    onExecuteCardAction(selectedCardToPlay, targetTeamId, targetPlayerName, targetCardId);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07070a]/95 backdrop-blur-xl flex flex-col justify-end sm:justify-center items-center p-2 sm:p-4 select-none">
      <div className="bg-[#0c0c14] border-2 border-[#d4af37]/60 rounded-3xl w-full max-w-sm max-h-[92vh] overflow-y-auto p-3.5 sm:p-5 shadow-deco-gold space-y-3 deco-card-frame">
        <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🃏</span>
            <div>
              <h3 className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">Naipes de tu Bando</h3>
              <span className="text-[10px] font-vintage text-amber-200/70">
                {selectedTeam?.name} • Baraja de Casino
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 bg-[#14141e] border border-[#d4af37]/30 rounded-full text-amber-200 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SECCIÓN SI ESTÁ SELECCIONANDO OBJETIVO PARA LANZAR */}
        {selectedCardToPlay ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center my-2 space-y-2">
              <PowerCardView card={selectedCardToPlay} size="sm" />
              <p className="text-xs text-amber-300 font-medium italic text-center">
                "{selectedCardToPlay.tagline}"
              </p>
            </div>

            {selectedCardToPlay.requiresTarget === 'team' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-300 block">
                  Elige el Equipo Rival Objetivo:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {activeTeams
                    .filter((t) => t.id !== myTeamId)
                    .map((team) => {
                      const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
                      const isSelected = targetTeamId === team.id;
                      return (
                        <button
                          key={team.id}
                          onClick={() => setTargetTeamId(team.id)}
                          className={`p-3 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                            isSelected
                              ? `${cat?.twBg} text-slate-950 font-black shadow-md scale-102`
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{team.name}</span>
                          {isSelected && <span>✓ Seleccionado</span>}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {selectedCardToPlay.requiresTarget === 'player' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-300 block">
                    Elige el Jugador Rival Objetivo:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManualPlayerEntry(!isManualPlayerEntry)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-bold"
                  >
                    {isManualPlayerEntry ? 'Volver a lista' : 'Escribir a mano'}
                  </button>
                </div>

                {!isManualPlayerEntry ? (
                  rivalPlayers.length === 0 ? (
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center space-y-1">
                      <p className="text-xs text-slate-400">No hay otros jugadores detectados.</p>
                      <button
                        type="button"
                        onClick={() => setIsManualPlayerEntry(true)}
                        className="text-xs text-amber-400 font-bold underline"
                      >
                        Escribir nombre del rival manualmente
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto pr-1">
                      {rivalPlayers.map((p) => {
                        const pTeam = activeTeams.find((t) => t.id === p.team_id || t.team_index === p.team_index);
                        const pCat = pTeam ? TEAMS_CATALOG.find((c) => c.index === pTeam.team_index) : null;
                        const isSelected = targetPlayerName === p.nickname;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setTargetPlayerName(p.nickname);
                              if (pTeam) setTargetTeamId(pTeam.id);
                            }}
                            className={`p-2.5 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-102 border-amber-300'
                                : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{p.badge_emoji || '👤'}</span>
                              <div>
                                <span className="block leading-tight text-xs font-black">{p.nickname}</span>
                                <span className={`text-[9px] uppercase font-bold block ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {pCat?.name || pTeam?.name || 'Equipo Rival'}
                                </span>
                              </div>
                            </div>
                            {isSelected && <span className="text-[10px] font-black">✓ Elegido</span>}
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Nombre del jugador rival..."
                      value={targetPlayerName}
                      onChange={(e) => setTargetPlayerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-400"
                    />

                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Equipo del jugador:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTeams
                        .filter((t) => t.id !== myTeamId)
                        .map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTargetTeamId(t.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              targetTeamId === t.id
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-950 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {t.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedCardToPlay.requiresTarget === 'card' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-300 block">
                  Elige la Carta a Recuperar del Descarte:
                </label>
                {!powerCards?.discardPile || powerCards.discardPile.length === 0 ? (
                  <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-center space-y-1">
                    <span className="text-xl">📭</span>
                    <p className="text-xs text-slate-400">
                      No hay cartas en la pila de descartes aún.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {powerCards.discardPile.map((dCardId, idx) => {
                      const dCard = getPowerCardById(dCardId);
                      if (!dCard) return null;
                      const isSelected = targetCardId === dCardId;
                      return (
                        <button
                          key={`${dCardId}_${idx}`}
                          onClick={() => setTargetCardId(dCardId)}
                          className={`w-full p-2.5 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 shadow-md font-black'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{dCard.emoji}</span>
                            <div>
                              <span className="block">{dCard.name}</span>
                              <span className="text-[10px] opacity-75 font-normal">
                                ★ {dCard.rarity}
                              </span>
                            </div>
                          </div>
                          {isSelected && <span>✓ Elegida</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedCardToPlay(null)}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase hover:bg-slate-700"
              >
                Atrás
              </button>
              <button
                disabled={
                  (selectedCardToPlay.requiresTarget === 'team' && !targetTeamId) ||
                  (selectedCardToPlay.requiresTarget === 'player' && !targetPlayerName.trim()) ||
                  (selectedCardToPlay.requiresTarget === 'card' &&
                    (!targetCardId || !powerCards?.discardPile?.length))
                }
                onClick={handleConfirmAction}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
              >
                🚀 ¡Activar Poder!
              </button>
            </div>
          </div>
        ) : (
          /* LISTA DE CARTAS EN MANO CON CARRUSEL 3D COVERFLOW */
          <div className="space-y-4">
            {myTeamCards.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <span className="text-4xl select-none opacity-40 block">📭</span>
                <p className="text-xs text-amber-200/70 font-vintage">
                  Tu equipo no tiene cartas de poder en este momento.
                </p>
                <p className="text-[11px] text-amber-400/80 italic font-editorial">
                  ¡Atento a la TV cuando el anfitrión reparta cartas al inicio o tras una prueba!
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Header bar indicando rol del jugador */}
                <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-vintage mb-2">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{player?.is_captain ? 'Eres el Capitán: Puedes Jugar Naipes' : 'Solo Capitán puede jugarlas'}</span>
                  </div>
                  <span className="text-[10px] text-amber-400/70">
                    {myTeamCards.length} en mano
                  </span>
                </div>

                {/* Carrusel 3D Coverflow de Naipes */}
                <FannedHandDeck
                  cards={myTeamCards}
                  disabled={!player?.is_captain}
                  onPlayCard={(card) => {
                    if (player?.is_captain) {
                      handleSelectCard(card);
                    } else {
                      onToast('👑 Solo el Capitán puede jugar las cartas.');
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, X } from 'lucide-react';
import { PowerCard, PowerCardsState, getPowerCardById } from '../../lib/powerCards';
import { Team, Player } from '../../lib/types';
import { TEAMS_CATALOG, TeamCatalogItem } from '../../lib/constants';
import PowerCardView from '../PowerCardView';
import { FannedHandDeck } from '../cards/FannedHandDeck';
import { playerHaptics } from '../../lib/playerHaptics';
import { isRecentFullscreenTransition } from '../../hooks/useFullscreen';

interface PlayerFannedHandDrawerProps {
  myTeamCards: PowerCard[];
  selectedTeam: TeamCatalogItem | null;
  player: Player | null;
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

/**
 * PlayerFannedHandDrawer: Bandeja de cartas estilo mesa de casino clandestino (1930s Speakeasy).
 * Docked en la parte inferior de la pantalla cuando está plegada, y con overlay independiente
 * que evita que el botón flote o se monte sobre el panel al abrirse/cerrarse.
 */
export const PlayerFannedHandDrawer: React.FC<PlayerFannedHandDrawerProps> = ({
  myTeamCards,
  selectedTeam,
  player,
  activeTeams,
  myTeamId,
  rivalPlayers,
  powerCards,
  onPlayCard,
  onExecuteCardAction,
  onToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCardToPlay, setSelectedCardToPlay] = useState<PowerCard | null>(null);
  const [targetTeamId, setTargetTeamId] = useState<string | undefined>(undefined);
  const [targetPlayerName, setTargetPlayerName] = useState<string>('');
  const [targetCardId, setTargetCardId] = useState<string | undefined>(undefined);
  const [isManualPlayerEntry, setIsManualPlayerEntry] = useState(false);

  const toggleDrawer = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    // Evitar que toques o clics accidentales/fantasmas durante o justo tras salir de pantalla completa abran la mano
    if (isRecentFullscreenTransition()) {
      return;
    }
    playerHaptics.cardSlide();
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setSelectedCardToPlay(null);
    }
  };

  const handleSelectCard = (card: PowerCard) => {
    if (card.requiresTarget) {
      playerHaptics.cardSlide();
      setSelectedCardToPlay(card);
      setTargetTeamId(undefined);
      setTargetPlayerName('');
      setTargetCardId(undefined);
      setIsManualPlayerEntry(false);
    } else {
      playerHaptics.cardPlay();
      onPlayCard(card);
      setSelectedCardToPlay(null);
      setIsOpen(false);
    }
  };

  const handleConfirmAction = () => {
    if (!selectedCardToPlay) return;
    playerHaptics.cardPlay();
    onExecuteCardAction(selectedCardToPlay, targetTeamId, targetPlayerName, targetCardId);
    setSelectedCardToPlay(null);
    setIsOpen(false);
  };

  const cardCount = myTeamCards.length;

  return (
    <>
      {/* 1. BOTÓN / LENGÜETA INFERIOR (SOLO VISIBLE CUANDO EL PANEL ESTÁ CERRADO) */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none select-none pb-[max(env(safe-area-inset-bottom,0px),4px)]">
            <motion.button
              key="peek-flap-btn"
              type="button"
              onClick={toggleDrawer}
              onPointerDown={(e) => e.stopPropagation()}
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 25, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`pointer-events-auto px-5 py-2.5 rounded-t-2xl border-t-2 border-x-2 shadow-2xl flex items-center gap-3 backdrop-blur-xl transition-all cursor-pointer ${
                cardCount > 0
                  ? 'bg-gradient-to-t from-[#0e0a05] via-[#1c1409] to-[#281c0c] border-[#d4af37] text-amber-100 shadow-[0_-8px_25px_rgba(212,175,55,0.35)]'
                  : 'bg-[#090910]/95 border-[#d4af37]/30 text-amber-200/50'
              }`}
            >
              {/* Asomo de naipes en miniatura si hay cartas */}
              {cardCount > 0 ? (
                <div className="flex -space-x-2.5 items-center mr-0.5">
                  {myTeamCards.slice(0, 3).map((_, idx) => (
                    <span
                      key={idx}
                      className="w-4 h-6 rounded-[3px] bg-gradient-to-br from-amber-200 to-amber-600 border border-[#f5eedb]/80 shadow-md block origin-bottom"
                      style={{ transform: `rotate(${(idx - 1) * 10}deg)` }}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-sm opacity-60">🂠</span>
              )}

              <div className="flex items-center gap-1.5 font-broadway tracking-wider uppercase text-xs">
                <span className="text-amber-400">♠</span>
                <span className={cardCount > 0 ? 'text-gold-gradient font-black' : 'text-amber-200/60'}>
                  Naipes ({cardCount})
                </span>
                <span className="text-amber-400">♦</span>
              </div>

              <ChevronUp className="w-4 h-4 text-amber-300 animate-bounce" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* 2. OVERLAY Y PANEL DESPLEGABLE CON TAPETE DE CASINO */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end items-center select-none">
            {/* BACKDROP OSCURO TRANSLÚCIDO (TOCAR PARA CERRAR) */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={toggleDrawer}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            {/* BANDEJA DE TERCIOPELO QUE DESLIZA DESDE ABAJO */}
            <motion.div
              key="drawer-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative z-10 w-full max-w-md casino-velvet-tray border-t-4 border-[#d4af37] rounded-t-3xl p-4 shadow-[0_-25px_60px_rgba(0,0,0,0.95)] max-h-[85vh] overflow-y-auto flex flex-col"
            >
              {/* CABECERA DEL TAPETE */}
              <div className="flex items-center justify-between border-b border-[#d4af37]/40 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-slate-950 font-broadway font-black text-sm shadow">
                    🃏
                  </div>
                  <div>
                    <h3 className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">
                      Tapete de Naipes de Poder
                    </h3>
                    <span className="text-[10px] font-vintage text-amber-200/70 block">
                      {selectedTeam?.name} • Mano Secreta de Mesa
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleDrawer}
                  className="w-8 h-8 rounded-full bg-[#12121a] border border-[#d4af37]/40 text-amber-200 flex items-center justify-center hover:text-white active:scale-90 transition-all cursor-pointer"
                  title="Plegar tapete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* SECCIÓN SI ESTÁ SELECCIONANDO OBJETIVO */}
              {selectedCardToPlay ? (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="flex flex-col items-center justify-center space-y-2 bg-[#0c0c14]/90 p-3 rounded-2xl border border-[#d4af37]/40">
                    <PowerCardView card={selectedCardToPlay} size="sm" />
                    <p className="text-xs text-amber-300 font-vintage italic text-center max-w-xs">
                      "{selectedCardToPlay.tagline}"
                    </p>
                  </div>

                  {selectedCardToPlay.requiresTarget === 'team' && (
                    <div className="space-y-2">
                      <label className="text-xs font-broadway uppercase text-amber-300 block">
                        Elige el Equipo Rival Objetivo:
                      </label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {activeTeams
                          .filter((t) => t.id !== myTeamId)
                          .map((team) => {
                            const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
                            const isSelected = targetTeamId === team.id;
                            return (
                              <button
                                key={team.id}
                                type="button"
                                onClick={() => setTargetTeamId(team.id)}
                                className={`p-2.5 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                                  isSelected
                                    ? `${cat?.twBg || 'bg-amber-400'} text-slate-950 font-black shadow-md border-white scale-[1.01]`
                                    : 'bg-[#0a0a12] border-stone-800 text-stone-300 hover:border-amber-400/50'
                                }`}
                              >
                                <span>{team.name}</span>
                                {isSelected && <span className="font-broadway uppercase text-[10px]">✓ Marcado</span>}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {selectedCardToPlay.requiresTarget === 'player' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-broadway uppercase text-amber-300 block">
                          Elige el Jugador Rival Objetivo:
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsManualPlayerEntry(!isManualPlayerEntry)}
                          className="text-[10px] text-amber-400 underline font-vintage font-bold"
                        >
                          {isManualPlayerEntry ? 'Volver a lista' : 'Escribir nombre'}
                        </button>
                      </div>

                      {!isManualPlayerEntry ? (
                        rivalPlayers.length === 0 ? (
                          <div className="p-3 bg-[#0a0a12] border border-stone-800 rounded-xl text-center space-y-1">
                            <p className="text-xs text-stone-400 font-vintage">No hay otros jugadores detectados.</p>
                            <button
                              type="button"
                              onClick={() => setIsManualPlayerEntry(true)}
                              className="text-xs text-amber-400 font-broadway underline uppercase"
                            >
                              Escribir rival manualmente
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                            {rivalPlayers.map((p) => {
                              const pTeam = activeTeams.find((t) => t.id === p.team_id || t.team_index === p.team_index);
                              const isSelected = targetPlayerName === p.nickname;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setTargetPlayerName(p.nickname);
                                    if (pTeam) setTargetTeamId(pTeam.id);
                                  }}
                                  className={`p-2 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                                    isSelected
                                      ? 'bg-amber-400 text-slate-950 font-black shadow-md border-amber-300'
                                      : 'bg-[#0a0a12] border-stone-800 text-stone-200 hover:border-amber-400/40'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{p.badge_emoji || '👤'}</span>
                                    <div>
                                      <span className="block leading-tight text-xs font-black font-broadway">{p.nickname}</span>
                                      <span className={`text-[9px] uppercase font-bold block ${isSelected ? 'text-slate-950' : 'text-stone-400'}`}>
                                        {pTeam?.name || 'Rival'}
                                      </span>
                                    </div>
                                  </div>
                                  {isSelected && <span className="text-[10px] font-black font-broadway">✓ Elegido</span>}
                                </button>
                              );
                            })}
                          </div>
                        )
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Nombre del rival..."
                            value={targetPlayerName}
                            onChange={(e) => setTargetPlayerName(e.target.value)}
                            className="w-full bg-[#0a0a12] border border-[#d4af37]/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-600 outline-none focus:border-amber-400 font-broadway"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {selectedCardToPlay.requiresTarget === 'card' && (
                    <div className="space-y-2">
                      <label className="text-xs font-broadway uppercase text-amber-300 block">
                        Carta a Recuperar del Descarte:
                      </label>
                      {!powerCards?.discardPile || powerCards.discardPile.length === 0 ? (
                        <div className="p-3 bg-[#0a0a12] rounded-xl border border-stone-800 text-center text-xs text-stone-400 font-vintage">
                          No hay cartas en la pila de descartes aún.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                          {powerCards.discardPile.map((dCardId, idx) => {
                            const dCard = getPowerCardById(dCardId);
                            if (!dCard) return null;
                            const isSelected = targetCardId === dCardId;
                            return (
                              <button
                                key={`${dCardId}_${idx}`}
                                type="button"
                                onClick={() => setTargetCardId(dCardId)}
                                className={`w-full p-2 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                                  isSelected
                                    ? 'bg-gold-gradient text-slate-950 border-white font-black'
                                    : 'bg-[#0a0a12] border-stone-800 text-stone-300'
                                }`}
                              >
                                <span>{dCard.name}</span>
                                <span className="text-[9px] uppercase opacity-75">{dCard.rarity}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* BOTONES DE CONFIRMACIÓN */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCardToPlay(null)}
                      className="py-2.5 px-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 font-broadway text-xs uppercase cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={
                        (selectedCardToPlay.requiresTarget === 'team' && !targetTeamId) ||
                        (selectedCardToPlay.requiresTarget === 'player' && !targetPlayerName) ||
                        (selectedCardToPlay.requiresTarget === 'card' && !targetCardId)
                      }
                      onClick={handleConfirmAction}
                      className="py-2.5 px-3 rounded-xl bg-gold-gradient text-slate-950 font-broadway font-black text-xs uppercase shadow-deco-gold disabled:opacity-40 disabled:cursor-not-allowed border border-[#f5eedb] cursor-pointer"
                    >
                      ¡Lanzar Ataque!
                    </button>
                  </div>
                </div>
              ) : cardCount === 0 ? (
                /* ESTADO SIN CARTAS */
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#0a0a14] border-2 border-dashed border-[#d4af37]/40 flex items-center justify-center text-2xl text-amber-300/60">
                    🂠
                  </div>
                  <div className="max-w-xs mx-auto">
                    <h4 className="text-base font-broadway uppercase text-gold-gradient">Mano Vacía</h4>
                    <p className="text-xs font-vintage text-amber-200/70 mt-1">
                      Tu equipo no dispone de naipes en este momento. ¡Gana pruebas o consigue favores del Anfitrión para robar del mazo!
                    </p>
                  </div>
                </div>
              ) : (
                /* MAZO 3D INTERACTIVO CON COVERFLOW */
                <div className="space-y-2">
                  <FannedHandDeck
                    cards={myTeamCards}
                    onPlayCard={handleSelectCard}
                  />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

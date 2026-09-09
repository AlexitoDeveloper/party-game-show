import { useState, useEffect } from 'react';
import { PowerCard, getRandomSensoryLimitation } from '../../lib/powerCardsCatalog';
import {
  PowerCardsState,
  createInitialPowerCardsState,
  dealInitialCardsToTeams,
  dealCardToSingleTeam,
  getPowerCardById,
  executePlayCard,
  executeDrawTwoForBank,
  executeStealCard,
  executeSwapCard,
  executeRecoverDiscardedCard,
  executeChooseBankCard,
} from '../../lib/powerCards';
import { RoomSync } from '../../lib/roomSync';
import { Team, Player, Room } from '../../lib/types';
import { GameDefinition, GAMES_CATALOG } from '../../lib/games';

export interface UseHostPowerCardsParams {
  roomCode: string;
  room: Room;
  roomSync: RoomSync;
  activeTeams: Team[];
  players: Player[];
  activeGame: GameDefinition;
  handleScoreChange: (teamId: string, delta: number) => void;
  soundFX: {
    playSound: (sound: string) => void;
  };
}

export function useHostPowerCards({
  roomCode,
  room,
  roomSync,
  activeTeams,
  players,
  activeGame,
  handleScoreChange,
  soundFX,
}: UseHostPowerCardsParams) {
  const [powerCards, setPowerCards] = useState<PowerCardsState>(() => {
    const saved = localStorage.getItem(`party_power_cards_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return createInitialPowerCardsState();
  });

  const [selectedBonusTeam, setSelectedBonusTeam] = useState<string>('random');

  const [activeCardOnScreen, setActiveCardOnScreen] = useState<{
    card: PowerCard;
    teamId?: string;
    teamName: string;
    targetName?: string;
    sensoryLimitation?: string;
    recoveredCard?: PowerCard;
  } | null>(null);

  const [bankChoiceState, setBankChoiceState] = useState<{
    teamId: string;
    teamName: string;
    cards: [PowerCard, PowerCard];
  } | null>(null);

  const [timeTravelModal, setTimeTravelModal] = useState<{
    teamId: string;
    teamName: string;
  } | null>(null);

  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [targetModalState, setTargetModalState] = useState<{
    card: PowerCard;
    teamId: string;
  } | null>(null);
  const [returnCardModal, setReturnCardModal] = useState<{
    card: PowerCard;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(powerCards));
  }, [powerCards, roomCode]);

  const handleDealInitialCards = () => {
    const activeTeamIds = activeTeams.map((t) => t.id);
    if (activeTeamIds.length === 0) return;
    const { nextState, dealt } = dealInitialCardsToTeams(powerCards, activeTeamIds);
    if (dealt.length === 0) {
      alert('¡Todos los equipos ya tienen el número máximo permitido (3 cartas)!');
      return;
    }
    setPowerCards(nextState);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });
  };

  const handleDealBonusCard = (chosenTeamId?: string) => {
    const targetId =
      chosenTeamId && chosenTeamId !== 'random'
        ? chosenTeamId
        : activeTeams.length > 0
        ? activeTeams[Math.floor(Math.random() * activeTeams.length)].id
        : null;

    if (!targetId) return;

    // Remontada invisible: A partir de la 5.ª prueba (índice 4+) y solo para puestos 4.º o peor
    const currentGameIndex = GAMES_CATALOG.findIndex(
      (g) => g.id === (room.active_game_id || activeGame.id)
    );
    const sortedTeams = [...activeTeams].sort((a, b) => b.score - a.score);
    const teamRank = sortedTeams.findIndex((t) => t.id === targetId) + 1;
    const isUnderdog = currentGameIndex >= 4 && teamRank >= 4;

    const { nextState, cardId, isFull } = dealCardToSingleTeam(powerCards, targetId, {
      isUnderdog,
    });
    if (isFull) {
      const teamObj = activeTeams.find((t) => t.id === targetId);
      alert(
        `¡El equipo ${
          teamObj?.name || 'elegido'
        } ya tiene 3 cartas (el máximo permitido)! Debe jugar alguna antes de recibir más.`
      );
      return;
    }
    if (!cardId) {
      alert(
        '¡El mazo común se ha quedado sin cartas! Se han reciclado los descartes si estaban disponibles.'
      );
      return;
    }
    setPowerCards(nextState);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });
  };

  const handlePlayCardDirectly = (
    sourceTeamId: string,
    cardId: string,
    targetTeamId?: string,
    targetPlayerName?: string,
    targetCardId?: string
  ) => {
    const card = getPowerCardById(cardId);
    const team = activeTeams.find((t) => t.id === sourceTeamId);
    if (!card || !team) return;

    if (card.requiresTarget === 'team' && !targetTeamId) {
      setTargetModalState({ card, teamId: sourceTeamId });
      return;
    }

    if (card.requiresTarget === 'player' && !targetPlayerName) {
      setTargetModalState({ card, teamId: sourceTeamId });
      return;
    }

    // Validación especial para El Ave Fénix (Legendaria): A partir de la 5ª prueba y solo si vas 4º o peor
    if (cardId === 'ave_fenix') {
      const currentGameIndex = GAMES_CATALOG.findIndex(
        (g) => g.id === (room.active_game_id || activeGame.id)
      );
      const sortedTeams = [...activeTeams].sort((a, b) => b.score - a.score);
      const teamRank = sortedTeams.findIndex((t) => t.id === sourceTeamId) + 1;

      if (currentGameIndex >= 0 && currentGameIndex < 4) {
        soundFX.playSound('buzz');
        alert(
          `🔥 ¡EL AVE FÉNIX NO PUEDE DESPEGAR AÚN!\nEsta legendaria solo puede jugarse a partir de la 5.ª prueba (prueba actual: ${
            currentGameIndex + 1
          }.ª). La carta vuelve a la mano.`
        );
        return;
      }

      if (teamRank > 0 && teamRank < 4) {
        soundFX.playSound('buzz');
        alert(
          `🔥 ¡EL AVE FÉNIX SOLO AYUDA A LOS CAÍDOS!\nSolo puede jugarse si el equipo va 4.º o peor en la clasificación (puesto actual: ${teamRank}.º con ${team.score} pts). La carta vuelve a la mano.`
        );
        return;
      }
    }

    const targetTeam = targetTeamId ? activeTeams.find((t) => t.id === targetTeamId) : undefined;

    // Determinar equipo objetivo efectivo (si se especificó un jugador, resolver su equipo)
    let effectiveTargetTeamId = targetTeamId;
    if (!effectiveTargetTeamId && targetPlayerName) {
      const pMatch = players.find(
        (p) => p.nickname.toLowerCase().trim() === targetPlayerName.toLowerCase().trim()
      );
      if (pMatch) {
        effectiveTargetTeamId =
          pMatch.team_id || activeTeams.find((t) => t.team_index === pMatch.team_index)?.id;
      }
    }

    // Comprobar si el equipo objetivo tiene un ESCUDO activo que bloquee cartas dañinas
    const isHarmfulCard = [
      'mal_de_ojo',
      'maldicion_comun',
      'baneo',
      'bomba',
      'cambio_forzoso',
      'caza_lider',
      'robo',
      'la_sentencia',
      'el_cuarto_mono',
      'titiritero',
      'robo_siglo',
      'impuesto_padrino',
    ].includes(cardId);

    const activeShield = effectiveTargetTeamId
      ? powerCards.activeEffects.find(
          (e: any) => e.cardId === 'escudo' && e.sourceTeamId === effectiveTargetTeamId
        )
      : undefined;

    if (isHarmfulCard && activeShield) {
      const victimTeam = activeTeams.find((t) => t.id === effectiveTargetTeamId);
      soundFX.playSound('heroic');
      alert(
        `🛡️ ¡ESCUDO ACTIVADO! ${
          victimTeam?.name || 'El equipo rival'
        } tenía un Escudo activo que ha bloqueado y anulado la carta "${card.name}". Ambas cartas van al descarte.`
      );

      // Descartar la carta jugada y consumir el escudo
      const stateWithPlayed = executePlayCard(
        powerCards,
        sourceTeamId,
        cardId,
        effectiveTargetTeamId,
        targetPlayerName
      );
      const stateShieldConsumed: PowerCardsState = {
        ...stateWithPlayed,
        activeEffects: stateWithPlayed.activeEffects.filter(
          (e: any) => e.id !== activeShield.id && e.cardId !== cardId
        ),
        discardPile: [...stateWithPlayed.discardPile, 'escudo'],
      };
      setPowerCards(stateShieldConsumed);
      localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(stateShieldConsumed));
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: stateShieldConsumed });

      const animPayload = {
        type: 'play' as const,
        teamName: team.name,
        teamId: team.id,
        teamColorHex: team.color_hex,
        card,
        targetName: `🛡️ ¡Bloqueado por Escudo de ${victimTeam?.name || 'Rival'}!`,
      };
      roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
      setActiveCardOnScreen(animPayload);
      return;
    }

    let sensoryLimitationText: string | undefined = undefined;
    let recoveredCardObj: PowerCard | undefined = undefined;

    // Caso Especial 1: BANCO DE CARTAS
    if (cardId === 'banco_cartas') {
      const currentGameIndex = GAMES_CATALOG.findIndex(
        (g) => g.id === (room.active_game_id || activeGame.id)
      );
      const sortedTeams = [...activeTeams].sort((a, b) => b.score - a.score);
      const teamRank = sortedTeams.findIndex((t) => t.id === sourceTeamId) + 1;
      const isUnderdog = currentGameIndex >= 4 && teamRank >= 4;

      const { nextState, drawnCards } = executeDrawTwoForBank(powerCards, { isUnderdog });
      if (!drawnCards) {
        alert('¡No hay suficientes cartas en el mazo ni en descartes para el Banco de Cartas!');
        return;
      }
      // Descartar la carta jugada
      const playedState = executePlayCard(nextState, sourceTeamId, cardId);
      setPowerCards(playedState);
      localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(playedState));
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: playedState });

      const c1 = getPowerCardById(drawnCards[0])!;
      const c2 = getPowerCardById(drawnCards[1])!;
      setBankChoiceState({
        teamId: sourceTeamId,
        teamName: team.name,
        cards: [c1, c2],
      });

      const animPayload = {
        type: 'play' as const,
        teamName: team.name,
        teamId: team.id,
        teamColorHex: team.color_hex,
        card,
      };
      roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
      setActiveCardOnScreen(animPayload);
      return;
    }

    // Caso Especial 2: ROBO
    if (cardId === 'robo' && targetTeamId) {
      const { nextState, stolenCardId } = executeStealCard(powerCards, sourceTeamId, targetTeamId);
      if (!stolenCardId) {
        alert(`¡El equipo ${targetTeam?.name || 'rival'} no tiene cartas para robar!`);
        return;
      }
      const finalState = executePlayCard(nextState, sourceTeamId, cardId, targetTeamId);
      setPowerCards(finalState);
      localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(finalState));
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: finalState });

      const animPayload = {
        type: 'play' as const,
        teamName: team.name,
        teamId: team.id,
        teamColorHex: team.color_hex,
        card,
        targetName: targetTeam?.name,
      };
      roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
      setActiveCardOnScreen(animPayload);
      return;
    }

    // Caso Especial 3: INTERCAMBIO DE CARTAS / EL TRUEQUE
    if ((cardId === 'el_trueque' || cardId === 'intercambio_cartas') && targetTeamId) {
      const targetHand = powerCards.teamHands[targetTeamId] || [];
      if (targetHand.length === 0) {
        alert(`¡El equipo ${targetTeam?.name || 'rival'} no tiene cartas para intercambiar!`);
        return;
      }

      // Descartar la carta jugada del origen
      const stateAfterPlay = executePlayCard(powerCards, sourceTeamId, cardId, targetTeamId);
      const remainingSourceHand = stateAfterPlay.teamHands[sourceTeamId] || [];

      let finalState = stateAfterPlay;
      if (remainingSourceHand.length > 0) {
        // Intercambiar una carta de la mano restante por una aleatoria del rival
        const randomSourceCard = remainingSourceHand[Math.floor(Math.random() * remainingSourceHand.length)];
        const { nextState } = executeSwapCard(stateAfterPlay, sourceTeamId, targetTeamId, randomSourceCard);
        finalState = nextState;
      } else {
        // Si no le quedan más cartas al origen tras jugar El Trueque, roba 1 carta del rival
        const { nextState } = executeStealCard(stateAfterPlay, sourceTeamId, targetTeamId);
        finalState = nextState;
      }

      setPowerCards(finalState);
      localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(finalState));
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: finalState });

      const animPayload = {
        type: 'play' as const,
        teamName: team.name,
        teamId: team.id,
        teamColorHex: team.color_hex,
        card,
        targetName: targetTeam?.name,
      };
      roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
      setActiveCardOnScreen(animPayload);
      return;
    }

    // Caso Especial 4: VIAJE EN EL TIEMPO
    if (cardId === 'viaje_tiempo') {
      if (targetCardId) {
        const stateWithRecovered = executeRecoverDiscardedCard(
          powerCards,
          sourceTeamId,
          targetCardId
        );
        const finalState = executePlayCard(stateWithRecovered, sourceTeamId, cardId);
        setPowerCards(finalState);
        localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(finalState));
        roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: finalState });
        recoveredCardObj = getPowerCardById(targetCardId);

        const animPayload = {
          type: 'play' as const,
          teamName: team.name,
          teamId: team.id,
          teamColorHex: team.color_hex,
          card,
          recoveredCard: recoveredCardObj,
          targetName: recoveredCardObj ? `Recupera: ${recoveredCardObj.name}` : undefined,
        };
        roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
        setActiveCardOnScreen(animPayload);
        return;
      } else {
        if (powerCards.discardPile.length === 0) {
          alert('¡No hay cartas en la pila de descartes para recuperar!');
          return;
        }
        setTimeTravelModal({ teamId: sourceTeamId, teamName: team.name });
        return;
      }
    }

    // Caso Especial 5: EL CUARTO MONO
    if (cardId === 'el_cuarto_mono') {
      const limitation = getRandomSensoryLimitation();
      sensoryLimitationText = `${limitation.emoji} ${limitation.label}: ${limitation.rule}`;
    }

    // Caso Especial 5.1: EL TITIRITERO (Sabotaje cómico)
    if (cardId === 'titiritero') {
      const puppetRules = [
        '🙃 Jugar de espaldas a la pantalla',
        '🎶 Responder cantando como en un musical',
        '🗣️ Hablar con acento extranjero exagerado',
        '💃 Bailar sin parar durante toda la prueba',
        '🤖 Hablar como robot sin doblar articulaciones',
      ];
      const randomRule = puppetRules[Math.floor(Math.random() * puppetRules.length)];
      sensoryLimitationText = `🎭 ${randomRule}`;
    }

    // Caso Especial 6: MAL DE OJO / MALDICIÓN COMÚN (-2 puntos inmediatos al rival objetivo)
    if (cardId === 'mal_de_ojo' || cardId === 'maldicion_comun') {
      const victimId = targetTeamId || sourceTeamId;
      handleScoreChange(victimId, -2);
    }

    // Caso Especial 7: LA MALDICIÓN ÉPICA (Patata caliente: duplica fallos y se pasa a rival)
    if (cardId === 'la_maldicion') {
      sensoryLimitationText = '☠️ Maldición activa (Fallos restan el DOBLE)';
    }

    // Caso Especial 8: ESCUDO (Protección activa durante la prueba actual)
    if (cardId === 'escudo') {
      sensoryLimitationText = '🛡️ Escudo protector activo en esta prueba';
    }

    // Caso Especial 9: EL AVE FÉNIX (Triplica x3 puntos conseguidos en la prueba)
    if (cardId === 'ave_fenix') {
      sensoryLimitationText = '🔥 Puntos Triplicados (x3)';
    }

    const nextState = executePlayCard(
      powerCards,
      sourceTeamId,
      cardId,
      targetTeamId,
      targetPlayerName,
      sensoryLimitationText
    );
    setPowerCards(nextState);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });

    const animPayload = {
      type: 'play' as const,
      teamName: team.name,
      teamId: team.id,
      teamColorHex: team.color_hex,
      card,
      targetName: targetPlayerName || targetTeam?.name,
      sensoryLimitation: sensoryLimitationText,
    };
    roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
    setActiveCardOnScreen(animPayload);
  };

  const handleDismissCardOnScreen = () => {
    setActiveCardOnScreen(null);
    roomSync.broadcast({ type: 'DISMISS_POWER_CARD_ANIMATION' });
  };

  const handleSelectBankChoice = (chosenCardId: string, rejectedCardId: string) => {
    if (!bankChoiceState) return;
    const nextState = executeChooseBankCard(
      powerCards,
      bankChoiceState.teamId,
      chosenCardId,
      rejectedCardId
    );
    setPowerCards(nextState);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });
    setBankChoiceState(null);
  };

  const handleInitiatePlayCard = (teamId: string, card: PowerCard) => {
    if (card.requiresTarget === 'team' || card.requiresTarget === 'player') {
      setTargetModalState({ card, teamId });
      return;
    }
    if (card.requiresTarget === 'card') {
      const team = activeTeams.find((t) => t.id === teamId);
      setTimeTravelModal({ teamId, teamName: team?.name || 'Equipo' });
      return;
    }
    handlePlayCardDirectly(teamId, card.id);
  };

  const handleRemoveActiveEffect = (effectId: string) => {
    const nextEffects = powerCards.activeEffects.filter((e: any) => e.id !== effectId);
    const nextState = { ...powerCards, activeEffects: nextEffects };
    setPowerCards(nextState);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });
  };

  const handleClearAllActiveEffects = () => {
    if (!powerCards || powerCards.activeEffects.length === 0) return;
    const newDiscard = [...powerCards.discardPile];
    powerCards.activeEffects.forEach((eff: any) => {
      if (!newDiscard.includes(eff.cardId)) newDiscard.push(eff.cardId);
    });
    const updatedCards: PowerCardsState = {
      ...powerCards,
      activeEffects: [],
      discardPile: newDiscard,
    };
    setPowerCards(updatedCards);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(updatedCards));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: updatedCards });
  };

  const handleResetPowerCards = () => {
    if (
      !confirm(
        '¿Seguro que quieres reiniciar el mazo de Cartas de Poder y vaciar las manos de todos los equipos?'
      )
    )
      return;
    const initial = createInitialPowerCardsState();
    setPowerCards(initial);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(initial));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: initial });
  };

  const handleReturnCardToTeam = (
    teamId: string,
    cardId: string,
    options?: {
      removeEffectId?: string;
      restorePoints?: number;
      dismissScreen?: boolean;
    }
  ) => {
    const card = getPowerCardById(cardId);
    if (!card) return;

    // 1. Quitar una instancia de la carta de la pila de descartes
    const discard = [...powerCards.discardPile];
    const discardIdx = discard.lastIndexOf(cardId);
    if (discardIdx !== -1) {
      discard.splice(discardIdx, 1);
    }

    // 2. Añadir la carta de vuelta a la mano del equipo
    const currentHand = powerCards.teamHands[teamId] || [];
    const nextHands = {
      ...powerCards.teamHands,
      [teamId]: [...currentHand, cardId],
    };

    // 3. Limpiar efectos activos asociados si procede
    let nextEffects = [...powerCards.activeEffects];
    if (options?.removeEffectId) {
      nextEffects = nextEffects.filter((e) => e.id !== options.removeEffectId);
    } else {
      nextEffects = nextEffects.filter((e) => !(e.cardId === cardId && e.sourceTeamId === teamId));
    }

    const nextPowerCards: PowerCardsState = {
      ...powerCards,
      activeEffects: nextEffects,
      discardPile: discard,
      teamHands: nextHands,
    };

    setPowerCards(nextPowerCards);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextPowerCards));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextPowerCards });

    // 4. Si está proyectándose en la TV, quitarla
    if (
      options?.dismissScreen !== false &&
      activeCardOnScreen &&
      activeCardOnScreen.card.id === cardId
    ) {
      handleDismissCardOnScreen();
    }

    // 5. Si tenía penalización de puntos asociada, restaurarla
    let pointsToRestore = options?.restorePoints || 0;
    if ((cardId === 'mal_de_ojo' || cardId === 'maldicion_comun') && !options?.restorePoints) {
      pointsToRestore = 2;
    } else if (cardId === 'la_maldicion' && !options?.restorePoints) {
      pointsToRestore = 3;
    }
    if (pointsToRestore > 0) {
      handleScoreChange(teamId, pointsToRestore);
    }

    soundFX.playSound('buzzer');
    const team = activeTeams.find((t) => t.id === teamId);
    alert(
      `↩ Carta "${card.name}" devuelta a la mano de ${team?.name || 'su equipo'}.${
        pointsToRestore > 0 ? ` (+${pointsToRestore} pts restaurados)` : ''
      }`
    );
  };

  const handleRevokeCardFromTeam = (teamId: string, cardId: string) => {
    const card = getPowerCardById(cardId);
    if (!card) return;

    const currentHand = powerCards.teamHands[teamId] || [];
    const idx = currentHand.indexOf(cardId);
    if (idx === -1) return;

    const nextHand = [...currentHand];
    nextHand.splice(idx, 1);

    const nextPowerCards: PowerCardsState = {
      ...powerCards,
      teamHands: {
        ...powerCards.teamHands,
        [teamId]: nextHand,
      },
      discardPile: [...powerCards.discardPile, cardId],
    };

    setPowerCards(nextPowerCards);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextPowerCards));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextPowerCards });

    const team = activeTeams.find((t) => t.id === teamId);
    alert(
      `✕ Carta "${card.name}" retirada de la mano de ${
        team?.name || 'su equipo'
      } y enviada al descarte.`
    );
  };

  return {
    powerCards,
    setPowerCards,
    selectedBonusTeam,
    setSelectedBonusTeam,
    activeCardOnScreen,
    setActiveCardOnScreen,
    bankChoiceState,
    setBankChoiceState,
    timeTravelModal,
    setTimeTravelModal,
    isDiscardModalOpen,
    setIsDiscardModalOpen,
    targetModalState,
    setTargetModalState,
    returnCardModal,
    setReturnCardModal,
    handleDealInitialCards,
    handleDealBonusCard,
    handlePlayCardDirectly,
    handleDismissCardOnScreen,
    handleSelectBankChoice,
    handleInitiatePlayCard,
    handleRemoveActiveEffect,
    handleClearAllActiveEffects,
    handleResetPowerCards,
    handleReturnCardToTeam,
    handleRevokeCardFromTeam,
  };
}

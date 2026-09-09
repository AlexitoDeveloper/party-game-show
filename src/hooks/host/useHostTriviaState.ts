import { useState } from 'react';
import { TriviaQuestion, OFFICIAL_TRIVIA_QUESTIONS } from '../../lib/triviaData';
import { RoomSync } from '../../lib/roomSync';
import { BuzzerPressPayload, Team } from '../../lib/types';
import { TEAMS_CATALOG } from '../../lib/constants';

export interface UseHostTriviaStateParams {
  roomSync: RoomSync;
  resetBuzzer: () => void;
  winner: BuzzerPressPayload | null;
  teams: Team[];
  selectedTeamCatalog?: (typeof TEAMS_CATALOG)[0] | null;
  handleScoreChange: (teamId: string, delta: number) => void;
  setRoundHits: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  soundFX: {
    playVictory: () => void;
    playFail: () => void;
  };
}

export function useHostTriviaState({
  roomSync,
  resetBuzzer,
  winner,
  teams,
  selectedTeamCatalog,
  handleScoreChange,
  setRoundHits,
  soundFX,
}: UseHostTriviaStateParams) {
  const [triviaBank] = useState<TriviaQuestion[]>(OFFICIAL_TRIVIA_QUESTIONS);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaRevealed, setTriviaRevealed] = useState(false);
  const [triviaReboundActive, setTriviaReboundActive] = useState(false);

  const currentTriviaQuestion: TriviaQuestion =
    triviaBank[triviaIndex % triviaBank.length] || OFFICIAL_TRIVIA_QUESTIONS[0];

  const syncTriviaState = (
    idx: number,
    isRev: boolean,
    isRebound: boolean,
    targetQ?: TriviaQuestion
  ) => {
    roomSync.broadcast({
      type: 'TRIVIA_STATE_UPDATE',
      payload: {
        questionIndex: idx,
        isRevealed: isRev,
        isReboundActive: isRebound,
        questionData: targetQ || triviaBank[idx % triviaBank.length] || currentTriviaQuestion,
      },
    });
  };

  const handleNextTrivia = () => {
    const nextIdx = (triviaIndex + 1) % triviaBank.length;
    setTriviaIndex(nextIdx);
    setTriviaRevealed(false);
    setTriviaReboundActive(false);
    resetBuzzer();
    syncTriviaState(nextIdx, false, false);
  };

  const handlePrevTrivia = () => {
    const prevIdx = (triviaIndex - 1 + triviaBank.length) % triviaBank.length;
    setTriviaIndex(prevIdx);
    setTriviaRevealed(false);
    setTriviaReboundActive(false);
    resetBuzzer();
    syncTriviaState(prevIdx, false, false);
  };

  const handleRandomTrivia = () => {
    const randIdx = Math.floor(Math.random() * triviaBank.length);
    setTriviaIndex(randIdx);
    setTriviaRevealed(false);
    setTriviaReboundActive(false);
    resetBuzzer();
    syncTriviaState(randIdx, false, false);
  };

  const handleToggleTriviaReveal = () => {
    const nextRev = !triviaRevealed;
    setTriviaRevealed(nextRev);
    syncTriviaState(triviaIndex, nextRev, triviaReboundActive);
  };

  const handleValidateTriviaHit = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, 2);
      setRoundHits((prev) => ({
        ...prev,
        [targetTeam.id]: (prev[targetTeam.id] || 0) + 1,
      }));
    }
    setTriviaRevealed(true);
    setTriviaReboundActive(false);
    resetBuzzer();
    syncTriviaState(triviaIndex, true, false);
    soundFX.playVictory();
  };

  const handleValidateTriviaFail = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, -1);
    }
    setTriviaReboundActive(true);
    resetBuzzer();
    syncTriviaState(triviaIndex, triviaRevealed, true);
    soundFX.playFail();
  };

  const handleValidateTriviaReboundHit = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, 2);
      setRoundHits((prev) => ({
        ...prev,
        [targetTeam.id]: (prev[targetTeam.id] || 0) + 1,
      }));
    }
    setTriviaRevealed(true);
    setTriviaReboundActive(false);
    resetBuzzer();
    syncTriviaState(triviaIndex, true, false);
    soundFX.playVictory();
  };

  return {
    triviaBank,
    triviaIndex,
    triviaRevealed,
    triviaReboundActive,
    currentTriviaQuestion,
    syncTriviaState,
    handleNextTrivia,
    handlePrevTrivia,
    handleRandomTrivia,
    handleToggleTriviaReveal,
    handleValidateTriviaHit,
    handleValidateTriviaFail,
    handleValidateTriviaReboundHit,
  };
}

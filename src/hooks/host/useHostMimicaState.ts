import { useState, useEffect } from 'react';
import { MimicaCard, OFFICIAL_MIMICA_CARDS } from '../../lib/mimicaData';
import { RoomSync } from '../../lib/roomSync';
import { Team } from '../../lib/types';
import { TEAMS_CATALOG } from '../../lib/constants';

export interface UseHostMimicaStateParams {
  roomSync: RoomSync;
  teams: Team[];
  selectedTeamCatalog?: (typeof TEAMS_CATALOG)[0] | null;
  activeTeams: Team[];
  setRoundHits: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  soundFX: {
    playDecoBell: () => void;
    playSuccess: () => void;
  };
}

export function useHostMimicaState({
  roomSync,
  teams,
  selectedTeamCatalog,
  activeTeams,
  setRoundHits,
  soundFX,
}: UseHostMimicaStateParams) {
  const [mimicaCards] = useState<MimicaCard[]>(OFFICIAL_MIMICA_CARDS);
  const [mimicaCardIndex, setMimicaCardIndex] = useState(0);
  const [mimicaHitsCount, setMimicaHitsCount] = useState(0);
  const [mimicaTimerSeconds, setMimicaTimerSeconds] = useState<number | null>(90);
  const [mimicaIsRunning, setMimicaIsRunning] = useState(false);

  const currentMimicaCard: MimicaCard =
    mimicaCards[mimicaCardIndex % mimicaCards.length] || OFFICIAL_MIMICA_CARDS[0];

  const syncMimicaState = (
    hits: number = mimicaHitsCount,
    timer: number | null = mimicaTimerSeconds,
    isRunning: boolean = mimicaIsRunning
  ) => {
    roomSync.broadcast({
      type: 'MIMICA_STATE_UPDATE',
      payload: {
        activeTeamId: selectedTeamCatalog
          ? teams.find((t) => t.team_index === selectedTeamCatalog.index)?.id
          : undefined,
        hitsCount: hits,
        timerSeconds: timer,
        isRunning: isRunning,
      },
    });
  };

  const handleNextMimicaCard = () => {
    const nextIdx = (mimicaCardIndex + 1) % mimicaCards.length;
    setMimicaCardIndex(nextIdx);
  };

  const handlePickRandomMimicaCard = () => {
    const randIdx = Math.floor(Math.random() * mimicaCards.length);
    setMimicaCardIndex(randIdx);
  };

  // Temporizador interactivo para Mímica en HostView
  useEffect(() => {
    if (!mimicaIsRunning || mimicaTimerSeconds === null || mimicaTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setMimicaTimerSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setMimicaIsRunning(false);
          soundFX.playDecoBell();
          syncMimicaState(mimicaHitsCount, 0, false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mimicaIsRunning, mimicaTimerSeconds, mimicaHitsCount]);

  const handleToggleMimicaTimer = () => {
    if (mimicaIsRunning) {
      setMimicaIsRunning(false);
      syncMimicaState(mimicaHitsCount, mimicaTimerSeconds, false);
    } else {
      const secsToStart =
        mimicaTimerSeconds === null || mimicaTimerSeconds <= 0 ? 90 : mimicaTimerSeconds;
      setMimicaTimerSeconds(secsToStart);
      setMimicaIsRunning(true);
      syncMimicaState(mimicaHitsCount, secsToStart, true);
    }
  };

  const handleStartMimicaTimer = (secs: number = 90) => {
    setMimicaTimerSeconds(secs);
    setMimicaIsRunning(true);
    syncMimicaState(mimicaHitsCount, secs, true);
  };

  const handlePauseMimicaTimer = () => {
    setMimicaIsRunning(false);
    syncMimicaState(mimicaHitsCount, mimicaTimerSeconds, false);
  };

  const handleAddMimicaHit = () => {
    const nextHits = mimicaHitsCount + 1;
    setMimicaHitsCount(nextHits);
    soundFX.playSuccess();
    syncMimicaState(nextHits, mimicaTimerSeconds, mimicaIsRunning);
    handleNextMimicaCard();
    const targetTeam = selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : activeTeams[0];
    if (targetTeam) {
      setRoundHits((prev) => ({
        ...prev,
        [targetTeam.id]: (prev[targetTeam.id] || 0) + 1,
      }));
    }
  };

  const handleSubtractMimicaHit = () => {
    const nextHits = Math.max(0, mimicaHitsCount - 1);
    setMimicaHitsCount(nextHits);
    syncMimicaState(nextHits, mimicaTimerSeconds, mimicaIsRunning);
    const targetTeam = selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : activeTeams[0];
    if (targetTeam) {
      setRoundHits((prev) => ({
        ...prev,
        [targetTeam.id]: Math.max(0, (prev[targetTeam.id] || 0) - 1),
      }));
    }
  };

  const handleResetMimicaRound = () => {
    setMimicaHitsCount(0);
    setMimicaTimerSeconds(90);
    setMimicaIsRunning(false);
    syncMimicaState(0, 90, false);
  };

  return {
    mimicaCards,
    mimicaCardIndex,
    mimicaHitsCount,
    mimicaTimerSeconds,
    mimicaIsRunning,
    currentMimicaCard,
    syncMimicaState,
    handleNextMimicaCard,
    handlePickRandomMimicaCard,
    handleToggleMimicaTimer,
    handleStartMimicaTimer,
    handlePauseMimicaTimer,
    handleAddMimicaHit,
    handleSubtractMimicaHit,
    handleResetMimicaRound,
  };
}

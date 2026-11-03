import { useState, useEffect } from 'react';
import { UnDosTresChallenge, OFFICIAL_UN_DOS_TRES_CHALLENGES } from '../../lib/unDosTresData';
import { RoomSync } from '../../lib/roomSync';
import { Team } from '../../lib/types';

export interface UseHostUnDosTresStateParams {
  roomSync: RoomSync;
  teams: Team[];
  handleScoreChange: (teamId: string, delta: number) => void;
  setRoundHits: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  soundFX: {
    playSuccess: () => void;
    playFail: () => void;
    playVictory: () => void;
  };
}

export function useHostUnDosTresState({
  roomSync,
  teams,
  handleScoreChange,
  setRoundHits,
  soundFX,
}: UseHostUnDosTresStateParams) {
  const [udtBank] = useState<UnDosTresChallenge[]>(OFFICIAL_UN_DOS_TRES_CHALLENGES);
  const [udtPromptIndex, setUdtPromptIndex] = useState(0);
  const [udtActiveTeamIndex, setUdtActiveTeamIndex] = useState(0);
  const [udtEliminatedTeamIds, setUdtEliminatedTeamIds] = useState<string[]>([]);
  const [udtCountdown, setUdtCountdown] = useState<number | null>(null);
  const [udtIsTimerRunning, setUdtIsTimerRunning] = useState(false);

  const currentUdtChallenge =
    udtBank[udtPromptIndex % udtBank.length] || OFFICIAL_UN_DOS_TRES_CHALLENGES[0];

  const aliveTeams = teams.filter((t) => t.is_active && !udtEliminatedTeamIds.includes(t.id));
  const currentUdtTeam =
    aliveTeams[udtActiveTeamIndex % (aliveTeams.length || 1)] || teams.find((t) => t.is_active);

  // Temporizador local de 5 segundos sincronizado con el Host
  useEffect(() => {
    if (!udtIsTimerRunning || udtCountdown === null || udtCountdown <= 0) return;
    const interval = setInterval(() => {
      setUdtCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setUdtIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [udtIsTimerRunning, udtCountdown]);

  const syncUdtState = (
    promptIdx: number,
    activeTeamId?: string,
    eliminated: string[] = udtEliminatedTeamIds,
    countdown: number | null = udtCountdown,
    isRunning: boolean = udtIsTimerRunning,
    targetChallenge?: UnDosTresChallenge
  ) => {
    roomSync.broadcast({
      type: 'UN_DOS_TRES_STATE',
      payload: {
        promptIndex: promptIdx,
        activeTeamId: activeTeamId || currentUdtTeam?.id,
        eliminatedTeamIds: eliminated,
        countdownSeconds: countdown,
        isTimerRunning: isRunning,
        challengeData: targetChallenge || udtBank[promptIdx % udtBank.length],
      },
    });
  };

  const handleStartUdtTimer = () => {
    setUdtCountdown(5);
    setUdtIsTimerRunning(true);
    syncUdtState(udtPromptIndex, currentUdtTeam?.id, udtEliminatedTeamIds, 5, true);
  };

  const handlePassUdtRound = () => {
    setUdtIsTimerRunning(false);
    setUdtCountdown(null);
    if (currentUdtTeam) {
      setRoundHits((prev) => ({
        ...prev,
        [currentUdtTeam.id]: (prev[currentUdtTeam.id] || 0) + 1,
      }));
    }
    const nextPrompt = (udtPromptIndex + 1) % udtBank.length;
    const nextTeamIdx = (udtActiveTeamIndex + 1) % (aliveTeams.length || 1);
    setUdtPromptIndex(nextPrompt);
    setUdtActiveTeamIndex(nextTeamIdx);
    const nextTeam = aliveTeams[nextTeamIdx];
    syncUdtState(nextPrompt, nextTeam?.id, udtEliminatedTeamIds, null, false);
    soundFX.playSuccess();
  };

  const handleEliminateUdtTeam = () => {
    if (!currentUdtTeam) return;
    const nextEliminated = [...udtEliminatedTeamIds, currentUdtTeam.id];
    setUdtEliminatedTeamIds(nextEliminated);
    setUdtIsTimerRunning(false);
    setUdtCountdown(null);
    soundFX.playFail();

    // Registrar aciertos de supervivencia según orden de eliminación
    setRoundHits((prev) => ({
      ...prev,
      [currentUdtTeam.id]: nextEliminated.length,
    }));

    const remaining = teams.filter((t) => t.is_active && !nextEliminated.includes(t.id));
    if (remaining.length === 1) {
      // ¡ÚLTIMO EQUIPO EN PIE GANA!
      const winnerId = remaining[0].id;
      setRoundHits((prev) => ({
        ...prev,
        [winnerId]: nextEliminated.length + 5,
      }));
      soundFX.playVictory();
    }

    const nextPrompt = (udtPromptIndex + 1) % udtBank.length;
    setUdtPromptIndex(nextPrompt);
    const nextTeamIdx = udtActiveTeamIndex % (remaining.length || 1);
    setUdtActiveTeamIndex(nextTeamIdx);
    syncUdtState(nextPrompt, remaining[nextTeamIdx]?.id, nextEliminated, null, false);
  };

  const handleResetUdtRound = () => {
    setUdtEliminatedTeamIds([]);
    setUdtPromptIndex(0);
    setUdtActiveTeamIndex(0);
    setUdtCountdown(null);
    setUdtIsTimerRunning(false);
    setRoundHits({});
    syncUdtState(0, teams.find((t) => t.is_active)?.id, [], null, false);
  };

  return {
    udtBank,
    udtPromptIndex,
    udtActiveTeamIndex,
    udtEliminatedTeamIds,
    udtCountdown,
    udtIsTimerRunning,
    currentUdtChallenge,
    aliveTeams,
    currentUdtTeam,
    syncUdtState,
    handleStartUdtTimer,
    handlePassUdtRound,
    handleEliminateUdtTeam,
    handleResetUdtRound,
  };
}

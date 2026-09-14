import { useState, useEffect, useRef } from 'react';
import { RoomSync } from '../../lib/roomSync';
import { BingoClaimPayload } from '../../lib/types';
import { soundFX } from '../../lib/audio';

export interface UseHostBingoStateParams {
  roomSync: RoomSync;
  roomCode?: string;
}

export function useHostBingoState({ roomSync, roomCode }: UseHostBingoStateParams) {
  const [bingoDrawnBalls, setBingoDrawnBalls] = useState<number[]>([]);
  const [bingoCurrentBall, setBingoCurrentBall] = useState<number | null>(null);
  const [bingoIsSpinning, setBingoIsSpinning] = useState(false);

  // Estados de control para no permitir cantar dos veces la línea o el bingo
  const [lineAwarded, setLineAwarded] = useState<boolean>(() => {
    if (!roomCode) return false;
    try {
      const saved = localStorage.getItem(`party_bingo_line_awarded_${roomCode}`);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [bingoAwarded, setBingoAwarded] = useState<boolean>(() => {
    if (!roomCode) return false;
    try {
      const saved = localStorage.getItem(`party_bingo_bingo_awarded_${roomCode}`);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [lineWinner, setLineWinner] = useState<{ playerName: string; teamName: string } | null>(() => {
    if (!roomCode) return null;
    try {
      const saved = localStorage.getItem(`party_bingo_line_winner_${roomCode}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [bingoWinner, setBingoWinner] = useState<{ playerName: string; teamName: string } | null>(() => {
    if (!roomCode) return null;
    try {
      const saved = localStorage.getItem(`party_bingo_bingo_winner_${roomCode}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const lineAwardedRef = useRef(lineAwarded);
  const bingoAwardedRef = useRef(bingoAwarded);
  const lineWinnerRef = useRef(lineWinner);
  const bingoWinnerRef = useRef(bingoWinner);

  useEffect(() => {
    lineAwardedRef.current = lineAwarded;
    if (roomCode) {
      try {
        localStorage.setItem(`party_bingo_line_awarded_${roomCode}`, JSON.stringify(lineAwarded));
      } catch {}
    }
  }, [lineAwarded, roomCode]);

  useEffect(() => {
    bingoAwardedRef.current = bingoAwarded;
    if (roomCode) {
      try {
        localStorage.setItem(`party_bingo_bingo_awarded_${roomCode}`, JSON.stringify(bingoAwarded));
      } catch {}
    }
  }, [bingoAwarded, roomCode]);

  useEffect(() => {
    lineWinnerRef.current = lineWinner;
    if (roomCode) {
      try {
        localStorage.setItem(`party_bingo_line_winner_${roomCode}`, JSON.stringify(lineWinner));
      } catch {}
    }
  }, [lineWinner, roomCode]);

  useEffect(() => {
    bingoWinnerRef.current = bingoWinner;
    if (roomCode) {
      try {
        localStorage.setItem(`party_bingo_bingo_winner_${roomCode}`, JSON.stringify(bingoWinner));
      } catch {}
    }
  }, [bingoWinner, roomCode]);

  // Reclamaciones en tiempo real de Línea y Bingo por parte de los jugadores
  const [pendingClaims, setPendingClaims] = useState<BingoClaimPayload[]>([]);
  const [activeClaim, setActiveClaim] = useState<BingoClaimPayload | null>(null);

  useEffect(() => {
    const unsubscribe = roomSync.onEvent((event) => {
      if (event.type === 'BINGO_CLAIM') {
        // Bloqueo de seguridad en el Host: Si la línea o el bingo ya fueron validados, ignorar el reclamo
        if (event.payload.claimType === 'line' && lineAwardedRef.current) {
          return;
        }
        if (event.payload.claimType === 'bingo' && bingoAwardedRef.current) {
          return;
        }

        soundFX.playDecoBell();
        setPendingClaims((prev) => [...prev, event.payload]);
        setActiveClaim((prev) => prev || event.payload);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomSync]);

  const syncBingoState = (
    current = bingoCurrentBall,
    drawn = bingoDrawnBalls,
    spinning = bingoIsSpinning,
    lineStatus = lineAwardedRef.current,
    bingoStatus = bingoAwardedRef.current,
    lWin = lineWinnerRef.current,
    bWin = bingoWinnerRef.current
  ) => {
    roomSync.broadcast({
      type: 'BINGO_STATE_UPDATE',
      payload: {
        currentBall: current,
        drawnBalls: drawn,
        isSpinning: spinning,
        lineAwarded: lineStatus,
        bingoAwarded: bingoStatus,
        lineWinner: lWin,
        bingoWinner: bWin,
      },
    });
  };

  const handleDrawBingoBall = () => {
    const available = Array.from({ length: 90 }, (_, i) => i + 1).filter(
      (n) => !bingoDrawnBalls.includes(n)
    );
    if (available.length === 0) {
      alert('¡Se han extraído todas las 90 bolas del bombo!');
      return;
    }
    if (bingoIsSpinning) return;

    setBingoIsSpinning(true);
    syncBingoState(bingoCurrentBall, bingoDrawnBalls, true);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * available.length);
      const drawn = available[randomIndex];
      const nextDrawn = [...bingoDrawnBalls, drawn];
      setBingoCurrentBall(drawn);
      setBingoDrawnBalls(nextDrawn);
      setBingoIsSpinning(false);
      syncBingoState(drawn, nextDrawn, false);
    }, 2200);
  };

  const handleResetBingo = () => {
    if (window.confirm('¿Reiniciar todas las bolas del bombo de Bingo? (Esto reiniciará también la línea y el bingo validados)')) {
      setBingoDrawnBalls([]);
      setBingoCurrentBall(null);
      setBingoIsSpinning(false);
      setPendingClaims([]);
      setActiveClaim(null);
      setLineAwarded(false);
      setBingoAwarded(false);
      setLineWinner(null);
      setBingoWinner(null);
      lineAwardedRef.current = false;
      bingoAwardedRef.current = false;
      lineWinnerRef.current = null;
      bingoWinnerRef.current = null;

      if (roomCode) {
        try {
          localStorage.removeItem(`party_bingo_line_awarded_${roomCode}`);
          localStorage.removeItem(`party_bingo_bingo_awarded_${roomCode}`);
          localStorage.removeItem(`party_bingo_line_winner_${roomCode}`);
          localStorage.removeItem(`party_bingo_bingo_winner_${roomCode}`);
        } catch {}
      }

      syncBingoState(null, [], false, false, false, null, null);
    }
  };

  const handleResolveClaim = (
    claim: BingoClaimPayload,
    accepted: boolean,
    onScoreChange?: (teamId: string, delta: number) => void
  ) => {
    let nextLineAwarded = lineAwardedRef.current;
    let nextBingoAwarded = bingoAwardedRef.current;
    let nextLineWinner = lineWinnerRef.current;
    let nextBingoWinner = bingoWinnerRef.current;

    if (accepted) {
      const delta = claim.claimType === 'line' ? 2 : 6;
      if (onScoreChange) {
        onScoreChange(claim.teamId, delta);
      }
      soundFX.playVictory();

      const winnerInfo = { playerName: claim.playerName, teamName: claim.teamName };

      if (claim.claimType === 'line') {
        nextLineAwarded = true;
        nextLineWinner = winnerInfo;
        setLineAwarded(true);
        setLineWinner(winnerInfo);
      } else if (claim.claimType === 'bingo') {
        nextBingoAwarded = true;
        nextBingoWinner = winnerInfo;
        setBingoAwarded(true);
        setBingoWinner(winnerInfo);
      }

      roomSync.broadcast({
        type: 'BINGO_CLAIM_RESOLVE',
        payload: {
          claimType: claim.claimType,
          accepted: true,
          teamId: claim.teamId,
          deltaPoints: delta,
          winnerName: claim.playerName,
          teamName: claim.teamName,
        },
      });

      roomSync.broadcast({
        type: 'TRIGGER_CONFETTI',
        payload: { teamId: claim.teamIndex },
      });

      // Sincronizar de inmediato el nuevo estado de Línea/Bingo otorgados con toda la sala
      syncBingoState(
        bingoCurrentBall,
        bingoDrawnBalls,
        bingoIsSpinning,
        nextLineAwarded,
        nextBingoAwarded,
        nextLineWinner,
        nextBingoWinner
      );
    } else {
      soundFX.playFail();
      roomSync.broadcast({
        type: 'BINGO_CLAIM_RESOLVE',
        payload: {
          claimType: claim.claimType,
          accepted: false,
          teamId: claim.teamId,
        },
      });
    }

    setPendingClaims((prev) => {
      // Si la línea fue validada con éxito, descartar cualquier otro reclamo pendiente de línea
      // Si el bingo fue validado con éxito, descartar cualquier otro reclamo pendiente de bingo
      const remaining = prev.filter((c) => {
        if (c.timestamp === claim.timestamp) return false;
        if (accepted && claim.claimType === 'line' && c.claimType === 'line') return false;
        if (accepted && claim.claimType === 'bingo' && c.claimType === 'bingo') return false;
        return true;
      });
      setActiveClaim(remaining.length > 0 ? remaining[0] : null);
      return remaining;
    });
  };

  const handleDismissActiveClaim = () => {
    setPendingClaims((prev) => {
      const remaining = prev.slice(1);
      setActiveClaim(remaining.length > 0 ? remaining[0] : null);
      return remaining;
    });
  };

  return {
    bingoDrawnBalls,
    bingoCurrentBall,
    bingoIsSpinning,
    lineAwarded,
    bingoAwarded,
    lineWinner,
    bingoWinner,
    pendingClaims,
    activeClaim,
    syncBingoState,
    handleDrawBingoBall,
    handleResetBingo,
    handleResolveClaim,
    handleDismissActiveClaim,
  };
}


import { useState } from 'react';
import { RoomSync } from '../../lib/roomSync';

export interface UseHostBingoStateParams {
  roomSync: RoomSync;
}

export function useHostBingoState({ roomSync }: UseHostBingoStateParams) {
  const [bingoDrawnBalls, setBingoDrawnBalls] = useState<number[]>([]);
  const [bingoCurrentBall, setBingoCurrentBall] = useState<number | null>(null);
  const [bingoIsSpinning, setBingoIsSpinning] = useState(false);

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
    roomSync.broadcast({
      type: 'BINGO_STATE_UPDATE',
      payload: { currentBall: bingoCurrentBall, drawnBalls: bingoDrawnBalls, isSpinning: true },
    });

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * available.length);
      const drawn = available[randomIndex];
      const nextDrawn = [...bingoDrawnBalls, drawn];
      setBingoCurrentBall(drawn);
      setBingoDrawnBalls(nextDrawn);
      setBingoIsSpinning(false);
      roomSync.broadcast({
        type: 'BINGO_STATE_UPDATE',
        payload: { currentBall: drawn, drawnBalls: nextDrawn, isSpinning: false },
      });
    }, 2200);
  };

  const handleResetBingo = () => {
    if (window.confirm('¿Reiniciar todas las bolas del bombo de Bingo?')) {
      setBingoDrawnBalls([]);
      setBingoCurrentBall(null);
      setBingoIsSpinning(false);
      roomSync.broadcast({
        type: 'BINGO_STATE_UPDATE',
        payload: { currentBall: null, drawnBalls: [], isSpinning: false },
      });
    }
  };

  return {
    bingoDrawnBalls,
    bingoCurrentBall,
    bingoIsSpinning,
    handleDrawBingoBall,
    handleResetBingo,
  };
}

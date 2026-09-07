import { useCallback } from 'react';
import { soundFX } from './audio';

/**
 * Hook useSoundFX: Envoltorio ergonómico de React sobre el motor de audio de estudio de plató.
 */
export function useSoundFX() {
  const playBuzzer = useCallback(() => soundFX.playBuzzer(), []);
  const playFail = useCallback(() => soundFX.playFail(), []);
  const playBuzzerWrong = useCallback(() => soundFX.playBuzzerWrong(), []);
  const playSuccess = useCallback(() => soundFX.playSuccess(), []);
  const playVictory = useCallback(() => soundFX.playVictory(), []);
  const playDrumRoll = useCallback(() => soundFX.playDrumRoll(), []);
  const playApplause = useCallback(() => soundFX.playApplause(), []);
  const playAirHorn = useCallback(() => soundFX.playAirHorn(), []);
  const playSuspense = useCallback(() => soundFX.playSuspense(), []);
  const playPowerCard = useCallback(() => soundFX.playPowerCard(), []);
  const playTick = useCallback(() => soundFX.playTick(), []);
  const playJoin = useCallback(() => soundFX.playJoin(), []);

  return {
    playBuzzer,
    playFail,
    playBuzzerWrong,
    playSuccess,
    playVictory,
    playDrumRoll,
    playApplause,
    playAirHorn,
    playSuspense,
    playPowerCard,
    playTick,
    playJoin,
    soundFX,
  };
}

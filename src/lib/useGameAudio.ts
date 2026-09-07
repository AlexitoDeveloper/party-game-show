import { useCallback } from 'react';
import useSound from 'use-sound';
import { soundFX } from './audio';

/**
 * useGameAudio: Hook centralizado para el motor sonoro del concurso.
 * Conecta use-sound para la gestión de hooks de React con el motor WebAudio de baja latencia.
 */
export function useGameAudio() {
  // Triggers con use-sound sobre los audios de plató
  const [playBuzzerRaw] = useSound('/sounds/buzzer.mp3', { volume: 0.95 });
  const [playCountdownRaw] = useSound('/sounds/tick.mp3', { volume: 0.85 });
  const [playCorrectRaw] = useSound('/sounds/success.mp3', { volume: 0.9 });
  const [playWrongRaw] = useSound('/sounds/fail.mp3', { volume: 0.95 });
  const [playVictoryRaw] = useSound('/sounds/victory.mp3', { volume: 1.0 });

  // Callbacks seguros con fallback inmediato a soundFX
  const playBuzzer = useCallback(() => {
    try {
      playBuzzerRaw();
    } catch {
      soundFX.playBuzzer();
    }
  }, [playBuzzerRaw]);

  const playCountdown = useCallback(() => {
    try {
      playCountdownRaw();
    } catch {
      soundFX.playTick();
    }
  }, [playCountdownRaw]);

  const playCorrect = useCallback(() => {
    try {
      playCorrectRaw();
    } catch {
      soundFX.playSuccess();
    }
  }, [playCorrectRaw]);

  const playWrong = useCallback(() => {
    try {
      playWrongRaw();
    } catch {
      soundFX.playFail();
    }
  }, [playWrongRaw]);

  const playVictory = useCallback(() => {
    try {
      playVictoryRaw();
    } catch {
      soundFX.playVictory();
    }
  }, [playVictoryRaw]);

  return {
    playBuzzer,
    playCountdown,
    playCorrect,
    playWrong,
    playVictory,
  };
}

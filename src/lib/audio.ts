// Motor de Efectos de Sonido de Alta Fidelidad para Concurso de TV
// Reproduce muestras de audio reales de plató (MP3 de estudio) alojadas en /sounds/
// Sin síntesis 8-bit ni ondas pixeladas: sonido real de televisión y concursos

const SOUND_FILES: Record<string, string> = {
  buzzer: '/sounds/buzzer.mp3',
  fail: '/sounds/fail.mp3',
  buzzer_wrong: '/sounds/fail.mp3',
  victory: '/sounds/victory.mp3',
  success: '/sounds/success.mp3',
  drumroll: '/sounds/drumroll.mp3',
  applause: '/sounds/applause.mp3',
  airhorn: '/sounds/airhorn.mp3',
  suspense: '/sounds/suspense.mp3',
  power_card: '/sounds/power_card.mp3',
  tick: '/sounds/tick.mp3',
  join: '/sounds/success.mp3',
};

class SoundFX {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isPreloaded = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Pre-cargar cuando el usuario interactúa o tras cargar el script
      window.addEventListener('click', () => this.initContext(), { once: true });
      window.addEventListener('touchstart', () => this.initContext(), { once: true });
      this.preloadSounds();
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioContext) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  // Pre-carga todos los archivos de sonido en memoria para latencia cero
  private preloadSounds() {
    if (this.isPreloaded || typeof window === 'undefined') return;
    this.isPreloaded = true;

    Object.entries(SOUND_FILES).forEach(([key, url]) => {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
        this.audioCache.set(key, audio);

        // También intentar decodificar en Web Audio API si está disponible
        fetch(url)
          .then((res) => (res.ok ? res.arrayBuffer() : null))
          .then((arrayBuf) => {
            if (!arrayBuf) return;
            const ctx = this.initContext();
            if (ctx) {
              ctx.decodeAudioData(
                arrayBuf,
                (buffer) => {
                  this.audioBuffers.set(key, buffer);
                },
                () => {}
              );
            }
          })
          .catch(() => {});
      } catch (err) {
        console.warn(`Error precargando sonido ${key}:`, err);
      }
    });
  }

  // Reproducción de sonido con doble vía: Web Audio Buffer (latencia 0) o Audio HTML5
  private playAudioFile(key: string, volume: number = 1.0) {
    if (typeof window === 'undefined') return;
    this.initContext();

    // 1. Vía prioritaria: AudioBuffer WebAudio (cero latencia y polifonía perfecta)
    const ctx = this.audioContext;
    const buffer = this.audioBuffers.get(key);
    if (ctx && buffer && ctx.state === 'running') {
      try {
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        source.buffer = buffer;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
        return;
      } catch {}
    }

    // 2. Vía estándar: Clon de elemento HTML5 Audio
    const url = SOUND_FILES[key];
    if (url) {
      try {
        const audio = new Audio(url);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.play().catch(() => {
          // Si el navegador bloquea autoplay, se reproducirá tras la primera interacción
        });
      } catch (err) {
        console.warn('Error al reproducir audio:', err);
      }
    }
  }

  // Métodos específicos
  playBuzzer() {
    this.playAudioFile('buzzer', 0.9);
  }

  playFail() {
    this.playAudioFile('fail', 0.95);
  }

  playBuzzerWrong() {
    this.playFail();
  }

  playSuccess() {
    this.playAudioFile('success', 0.85);
  }

  playVictory() {
    this.playAudioFile('victory', 1.0);
  }

  playDrumRoll() {
    this.playAudioFile('drumroll', 0.95);
  }

  playApplause() {
    this.playAudioFile('applause', 0.9);
  }

  playAirHorn() {
    this.playAudioFile('airhorn', 0.9);
  }

  playSuspense() {
    this.playAudioFile('suspense', 0.95);
  }

  playPowerCard() {
    this.playAudioFile('power_card', 0.85);
  }

  playTick(urgent: boolean = false) {
    this.playAudioFile('tick', urgent ? 0.7 : 0.4);
  }

  playJoin() {
    this.playAudioFile('join', 0.7);
  }

  playSound(name: string) {
    switch (name) {
      case 'fail':
      case 'buzzer_wrong':
        this.playFail();
        break;
      case 'victory':
        this.playVictory();
        break;
      case 'success':
        this.playSuccess();
        break;
      case 'buzzer':
        this.playBuzzer();
        break;
      case 'drumroll':
        this.playDrumRoll();
        break;
      case 'applause':
        this.playApplause();
        break;
      case 'airhorn':
        this.playAirHorn();
        break;
      case 'suspense':
        this.playSuspense();
        break;
      case 'power_card':
        this.playPowerCard();
        break;
      case 'tick':
        this.playTick();
        break;
      case 'join':
        this.playJoin();
        break;
      default:
        this.playSuccess();
        break;
    }
  }
}

export const soundFX = new SoundFX();

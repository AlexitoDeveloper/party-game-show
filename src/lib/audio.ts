// Motor de Efectos de Sonido de Alta Fidelidad para Concurso de TV
// Reproduce muestras de audio reales de plató (MP3 de estudio) alojadas en /sounds/
// Sin síntesis 8-bit ni ondas pixeladas: sonido real de televisión y concursos

const SOUND_FILES: Record<string, string> = {
  buzzer: '/sounds/buzzer.opus',
  fail: '/sounds/fail.mp3',
  buzzer_wrong: '/sounds/fail.mp3',
  victory: '/sounds/victory.opus',
  success: '/sounds/success.opus',
  drumroll: '/sounds/drumroll.opus',
  applause: '/sounds/applause.opus',
  airhorn: '/sounds/airhorn.mp3',
  suspense: '/sounds/suspense.opus',
  power_card: '/sounds/power_card.opus',
  tick: '/sounds/tick.opus',
  join: '/sounds/success.opus',
  card_snap: '/sounds/power_card.opus',
  card_slam: '/sounds/power_card.opus',
  chips: '/sounds/tick.opus',
  deco_bell: '/sounds/buzzer.opus',
  speakeasy_brass: '/sounds/victory.opus',
  wah_wah: '/sounds/fail.mp3',
};

class SoundFX {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isPreloaded = false;
  private lastPlayedTimestamps: Map<string, number> = new Map();

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

    const now = Date.now();
    const lastPlayed = this.lastPlayedTimestamps.get(key) || 0;

    // Evitar solapamiento idéntico (doble llamada o rebote en menos de 220ms)
    if (now - lastPlayed < 220) {
      return;
    }

    // Si suena 'victory', suprimir un 'success' casi simultáneo (dentro de 500ms)
    if (key === 'success' && now - (this.lastPlayedTimestamps.get('victory') || 0) < 500) {
      return;
    }

    this.lastPlayedTimestamps.set(key, now);
    this.initContext();

    // Atenuar música de fondo automáticamente mientras suena el efecto
    speakeasyJukebox.duck(2600);

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

  // ==========================================
  // SÍNTESIS DE SONIDO VINTAGE 1930s SPEAKEASY
  // ==========================================

  // 1. Chasquido nítido de naipe sobre tapete verde de casino
  playCardSnap(volume: number = 0.85) {
    const ctx = this.initContext();
    if (!ctx) {
      this.playPowerCard();
      return;
    }

    try {
      const now = ctx.currentTime;
      
      // Ruido filtrado para el roce del cartón satinado
      const bufferSize = ctx.sampleRate * 0.05; // 50ms
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.9, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);

      // Golpe sordo del naipe aterrizando (120Hz -> 50Hz)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

      oscGain.gain.setValueAtTime(volume * 0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      this.playPowerCard();
    }
  }

  // 2. Impacto cinemático de naipe en TV: subgrave + chasquido + destello mágico pentatónico
  playCardSlam(volume: number = 1.0) {
    const ctx = this.initContext();
    if (!ctx) {
      this.playPowerCard();
      return;
    }

    try {
      const now = ctx.currentTime;

      // Chasquido inicial
      this.playCardSnap(volume * 0.9);

      // Impacto grave de mesa de madera noble (Sub-bass thud)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(95, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.28);

      subGain.gain.setValueAtTime(volume * 0.9, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.32);

      // Destello mágico Art Déco (Arpegio de campanillas C6, E6, G6, C7)
      const chimeFreqs = [1046.5, 1318.5, 1567.98, 2093.0];
      chimeFreqs.forEach((freq, idx) => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, now + 0.04 * idx);

        const startTime = now + 0.04 * idx;
        chimeGain.gain.setValueAtTime(0.001, now);
        chimeGain.gain.setValueAtTime(volume * 0.35, startTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chimeOsc.start(startTime);
        chimeOsc.stop(startTime + 0.65);
      });
    } catch {
      this.playPowerCard();
    }
  }

  // 3. Tintineo de fichas de casino de arcilla (Clay Poker Chips Clink)
  playChipClink(volume: number = 0.8) {
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Golpe 1 de ficha
      [2400, 3800].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(volume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      });

      // Rebote ligero de la segunda ficha a los 28ms
      [2250, 3650].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.028);

        const t = now + 0.028;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setValueAtTime(volume * 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
      });
    } catch {}
  }

  // 4. Campana de recepción / boxeo vintage Art Déco (1930s Bell)
  playDecoBell(volume: number = 0.85) {
    const ctx = this.initContext();
    if (!ctx) {
      this.playBuzzer();
      return;
    }

    try {
      const now = ctx.currentTime;
      const partials = [
        { f: 1760, g: 0.55 },
        { f: 3520, g: 0.25 },
        { f: 5280, g: 0.12 },
      ];

      partials.forEach(({ f, g }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(volume * g, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.15);
      });
    } catch {
      this.playBuzzer();
    }
  }

  // 5. Fanfarria de metales Speakeasy 1930s (Big Band Brass Accord)
  playSpeakeasyBrass(volume: number = 0.9) {
    const ctx = this.initContext();
    if (!ctx) {
      this.playVictory();
      return;
    }

    try {
      const now = ctx.currentTime;
      // Acorde triunfal estilo años 30: C4, E4, G4, C5
      const notes = [261.63, 329.63, 392.0, 523.25];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);

        // Filtro cálido de gramófono / válvulas de vacío
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
        filter.frequency.exponentialRampToValueAtTime(900, now + 0.8);

        const startTime = now + idx * 0.02;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setValueAtTime(volume * 0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.85);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.9);
      });
    } catch {
      this.playVictory();
    }
  }

  // 6. Trompeta cómica Wah-Wah años 30 (Rubber-hose Cartoon Fail)
  playWahWahFail(volume: number = 0.85) {
    const ctx = this.initContext();
    if (!ctx) {
      this.playFail();
      return;
    }

    try {
      const now = ctx.currentTime;
      const pitches = [311.13, 293.66, 277.18, 246.94]; // Eb4, D4, Db4, B3 slide

      pitches.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        const stepTime = now + i * 0.26;
        const dur = i === pitches.length - 1 ? 0.6 : 0.24;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, stepTime);
        if (i === pitches.length - 1) {
          osc.frequency.linearRampToValueAtTime(freq - 20, stepTime + dur);
        }

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, stepTime);
        filter.frequency.linearRampToValueAtTime(1100, stepTime + dur * 0.5);
        filter.frequency.linearRampToValueAtTime(550, stepTime + dur);
        filter.Q.setValueAtTime(4.0, stepTime);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setValueAtTime(volume * 0.35, stepTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stepTime + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(stepTime);
        osc.stop(stepTime + dur + 0.05);
      });
    } catch {
      this.playFail();
    }
  }

  // Métodos específicos (100% tematizados 1930s Speakeasy, Cartoon y Casino)
  playBuzzer() {
    this.playAudioFile('buzzer', 0.95);
  }

  playFail() {
    this.playAudioFile('fail', 0.95);
  }

  playBuzzerWrong() {
    this.playFail();
  }

  playSuccess() {
    this.playAudioFile('success', 0.9);
  }

  playVictory() {
    this.playAudioFile('victory', 1.0);
  }

  playDrumRoll() {
    this.playAudioFile('drumroll', 0.95);
  }

  playApplause() {
    this.playAudioFile('applause', 0.95);
  }

  playAirHorn() {
    this.playAudioFile('airhorn', 0.95);
  }

  playSuspense() {
    this.playAudioFile('suspense', 0.95);
  }

  playPowerCard() {
    this.playAudioFile('power_card', 1.0);
  }

  playTick(urgent: boolean = false) {
    this.playAudioFile('tick', urgent ? 0.85 : 0.55);
  }

  playJoin() {
    this.playAudioFile('success', 0.7);
  }

  playSound(name: string) {
    switch (name) {
      case 'card_snap':
        this.playCardSnap();
        break;
      case 'card_slam':
        this.playCardSlam();
        break;
      case 'chip_clink':
      case 'chips':
        this.playChipClink();
        break;
      case 'deco_bell':
      case 'bell':
        this.playDecoBell();
        break;
      case 'brass':
      case 'speakeasy_brass':
        this.playSpeakeasyBrass();
        break;
      case 'wah_wah':
      case 'cartoon_fail':
        this.playWahWahFail();
        break;
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

// ============================================================================
// 🎷 SPEAKEASY JUKEBOX: HILO MUSICAL DE LOS AÑOS 20/30 CON AUDIO DUCKING
// ============================================================================
import { JukeboxTrack, JUKEBOX_PLAYLIST } from './jukeboxPlaylist';
export type { JukeboxTrack };
export { JUKEBOX_PLAYLIST };

export interface JukeboxState {
  isPlaying: boolean;
  currentTrackIndex: number;
  currentTrack: JukeboxTrack;
  volume: number;
  isMuted: boolean;
  isDucked: boolean;
  autoplayBlocked?: boolean;
  contextFactor?: number;
  contextReason?: string;
}

export class SpeakeasyJukebox {
  private audioElement: HTMLAudioElement | null = null;
  private currentTrackIndex = 0;
  private isPlaying = true; // Por defecto el hilo musical está concebido para sonar siempre
  private isEnabled = true; // Habilitado globalmente salvo que el host lo pause
  private isMuted = false;
  private userVolume = 0.45; // Volumen de fiesta por defecto
  private isDucked = false;
  private autoplayBlocked = false;
  private contextFactor = 1.0;
  private contextReason = 'Salón / Fiesta';
  private duckTimer: any = null;
  private listeners: ((state: JukeboxState) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (this.audioElement || typeof window === 'undefined') return;
    const track = JUKEBOX_PLAYLIST[this.currentTrackIndex];
    this.audioElement = new Audio();
    this.audioElement.src = track.url;
    this.audioElement.preload = 'auto';
    this.audioElement.autoplay = false;
    this.audioElement.volume = this.getEffectiveVolume();
    this.audioElement.loop = false;

    this.audioElement.addEventListener('ended', () => {
      this.next();
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('Error en SpeakeasyJukebox:', e);
    });
  }

  // Modula el volumen según el estado de la sala y el juego activo
  setGameContext(status: string, gameId?: string | null, isMusicPreviewPlaying?: boolean) {
    if (status === 'lobby') {
      // 1. En el Lobby de convocatoria: ambientación festiva a pleno volumen
      this.contextFactor = 1.0;
      this.contextReason = 'Salón / Fiesta';
    } else if (status === 'presentation') {
      // 2. En la presentación de pruebas o cartas: música lounge agradable de fondo
      this.contextFactor = 0.75;
      this.contextReason = 'Presentación';
    } else if (status === 'podium' || status === 'ended') {
      // 3. Podio final y periódico The Speakeasy Gazette: celebración a pleno volumen
      this.contextFactor = 1.0;
      this.contextReason = 'Speakeasy Gazette';
    } else if (status === 'playing') {
      // 4. Pruebas en curso: silenciar solo en las que pueda molestar a los participantes
      if (gameId === 'music') {
        // Adivina la Canción: SILENCIO TOTAL (deben escuchar exclusivamente el tema musical/Spotify)
        this.contextFactor = 0.0;
        this.contextReason = isMusicPreviewPlaying ? 'Canción en curso' : 'Adivina la Canción (Silencio)';
      } else if (gameId === 'un_dos_tres') {
        // 1, 2, 3 ¿Ya?: SILENCIO TOTAL (cuenta atrás de 5 segundos de máxima tensión verbal)
        this.contextFactor = 0.0;
        this.contextReason = '1, 2, 3 ¿Ya? (Silencio)';
      } else if (gameId === 'trivial' || gameId === 'mimica') {
        // Concentración, preguntas o actuación: música sutil que no compita con la voz
        this.contextFactor = 0.20;
        this.contextReason = 'Prueba en curso';
      } else if (gameId === 'movies' || gameId === 'fotos_proyector') {
        // Pruebas visuales de proyección
        this.contextFactor = 0.35;
        this.contextReason = 'Prueba Visual';
      } else {
        // Juegos de fiesta, dibujo, beer pong, juegos de mesa (torneo_juegos, drawing, bingo...)
        this.contextFactor = 0.60;
        this.contextReason = 'Juego de Fiesta';
      }
    } else {
      this.contextFactor = 1.0;
      this.contextReason = 'Salón / Fiesta';
    }

    if (this.audioElement) {
      const effVol = this.getEffectiveVolume();
      this.audioElement.volume = effVol;

      if (this.contextFactor === 0.0) {
        if (!this.audioElement.paused) {
          this.audioElement.pause();
        }
      } else if (this.isEnabled) {
        if (this.audioElement.paused) {
          this.audioElement.play().then(() => {
            this.isPlaying = true;
            this.autoplayBlocked = false;
            this.notify();
          }).catch(() => {
            // El navegador esperará una interacción pasiva si aún no hubo gesto
          });
        }
      }
    }
    this.notify();
  }

  private getEffectiveVolume(): number {
    if (this.isMuted) return 0;
    let vol = this.userVolume * this.contextFactor;
    if (this.isDucked) {
      vol = vol * 0.22;
    }
    return Math.max(0, Math.min(1, vol));
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  getState(): JukeboxState {
    return {
      isPlaying: this.isPlaying && this.isEnabled && this.contextFactor > 0.0,
      currentTrackIndex: this.currentTrackIndex,
      currentTrack: JUKEBOX_PLAYLIST[this.currentTrackIndex],
      volume: this.userVolume,
      isMuted: this.isMuted,
      isDucked: this.isDucked,
      autoplayBlocked: this.autoplayBlocked,
      contextFactor: this.contextFactor,
      contextReason: this.contextReason,
    };
  }

  subscribe(listener: (state: JukeboxState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Arranque automático: reproduce de inmediato y, si la política del navegador lo retiene,
  // se activa de manera totalmente transparente ante cualquier tecla, mando o toque
  async autoStart() {
    this.isEnabled = true;
    this.initAudio();
    if (!this.audioElement) return;

    if (this.contextFactor === 0.0) {
      this.isPlaying = true;
      this.notify();
      return;
    }

    try {
      this.audioElement.volume = this.getEffectiveVolume();
      await this.audioElement.play();
      this.isPlaying = true;
      this.autoplayBlocked = false;
      this.notify();
    } catch (err: any) {
      this.autoplayBlocked = true;
      this.notify();

      // Desbloqueo pasivo transparente (mandos a distancia, teclado del proyector, cualquier clic/toque)
      const unlockAudio = async () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('keydown', unlockAudio);
          window.removeEventListener('keyup', unlockAudio);
          window.removeEventListener('pointerdown', unlockAudio);
          window.removeEventListener('click', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
          window.removeEventListener('focus', unlockAudio);
          window.removeEventListener('visibilitychange', unlockAudio);
        }
        this.autoplayBlocked = false;
        if (this.isEnabled && this.contextFactor > 0.0) {
          await this.play();
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', unlockAudio, { once: true });
        window.addEventListener('keyup', unlockAudio, { once: true });
        window.addEventListener('pointerdown', unlockAudio, { once: true });
        window.addEventListener('click', unlockAudio, { once: true });
        window.addEventListener('touchstart', unlockAudio, { once: true });
        window.addEventListener('focus', unlockAudio, { once: true });
        window.addEventListener('visibilitychange', unlockAudio, { once: true });
      }
    }
  }

  async play() {
    this.isEnabled = true;
    this.initAudio();
    if (!this.audioElement) return;

    if (this.contextFactor === 0.0) {
      this.isPlaying = true;
      this.notify();
      return;
    }

    try {
      this.audioElement.volume = this.getEffectiveVolume();
      await this.audioElement.play();
      this.isPlaying = true;
      this.autoplayBlocked = false;
      this.notify();
    } catch (err) {
      this.autoplayBlocked = true;
      this.notify();
    }
  }

  pause() {
    this.isEnabled = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.isPlaying = false;
    this.notify();
  }

  toggle() {
    if (this.isPlaying && this.isEnabled) {
      this.pause();
    } else {
      this.play();
    }
  }

  next() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % JUKEBOX_PLAYLIST.length;
    this.switchTrack();
  }

  prev() {
    this.currentTrackIndex =
      (this.currentTrackIndex - 1 + JUKEBOX_PLAYLIST.length) % JUKEBOX_PLAYLIST.length;
    this.switchTrack();
  }

  private switchTrack() {
    const track = JUKEBOX_PLAYLIST[this.currentTrackIndex];
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = track.url;
      this.audioElement.currentTime = 0;
      this.audioElement.volume = this.getEffectiveVolume();
      if (this.isPlaying) {
        this.audioElement.play().catch(() => {});
      }
    }
    this.notify();
  }

  setVolume(volume: number) {
    this.userVolume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.getEffectiveVolume();
    }
    this.notify();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.volume = this.getEffectiveVolume();
    }
    this.notify();
  }

  // Audio ducking automático al reproducir cualquier efecto importante
  duck(durationMs = 2600) {
    if (!this.isPlaying || !this.audioElement) return;
    this.isDucked = true;
    this.audioElement.volume = this.getEffectiveVolume();
    this.notify();

    if (this.duckTimer) clearTimeout(this.duckTimer);
    this.duckTimer = setTimeout(() => {
      this.isDucked = false;
      if (this.audioElement) {
        // Recuperación gradual del volumen
        this.audioElement.volume = this.getEffectiveVolume();
      }
      this.notify();
    }, durationMs);
  }
}

export const speakeasyJukebox = new SpeakeasyJukebox();



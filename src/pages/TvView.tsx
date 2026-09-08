import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Tv2,
  Users,
  Sparkles,
  Trophy,
  Flame,
  Timer,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  Swords,
  Layers,
  Play,
  Palette,
  Award,
  Film,
  Clapperboard,
  Zap,
  Camera,
  Image as ImageIcon,
  Crown,
  Star,
  ShieldAlert,
  Moon,
  Orbit,
  Sun,
  Droplets,
  Music,
  Disc,
  Volume2,
  VolumeX,
  HelpCircle,
  Skull,
  Dices,
  Beer,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TEAMS_CATALOG, SAMPLE_CHALLENGES } from '../lib/constants';
import { Room, Team, Player, MinigameType, CaptainGamble, CaptainDuelState } from '../lib/types';
import { OFFICIAL_TRIVIA_QUESTIONS, TriviaQuestion } from '../lib/triviaData';
import { OFFICIAL_UN_DOS_TRES_CHALLENGES, UnDosTresChallenge } from '../lib/unDosTresData';
import { OFFICIAL_MIMICA_CARDS, MimicaCard } from '../lib/mimicaData';
import { BingoRoulette } from '../components/BingoRoulette';
import { getBingoBallTheme } from '../lib/bingoUtils';
import { soundFX } from '../lib/audio';
import { useBuzzerRace } from '../lib/useBuzzerRace';
import { RoomSync, getRoomSync } from '../lib/roomSync';
import { GAMES_CATALOG, GameDefinition } from '../lib/games';
import { MOVIES_DATABASE, MovieItem } from '../lib/moviesData';
import { DEV_MOCK_BABY_PHOTOS, BabyPhotoItem } from '../lib/babyPhotosData';
import { SongTrack } from '../lib/musicData';
import { PowerCardsState, PowerCard, POWER_CARDS_CATALOG } from '../lib/powerCards';
import PowerCardView from '../components/PowerCardView';
import { CoinBurstCelebration } from '../components/particles/CoinBurstCelebration';
import { DecoProceduralSpandrel } from '../components/deco/DecoProceduralSpandrel';
import { CinematicCardPlayReveal } from '../components/cards/CinematicCardPlayReveal';
import { RetroGridBackground } from '../components/RetroGridBackground';
import { TeamScoreCard } from '../components/TeamScoreCard';
import { getTeamTheme } from '../lib/teamThemes';
import { useGameAudio } from '../lib/useGameAudio';
import { triggerTeamConfetti } from '../lib/triggerTeamConfetti';
import { TwemojiText } from '../components/TwemojiText';
import { GameIcon } from '../components/GameIcon';
import { generateAvatarDataUri, DiceBearStyle } from '../lib/dicebear';
import { speakeasyJukebox, JukeboxState } from '../lib/audio';
import { SpeakeasyJukeboxWidget } from '../components/audio/SpeakeasyJukeboxWidget';
import { SpeakeasyGazettePodium } from '../components/podium/SpeakeasyGazettePodium';
import { ThreeArtDecoPodiumStage } from '../components/3d/ThreeArtDecoPodiumStage';

export default function TvView() {
  const { code } = useParams<{ code: string }>();
  const roomCode = (code || '').toUpperCase();
  const { playBuzzer, playCountdown, playCorrect, playWrong, playVictory } = useGameAudio();

  const [room, setRoom] = useState<Room>(() => {
    const saved = localStorage.getItem(`party_room_${roomCode}`);
    const savedTitle = localStorage.getItem(`party_room_title_${roomCode}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (savedTitle && !parsed.title) parsed.title = savedTitle;
        return parsed;
      } catch {}
    }
    return {
      id: 'local_room_' + roomCode,
      code: roomCode,
      host_token: 'demo',
      status: 'lobby',
      active_teams_count: 5,
      current_game: 'buzzer',
      active_game_id: 'music',
      title: savedTitle || 'GAME SHOW ARENA',
    };
  });

  const [jukeboxState, setJukeboxState] = useState<JukeboxState>(() => speakeasyJukebox.getState());
  const [podiumPage, setPodiumPage] = useState<'podium' | 'medals'>('podium');

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(`party_teams_${roomCode}`);
    if (saved) {
      try {
        const parsed: Team[] = JSON.parse(saved);
        return TEAMS_CATALOG.map((c) => {
          const existing = parsed.find((p) => p.team_index === c.index);
          return {
            id: existing ? existing.id : `team_${c.index}`,
            room_id: 'local_room_' + roomCode,
            team_index: c.index,
            name: c.name,
            theme: c.theme,
            color_hex: c.colorHex,
            color_tw: c.twBg,
            score: existing ? existing.score : 0,
            is_active: existing !== undefined ? existing.is_active : c.index <= 5,
          };
        });
      } catch {}
    }
    return TEAMS_CATALOG.map((c) => ({
      id: `team_${c.index}`,
      room_id: 'local_room_' + roomCode,
      team_index: c.index,
      name: c.name,
      theme: c.theme,
      color_hex: c.colorHex,
      color_tw: c.twBg,
      score: 0,
      is_active: c.index <= 5,
    }));
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(`party_players_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [joinUrl, setJoinUrl] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [showTvCoinBurst, setShowTvCoinBurst] = useState(false);

  // Instancia de sincronización multi-pantalla como pantalla de TV
  const roomSync = useMemo(() => getRoomSync(roomCode, 'tv'), [roomCode]);

  useEffect(() => {
    // Iniciar hilo musical automáticamente en la TV
    speakeasyJukebox.autoStart();

    const unsub = speakeasyJukebox.subscribe((st) => {
      setJukeboxState(st);
      roomSync.broadcast({ type: 'JUKEBOX_STATE_SYNC', payload: st });
    });

    // Desbloquear al primer clic o toque en cualquier parte de la TV si el navegador lo bloqueó
    const handleFirstTouch = () => {
      if (!speakeasyJukebox.getState().isPlaying) {
        speakeasyJukebox.play();
      }
    };
    window.addEventListener('click', handleFirstTouch, { once: true });
    window.addEventListener('pointerdown', handleFirstTouch, { once: true });
    window.addEventListener('keydown', handleFirstTouch, { once: true });

    return () => {
      unsub();
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('pointerdown', handleFirstTouch);
      window.removeEventListener('keydown', handleFirstTouch);
    };
  }, [roomSync]);

  // Hook del motor de carreras con arbitraje en TV
  const { winner: buzzerWinner, isLocked: buzzerLocked, resetBuzzer } = useBuzzerRace({
    roomCode,
    isHostOrTv: true,
    roomSync,
  });

  // Estados de Cartas de Poder
  const [powerCards, setPowerCards] = useState<PowerCardsState | null>(() => {
    const saved = localStorage.getItem(`party_power_cards_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });
  const [activeCardAnimation, setActiveCardAnimation] = useState<{
    type: 'deal' | 'play';
    teamName: string;
    card: PowerCard;
    targetName?: string;
    teamId?: string;
    teamColorHex?: string;
    teamThemeIndex?: number;
    sensoryLimitation?: string;
    recoveredCard?: PowerCard;
  } | null>(null);
  const [testFinishedNotification, setTestFinishedNotification] = useState<{ gameTitle: string; winnerTeamName?: string } | null>(null);
  const [selectedPresentationCard, setSelectedPresentationCard] = useState<PowerCard | null>(null);

  // Estados del minijuego de adivinar películas
  const [movieIndex, setMovieIndex] = useState(0);
  const [movieFrameLevel, setMovieFrameLevel] = useState<1 | 2 | 3 | 4>(1);
  const [movieRevealed, setMovieRevealed] = useState(false);
  const [remoteMovie, setRemoteMovie] = useState<MovieItem | null>(null);
  const [movieCategoryFilter, setMovieCategoryFilter] = useState<'Todos' | 'Taquillazos' | 'Disney / Pixar' | 'Terror'>('Todos');

  const filteredMovies = useMemo(() => {
    if (movieCategoryFilter === 'Todos') return MOVIES_DATABASE;
    return MOVIES_DATABASE.filter((m) => m.category === movieCategoryFilter);
  }, [movieCategoryFilter]);

  const currentMovie: MovieItem = remoteMovie || filteredMovies[movieIndex % filteredMovies.length] || MOVIES_DATABASE[0];

  // Estados del minijuego de Fotos Proyector (Bebés)
  const [babyPhotoIndex, setBabyPhotoIndex] = useState(0);
  const [babyPhotoRevealed, setBabyPhotoRevealed] = useState(false);
  const [remoteBabyPhoto, setRemoteBabyPhoto] = useState<BabyPhotoItem | null>(null);

  const currentBabyPhoto: BabyPhotoItem =
    remoteBabyPhoto || DEV_MOCK_BABY_PHOTOS[babyPhotoIndex % DEV_MOCK_BABY_PHOTOS.length] || DEV_MOCK_BABY_PHOTOS[0];

  // Estados de Adivina la Canción (100% Spotify)
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicRevealed, setMusicRevealed] = useState(false);
  const [remoteMusicTrack, setRemoteMusicTrack] = useState<SongTrack | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const musicAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Adaptación automática del volumen del Speakeasy Jukebox según la prueba o juego
  useEffect(() => {
    speakeasyJukebox.setGameContext(room.status, room.active_game_id, musicPlaying);
  }, [room.status, room.active_game_id, musicPlaying]);

  const currentSong: SongTrack | null = remoteMusicTrack;

  // Reiniciar tiempo de audio a 0 solo cuando cambie efectivamente de canción
  const prevSongIdRef = React.useRef<string | undefined>(currentSong?.id);
  useEffect(() => {
    if (currentSong && prevSongIdRef.current !== currentSong.id) {
      prevSongIdRef.current = currentSong.id;
      if (musicAudioRef.current) {
        musicAudioRef.current.currentTime = 0;
      }
    }
  }, [currentSong?.id]);

  // Auto-pausa de la música si alguien pulsa el buzzer en el móvil (solo mientras la canción no esté resuelta)
  useEffect(() => {
    if (buzzerLocked && musicPlaying && !musicRevealed) {
      setMusicPlaying(false);
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
      }
    }
  }, [buzzerLocked, musicPlaying, musicRevealed]);

  const musicRevealedRef = React.useRef(musicRevealed);
  musicRevealedRef.current = musicRevealed;
  const currentSongRef = React.useRef(currentSong);
  currentSongRef.current = currentSong;
  const musicPlayingRef = React.useRef(musicPlaying);
  musicPlayingRef.current = musicPlaying;

  // Manejo del elemento de audio HTML5 según musicPlaying
  useEffect(() => {
    if (!musicAudioRef.current) return;
    // Si la canción está revelada (acierto validado por el host), suena la música para celebrar
    const shouldPlay = musicPlaying && (!buzzerLocked || musicRevealed);
    if (shouldPlay && currentSong?.previewUrl) {
      musicAudioRef.current.play().then(() => {
        setAutoplayBlocked(false);
      }).catch((err) => {
        console.warn('Auto-play bloqueado o error en preview en TV:', err);
        if (err.name === 'NotAllowedError') {
          setAutoplayBlocked(true);
        }
        setMusicPlaying(false);
        roomSync.broadcast({
          type: 'MUSIC_STATE_UPDATE',
          payload: {
            trackIndex: 0,
            isPlaying: false,
            isRevealed: musicRevealedRef.current,
            trackData: currentSongRef.current || undefined,
          },
        });
      });
    } else {
      musicAudioRef.current.pause();
    }
  }, [musicPlaying, currentSong?.previewUrl, currentSong?.id, buzzerLocked, musicRevealed]);

  // Estados de Capitanes
  const [captainGambles, setCaptainGambles] = useState<Record<string, CaptainGamble>>({});
  const [captainDuel, setCaptainDuel] = useState<CaptainDuelState | null>(null);

  // Estados específicos para Trivial
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaRevealed, setTriviaRevealed] = useState(false);
  const [triviaReboundActive, setTriviaReboundActive] = useState(false);
  const [remoteTriviaQuestion, setRemoteTriviaQuestion] = useState<TriviaQuestion | null>(null);
  const currentTriviaQuestion = remoteTriviaQuestion || OFFICIAL_TRIVIA_QUESTIONS[triviaIndex % OFFICIAL_TRIVIA_QUESTIONS.length] || OFFICIAL_TRIVIA_QUESTIONS[0];

  // Estados específicos para 1, 2, 3 ¿Ya?
  const [udtPromptIndex, setUdtPromptIndex] = useState(0);
  const [udtActiveTeamId, setUdtActiveTeamId] = useState<string | undefined>(undefined);
  const [udtEliminatedTeamIds, setUdtEliminatedTeamIds] = useState<string[]>([]);
  const [udtCountdown, setUdtCountdown] = useState<number | null>(null);
  const [udtIsTimerRunning, setUdtIsTimerRunning] = useState(false);
  const [remoteUdtChallenge, setRemoteUdtChallenge] = useState<UnDosTresChallenge | null>(null);
  const currentUdtChallenge = remoteUdtChallenge || OFFICIAL_UN_DOS_TRES_CHALLENGES[udtPromptIndex % OFFICIAL_UN_DOS_TRES_CHALLENGES.length] || OFFICIAL_UN_DOS_TRES_CHALLENGES[0];

  // Estados específicos para BINGO
  const [bingoCurrentBall, setBingoCurrentBall] = useState<number | null>(null);
  const [bingoDrawnBalls, setBingoDrawnBalls] = useState<number[]>([]);
  const [bingoIsSpinning, setBingoIsSpinning] = useState(false);

  // Estados específicos para Mímica
  const [mimicaActiveTeamId, setMimicaActiveTeamId] = useState<string | undefined>(undefined);
  const [mimicaHitsCount, setMimicaHitsCount] = useState(0);
  const [mimicaTimerSeconds, setMimicaTimerSeconds] = useState<number | null>(null);
  const [mimicaIsRunning, setMimicaIsRunning] = useState(false);

  // Juego activo según ID
  const activeGame: GameDefinition = useMemo(() => {
    const found = GAMES_CATALOG.find((g) => g.id === room.active_game_id);
    return found || GAMES_CATALOG[0];
  }, [room.active_game_id]);

  // Generar URL completa para el QR
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/room/${roomCode}/play`;
      setJoinUrl(url);
    }
  }, [roomCode]);

  // Guardar jugadores y estado en localStorage
  useEffect(() => {
    localStorage.setItem(`party_players_${roomCode}`, JSON.stringify(players));
  }, [players, roomCode]);

  useEffect(() => {
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(room));
  }, [room, roomCode]);

  useEffect(() => {
    localStorage.setItem(`party_teams_${roomCode}`, JSON.stringify(teams));
  }, [teams, roomCode]);

  const roomRef = useRef(room);
  useEffect(() => { roomRef.current = room; }, [room]);
  const teamsRef = useRef(teams);
  useEffect(() => { teamsRef.current = teams; }, [teams]);

  // Sincronización en tiempo real
  useEffect(() => {
    roomSync.broadcast({ type: 'REQUEST_PLAYERS_SYNC' });

    const unsubscribe = roomSync.onEvent((event) => {
      if (event.type === 'PLAYER_JOINED') {
        soundFX.playJoin();
        setPlayers((prev) => {
          const exists = prev.some((p) => p.id === event.payload.id);
          const updated = exists
            ? prev.map((p) => (p.id === event.payload.id ? event.payload : p))
            : [...prev, event.payload];
          return updated;
        });
      } else if (event.type === 'PLAYER_UPDATED') {
        setPlayers((prev) => {
          const exists = prev.some((p) => p.id === event.payload.id);
          const updated = exists
            ? prev.map((p) => (p.id === event.payload.id ? event.payload : p))
            : [...prev, event.payload];
          return updated;
        });
      } else if (event.type === 'PLAYERS_UPDATE') {
        setPlayers(event.payload);
      } else if (event.type === 'REQUEST_ROOM_SYNC') {
        roomSync.broadcast({
          type: 'ROOM_UPDATE',
          payload: {
            status: roomRef.current.status,
            current_game: roomRef.current.current_game,
            active_game_id: roomRef.current.active_game_id,
            active_teams_count: roomRef.current.active_teams_count,
          },
        });
        roomSync.broadcast({ type: 'TEAMS_UPDATE', payload: teamsRef.current });
        roomSync.broadcast({ type: 'JUKEBOX_STATE_SYNC', payload: speakeasyJukebox.getState() });
      } else if (event.type === 'RETURN_TO_LOBBY') {
        setRoom((prev) => ({ ...prev, status: 'lobby' }));
        resetBuzzer();
        setTimerSeconds(null);
        setMusicPlaying(false);
      } else if (event.type === 'PRESENTATION_SLIDE') {
        setRoom((prev) => ({ ...prev, status: 'presentation', presentation_slide: event.payload.slide }));
      } else if (event.type === 'TEST_FINISHED') {
        setTestFinishedNotification(event.payload);
        triggerVictoryConfetti();
        resetBuzzer();
        setTimerSeconds(null);
        setMusicPlaying(false);
        setTimeout(() => {
          setTestFinishedNotification(null);
        }, 7000);
      } else if (event.type === 'SWITCH_GAME') {
        setRoom((prev) => ({
          ...prev,
          status: event.payload.status,
          current_game: event.payload.current_game,
          active_game_id: event.payload.game_id || prev.active_game_id,
        }));
        resetBuzzer();
        setTimerSeconds(null);
        setMusicPlaying(false);
      } else if (event.type === 'ROOM_UPDATE') {
        setRoom((prev) => ({ ...prev, ...event.payload }));
      } else if (event.type === 'TEAMS_UPDATE') {
        setTeams(event.payload);
      } else if (event.type === 'MUSIC_STATE_UPDATE') {
        setMusicPlaying(event.payload.isPlaying);
        setMusicRevealed(event.payload.isRevealed);
        if (event.payload.trackData !== undefined) {
          setRemoteMusicTrack(event.payload.trackData || null);
        }
        if (event.payload.isRevealed) {
          triggerVictoryConfetti();
        }
      } else if (event.type === 'MOVIE_STATE_UPDATE') {
        setMovieIndex(event.payload.movieIndex);
        setMovieFrameLevel(event.payload.frameLevel);
        setMovieRevealed(event.payload.isRevealed);
        if (event.payload.categoryFilter) {
          setMovieCategoryFilter(event.payload.categoryFilter as any);
        }
        if (event.payload.movieData) {
          setRemoteMovie(event.payload.movieData);
        }
        if (event.payload.isRevealed) {
          triggerVictoryConfetti();
        }
      } else if (event.type === 'POWER_CARDS_STATE_UPDATE') {
        setPowerCards(event.payload);
      } else if (event.type === 'POWER_CARD_ANIMATION') {
        // Mostrar carta en pantalla completa sin temporizador (el anfitrión la descarta)
        if (event.payload.type === 'play') {
          soundFX.playPowerCard();
          setActiveCardAnimation(event.payload);
        }
      } else if (event.type === 'DISMISS_POWER_CARD_ANIMATION') {
        setActiveCardAnimation(null);
      } else if (event.type === 'BABY_PHOTO_UPDATE') {
        setBabyPhotoIndex(event.payload.photoIndex);
        setBabyPhotoRevealed(event.payload.isRevealed);
        if (event.payload.photoData) {
          setRemoteBabyPhoto(event.payload.photoData);
        }
        if (event.payload.isRevealed) {
          triggerVictoryConfetti();
        }
      } else if (event.type === 'SET_CAPTAIN') {
        setPlayers((prev) =>
          prev.map((p) => {
            if (p.team_id === event.payload.teamId) {
              return { ...p, is_captain: p.id === event.payload.playerId };
            }
            return p;
          })
        );
      } else if (event.type === 'CAPTAIN_DOUBLE_OR_NOTHING') {
        setCaptainGambles((prev) => ({ ...prev, [event.payload.teamId]: event.payload }));
        soundFX.playPowerCard();
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      } else if (event.type === 'CLEAR_CAPTAIN_GAMBLES') {
        if (event.payload?.teamId) {
          setCaptainGambles((prev) => {
            const next = { ...prev };
            delete next[event.payload!.teamId!];
            return next;
          });
        } else {
          setCaptainGambles({});
        }
      } else if (event.type === 'CAPTAIN_DUEL_STATE') {
        setCaptainDuel(event.payload);
        if (event.payload.isActive) {
          soundFX.playBuzzer();
        }
      } else if (event.type === 'TRIVIA_STATE_UPDATE') {
        setTriviaIndex(event.payload.questionIndex);
        setTriviaRevealed(event.payload.isRevealed);
        setTriviaReboundActive(event.payload.isReboundActive);
        if (event.payload.questionData) {
          setRemoteTriviaQuestion(event.payload.questionData);
        }
        if (event.payload.isRevealed) {
          triggerVictoryConfetti();
        }
      } else if (event.type === 'UN_DOS_TRES_STATE') {
        setUdtPromptIndex(event.payload.promptIndex);
        setUdtActiveTeamId(event.payload.activeTeamId);
        setUdtEliminatedTeamIds(event.payload.eliminatedTeamIds);
        setUdtCountdown(event.payload.countdownSeconds);
        setUdtIsTimerRunning(event.payload.isTimerRunning);
        if (event.payload.challengeData) {
          setRemoteUdtChallenge(event.payload.challengeData);
        }
      } else if (event.type === 'BINGO_STATE_UPDATE') {
        setBingoCurrentBall(event.payload.currentBall);
        setBingoDrawnBalls(event.payload.drawnBalls);
        setBingoIsSpinning(!!event.payload.isSpinning);
      } else if (event.type === 'MIMICA_STATE_UPDATE') {
        setMimicaActiveTeamId(event.payload.activeTeamId);
        setMimicaHitsCount(event.payload.hitsCount);
        setMimicaTimerSeconds(event.payload.timerSeconds);
        setMimicaIsRunning(event.payload.isRunning);
      } else if (event.type === 'PLAY_SOUND') {
        soundFX.playSound(event.payload.sound);
      } else if (event.type === 'LAUNCH_TIMER') {
        setTimerSeconds(event.payload.seconds);
      } else if (event.type === 'TRIGGER_CONFETTI') {
        playVictory();
        triggerTeamConfetti(event.payload?.teamId || winningTeamCatalog?.index);
        setShowTvCoinBurst(true);
        setTimeout(() => setShowTvCoinBurst(false), 2400);
      } else if (event.type === 'JUKEBOX_COMMAND') {
        const { action, volume } = event.payload;
        if (action === 'play') speakeasyJukebox.play();
        else if (action === 'pause') speakeasyJukebox.pause();
        else if (action === 'toggle') speakeasyJukebox.toggle();
        else if (action === 'next') speakeasyJukebox.next();
        else if (action === 'prev') speakeasyJukebox.prev();
        else if (action === 'volume' && typeof volume === 'number') speakeasyJukebox.setVolume(volume);
        else if (action === 'mute') speakeasyJukebox.toggleMute();
      } else if (event.type === 'PODIUM_PAGE_CHANGE') {
        setPodiumPage(event.payload.page);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomSync, resetBuzzer]);

  // Temporizador interactivo para 1, 2, 3 ¿Ya?
  useEffect(() => {
    if (!udtIsTimerRunning || udtCountdown === null || udtCountdown <= 0) return;
    const interval = setInterval(() => {
      setUdtCountdown((prev) => {
        if (prev === null || prev <= 1) {
          soundFX.playFail();
          setUdtIsTimerRunning(false);
          return 0;
        }
        soundFX.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [udtIsTimerRunning, udtCountdown]);

  // Temporizador interactivo para Mímica
  useEffect(() => {
    if (!mimicaIsRunning || mimicaTimerSeconds === null || mimicaTimerSeconds <= 0) return;
    const interval = setInterval(() => {
      setMimicaTimerSeconds((prev) => {
        if (prev === null || prev <= 1) {
          soundFX.playFail();
          setMimicaIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mimicaIsRunning, mimicaTimerSeconds]);


  // Temporizador interactivo con audio de cuenta atrás
  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev === null || prev <= 1) {
          playWrong();
          return 0;
        }
        if (prev <= 6) {
          playCountdown();
        } else {
          soundFX.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerSeconds, playWrong, playCountdown]);

  // Reproducir sonido de buzzer en la TV cuando alguien pulsa primero
  useEffect(() => {
    if (buzzerLocked && buzzerWinner) {
      playBuzzer();
    }
  }, [buzzerLocked, buzzerWinner, playBuzzer]);

  const launchTimer = (seconds: number) => {
    setTimerSeconds(seconds);
  };

  const nextChallenge = () => {
    setCurrentChallengeIndex((prev) => (prev + 1) % SAMPLE_CHALLENGES.length);
    setTimerSeconds(null);
  };

  const triggerVictoryConfetti = () => {
    soundFX.playSuccess();
    setShowTvCoinBurst(true);
    setTimeout(() => setShowTvCoinBurst(false), 2400);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleReturnToLobby = () => {
    setRoom((prev) => ({ ...prev, status: 'lobby' }));
    roomSync.broadcast({ type: 'RETURN_TO_LOBBY' });
    if (isSupabaseConfigured) {
      supabase.from('rooms').update({ status: 'lobby' }).eq('code', roomCode);
    }
  };

  // Modificar puntuación desde la TV con celebración sonora y confeti del equipo
  const handleScoreChange = (teamId: string, delta: number) => {
    const updated = teams.map((t) =>
      t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t
    );
    setTeams(updated);
    roomSync.broadcast({ type: 'TEAMS_UPDATE', payload: updated });
    if (delta > 0) {
      playCorrect();
      triggerTeamConfetti(teamId);
    } else {
      playWrong();
    }
    resetBuzzer();
  };

  const activeTeams = teams.filter((t) => t.is_active);
  const unassignedPlayers = players.filter(
    (p) => !p.team_id && (p.team_index === undefined || p.team_index === null)
  );
  const winningTeamCatalog = buzzerWinner
    ? TEAMS_CATALOG.find((c) => c.index === buzzerWinner.teamIndex)
    : null;
  const isWinnerCaptain = buzzerWinner
    ? players.some(
        (p) =>
          (p.id === buzzerWinner.playerId || p.nickname === buzzerWinner.playerName) &&
          p.is_captain
      )
    : false;
  const currentSlide = room.presentation_slide || 0;

  const renderPresentationView = () => {
    return (
      <section className="flex-1 flex flex-col justify-center items-center my-3 z-10 w-full max-w-7xl mx-auto px-2">
        {/* CABECERA PRESENTACIÓN TEATRAL 1930s */}
        <div className="w-full flex items-center justify-between bg-[#0c0c14]/90 border-2 border-[#d4af37]/40 px-6 py-3.5 rounded-2xl mb-4 backdrop-blur-xl shadow-deco-gold">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">✨</span>
            <div>
              <span className="text-[11px] font-vintage uppercase tracking-widest text-amber-300/80 block">
                PROGRAMA TEATRAL OFICIAL DE LA VELADA
              </span>
              <h2 className="text-xl font-broadway tracking-wider text-gold-gradient uppercase">
                {currentSlide === 0 ? 'Los 10 Grandes Desafíos' : 'Cartas de Poder y Rarezas de Casino'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-broadway uppercase tracking-wider border transition-all ${
                currentSlide === 0
                  ? 'bg-gold-gradient text-slate-950 border-[#f5eedb] shadow-deco-gold font-black'
                  : 'bg-[#12121c] text-slate-400 border-[#d4af37]/20 font-medium'
              }`}
            >
              1. Desafíos
            </span>
            <span
              className={`px-3.5 py-1.5 rounded-xl text-xs font-broadway uppercase tracking-wider border transition-all ${
                currentSlide === 1
                  ? 'bg-gold-gradient text-slate-950 border-[#f5eedb] shadow-deco-gold font-black'
                  : 'bg-[#12121c] text-slate-400 border-[#d4af37]/20 font-medium'
              }`}
            >
              2. Cartas de Poder
            </span>
          </div>
        </div>

        {/* DIAPOSITIVA 0: LOS 10 MINIJUEGOS Y CARTEL */}
        {currentSlide === 0 && (
          <motion.div
            key="slide-games"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full grid grid-cols-12 gap-5 items-stretch flex-1 min-h-0"
          >
            {/* CARTEL DEL EVENTO */}
            <div className="col-span-5 bg-[#0c0c14]/90 border-2 border-[#d4af37]/50 rounded-3xl p-3.5 flex flex-col items-center justify-center backdrop-blur-xl shadow-deco-gold relative overflow-hidden group">
              <div className="relative w-full h-[590px] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#d4af37]/30 shadow-inner">
                <img
                  src="/presentation_games.jpg"
                  alt="Cartel 10 Minijuegos"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
              <div className="w-full mt-2 text-center">
                <span className="text-[11px] font-vintage uppercase tracking-widest text-amber-300 flex items-center justify-center gap-1.5">
                  <span>🏆</span> 10 Retos • Puntuación Progresiva • Elenco en Vivo
                </span>
              </div>
            </div>

            {/* LISTA COMPLETA DE LOS 10 JUEGOS EN ORDEN CON ESTILO BROADWAY */}
            <div className="col-span-7 bg-[#0c0c14]/90 border-2 border-[#d4af37]/40 rounded-3xl p-5 flex flex-col backdrop-blur-xl shadow-2xl justify-between">
              <div className="mb-3">
                <h3 className="text-2xl font-broadway uppercase text-gold-gradient tracking-wider flex items-center gap-2">
                  <span>🔥</span> CARTELERA DE LA NOCHE
                </h3>
                <p className="text-xs font-vintage text-amber-100/70 mt-0.5">
                  Cada cuadrilla sumará puntos en cada contienda. ¡El podio final coronará al campeón de la noche!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 flex-1">
                {GAMES_CATALOG.slice(0, 10).map((g, idx) => (
                  <div
                    key={g.id}
                    className="p-2.5 rounded-2xl bg-[#14141e]/80 border border-[#d4af37]/25 hover:border-[#d4af37]/60 transition-all flex items-start gap-2.5 shadow-md"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8a6a1a] text-slate-950 font-broadway flex items-center justify-center text-sm font-black shrink-0 shadow-sm border border-[#f5eedb]/30">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{g.emoji}</span>
                        <h4 className="text-xs font-broadway tracking-wide text-white truncate">{g.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] uppercase font-vintage tracking-wider text-amber-300">
                          {g.category}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/60 border border-[#d4af37]/30 text-amber-200/90 font-vintage font-bold">
                          {g.engine === 'buzzer' ? '⚡ Pulsador de Latón' : '🎲 En Vivo'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {g.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-[#d4af37]/30 flex items-center justify-between text-xs text-amber-200/80">
                <span className="font-vintage tracking-wide flex items-center gap-1.5 text-amber-300 font-bold">
                  <span>👑</span> El Maestro de Ceremonias iniciará la velada en breve
                </span>
                <span className="text-[11px] bg-black/60 border border-[#d4af37]/30 px-3 py-1 rounded-full text-amber-200 font-vintage uppercase tracking-wider font-bold">
                  Puntuación en tiempo real
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* DIAPOSITIVA 1: SISTEMA DE CARTAS Y RAREZAS */}
        {currentSlide === 1 && (
          <motion.div
            key="slide-cards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col gap-4 flex-1"
          >
            {/* TRES REGLAS CLAVE */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#0c0c14]/90 border-2 border-[#d4af37]/35 backdrop-blur-xl text-center space-y-1 shadow-lg">
                <span className="text-2xl">🃏</span>
                <h4 className="text-sm font-broadway tracking-wider text-gold-gradient uppercase">1. Obtención de Naipes</h4>
                <p className="text-xs font-vintage text-amber-100/70">
                  Se reparten al inicio y como recompensas de bonus por ganar o deslumbrar en cada prueba.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#0c0c14]/90 border-2 border-[#d4af37]/35 backdrop-blur-xl text-center space-y-1 shadow-lg">
                <span className="text-2xl">📲</span>
                <h4 className="text-sm font-broadway tracking-wider text-gold-gradient uppercase">2. Uso en la Partida</h4>
                <p className="text-xs font-vintage text-amber-100/70">
                  Los equipos las juegan desde la pantalla de su móvil. Sus efectos se proyectan al instante en la TV.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#0c0c14]/90 border-2 border-[#d4af37]/35 backdrop-blur-xl text-center space-y-1 shadow-lg">
                <span className="text-2xl">⏱️</span>
                <h4 className="text-sm font-broadway tracking-wider text-gold-gradient uppercase">3. Expiración de Efectos</h4>
                <p className="text-xs font-vintage text-amber-100/70">
                  Duran durante la ronda o prueba activa. Al finalizar el minijuego, se descartan solas.
                </p>
              </div>
            </div>

            {/* LAS 4 RAREZAS CON EJEMPLOS REALES */}
            <div className="grid grid-cols-4 gap-4 flex-1">
              {[
                {
                  rarity: 'Común',
                  colorText: 'text-emerald-400',
                  colorBorder: 'border-emerald-500/50',
                  colorBg: 'from-emerald-950/40 to-slate-950',
                  glow: '#10b981',
                  icon: '🟢',
                  sampleCardId: 'bomba',
                  badge: 'Efectos Básicos',
                  desc: 'Baneos de turno, bombas trampa, pérdidas rápidas y marcas de objetivo.',
                },
                {
                  rarity: 'Rara',
                  colorText: 'text-blue-400',
                  colorBorder: 'border-blue-500/50',
                  colorBg: 'from-blue-950/40 to-slate-950',
                  glow: '#3b82f6',
                  icon: '🔵',
                  sampleCardId: 'banco_cartas',
                  badge: 'Impacto Táctico',
                  desc: 'Banco de cartas del mazo, intercambio de manos, escudo e inmunidad.',
                },
                {
                  rarity: 'Épica',
                  colorText: 'text-purple-400',
                  colorBorder: 'border-purple-500/50',
                  colorBg: 'from-purple-950/40 to-slate-950',
                  glow: '#a855f7',
                  icon: '🟣',
                  sampleCardId: 'caza_lider',
                  badge: 'Poder Avanzado',
                  desc: 'Multiplicador doble de puntos, caza implacable al líder y ruleta rusa.',
                },
                {
                  rarity: 'Legendaria',
                  colorText: 'text-amber-300',
                  colorBorder: 'border-[#d4af37]',
                  colorBg: 'from-amber-950/40 to-slate-950',
                  glow: '#d4af37',
                  icon: '🟡',
                  sampleCardId: 'el_cuarto_mono',
                  badge: 'Giro Legendario',
                  desc: 'Limitaciones sensoriales (el mono), el titiritero cómico, robo del siglo y golpe maestro.',
                },
              ].map((r) => {
                const sampleCard =
                  POWER_CARDS_CATALOG.find((c: PowerCard) => c.id === r.sampleCardId) || POWER_CARDS_CATALOG[0];
                return (
                  <div
                    key={r.rarity}
                    className={`p-4 rounded-3xl bg-gradient-to-b ${r.colorBg} border-2 ${r.colorBorder} flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden`}
                  >
                    <div
                      className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-30 blur-2xl pointer-events-none"
                      style={{ backgroundColor: r.glow }}
                    />
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{r.icon}</span>
                        <span
                          className={`text-[10px] font-vintage uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-current ${r.colorText}`}
                        >
                          {r.badge}
                        </span>
                      </div>
                      <h4 className={`text-xl font-broadway uppercase tracking-wider ${r.colorText}`}>
                        {r.rarity}
                      </h4>
                      <p className="text-[11px] font-vintage text-slate-300 mt-1 mb-3">{r.desc}</p>
                    </div>

                    <div
                      onClick={() => setSelectedPresentationCard(sampleCard)}
                      className="my-1.5 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 flex flex-col items-center group/card"
                      title="Pulsa para ver la carta ampliada en alta resolución"
                    >
                      <PowerCardView card={sampleCard} size="md" priority={true} />
                      <span className="text-[10px] text-amber-300/80 group-hover/card:text-amber-200 uppercase font-vintage tracking-wider mt-1.5 flex items-center gap-1">
                        <span>🔍</span> Ampliar detalle
                      </span>
                    </div>

                    <span className="text-[11px] text-amber-200/90 font-broadway uppercase tracking-wider">
                      Ejemplo: {sampleCard.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* MODAL SPOTLIGHT CINEMATOGRÁFICO DE ALTA RESOLUCIÓN */}
        {selectedPresentationCard && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
            onClick={() => setSelectedPresentationCard(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="relative max-w-md w-full bg-[#0c0c14] border-3 border-[#d4af37] rounded-3xl p-6 shadow-[0_0_80px_rgba(212,175,55,0.4)] flex flex-col items-center text-center deco-card-frame"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedPresentationCard(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/80 border border-[#d4af37]/60 text-amber-200 hover:text-white flex items-center justify-center text-sm font-bold active:scale-90 shadow-lg"
              >
                ✕
              </button>

              <div className="mb-3">
                <span className="text-xs uppercase font-vintage tracking-widest text-amber-300 block">
                  CARTA DE PODER · RAREZA {selectedPresentationCard.rarity.toUpperCase()}
                </span>
                <h3 className="text-2xl font-broadway uppercase tracking-wider text-gold-gradient mt-0.5">
                  {selectedPresentationCard.name}
                </h3>
              </div>

              <div className="my-2 drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
                <PowerCardView card={selectedPresentationCard} size="lg" priority={true} />
              </div>

              <div className="mt-4 p-3.5 rounded-2xl bg-black/70 border border-[#d4af37]/40 w-full">
                <span className="text-[11px] uppercase font-vintage text-amber-300 tracking-wider font-bold block mb-1">
                  Regla y Efecto de Casino:
                </span>
                <p className="text-sm font-editorial text-amber-100/90 leading-relaxed">
                  {selectedPresentationCard.description}
                </p>
                <span className="inline-block mt-2 text-[10px] text-amber-400/80 font-vintage uppercase tracking-widest">
                  ⏱️ Momento de juego: {selectedPresentationCard.timing}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </section>
    );
  };

  return (
    <main className="min-h-screen w-full bg-slate-950 text-white font-sans overflow-hidden flex flex-col justify-between p-6 select-none relative">
      {/* Reproductor de Audio HTML5 persistente en la TV para todas las pantallas y fases */}
      <audio
        ref={musicAudioRef}
        src={currentSong?.previewUrl || ''}
        preload="auto"
        onEnded={() => {
          setMusicPlaying(false);
          roomSync.broadcast({
            type: 'MUSIC_STATE_UPDATE',
            payload: {
              trackIndex: 0,
              isPlaying: false,
              isRevealed: musicRevealedRef.current,
              trackData: currentSongRef.current || undefined,
            },
          });
        }}
        onError={(e) => {
          console.warn('Error al reproducir audio preview en TV:', e);
          setMusicPlaying(false);
          roomSync.broadcast({
            type: 'MUSIC_STATE_UPDATE',
            payload: {
              trackIndex: 0,
              isPlaying: false,
              isRevealed: musicRevealedRef.current,
              trackData: currentSongRef.current || undefined,
            },
          });
        }}
        onPause={() => {
          if (musicPlayingRef.current) {
            setMusicPlaying(false);
            roomSync.broadcast({
              type: 'MUSIC_STATE_UPDATE',
              payload: {
                trackIndex: 0,
                isPlaying: false,
                isRevealed: musicRevealedRef.current,
                trackData: currentSongRef.current || undefined,
              },
            });
          }
        }}
      />

      {/* Aviso flotante si el navegador bloquea el autoplay en la TV */}
      {autoplayBlocked && (
        <div
          onClick={() => {
            if (musicAudioRef.current) {
              musicAudioRef.current.play().then(() => setAutoplayBlocked(false)).catch(() => {});
            }
          }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-sm shadow-2xl flex items-center gap-3 cursor-pointer animate-bounce border-2 border-amber-300 backdrop-blur-md"
        >
          <Volume2 className="w-5 h-5 animate-pulse" />
          <span>🔊 Haz clic aquí para activar el sonido de la TV</span>
        </div>
      )}

      {/* FONDO 3D ART DÉCO 1930s (THREE.JS) DURANTE LA CLAUSURA / PODIO */}
      {(room.status === 'podium' || room.status === 'ended') ? (
        <ThreeArtDecoPodiumStage
          winnerColorHex={winningTeamCatalog?.colorHex || '#d4af37'}
          className="fixed inset-0 pointer-events-none z-0"
        />
      ) : (
        /* FONDO RETRO-GRID DINÁMICO ACELERADO POR GPU EN PARTIDAS REGULARES Y LOBBY */
        <RetroGridBackground activeTeamColor={winningTeamCatalog?.colorHex} />
      )}

      {/* LLUVIA DE MONEDAS Y FICHAS DORADAS EN CELEBRACIONES */}
      <CoinBurstCelebration active={showTvCoinBurst} onComplete={() => setShowTvCoinBurst(false)} />

      {/* FLASH NEÓN PERIMETRAL A PANTALLA COMPLETA CUANDO SUENA EL BUZZER */}
      <AnimatePresence>
        {buzzerLocked && winningTeamCatalog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 border-[16px] animate-pulse"
            style={{
              borderColor: winningTeamCatalog.colorHex,
              boxShadow: `inset 0 0 100px ${winningTeamCatalog.colorHex}, 0 0 100px ${winningTeamCatalog.colorHex}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* HEADER TV / PROYECTOR ART DÉCO 1930s (ADAPTABLE Y ULTRA-COMPACTO EN PODIO) */}
      <header className={`flex items-center justify-between border-b border-[#d4af37]/30 z-20 ${
        room.status === 'podium' || room.status === 'ended' ? 'pb-2 mb-1' : 'pb-4 mb-2'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`bg-gradient-to-br from-[#d4af37] via-[#b38f2a] to-[#8a6a1a] rounded-2xl shadow-lg shadow-amber-900/40 border border-[#f5eedb]/30 ${
            room.status === 'podium' || room.status === 'ended' ? 'p-2' : 'p-3'
          }`}>
            <GameIcon name="Tv" size={room.status === 'podium' || room.status === 'ended' ? 22 : 32} color="#FFFFFF" glow={true} weight="fill" />
          </div>
          <div>
            <h1 className={`font-broadway uppercase tracking-wider text-gold-gradient drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)] leading-tight ${
              room.status === 'podium' || room.status === 'ended' ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
            }`}>
              {room.title || 'GAME SHOW ARENA'}
            </h1>
            <p className="text-amber-100/70 text-xs sm:text-sm font-vintage tracking-wider flex items-center gap-1.5 mt-0.5">
              <GameIcon name="Sparkle" size={14} color="#d4af37" glow="#d4af37" weight="fill" />
              {room.status === 'lobby' ? (
                <span>LOBBY DE CONVOCATORIA • ESPERANDO JUGADORES</span>
              ) : room.status === 'presentation' ? (
                <span className="text-gold-gradient font-bold flex items-center gap-1.5">
                  <span>✨</span>
                  <span>PRESENTACIÓN OFICIAL DE LA VELADA</span>
                </span>
              ) : room.status === 'podium' || room.status === 'ended' ? (
                <span className="text-gold-gradient font-bold flex items-center gap-1.5 font-broadway">
                  <span>🏆</span>
                  <span>CEREMONIA DE CLAUSURA • THE SPEAKEASY GAZETTE</span>
                </span>
              ) : (
                <span className="text-white font-bold flex items-center gap-1.5 font-broadway">
                  <TwemojiText className="text-base">{activeGame.emoji}</TwemojiText>
                  <span className="uppercase tracking-wider">{activeGame.title}</span>
                  <span className="text-xs text-amber-300/80 font-vintage font-normal">({activeGame.category})</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* CABECERA DE LA TV CON JUKEBOX, MODO CINE Y PLACA DE SALA */}
        <div className="flex items-center gap-3">
          {/* INDICADOR VISUAL ART DÉCO DEL HILO MUSICAL SPEAKEASY (PASIVO) */}
          <SpeakeasyJukeboxWidget
            variant="tv"
            externalState={jukeboxState}
          />

          {/* MINI QR EN LA ESQUINA DURANTE LAS PRUEBAS/SHOW */}
          {room.status !== 'lobby' && joinUrl && (
            <div className="flex items-center gap-2.5 bg-[#0c0c14]/95 border-2 border-[#d4af37]/40 rounded-2xl px-3 py-1.5 shadow-xl backdrop-blur-md">
              <div className="p-1 bg-white rounded-lg shadow-sm">
                <QRCodeSVG value={joinUrl} size={42} level="L" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[9px] uppercase font-broadway text-amber-300 tracking-wider block">
                  ¿Reconectar?
                </span>
                <span className="text-[11px] font-vintage text-slate-200 block">
                  Escanea el QR
                </span>
              </div>
            </div>
          )}

          {/* PLACA DE LATÓN DE CÓDIGO DE SALA */}
          <div className="flex items-center gap-4 bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-2xl px-5 py-2 shadow-deco-gold backdrop-blur-md relative overflow-hidden">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-amber-200/70 block font-vintage font-bold">SALA</span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 justify-end font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> EN VIVO
              </span>
            </div>
            <div className="text-4xl font-broadway tracking-widest text-gold-gradient drop-shadow-[0_0_12px_rgba(212,175,55,0.6)]">
              {roomCode}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      {room.status === 'lobby' ? (
        /* ================= VISTA LOBBY ================= */
        <section className="flex-1 grid grid-cols-12 gap-6 my-6 z-10">
          {/* PANEL QR LATERAL CON MARCO ART DÉCO */}
          <div className="col-span-3 bg-[#0c0c14]/90 border-2 border-[#d4af37]/45 rounded-3xl p-6 flex flex-col items-center justify-between backdrop-blur-xl shadow-deco-gold deco-card-frame">
            <div className="text-center w-full">
              <h2 className="text-lg font-broadway uppercase tracking-wider text-gold-gradient">Pase de Espectador</h2>
              <p className="text-xs font-vintage text-amber-100/70 mt-0.5">Escanea con tu cámara móvil para ingresar</p>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.25)] border-4 border-[#d4af37]/30 my-2">
              {joinUrl ? (
                <QRCodeSVG value={joinUrl} size={170} level="H" />
              ) : (
                <div className="w-[170px] h-[170px] bg-slate-800 animate-pulse rounded-lg" />
              )}
            </div>

            {/* CONTADOR DE JUGADORES */}
            <div className="w-full bg-[#14141e]/90 rounded-2xl p-3.5 border border-[#d4af37]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GameIcon name="Users" size={22} color="#d4af37" glow="#d4af37" weight="fill" />
                <div>
                  <span className="text-[10px] text-amber-200/70 block uppercase font-vintage font-bold">Jugadores</span>
                  <span className="text-base font-broadway text-white">{players.length} conectados</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-200/70 block uppercase font-vintage font-bold">Equipos</span>
                <span className="text-base font-broadway text-gold-gradient">{activeTeams.length} / {TEAMS_CATALOG.length}</span>
              </div>
            </div>

            {/* JUGADORES ENTRADOS QUE ESTÁN ELIGIENDO BANDO */}
            {unassignedPlayers.length > 0 && (
              <div className="w-full bg-amber-500/10 border-2 border-amber-400/40 rounded-2xl p-3 my-2 text-left animate-pulse">
                <span className="text-[10px] uppercase font-vintage font-bold text-amber-300 block mb-1.5 flex items-center gap-1">
                  <GameIcon name="Lightning" size={14} color="#d4af37" weight="fill" glow="#d4af37" />
                  <span>Recién llegados ({unassignedPlayers.length}):</span>
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {unassignedPlayers.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#0c0c14]/95 border border-[#d4af37]/40 px-2 py-1 rounded-xl text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-sm"
                    >
                      <div className="w-4 h-4 rounded-md bg-slate-950 overflow-hidden shrink-0">
                        <img
                          src={generateAvatarDataUri(p.avatar_seed || p.nickname, (p.avatar_style as any) || 'avataaars')}
                          alt={p.nickname}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {p.badge_emoji && <TwemojiText className="text-[10px]">{p.badge_emoji}</TwemojiText>}
                      <span className="font-vintage">{p.nickname}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNAS DE EQUIPOS DINÁMICAS (2 A 6) */}
          <div
            className="col-span-9 grid gap-4 h-full"
            style={{ gridTemplateColumns: `repeat(${activeTeams.length}, minmax(0, 1fr))` }}
          >
            {(() => {
              const maxLobbyScore = Math.max(...activeTeams.map((t) => t.score || 0), 0);
              return activeTeams.map((team) => {
                const theme = getTeamTheme(team.team_index);
                const teamMembers = players.filter(
                  (p) =>
                    (p.team_index !== undefined && p.team_index !== null && p.team_index === team.team_index) ||
                    p.team_id === team.id ||
                    p.team_id === `team_${team.team_index}`
                );
                const hand = powerCards?.teamHands[team.id] || [];

                return (
                  <TeamScoreCard
                    key={team.id}
                    team={team}
                    theme={theme}
                    members={teamMembers}
                    powerCardsCount={hand.length}
                    variant="lobby"
                    maxRoomScore={maxLobbyScore}
                  />
                );
              });
            })()}
          </div>
        </section>
      ) : room.status === 'presentation' ? (
        /* ================= VISTA PRESENTACIÓN DEL SHOW ================= */
        renderPresentationView()
      ) : room.status === 'podium' || room.status === 'ended' ? (
        /* ================= VISTA CLAUSURA / THE SPEAKEASY GAZETTE ================= */
        <SpeakeasyGazettePodium
          teams={teams}
          players={players}
          powerCards={powerCards}
          activePage={podiumPage}
          onPageChange={setPodiumPage}
          isHost={false}
          onReturnToLobby={() => {
            const updated: Room = { ...room, status: 'lobby' };
            setRoom(updated);
            roomSync.broadcast({ type: 'ROOM_UPDATE', payload: { status: 'lobby' } });
            roomSync.broadcast({ type: 'RETURN_TO_LOBBY' });
          }}
        />
      ) : (
        /* ================= VISTA ESCENARIO DE JUEGO ================= */
        <section className="flex-1 flex flex-col justify-center items-center my-4 z-10 w-full max-w-6xl mx-auto">
          {/* MARQUESINA DE TEATRO SUPERIOR CON REGLAS Y PUNTUACIONES */}
          <div className="mb-5 flex flex-col md:flex-row items-center justify-between bg-[#0c0c14]/90 border-2 border-[#d4af37]/45 px-6 py-3.5 rounded-2xl w-full max-w-4xl gap-3 shadow-deco-gold backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeGame.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-vintage tracking-widest text-amber-300 block">
                    {activeGame.category}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold font-vintage shadow-sm">
                    {activeGame.participantsLabel}
                  </span>
                </div>
                <h3 className="text-xl font-broadway uppercase tracking-wide text-gold-gradient">{activeGame.title}</h3>
                <p className="text-xs text-slate-300 font-vintage italic mt-0.5">{activeGame.participantsDescription}</p>
              </div>
            </div>

            {/* Puntuaciones de este juego proyectadas en TV */}
            <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-end">
              {activeGame.scoringOptions.map((opt) => (
                <span
                  key={opt.id}
                  className="bg-[#14141e]/90 text-amber-100 text-[11px] font-vintage font-bold px-3 py-1 rounded-xl border border-[#d4af37]/30 flex items-center gap-1.5 shadow-sm"
                >
                  <span>{opt.label}</span>
                  <span className="text-amber-300 font-broadway font-black">{opt.badge}</span>
                </span>
              ))}
            </div>
          </div>

          {/* BANNER MINIDUELO DE CAPITANES (SI ESTÁ ACTIVO) */}
          {captainDuel?.isActive && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 w-full max-w-4xl bg-gradient-to-r from-[#4a0e17] via-[#8a1c2a] to-[#4a0e17] border-2 border-[#d4af37] rounded-2xl px-6 py-3.5 text-center shadow-deco-gold flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-amber-300 animate-bounce shrink-0 drop-shadow-md" />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-vintage tracking-widest text-amber-200 block">
                    ⚔️ DESAFÍO DIRECTO ENTRE LÍDERES
                  </span>
                  <h4 className="text-xl font-broadway text-gold-gradient uppercase tracking-wider drop-shadow-sm">
                    {captainDuel.title || 'MINIDUELO DE CAPITANES'}
                  </h4>
                </div>
              </div>
              <div className="bg-[#0c0c14]/90 border border-[#d4af37]/40 rounded-xl px-4 py-2 text-right">
                <span className="text-[10px] text-amber-300 uppercase font-vintage tracking-wider font-black block">REGLA EXCLUSIVA</span>
                <span className="text-xs text-white font-vintage font-bold">Solo pueden pulsar los Capitanes 👑</span>
              </div>
            </motion.div>
          )}

          {/* BANNER APUESTAS DOBLE O NADA DE CAPITANES */}
          {Object.values(captainGambles).length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 max-w-4xl">
              {Object.values(captainGambles).map((gamble) => (
                <div
                  key={gamble.teamId}
                  className="bg-[#14141e]/90 border-2 border-[#d4af37] text-amber-200 px-4 py-1.5 rounded-2xl text-xs font-vintage font-black flex items-center gap-2 shadow-deco-gold backdrop-blur-md animate-pulse"
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>
                    ¡Capitán de <strong className="text-white uppercase font-broadway">{gamble.teamName}</strong> arriesga: DOBLE O NADA (x2 PUNTOS)!
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TIRA DE EFECTOS DE CARTAS DE PODER ACTIVOS */}
          {powerCards && powerCards.activeEffects.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 max-w-4xl">
              <span className="text-[10px] uppercase font-vintage tracking-wider text-slate-950 bg-gold-gradient px-3 py-1 rounded-full border border-[#f5eedb]/40 flex items-center gap-1 shadow-sm font-black">
                <Zap className="w-3 h-3" /> Poderes en Juego:
              </span>
              {powerCards.activeEffects.map((eff) => {
                const team = activeTeams.find((t) => t.id === eff.sourceTeamId);
                const targetTeam = eff.targetTeamId ? activeTeams.find((t) => t.id === eff.targetTeamId) : null;
                return (
                  <span
                    key={eff.id}
                    className="bg-[#0c0c14]/95 border border-[#d4af37]/45 text-xs px-3 py-1 rounded-xl text-amber-100 font-vintage font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md"
                  >
                    <span>{eff.cardEmoji}</span>
                    <strong className="text-white font-broadway">{eff.cardName}</strong>
                    <span className="text-amber-300/70">({team?.name || eff.sourceTeamName})</span>
                    {targetTeam && <span className="text-red-400 font-extrabold">➔ {targetTeam.name}</span>}
                    {eff.targetPlayerName && <span className="text-red-400 font-extrabold">➔ {eff.targetPlayerName}</span>}
                    {eff.sensoryLimitation && (
                      <span className="text-amber-300 font-extrabold bg-[#1a1405] border border-[#d4af37]/60 px-2 py-0.5 rounded-lg text-[11px] shadow-sm">
                        {eff.sensoryLimitation}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          {/* MOTOR A: PULSADOR RÁPIDO (Adivina la Canción & Trivial & Adivina la Película) */}
          {activeGame.engine === 'buzzer' && (
            <div className="w-full text-center">
              {/* VISTA ESPECIAL CINEMATOGRÁFICA PARA ADIVINA LA PELÍCULA CON EMOJIS */}
              {activeGame.id === 'movies' ? (
                <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                  {/* ESCENARIO DE ADIVINANZA CON EMOJIS (MARCO TEATRAL SILENT FILM) */}
                  <div className="relative w-full rounded-3xl overflow-hidden border-4 border-[#d4af37]/60 shadow-deco-gold bg-gradient-to-b from-[#0c0c14] via-[#090910] to-black p-6 md:p-10 text-center deco-card-frame">
                    {/* Viñeta e iluminación decorativa */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/15 blur-[90px] pointer-events-none" />

                    {/* Cabecera del misterio: Género, Año y Nivel de Pista */}
                    <div className="flex items-center justify-between mb-8 z-20 relative">
                      <div className="bg-[#0c0c14]/90 backdrop-blur-md border border-[#d4af37]/50 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-vintage font-bold text-amber-300 shadow-lg">
                        <Clapperboard className="w-4 h-4 text-amber-400" />
                        <span>{currentMovie.genreEmoji} {currentMovie.category}</span>
                        <span className="text-[#d4af37]/40">•</span>
                        <span className="text-white font-broadway">Año {currentMovie.year}</span>
                      </div>

                      <div className="bg-[#0c0c14]/90 backdrop-blur-md border border-[#d4af37]/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-vintage font-bold text-amber-200 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span className="font-vintage">
                          {movieFrameLevel === 1 && '🎯 Pista 1: 2 Emojis (+3 pts)'}
                          {movieFrameLevel === 2 && '🔍 Pista 2: 4 Emojis (+2 pts)'}
                          {movieFrameLevel === 3 && '⭐ Pista 3: Todos los Emojis (+1 pt)'}
                          {movieFrameLevel >= 4 && '💡 Pista 4: + Pista de Texto (+1 pt)'}
                        </span>
                      </div>
                    </div>

                    {/* CONTENEDOR CENTRAL DE EMOJIS GIGANTES */}
                    <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 py-8 px-4 my-2 bg-black/60 border-2 border-[#d4af37]/30 rounded-3xl shadow-inner backdrop-blur-md min-h-[160px]">
                      {(movieFrameLevel === 1
                        ? currentMovie.emojisStage1
                        : movieFrameLevel === 2
                        ? currentMovie.emojisStage2
                        : currentMovie.emojisFull
                      ).map((em, idx) => (
                        <motion.span
                          key={`${currentMovie.id}_${movieFrameLevel}_${idx}_${em}`}
                          initial={{ scale: 0, y: 30 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: idx * 0.08, type: 'spring', stiffness: 280 }}
                          className="text-6xl sm:text-7xl md:text-8xl select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] hover:scale-110 transition-transform"
                        >
                          {em}
                        </motion.span>
                      ))}
                    </div>

                    {/* PISTA ADICIONAL DE TEXTO (SI SE ACTIVA NIVEL 4) */}
                    {movieFrameLevel >= 4 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5 bg-amber-500/10 border border-[#d4af37]/40 rounded-2xl px-5 py-3 text-amber-200 text-xs md:text-sm font-vintage max-w-2xl mx-auto shadow-md"
                      >
                        <span className="font-broadway uppercase tracking-wider text-gold-gradient mr-2">Pista Secreta:</span>
                        "{currentMovie.textHint}"
                      </motion.div>
                    )}

                    {/* OVERLAY: REVELADO FINAL DEL TÍTULO DE LA PELÍCULA CON EXPLICACIÓN */}
                    <AnimatePresence>
                      {movieRevealed && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-[#07070a]/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-6 text-center deco-card-frame"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-widest mb-3 border border-[#f5eedb]/50 shadow-deco-gold">
                            🎉 ¡PELÍCULA RESUELTA!
                          </div>
                          <h2 className="text-4xl md:text-6xl font-broadway uppercase text-gold-gradient drop-shadow-[0_0_35px_rgba(212,175,55,0.6)]">
                            {currentMovie.title}
                          </h2>
                          {currentMovie.originalTitle && currentMovie.originalTitle !== currentMovie.title && (
                            <p className="text-base text-amber-200/70 mt-1 italic font-editorial">
                              "{currentMovie.originalTitle}"
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-4 text-xs md:text-sm text-amber-100 font-vintage">
                            <span className="bg-[#14141e] px-3 py-1 rounded-xl border border-[#d4af37]/30 font-bold">
                              Año {currentMovie.year}
                            </span>
                            {currentMovie.director && (
                              <span className="bg-[#14141e] px-3 py-1 rounded-xl border border-[#d4af37]/30 font-medium">
                                Dir: <strong className="text-white font-broadway">{currentMovie.director}</strong>
                              </span>
                            )}
                            <span className="bg-gold-gradient text-slate-950 px-3 py-1 rounded-xl border border-[#f5eedb]/30 font-broadway font-black">
                              {currentMovie.category}
                            </span>
                          </div>

                          {/* Explicación de los emojis */}
                          <div className="mt-6 bg-[#0c0c14]/90 border border-[#d4af37]/40 px-5 py-3 rounded-2xl max-w-xl text-xs md:text-sm text-amber-100/90 text-left font-vintage">
                            <span className="text-[10px] uppercase font-broadway text-gold-gradient block mb-1">
                              Descifrado del Acertijo:
                            </span>
                            {currentMovie.explanation}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : activeGame.id === 'fotos_proyector' ? (
                /* VISTA CINEMATOGRÁFICA DE FOTOS PROYECTOR (BEBÉS) */
                <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                  <div className="w-full bg-[#0c0c14]/90 border-2 border-[#d4af37]/50 rounded-3xl p-6 sm:p-8 shadow-deco-gold relative overflow-hidden backdrop-blur-xl deco-card-frame">
                    {/* Cabecera: Número de foto, categoría y regla anti-infracción */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 z-20 relative">
                      <div className="bg-[#07070a]/90 backdrop-blur-md border border-[#d4af37]/50 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-vintage font-bold text-amber-300 shadow-lg">
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span className="font-broadway uppercase">FOTO {babyPhotoIndex + 1} DE {DEV_MOCK_BABY_PHOTOS.length}</span>
                        <span className="text-[#d4af37]/40">•</span>
                        <span className="text-amber-100/80 font-medium">¿Famoso o Concursante? 🕵️</span>
                      </div>

                      <div className="bg-[#380b12]/90 border border-red-500/50 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-vintage font-bold text-red-200 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                        <span>🚫 ¡Si es tu propia foto NO pulses! (−2 pts)</span>
                      </div>
                    </div>

                    {/* MARCO DE LA FOTO PROYECTADA (ESTILO DAGUERROTIPO / RETRATO DE ÉPOCA) */}
                    <div className="relative flex items-center justify-center min-h-[300px] max-h-[420px] rounded-2xl overflow-hidden bg-black border-4 border-[#d4af37]/40 shadow-inner p-3">
                      <motion.img
                        key={`${currentBabyPhoto.id}_${babyPhotoIndex}`}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35 }}
                        src={currentBabyPhoto.imageUrl}
                        alt="Foto de Bebé"
                        className="max-h-[350px] md:max-h-[390px] w-auto max-w-full object-contain rounded-xl shadow-2xl sepia-[0.15]"
                      />

                      {/* Luz sutil de linterna mágica / proyector de época */}
                      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-400/15 blur-3xl pointer-events-none" />
                    </div>

                    {/* OVERLAY: REVELADO DE IDENTIDAD */}
                    <AnimatePresence>
                      {babyPhotoRevealed && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-[#07070a]/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-6 text-center deco-card-frame"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-widest mb-3 border border-[#f5eedb]/50 shadow-deco-gold">
                            🎉 ¡IDENTIDAD REVELADA!
                          </div>
                          <h2 className="text-4xl md:text-6xl font-broadway uppercase text-gold-gradient drop-shadow-[0_0_35px_rgba(212,175,55,0.6)]">
                            {currentBabyPhoto.personName}
                          </h2>
                          {currentBabyPhoto.ownerPlayerName ? (
                            <div className="mt-3 inline-block bg-[#380b12]/90 border border-red-500/50 px-4 py-1.5 rounded-xl text-xs font-vintage font-bold text-red-200">
                              👤 ¡Foto de <strong className="text-white font-broadway">{currentBabyPhoto.ownerPlayerName}</strong>! (¡No podía pulsar!)
                            </div>
                          ) : null}
                          {currentBabyPhoto.hint && (
                            <p className="mt-4 text-xs md:text-sm text-amber-100/80 italic max-w-md bg-[#0c0c14] px-4 py-2 rounded-xl border border-[#d4af37]/30 font-vintage">
                              💡 Pista: "{currentBabyPhoto.hint}"
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* OVERLAY DEL BUZZER CUANDO ALGUIEN PULSA */}
                  <AnimatePresence>
                    {buzzerLocked && buzzerWinner && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="mt-4 w-full bg-slate-900/95 border-2 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3"
                        style={{ borderColor: buzzerWinner.teamColorHex }}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-md"
                            style={{ backgroundColor: buzzerWinner.teamColorHex }}
                          >
                            ⚡
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                              ¡HA PULSADO PRIMERO!
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-lg font-black text-white">
                                {buzzerWinner.playerName}{' '}
                                <span style={{ color: buzzerWinner.teamColorHex }}>({buzzerWinner.teamName})</span>
                              </span>
                              {isWinnerCaptain && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400 text-amber-300 text-xs font-black">
                                  <Crown className="w-3 h-3 fill-amber-400 text-amber-400" /> CAPITÁN
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Indicador pasivo en TV */}
                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          <span>Esperando veredicto del Anfitrión en su mando...</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : activeGame.id === 'music' ? (
                /* ESCENARIO ESPECIAL ADIVINA LA CANCIÓN */
                currentSong ? (
                  <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                  <div className="w-full bg-slate-900/90 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    {/* Glows ambientales */}
                    <div className="absolute -top-24 left-1/4 w-96 h-48 bg-pink-500/20 blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-cyan-500/20 blur-[100px] pointer-events-none" />

                    {/* Cabecera: Categoría, Ronda y Estado de Audio */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 z-20 relative">
                      <div className="bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black text-emerald-300 shadow-lg">
                        <Disc className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
                        <span>ADIVINA EL TEMAZO</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-white/90 font-bold">Spotify</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {musicPlaying && !buzzerLocked ? (
                          <div className="bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-300 shadow-lg">
                            <Volume2 className="w-4 h-4 animate-pulse text-emerald-400" />
                            <span>SONANDO PREVIEW (30s)</span>
                          </div>
                        ) : (
                          <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-300 shadow-lg">
                            <VolumeX className="w-4 h-4 text-slate-400" />
                            <span>EN PAUSA</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ESCENARIO DEL DISCO DE VINILO Y CARÁTULA MISTERIOSA */}
                    <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 py-6 px-4 my-2 bg-slate-950/70 border-2 border-slate-800/80 rounded-3xl shadow-inner backdrop-blur-md min-h-[320px]">
                      
                      {/* DISCO DE VINILO 3D GIRATORIO */}
                      <div className="relative shrink-0">
                        <motion.div
                          animate={{
                            rotate: musicPlaying && !buzzerLocked ? 360 : 0,
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2.5,
                            ease: 'linear',
                          }}
                          className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-[#0a0a0c] via-[#1a1a20] to-[#0d0d10] border-4 border-[#d4af37]/60 shadow-[0_0_35px_rgba(212,175,55,0.25)] relative flex items-center justify-center"
                        >
                          {/* Ranuras concéntricas de disco de pizarra 78 RPM */}
                          <div className="absolute inset-2 rounded-full border border-[#d4af37]/20" />
                          <div className="absolute inset-5 rounded-full border border-[#d4af37]/35" />
                          <div className="absolute inset-9 rounded-full border border-[#d4af37]/20" />
                          <div className="absolute inset-14 rounded-full border border-[#d4af37]/30" />

                          {/* Reflejo de luz en el disco */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-amber-200/5 to-transparent pointer-events-none" />

                          {/* Galleta central dorada estilo gramófono 1930s */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#d4af37] via-[#b38f2a] to-[#8a6a1a] border-2 border-[#f5eedb] flex items-center justify-center shadow-lg relative overflow-hidden">
                            {musicRevealed && (currentSong.coverUrl || currentSong.albumArt) ? (
                              <img
                                src={currentSong.coverUrl || currentSong.albumArt}
                                alt={currentSong.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Music className="w-7 h-7 text-slate-950 drop-shadow" />
                            )}
                            {/* Agujero central de bronce */}
                            <div className="absolute w-4 h-4 rounded-full bg-[#0a0a0e] border border-[#f5eedb]/40" />
                          </div>
                        </motion.div>
                      </div>

                      {/* CARÁTULA MISTERIOSA O REVELADA */}
                      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-md">
                        <AnimatePresence mode="wait">
                          {!musicRevealed ? (
                            <motion.div
                              key="hidden-music"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="w-full"
                            >
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-gradient text-slate-950 text-xs font-vintage font-bold uppercase tracking-wider mb-2 border border-[#f5eedb]/40 shadow-sm">
                                🎧 GRAMÓFONO EN VIVO
                              </div>
                              <h3 className="text-2xl sm:text-3xl font-broadway uppercase text-gold-gradient tracking-wide">
                                ¿QUÉ CANCIÓN ES?
                              </h3>
                              <p className="text-amber-100/70 text-xs sm:text-sm font-vintage mt-1">
                                ¡El primer concursante en presionar el pulsador responderá con el Título, Artista o Ambos!
                              </p>

                              {/* BARRAS DE ECUALIZADOR DINÁMICAS EN TONOS DE LATÓN */}
                              <div className="flex items-end justify-center md:justify-start gap-1.5 h-12 mt-5">
                                {[35, 60, 20, 85, 45, 95, 30, 75, 50, 90, 40, 65].map((height, i) => (
                                  <motion.div
                                    key={i}
                                    animate={{
                                      height:
                                        musicPlaying && !buzzerLocked
                                          ? [`${(height % 30) + 15}%`, `${height}%`, `${(height % 40) + 20}%`]
                                          : '12%',
                                    }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 0.4 + (i % 4) * 0.1,
                                      ease: 'easeInOut',
                                    }}
                                    className="w-2 sm:w-2.5 rounded-full bg-gradient-to-t from-[#8a6a1a] via-[#d4af37] to-[#f5eedb] shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                                  />
                                ))}
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="revealed-music"
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="w-full flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 border border-pink-500/40 p-4 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                            >
                              {(currentSong.coverUrl || currentSong.albumArt) && (
                                <img
                                  src={currentSong.coverUrl || currentSong.albumArt}
                                  alt={currentSong.title}
                                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shadow-2xl border-2 border-pink-400 shrink-0"
                                />
                              )}
                              <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-black uppercase tracking-wider mb-1 border border-pink-500/40">
                                  🎉 ¡CANCIÓN REVELADA!
                                </div>
                                <h4 className="text-xl sm:text-2xl font-black text-white drop-shadow leading-tight">
                                  {currentSong.title}
                                </h4>
                                <p className="text-base sm:text-lg font-bold text-amber-300 mt-0.5">
                                  {currentSong.artist}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                  {currentSong.year ? (
                                    <span className="bg-slate-800 px-2 py-0.5 rounded-md font-mono text-slate-300">
                                      Año {currentSong.year}
                                    </span>
                                  ) : null}
                                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                    🟢 Spotify Track
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* OVERLAY DEL BUZZER CUANDO ALGUIEN PULSA EN MODO MÚSICA */}
                    <AnimatePresence>
                      {buzzerLocked && buzzerWinner && (() => {
                        const winnerPlayer = players.find((p) => p.id === buzzerWinner.playerId || p.nickname === buzzerWinner.playerName);
                        const winnerSeed = buzzerWinner.avatarSeed || winnerPlayer?.avatar_seed || buzzerWinner.playerName;
                        const winnerStyle = (buzzerWinner.avatarStyle || winnerPlayer?.avatar_style || 'avataaars') as DiceBearStyle;
                        const winnerEmoji = buzzerWinner.badgeEmoji || winnerPlayer?.badge_emoji;

                        return (
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="mt-4 w-full bg-slate-900/95 border-2 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3"
                            style={{ borderColor: buzzerWinner.teamColorHex }}
                          >
                            <div className="flex items-center gap-3 text-left">
                              <div className="relative shrink-0">
                                <div
                                  className="w-14 h-14 rounded-2xl bg-slate-950 border-2 flex items-center justify-center overflow-hidden shadow-lg p-0.5"
                                  style={{ borderColor: buzzerWinner.teamColorHex }}
                                >
                                  <img
                                    src={generateAvatarDataUri(winnerSeed, winnerStyle)}
                                    alt={buzzerWinner.playerName}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                {winnerEmoji && (
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow">
                                    <TwemojiText className="text-xs">{winnerEmoji}</TwemojiText>
                                  </div>
                                )}
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                                  ¡HA PULSADO PRIMERO! (Música Pausada)
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-lg font-black text-white">
                                    {buzzerWinner.playerName}{' '}
                                    <span style={{ color: buzzerWinner.teamColorHex }}>({buzzerWinner.teamName})</span>
                                  </span>
                                  {isWinnerCaptain && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400 text-amber-300 text-xs font-black">
                                      <Crown className="w-3 h-3 fill-amber-400 text-amber-400" /> CAPITÁN
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Indicador pasivo en la TV sin botones */}
                            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs font-bold text-amber-300 w-full">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                              <span>Esperando veredicto del Anfitrión en su mando...</span>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                  <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
                    <div className="w-full bg-[#0c0c14]/95 border-2 border-[#d4af37]/50 rounded-3xl p-10 shadow-deco-gold relative overflow-hidden backdrop-blur-xl text-center deco-card-frame">
                      <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/10 border-2 border-[#d4af37]/60 flex items-center justify-center animate-pulse mb-5 shadow-[0_0_35px_rgba(212,175,55,0.25)]">
                        <Music className="w-12 h-12 text-[#d4af37]" />
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-wider mb-3 border border-[#f5eedb]/40 shadow-sm">
                        🎶 Fonógrafo & Gramófono Spotify
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-broadway text-gold-gradient tracking-wide">
                        ESPERANDO TEMAZO EN EL GRAMÓFONO...
                      </h2>
                      <p className="text-amber-200/80 font-vintage text-sm sm:text-base mt-2 max-w-md mx-auto">
                        El anfitrión está sintonizando pistas musicales en su consola de retransmisión.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                /* VISTA CLÁSICA PARA ADIVINA LA CANCIÓN Y TRIVIAL */
                <AnimatePresence mode="wait">
                  {buzzerLocked && buzzerWinner ? (() => {
                    const winnerPlayer = players.find((p) => p.id === buzzerWinner.playerId || p.nickname === buzzerWinner.playerName);
                    const winnerSeed = buzzerWinner.avatarSeed || winnerPlayer?.avatar_seed || buzzerWinner.playerName;
                    const winnerStyle = (buzzerWinner.avatarStyle || winnerPlayer?.avatar_style || 'avataaars') as DiceBearStyle;
                    const winnerEmoji = buzzerWinner.badgeEmoji || winnerPlayer?.badge_emoji;

                    return (
                      <motion.div
                        key="winner"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="p-8 md:p-10 rounded-3xl bg-[#0c0c14]/95 border-4 shadow-deco-gold max-w-2xl mx-auto backdrop-blur-2xl text-center deco-card-frame"
                        style={{ borderColor: buzzerWinner.teamColorHex }}
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-widest mb-4 border border-[#f5eedb]/50 shadow-md">
                          ⚡ ¡TURNO DE RESPUESTA!
                        </div>

                        {/* AVATAR GIGANTE DEL GANADOR EN PANTALLA DE TV */}
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <div
                              className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-[#07070a] border-4 p-1 shadow-2xl overflow-hidden flex items-center justify-center"
                              style={{
                                borderColor: buzzerWinner.teamColorHex,
                                boxShadow: `0 0 35px ${buzzerWinner.teamColorHex}`,
                              }}
                            >
                              <img
                                src={generateAvatarDataUri(winnerSeed, winnerStyle)}
                                alt={buzzerWinner.playerName}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            {winnerEmoji && (
                              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[#0c0c14] border-2 border-amber-400 flex items-center justify-center shadow-lg">
                                <TwemojiText className="text-lg">{winnerEmoji}</TwemojiText>
                              </div>
                            )}
                          </div>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-broadway uppercase text-gold-gradient drop-shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3">
                          <span>{buzzerWinner.playerName}</span>
                          {isWinnerCaptain && (
                            <span title="¡Capitán del equipo!" className="inline-flex items-center text-amber-400">
                              <Crown className="w-10 h-10 md:w-12 md:h-12 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-bounce" />
                            </span>
                          )}
                        </h2>
                        <p
                          className="text-2xl md:text-3xl font-broadway uppercase mt-1"
                          style={{ color: buzzerWinner.teamColorHex }}
                        >
                          {buzzerWinner.teamName}
                        </p>

                        {/* Indicador pasivo en TV */}
                        <div className="mt-6 pt-5 border-t border-[#d4af37]/30 flex items-center justify-center gap-2 text-sm font-vintage font-bold text-amber-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                          <span>Esperando veredicto del Anfitrión en su consola de sala...</span>
                        </div>
                      </motion.div>
                    );
                  })() : activeGame.id === 'trivial' ? (
                    /* ESCENARIO ESPECIAL TRIVIAL CON PREGUNTAS Y REBOTE */
                    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                      <div className="w-full bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-deco-gold relative overflow-hidden backdrop-blur-xl deco-card-frame">
                        {/* Glows */}
                        <div className="absolute -top-24 left-1/4 w-96 h-48 bg-amber-500/15 blur-[100px] pointer-events-none" />
                        <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-yellow-500/10 blur-[100px] pointer-events-none" />

                        {/* Header: Categoría + Indicador de Rebote */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 z-20 relative">
                          <div className="bg-[#07070a]/90 backdrop-blur-md border border-[#d4af37]/50 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-vintage font-bold text-amber-300 shadow-lg">
                            <span className="text-base">{currentTriviaQuestion.categoryEmoji}</span>
                            <span className="font-broadway uppercase tracking-wide">{currentTriviaQuestion.category}</span>
                            <span className="text-[#d4af37]/40">•</span>
                            <span className="text-amber-100/90 font-mono">Pregunta {triviaIndex + 1}</span>
                          </div>

                          {triviaReboundActive && !triviaRevealed && (
                            <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-broadway font-black uppercase tracking-wider animate-bounce shadow-deco-gold border border-[#f5eedb]/50">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>¡REBOTE ABIERTO! CUALQUIERA PUEDE PULSAR (+1 pt)</span>
                            </div>
                          )}
                        </div>

                        {/* Tarjeta de Pregunta */}
                        <div className="p-6 md:p-8 rounded-2xl bg-[#07070a]/90 border border-[#d4af37]/40 text-center shadow-inner my-2">
                          <h2 className="text-2xl md:text-4xl font-broadway text-amber-50 leading-tight drop-shadow-md">
                            {currentTriviaQuestion.question}
                          </h2>
                        </div>

                        {/* Opciones Tipo Test (si las tiene) o Badge de Pregunta Abierta */}
                        {currentTriviaQuestion.options && currentTriviaQuestion.options.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                            {currentTriviaQuestion.options.map((opt, oIdx) => {
                              const letters = ['A', 'B', 'C', 'D'];
                              const isCorrectOpt = triviaRevealed && (
                                currentTriviaQuestion.correctAnswer.toLowerCase().includes(opt.toLowerCase()) ||
                                opt.toLowerCase().includes(currentTriviaQuestion.correctAnswer.toLowerCase())
                              );
                              return (
                                <div
                                  key={oIdx}
                                  className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 text-left transition-all ${
                                    isCorrectOpt
                                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100 shadow-[0_0_25px_rgba(52,211,153,0.35)] scale-105'
                                      : 'bg-[#14141e]/90 border-[#d4af37]/30 text-amber-100/90 hover:border-[#d4af37]/60'
                                  }`}
                                >
                                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-broadway font-black text-sm shrink-0 shadow-md ${
                                    isCorrectOpt ? 'bg-emerald-400 text-slate-950' : 'bg-gold-gradient text-slate-950'
                                  }`}>
                                    {letters[oIdx]}
                                  </span>
                                  <span className="font-vintage font-bold text-sm sm:text-base">{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="my-4 py-2.5 px-5 rounded-xl bg-[#07070a]/90 border border-[#d4af37]/40 inline-block text-xs font-vintage font-bold text-amber-300">
                            💬 Pregunta de Conocimiento Clandestino — ¡Pulsa el timbre de mesa para responder!
                          </div>
                        )}

                        {/* Revelación de Solución */}
                        {triviaRevealed && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#07070a] to-emerald-950/90 border-2 border-emerald-400/80 text-center shadow-2xl"
                          >
                            <span className="text-[10px] uppercase font-broadway font-black tracking-widest text-emerald-300 block mb-1">
                              🎉 RESPUESTA CORRECTA
                            </span>
                            <div className="text-2xl sm:text-4xl font-broadway text-emerald-200 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                              {currentTriviaQuestion.correctAnswer}
                            </div>
                            {currentTriviaQuestion.hint && (
                              <p className="text-xs text-amber-200/80 font-vintage mt-1 italic">
                                💡 {currentTriviaQuestion.hint}
                              </p>
                            )}
                          </motion.div>
                        )}

                        {/* Turno activo de respuesta o espera */}
                        <AnimatePresence mode="wait">
                          {buzzerLocked && buzzerWinner ? (
                            <motion.div
                              key="buzzer-active"
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-5 p-4 rounded-2xl border-2 border-amber-400 bg-[#1a1408]/90 backdrop-blur-md flex items-center justify-between shadow-xl"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-3xl animate-bounce">⚡</span>
                                <div className="text-left">
                                  <span className="text-[10px] uppercase font-broadway tracking-wider text-amber-300">
                                    {triviaReboundActive ? '¡Rebote cazado por:' : '¡Pulsó primero:'}
                                  </span>
                                  <div className="text-xl font-broadway text-gold-gradient">{buzzerWinner.teamName}</div>
                                </div>
                              </div>
                              <div className="text-xs font-vintage font-bold text-amber-300 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                                <span>Respondiendo en directo...</span>
                              </div>
                            </motion.div>
                          ) : !triviaRevealed && (
                            <div className="mt-4 pt-3 border-t border-[#d4af37]/30 flex items-center justify-center gap-2 text-xs font-vintage font-bold text-amber-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                              <span>Pulsa el timbre de tu móvil para responder</span>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-28 h-28 mx-auto rounded-full bg-amber-500/10 border-2 border-[#d4af37] flex items-center justify-center animate-pulse mb-5 shadow-deco-gold">
                        <Flame className="w-14 h-14 text-[#d4af37]" />
                      </div>
                      <h2 className="text-4xl md:text-5xl font-broadway tracking-wider uppercase text-gold-gradient drop-shadow-md">
                        ¡ATENTOS AL TIMBRE!
                      </h2>
                      <p className="text-amber-200/80 font-vintage text-base sm:text-lg mt-2">
                        El primer equipo en presionar el timbre de bronce en su móvil responderá.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          )}

          {/* MOTOR B: CADENA / RETOS PRESENCIALES Y JUEGOS */}
          {activeGame.engine === 'challenges' && (
            <div className="w-full text-center max-w-4xl mx-auto">
              {activeGame.id === 'un_dos_tres' ? (
                /* ESCENARIO 1, 2, 3 ¿YA? */
                <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-deco-gold relative overflow-hidden backdrop-blur-xl deco-card-frame">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/50 shadow-md">
                      <span>⚡</span> 1, 2, 3 ¿YA? — {currentUdtChallenge.level} (Nivel {currentUdtChallenge.levelNumber})
                    </div>
                    <div className="text-xs font-vintage font-bold text-amber-300 uppercase tracking-wider">
                      Turnos por equipo • 5 Segundos • Eliminación directa
                    </div>
                  </div>

                  {/* TEMPORIZADOR GIGANTE DE 5 SEGUNDOS (CRONÓMETRO DE BRONCE) */}
                  <div className="my-6">
                    <div className={`text-8xl sm:text-9xl font-broadway transition-all drop-shadow-[0_0_35px_rgba(212,175,55,0.4)] ${
                      udtCountdown !== null && udtCountdown <= 2
                        ? 'text-red-500 animate-pulse scale-110 drop-shadow-[0_0_35px_rgba(239,68,68,0.7)]'
                        : udtCountdown !== null && udtCountdown > 0
                        ? 'text-gold-gradient'
                        : 'text-amber-200/40'
                    }`}>
                      {udtCountdown !== null ? `${udtCountdown}s` : '5s'}
                    </div>
                    <p className="text-sm font-vintage font-bold uppercase tracking-wider text-amber-200/80 mt-2">
                      {udtIsTimerRunning ? '¡Cuenta atrás en marcha! ¡Di 3 respuestas en voz alta!' : 'Esperando que el Anfitrión lance el tiempo'}
                    </p>
                  </div>

                  {/* RETO ACTIVO */}
                  <div className="p-6 rounded-2xl bg-[#07070a]/90 border border-[#d4af37]/40 my-4 shadow-inner">
                    <span className="text-xs uppercase font-broadway font-black text-gold-gradient block mb-1">
                      {currentUdtChallenge.category}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-broadway text-amber-50 drop-shadow-sm">
                      {currentUdtChallenge.prompt}
                    </h2>
                  </div>

                  {/* ESTADO DE LOS EQUIPOS: TURNO ACTIVO Y ELIMINADOS */}
                  <div className="mt-6 pt-4 border-t border-[#d4af37]/30 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {activeTeams.map((team) => {
                      const isEliminated = udtEliminatedTeamIds.includes(team.id);
                      const isCurrentTurn = udtActiveTeamId === team.id;
                      const catalog = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
                      return (
                        <div
                          key={team.id}
                          className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center ${
                            isEliminated
                              ? 'bg-[#07070a]/60 border-red-950/60 opacity-40'
                              : isCurrentTurn
                              ? 'bg-amber-500/20 border-amber-400 shadow-deco-gold scale-105 ring-2 ring-amber-300'
                              : 'bg-[#14141e]/90 border-[#d4af37]/30'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${catalog.twBg} mb-1 shadow`} />
                          <span className="text-xs font-broadway text-white truncate max-w-full">{team.name}</span>
                          <span className={`text-[10px] font-vintage font-black uppercase mt-1 ${
                            isEliminated ? 'text-red-400' : isCurrentTurn ? 'text-amber-300 font-bold' : 'text-amber-200/50'
                          }`}>
                            {isEliminated ? '💀 ELIMINADO' : isCurrentTurn ? '🎙️ EN JUEGO' : 'EN ESPERA'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : activeGame.id === 'bingo' ? (
                /* ESCENARIO BINGO INTERACTIVO EN TV CON RULETA Y PANEL SIN SCROLL */
                <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-4 sm:p-6 shadow-deco-gold relative overflow-hidden backdrop-blur-xl deco-card-frame">
                  {/* CABECERA COMPACTA */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm">
                      <span>🎰</span> RULETA Y BOMBO VIRTUAL (1 - 90)
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-broadway">
                      <span className="px-3.5 py-1 rounded-full bg-[#14141e] text-amber-200 border border-[#d4af37]/40 shadow-sm">
                        📏 Línea: +2 pts
                      </span>
                      <span className="px-3.5 py-1 rounded-full bg-gold-gradient text-slate-950 border border-[#f5eedb]/50 shadow-deco-gold font-black">
                        🎱 BINGO: +6 pts
                      </span>
                    </div>
                  </div>

                  {/* LAYOUT EN 2 COLUMNAS PARA QUE TODO QUEPA EN PANTALLA SIN SCROLL */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                    {/* COLUMNA IZQUIERDA: BOMBO / RULETA */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center">
                      <BingoRoulette
                        currentBall={bingoCurrentBall}
                        drawnBalls={bingoDrawnBalls}
                        isSpinning={bingoIsSpinning}
                      />
                    </div>

                    {/* COLUMNA DERECHA: PANEL COMPLETO DE LOS 90 NÚMEROS (10x9, SIN SCROLL) */}
                    <div className="lg:col-span-8 p-3 sm:p-4 rounded-2xl bg-[#07070a]/90 border border-[#d4af37]/40 shadow-inner flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2.5 px-1">
                        <span className="text-[11px] uppercase font-broadway tracking-wider text-amber-300">
                          Panel de Números Extraídos:
                        </span>
                        <span className="text-[11px] font-broadway text-gold-gradient font-black">
                          {bingoDrawnBalls.length} de 90 bolas
                        </span>
                      </div>

                      {/* 10 columnas x 9 filas: los 90 números con legibilidad óptima */}
                      <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
                        {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
                          const isDrawn = bingoDrawnBalls.includes(num);
                          const isCurrent = bingoCurrentBall === num;
                          const theme = getBingoBallTheme(num);
                          return (
                            <div
                              key={num}
                              className={`h-6 sm:h-7 rounded-md flex items-center justify-center text-[11px] sm:text-xs font-mono font-black transition-all ${
                                isCurrent
                                  ? `bg-gradient-to-tr ${theme.bgGradient} ${theme.gridTextClass} scale-110 shadow-deco-gold ring-2 ring-amber-300 z-10 animate-pulse`
                                  : isDrawn
                                  ? `bg-gradient-to-tr ${theme.bgGradient} ${theme.gridTextClass} shadow-sm opacity-95 ${
                                      theme.isLightColor ? 'border border-slate-400 font-extrabold' : ''
                                    }`
                                  : 'bg-[#101018] text-[#d4af37]/40 border border-[#d4af37]/15 hover:border-[#d4af37]/40'
                              }`}
                              style={
                                !isDrawn && !isCurrent
                                  ? { borderColor: '#d4af3720' }
                                  : undefined
                              }
                            >
                              {num}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeGame.id === 'mimica' ? (
                /* ESCENARIO MÍMICA */
                <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-deco-gold relative overflow-hidden backdrop-blur-xl deco-card-frame">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-widest mb-4 border border-[#f5eedb]/40 shadow-sm">
                    <span>🎭</span> TEATRO DE CINE MUDO Y MÍMICA
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-broadway text-gold-gradient mb-2 uppercase drop-shadow-md">
                    ¡PROHIBIDO HABLAR O EMITIR SONIDOS!
                  </h2>
                  <p className="text-sm font-vintage text-amber-100/80 max-w-lg mx-auto mb-6">
                    El actor interpreta el reto que le dio el anfitrión en su móvil. ¡Su equipo debe adivinar antes de que acabe el tiempo!
                  </p>

                  <div className="flex items-center justify-center gap-8 my-6">
                    <div className="p-6 rounded-3xl bg-[#07070a]/90 border-2 border-[#d4af37]/40 text-center min-w-[170px] shadow-deco-gold">
                      <span className="text-xs uppercase font-broadway tracking-wider text-amber-300 block mb-1">Tiempo Restante</span>
                      <div className="text-6xl font-broadway text-gold-gradient drop-shadow-md">
                        {mimicaTimerSeconds !== null ? `${mimicaTimerSeconds}s` : '90s'}
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-[#07070a]/90 border-2 border-emerald-400/40 text-center min-w-[170px] shadow-[0_0_30px_rgba(52,211,153,0.25)]">
                      <span className="text-xs uppercase font-broadway tracking-wider text-emerald-300 block mb-1">Aciertos Ronda</span>
                      <div className="text-6xl font-broadway text-emerald-300 drop-shadow-md">
                        {mimicaHitsCount}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-vintage font-bold uppercase tracking-wider text-amber-300/80">
                    🤫 El presentador tiene las tarjetas secretas y controla el tiempo en su móvil
                  </div>
                </div>
              ) : activeGame.id === 'beer_pong' ? (
                /* ESCENARIO BEER PONG */
                <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-deco-gold relative overflow-hidden backdrop-blur-xl deco-card-frame">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-wider mb-4 border border-[#f5eedb]/40 shadow-sm">
                    <span>🍺</span> TABERNA CLANDESTINA & TORNEO DE VASOS
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-broadway text-gold-gradient mb-2 uppercase drop-shadow-md">
                    TORNEO DE TIROS Y VASOS
                  </h2>
                  <p className="text-sm font-vintage text-amber-100/80 max-w-lg mx-auto mb-6">
                    Prueba presencial con vasos de colores y pelotas de ping pong. ¡Cada vaso encestado suma +1 pt y el último vaso +5 pts!
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 my-4">
                    {activeTeams.map((team) => {
                      const catalog = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
                      return (
                        <div key={team.id} className="p-4 rounded-2xl bg-[#07070a]/90 border border-[#d4af37]/40 flex flex-col items-center shadow-md">
                          <span className={`w-4 h-4 rounded-full ${catalog.twBg} mb-2 shadow`} />
                          <span className="text-sm font-broadway text-white">{team.name}</span>
                          <span className="text-2xl font-broadway text-gold-gradient mt-1">{team.score} pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* TELÉFONO DIBUJADO */
                <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 sm:p-8 shadow-deco-gold relative overflow-hidden backdrop-blur-xl deco-card-frame">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-wider mb-3 border border-[#f5eedb]/40 shadow-sm">
                    <Palette className="w-4 h-4" /> Teléfono Dibujado en Papel Real
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-broadway text-gold-gradient mb-2 drop-shadow-md">
                    CADENA CÓSMICA DE ARTE & CARICATURAS
                  </h2>
                  <div className="inline-block px-4 py-1.5 bg-[#14141e] border border-[#d4af37]/40 rounded-full text-xs font-vintage font-bold text-amber-300 mb-3 shadow-sm">
                    💡 El Jugador 1 decide qué dibujar para iniciar la cadena
                  </div>
                  <p className="text-xs sm:text-sm font-vintage text-amber-100/80 max-w-lg mx-auto mb-6">
                    J1 piensa y dibuja en su folio ➔ J2 adivina y escribe ➔ J3 dibuja lo escrito ➔ J4 adivina ➔ J5 dibuja la obra final. ¡Al terminar, se revelan los folios!
                  </p>
                  <div className="my-4">
                    <div className={`text-7xl font-broadway drop-shadow-[0_0_25px_rgba(212,175,55,0.4)] ${timerSeconds !== null && timerSeconds <= 5 ? 'text-red-500 animate-ping' : 'text-gold-gradient'}`}>
                      {timerSeconds !== null ? `${timerSeconds}s` : '--'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MOTOR C: DUELOS & JUEGOS DE MESA (Blackjack, Dominó, Parchís, UNO) */}
          {activeGame.engine === 'duel' && (
            <div className="w-full max-w-4xl bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-8 backdrop-blur-xl shadow-deco-gold text-center deco-card-frame">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-gradient text-slate-950 text-xs font-broadway font-black uppercase tracking-wider mb-3 border border-[#f5eedb]/40 shadow-sm">
                <Swords className="w-4 h-4" /> Gran Salón de Juegos Clandestinos: {activeGame.title}
              </div>
              <h2 className="text-3xl md:text-5xl font-broadway uppercase text-gold-gradient mb-2 drop-shadow-md">
                CLASIFICACIÓN DEL TORNEO
              </h2>
              <p className="text-amber-200/80 font-vintage text-xs md:text-sm mb-6 max-w-xl mx-auto">
                {activeGame.description}
              </p>

              {/* PODIO DE PUNTOS */}
              <div
                className="grid gap-3 mb-6"
                style={{ gridTemplateColumns: `repeat(${activeTeams.length}, minmax(0, 1fr))` }}
              >
                {activeTeams.map((team) => {
                  const catalog = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
                  return (
                    <div
                      key={team.id}
                      className={`p-4 rounded-2xl border-2 ${catalog.twBorder} bg-[#07070a]/90 flex flex-col justify-between shadow-deco-gold`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${catalog.twBg} mx-auto mb-2 shadow`} />
                      <span className={`text-base font-broadway uppercase ${catalog.twText}`}>{team.name}</span>
                      <span className="text-3xl font-broadway text-gold-gradient mt-2">{team.score}</span>
                      <span className="text-[10px] text-amber-300/70 uppercase font-vintage font-bold">puntos</span>
                    </div>
                  );
                })}
              </div>

              <div className="text-xs font-vintage font-bold uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#d4af37]" /> Clasificación y puntos gestionados en directo por el Anfitrión
              </div>
            </div>
          )}
        </section>
      )}

      {/* MARCADOR INFERIOR PERMANENTE EN TV (DURANTE LAS PRUEBAS / JUEGOS) */}
      {room.status !== 'lobby' && room.status !== 'presentation' && room.status !== 'podium' && room.status !== 'ended' && (
        <footer className="border-t border-slate-800/80 pt-4 z-10">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Marcador General:
            </span>
            <div
              className="flex-1 grid gap-3"
              style={{ gridTemplateColumns: `repeat(${activeTeams.length}, minmax(0, 1fr))` }}
            >
              {activeTeams.map((team) => {
                const theme = getTeamTheme(team.team_index);
                const teamHand = powerCards?.teamHands[team.id] || [];
                const hasDouble = powerCards?.activeEffects.some(
                  (e) => e.sourceTeamId === team.id && e.cardId === 'doble'
                );
                const hasBomb = powerCards?.activeEffects.some(
                  (e) => e.targetTeamId === team.id && e.cardId === 'bomba'
                );
                const hasShield = powerCards?.activeEffects.some(
                  (e) => e.sourceTeamId === team.id && e.cardId === 'escudo'
                );
                const hasSentence = powerCards?.activeEffects.some(
                  (e) => e.targetTeamId === team.id && e.cardId === 'la_sentencia'
                );
                const hasRussianRoulette = powerCards?.activeEffects.some(
                  (e) => e.sourceTeamId === team.id && e.cardId === 'ruleta_rusa'
                );
                const hasPhoenix = powerCards?.activeEffects.some(
                  (e) => e.sourceTeamId === team.id && e.cardId === 'ave_fenix'
                );
                const hasCurse = teamHand.includes('la_maldicion');
                const hasCaptainGamble = !!captainGambles[team.id];
                const teamCaptain = players.find(
                  (p) => (p.team_id === team.id || p.team_index === team.team_index) && p.is_captain
                );
                const members = teamCaptain ? [teamCaptain] : [];

                return (
                  <TeamScoreCard
                    key={team.id}
                    team={team}
                    theme={theme}
                    members={members}
                    powerCardsCount={teamHand.length}
                    variant="scoreboard"
                    maxRoomScore={Math.max(...activeTeams.map((t) => t.score || 0), 0)}
                    activeEffects={{
                      hasDouble,
                      hasBomb,
                      hasShield,
                      hasSentence,
                      hasRussianRoulette,
                      hasPhoenix,
                      hasCurse,
                      hasGamble: hasCaptainGamble,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </footer>
      )}

      {/* MODAL CINEMATOGRÁFICO DE CARTA DE PODER EN TV CON ENTRADA DE IMPACTO Y ONDA EXPANSIVA */}
      <CinematicCardPlayReveal
        activeAnimation={activeCardAnimation}
        onDismiss={() => setActiveCardAnimation(null)}
        isHost={false}
      />

      {/* OVERLAY CELEBRATORIO DE PRUEBA FINALIZADA EN TV */}
      <AnimatePresence>
        {testFinishedNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-[#07070a]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 select-none"
          >
            <div className="relative max-w-xl w-full text-center space-y-6">
              <div className="absolute -inset-10 rounded-3xl opacity-50 blur-3xl pointer-events-none bg-amber-500/20" />
              <div className="relative bg-[#0c0c14]/95 border-4 border-[#d4af37] rounded-3xl p-8 shadow-deco-gold space-y-5 deco-card-frame">
                <div className="w-24 h-24 mx-auto rounded-full bg-gold-gradient border-2 border-[#f5eedb]/60 flex items-center justify-center animate-bounce shadow-deco-gold">
                  <Trophy className="w-14 h-14 text-slate-950" />
                </div>
                <div>
                  <span className="text-xs uppercase font-broadway font-black tracking-widest text-amber-300 block">
                    ¡VEREDICTO DEL SALÓN DE JUEGO!
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-broadway uppercase text-gold-gradient drop-shadow-md mt-1">
                    PRUEBA FINALIZADA
                  </h2>
                  <p className="text-lg font-vintage font-bold text-amber-200 mt-2">
                    {testFinishedNotification.gameTitle}
                  </p>
                </div>

                {testFinishedNotification.winnerTeamName && (
                  <div className="bg-gold-gradient/15 border-2 border-[#d4af37]/60 rounded-2xl p-4 shadow-inner">
                    <span className="text-[11px] uppercase font-broadway tracking-wider text-amber-300 block">
                      Equipo más destacado:
                    </span>
                    <span className="text-2xl font-broadway text-gold-gradient uppercase mt-1 block">
                      🎉 {testFinishedNotification.winnerTeamName}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#d4af37]/30 flex items-center justify-center gap-2 text-xs font-vintage font-bold text-amber-200/70">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>El Anfitrión está asignando puntuaciones y cartas bonus en su consola...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

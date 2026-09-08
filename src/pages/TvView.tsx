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
import { TvLobby } from '../components/tv/TvLobby';
import { TvPresentationView } from '../components/tv/TvPresentationView';
import { TvMoviesGame } from '../components/tv/minigames/TvMoviesGame';
import { TvBabyPhotosGame } from '../components/tv/minigames/TvBabyPhotosGame';
import { TvMusicGame } from '../components/tv/minigames/TvMusicGame';
import { TvTriviaGame } from '../components/tv/minigames/TvTriviaGame';
import { TvUnDosTresGame } from '../components/tv/minigames/TvUnDosTresGame';
import { TvBingoGame } from '../components/tv/minigames/TvBingoGame';
import { TvMimicaGame } from '../components/tv/minigames/TvMimicaGame';

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
  const [testFinishedNotification, setTestFinishedNotification] = useState<{
    gameTitle: string;
    winnerTeamName?: string;
    results?: Array<{
      teamId: string;
      teamName: string;
      teamIndex: number;
      colorHex: string;
      rank: number;
      hits: number;
      basePoints: number;
      cardImpacts: Array<{
        cardId: string;
        cardName: string;
        cardEmoji: string;
        delta: number;
        explanation: string;
      }>;
      totalCardDelta: number;
      finalPoints: number;
    }>;
  } | null>(null);
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
          setTestFinishedNotification((prev) => (prev?.results ? prev : null));
        }, 8000);
      } else if (event.type === 'TEST_VERDICT_APPLIED') {
        setTestFinishedNotification({
          gameTitle: event.payload.gameTitle,
          results: event.payload.results,
        });
        triggerVictoryConfetti();
        resetBuzzer();
        setTimerSeconds(null);
        setMusicPlaying(false);
        setTimeout(() => {
          setTestFinishedNotification(null);
        }, 12000);
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
        <TvLobby
          joinUrl={joinUrl}
          players={players}
          activeTeams={activeTeams}
          unassignedPlayers={unassignedPlayers}
          powerCards={powerCards}
        />
      ) : room.status === 'presentation' ? (
        /* ================= VISTA PRESENTACIÓN DEL SHOW ================= */
        <TvPresentationView
          currentSlide={currentSlide}
          selectedPresentationCard={selectedPresentationCard}
          onSelectPresentationCard={setSelectedPresentationCard}
        />
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
              {/* VISTAS MODULARIZADAS DE MINIJUEGOS CON TIMBRE */}
              {activeGame.id === 'movies' ? (
                <TvMoviesGame
                  currentMovie={currentMovie}
                  movieFrameLevel={movieFrameLevel}
                  movieRevealed={movieRevealed}
                />
              ) : activeGame.id === 'fotos_proyector' ? (
                <TvBabyPhotosGame
                  currentBabyPhoto={currentBabyPhoto}
                  babyPhotoIndex={babyPhotoIndex}
                  babyPhotosCount={DEV_MOCK_BABY_PHOTOS.length}
                  babyPhotoRevealed={babyPhotoRevealed}
                  buzzerLocked={buzzerLocked}
                  buzzerWinner={buzzerWinner}
                  isWinnerCaptain={isWinnerCaptain}
                />
              ) : activeGame.id === 'music' ? (
                <TvMusicGame
                  currentSong={currentSong}
                  musicPlaying={musicPlaying}
                  buzzerLocked={buzzerLocked}
                  musicRevealed={musicRevealed}
                  buzzerWinner={buzzerWinner}
                  players={players}
                  isWinnerCaptain={isWinnerCaptain}
                />
              ) : (
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
                    <TvTriviaGame
                      currentTriviaQuestion={currentTriviaQuestion}
                      triviaIndex={triviaIndex}
                      triviaRevealed={triviaRevealed}
                      triviaReboundActive={triviaReboundActive}
                      buzzerLocked={buzzerLocked}
                      buzzerWinner={buzzerWinner}
                    />
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
                <TvUnDosTresGame
                  currentUdtChallenge={currentUdtChallenge}
                  udtCountdown={udtCountdown}
                  udtIsTimerRunning={udtIsTimerRunning}
                  activeTeams={activeTeams}
                  udtEliminatedTeamIds={udtEliminatedTeamIds}
                  udtActiveTeamId={udtActiveTeamId}
                />
              ) : activeGame.id === 'bingo' ? (
                <TvBingoGame
                  bingoCurrentBall={bingoCurrentBall}
                  bingoDrawnBalls={bingoDrawnBalls}
                  bingoIsSpinning={bingoIsSpinning}
                />
              ) : activeGame.id === 'mimica' ? (
                <TvMimicaGame
                  mimicaTimerSeconds={mimicaTimerSeconds}
                  mimicaHitsCount={mimicaHitsCount}
                />
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

                {testFinishedNotification.results && testFinishedNotification.results.length > 0 ? (
                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs uppercase font-broadway tracking-widest text-amber-300 block text-center">
                      🏆 Podio Oficial de la Prueba
                    </span>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {testFinishedNotification.results.map((res) => {
                        const rankEmoji = res.rank === 1 ? '🥇' : res.rank === 2 ? '🥈' : res.rank === 3 ? '🥉' : '🎖️';
                        return (
                          <div
                            key={res.teamId}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                              res.rank === 1
                                ? 'bg-gold-gradient/20 border-[#d4af37] shadow-deco-gold'
                                : 'bg-[#14141e]/90 border-[#d4af37]/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl shrink-0">{rankEmoji}</span>
                              <div className="min-w-0 text-left">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: res.colorHex }}
                                  />
                                  <span className="text-base font-broadway uppercase text-white truncate">
                                    {res.teamName}
                                  </span>
                                </div>
                                <span className="text-xs text-amber-200/70 font-vintage block">
                                  {res.hits} {res.hits === 1 ? 'acierto' : 'aciertos'} en la ronda
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {res.cardImpacts.map((imp, impIdx) => (
                                <span
                                  key={impIdx}
                                  className={`text-xs font-broadway px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                                    imp.delta >= 0
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                                  }`}
                                  title={imp.explanation}
                                >
                                  <span>{imp.cardEmoji}</span>
                                  <span>{imp.delta >= 0 ? `+${imp.delta}` : imp.delta}</span>
                                </span>
                              ))}

                              <span
                                className={`px-3.5 py-1.5 rounded-xl font-broadway text-lg font-black border ${
                                  res.finalPoints > 0
                                    ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
                                    : res.finalPoints < 0
                                    ? 'bg-red-500/30 text-red-300 border-red-500/50'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                {res.finalPoints > 0 ? `+${res.finalPoints}` : res.finalPoints} pts
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : testFinishedNotification.winnerTeamName ? (
                  <div className="bg-gold-gradient/15 border-2 border-[#d4af37]/60 rounded-2xl p-4 shadow-inner">
                    <span className="text-[11px] uppercase font-broadway tracking-wider text-amber-300 block">
                      Equipo más destacado:
                    </span>
                    <span className="text-2xl font-broadway text-gold-gradient uppercase mt-1 block">
                      🎉 {testFinishedNotification.winnerTeamName}
                    </span>
                  </div>
                ) : null}

                {!testFinishedNotification.results && (
                  <div className="pt-2 border-t border-[#d4af37]/30 flex items-center justify-center gap-2 text-xs font-vintage font-bold text-amber-200/70">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>El Anfitrión está asignando puntuaciones y cartas bonus en su consola...</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

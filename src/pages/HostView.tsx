import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Sliders,
  Play,
  Plus,
  Minus,
  RefreshCw,
  Trophy,
  Gamepad2,
  ArrowLeft,
  Tv,
  CheckCircle2,
  UserCheck,
  Award,
  Sparkles,
  Layers,
  Film,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  FolderUp,
  PackageCheck,
  ShieldCheck,
  Sparkle,
  Dices,
  Zap,
  Shield,
  RotateCcw,
  Camera,
  Image as ImageIcon,
  Crown,
  Swords,
  Star,
  ShieldAlert,
  Volume2,
  VolumeX,
  Music,
  Disc,
  Pause,
  Search,
  Loader2,
  ListMusic,
  Shuffle,
  Trash2,
  X,
  Check,
  HelpCircle,
  Timer,
  Skull,
  Beer,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { soundFX, JukeboxState, JUKEBOX_PLAYLIST } from '../lib/audio';
import { TEAMS_CATALOG } from '../lib/constants';
import { Room, Team, Player, MinigameType, CaptainGamble, CaptainDuelState } from '../lib/types';
import { useBuzzerRace } from '../lib/useBuzzerRace';
import { RoomSync, getRoomSync } from '../lib/roomSync';
import { GAMES_CATALOG, GameDefinition, ScoringOption } from '../lib/games';
import { MOVIES_DATABASE, DEV_MOCK_MOVIES, MovieItem } from '../lib/moviesData';
import { DEV_MOCK_BABY_PHOTOS, BabyPhotoItem } from '../lib/babyPhotosData';
import { SongTrack } from '../lib/musicData';
import { searchSpotifyTracks, fetchSpotifyPlaylistTracks } from '../lib/spotify';
import { OFFICIAL_TRIVIA_QUESTIONS, TriviaQuestion } from '../lib/triviaData';
import { OFFICIAL_UN_DOS_TRES_CHALLENGES, UnDosTresChallenge } from '../lib/unDosTresData';
import { OFFICIAL_MIMICA_CARDS, MimicaCard } from '../lib/mimicaData';
import { getBingoBallTheme, BINGO_NICKNAMES } from '../lib/bingoUtils';
import PowerCardView from '../components/PowerCardView';
import { CoinBurstCelebration } from '../components/particles/CoinBurstCelebration';
import { DecoProceduralSpandrel } from '../components/deco/DecoProceduralSpandrel';
import {
  PowerCardsState,
  PowerCard,
  MASTER_POWER_CARDS,
  createInitialPowerCardsState,
  dealInitialCardsToTeams,
  dealCardToSingleTeam,
  executePlayCard,
  executeStealCard,
  executeSwapCard,
  executeRecoverDiscardedCard,
  executeDrawTwoForBank,
  executeChooseBankCard,
  getRandomSensoryLimitation,
  getPowerCardById,
} from '../lib/powerCards';
import { SpeakeasyJukeboxWidget } from '../components/audio/SpeakeasyJukeboxWidget';
import {
  calculateTestVerdict,
  TestVerdictCalculation,
  TeamVerdictResult,
} from '../lib/testVerdict';
import { HostTestVerdictModal } from '../components/host/HostTestVerdictModal';
import { HostMusicControls } from '../components/host/minigames/HostMusicControls';
import { HostMoviesControls } from '../components/host/minigames/HostMoviesControls';
import { HostBabyPhotosControls } from '../components/host/minigames/HostBabyPhotosControls';
import { HostTriviaControls } from '../components/host/minigames/HostTriviaControls';
import { HostUnDosTresControls } from '../components/host/minigames/HostUnDosTresControls';
import { HostBingoControls } from '../components/host/minigames/HostBingoControls';
import { HostMimicaControls } from '../components/host/minigames/HostMimicaControls';
import { HostDrawingControls } from '../components/host/minigames/HostDrawingControls';
import { HostTeamsScoreboard } from '../components/host/HostTeamsScoreboard';
import { HostPowerCardsTab } from '../components/host/HostPowerCardsTab';

export default function HostView() {
  const { code } = useParams<{ code: string }>();
  const roomCode = (code || '').toUpperCase();

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
      id: 'room_' + roomCode,
      code: roomCode,
      host_token: 'demo',
      status: 'lobby',
      active_teams_count: 5,
      current_game: 'buzzer',
      active_game_id: 'music',
      title: savedTitle || 'GAME SHOW ARENA',
    };
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(`party_teams_${roomCode}`);
    if (saved) {
      try {
        const parsed: Team[] = JSON.parse(saved);
        return TEAMS_CATALOG.map((c) => {
          const existing = parsed.find((p) => p.team_index === c.index);
          return {
            id: existing ? existing.id : `team_${c.index}`,
            room_id: 'room_' + roomCode,
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
      room_id: 'room_' + roomCode,
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

  const [selectedTeamForPoints, setSelectedTeamForPoints] = useState<string | null>(null);
  const [showCoinBurst, setShowCoinBurst] = useState(false);

  // Estados del Sistema de Capitanes
  const [captainGambles, setCaptainGambles] = useState<Record<string, CaptainGamble>>({});
  const [captainDuel, setCaptainDuel] = useState<CaptainDuelState | null>(null);

  // Estado del Jukebox Speakeasy sincronizado desde la TV
  const [jukeboxState, setJukeboxState] = useState<JukeboxState>({
    isPlaying: false,
    currentTrackIndex: 0,
    currentTrack: JUKEBOX_PLAYLIST[0],
    volume: 0.35,
    isMuted: false,
    isDucked: false,
  });
  const [podiumPage, setPodiumPage] = useState<'podium' | 'medals'>('podium');

  // Instancia de sincronización multi-pantalla como anfitrión
  const roomSync = useMemo(() => getRoomSync(roomCode, 'host'), [roomCode]);

  const { resetBuzzer, isLocked, winner } = useBuzzerRace({ roomCode, isHostOrTv: true, roomSync });

  // Juego activo según el ID seleccionado
  const activeGame: GameDefinition = useMemo(() => {
    const found = GAMES_CATALOG.find((g) => g.id === room.active_game_id);
    return found || GAMES_CATALOG[0];
  }, [room.active_game_id]);

  // Estados para el minijuego de adivinar películas con protección anti-spoilers
  const [movieBank, setMovieBank] = useState<MovieItem[]>(() => {
    const saved = localStorage.getItem(`party_movie_bank_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEV_MOCK_MOVIES;
  });
  const [activePackName, setActivePackName] = useState<string>(() => {
    return localStorage.getItem(`party_movie_pack_name_${roomCode}`) || 'Modo Demo (Pruebas)';
  });
  const [movieIndex, setMovieIndex] = useState(0);
  const [movieFrameLevel, setMovieFrameLevel] = useState<1 | 2 | 3 | 4>(1);
  const [movieRevealed, setMovieRevealed] = useState(false);
  const [movieCategoryFilter, setMovieCategoryFilter] = useState<'Todos' | 'Taquillazos' | 'Disney / Pixar' | 'Terror'>('Todos');

  const filteredMovies = useMemo(() => {
    if (movieCategoryFilter === 'Todos') return movieBank;
    return movieBank.filter((m) => m.category === movieCategoryFilter);
  }, [movieCategoryFilter, movieBank]);

  const currentMovie: MovieItem = filteredMovies[movieIndex % filteredMovies.length] || movieBank[0] || DEV_MOCK_MOVIES[0];

  const syncMovieState = (
    index: number,
    level: 1 | 2 | 3 | 4,
    revealed: boolean,
    cat?: string,
    targetMovie?: MovieItem
  ) => {
    const mov = targetMovie || filteredMovies[index % filteredMovies.length] || currentMovie;
    roomSync.broadcast({
      type: 'MOVIE_STATE_UPDATE',
      payload: {
        movieIndex: index,
        frameLevel: level,
        isRevealed: revealed,
        categoryFilter: cat || movieCategoryFilter,
        movieData: mov,
      },
    });
  };

  const handleLoadOfficialPack = async () => {
    try {
      const res = await fetch('/packs/pack_peliculas_oficial.json');
      if (!res.ok) throw new Error('No se pudo cargar el archivo');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMovieBank(data);
        const name = `Pack Oficial Fiesta (${data.length} películas)`;
        setActivePackName(name);
        localStorage.setItem(`party_movie_bank_${roomCode}`, JSON.stringify(data));
        localStorage.setItem(`party_movie_pack_name_${roomCode}`, name);
        setMovieIndex(0);
        setMovieFrameLevel(1);
        setMovieRevealed(false);
        resetBuzzer();
        syncMovieState(0, 1, false, undefined, data[0]);
      }
    } catch (err) {
      alert('Error al cargar el pack oficial de películas');
    }
  };

  const handleResetToDemo = () => {
    setMovieBank(DEV_MOCK_MOVIES);
    setActivePackName('Modo Demo (Pruebas)');
    localStorage.removeItem(`party_movie_bank_${roomCode}`);
    localStorage.removeItem(`party_movie_pack_name_${roomCode}`);
    setMovieIndex(0);
    setMovieFrameLevel(1);
    setMovieRevealed(false);
    resetBuzzer();
    syncMovieState(0, 1, false, undefined, DEV_MOCK_MOVIES[0]);
  };

  const handleUploadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMovieBank(parsed);
          const name = `Custom: ${file.name} (${parsed.length} pelis)`;
          setActivePackName(name);
          localStorage.setItem(`party_movie_bank_${roomCode}`, JSON.stringify(parsed));
          localStorage.setItem(`party_movie_pack_name_${roomCode}`, name);
          setMovieIndex(0);
          setMovieFrameLevel(1);
          setMovieRevealed(false);
          resetBuzzer();
          syncMovieState(0, 1, false, undefined, parsed[0]);
        } else {
          alert('El archivo no contiene un array válido de películas');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleNextMovie = () => {
    const nextIdx = (movieIndex + 1) % filteredMovies.length;
    setMovieIndex(nextIdx);
    setMovieFrameLevel(1);
    setMovieRevealed(false);
    resetBuzzer();
    syncMovieState(nextIdx, 1, false);
  };

  const handlePrevMovie = () => {
    const prevIdx = (movieIndex - 1 + filteredMovies.length) % filteredMovies.length;
    setMovieIndex(prevIdx);
    setMovieFrameLevel(1);
    setMovieRevealed(false);
    resetBuzzer();
    syncMovieState(prevIdx, 1, false);
  };

  const handleSetFrameLevel = (lvl: 1 | 2 | 3 | 4) => {
    setMovieFrameLevel(lvl);
    syncMovieState(movieIndex, lvl, movieRevealed);
  };

  const handleToggleReveal = () => {
    const nextRevealed = !movieRevealed;
    setMovieRevealed(nextRevealed);
    syncMovieState(movieIndex, movieFrameLevel, nextRevealed);
  };

  const handleCategoryFilterChange = (cat: 'Todos' | 'Taquillazos' | 'Disney / Pixar' | 'Terror') => {
    setMovieCategoryFilter(cat);
    setMovieIndex(0);
    setMovieFrameLevel(1);
    setMovieRevealed(false);
    resetBuzzer();
    syncMovieState(0, 1, false, cat);
  };

  // ==========================================================================
  // 👶 FOTOS PROYECTOR (BEBÉS) - ESTADO Y HANDLERS
  // ==========================================================================
  const [babyPhotosList, setBabyPhotosList] = useState<BabyPhotoItem[]>(() => {
    const saved = localStorage.getItem(`party_baby_photos_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEV_MOCK_BABY_PHOTOS;
  });
  const [babyPhotoIndex, setBabyPhotoIndex] = useState(0);
  const [babyPhotoRevealed, setBabyPhotoRevealed] = useState(false);

  const currentBabyPhoto: BabyPhotoItem =
    babyPhotosList[babyPhotoIndex % babyPhotosList.length] || babyPhotosList[0];

  const syncBabyPhotoState = (idx: number, isRev: boolean, photo?: BabyPhotoItem) => {
    roomSync.broadcast({
      type: 'BABY_PHOTO_UPDATE',
      payload: {
        photoIndex: idx,
        isRevealed: isRev,
        photoData: photo || babyPhotosList[idx % babyPhotosList.length],
      },
    });
  };

  const handleNextBabyPhoto = () => {
    const nextIdx = (babyPhotoIndex + 1) % babyPhotosList.length;
    setBabyPhotoIndex(nextIdx);
    setBabyPhotoRevealed(false);
    resetBuzzer();
    syncBabyPhotoState(nextIdx, false);
  };

  const handlePrevBabyPhoto = () => {
    const prevIdx = (babyPhotoIndex - 1 + babyPhotosList.length) % babyPhotosList.length;
    setBabyPhotoIndex(prevIdx);
    setBabyPhotoRevealed(false);
    resetBuzzer();
    syncBabyPhotoState(prevIdx, false);
  };

  const handleToggleBabyPhotoReveal = () => {
    const nextRev = !babyPhotoRevealed;
    setBabyPhotoRevealed(nextRev);
    syncBabyPhotoState(babyPhotoIndex, nextRev);
  };

  const handleSelectBabyPhotoDirect = (idx: number) => {
    setBabyPhotoIndex(idx);
    setBabyPhotoRevealed(false);
    resetBuzzer();
    syncBabyPhotoState(idx, false);
  };

  // ==========================================================================
  // 🧠 PREGUNTAS TRIVIAL - ESTADO Y HANDLERS
  // ==========================================================================
  const [triviaBank] = useState<TriviaQuestion[]>(OFFICIAL_TRIVIA_QUESTIONS);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaRevealed, setTriviaRevealed] = useState(false);
  const [triviaReboundActive, setTriviaReboundActive] = useState(false);

  const currentTriviaQuestion: TriviaQuestion =
    triviaBank[triviaIndex % triviaBank.length] || OFFICIAL_TRIVIA_QUESTIONS[0];

  const syncTriviaState = (idx: number, isRev: boolean, isRebound: boolean, targetQ?: TriviaQuestion) => {
    roomSync.broadcast({
      type: 'TRIVIA_STATE_UPDATE',
      payload: {
        questionIndex: idx,
        isRevealed: isRev,
        isReboundActive: isRebound,
        questionData: targetQ || triviaBank[idx % triviaBank.length] || currentTriviaQuestion,
      },
    });
  };

  const handleNextTrivia = () => {
    const nextIdx = (triviaIndex + 1) % triviaBank.length;
    setTriviaIndex(nextIdx);
    setTriviaRevealed(false);
    setTriviaReboundActive(false);
    resetBuzzer();
    syncTriviaState(nextIdx, false, false);
  };

  const handlePrevTrivia = () => {
    const prevIdx = (triviaIndex - 1 + triviaBank.length) % triviaBank.length;
    setTriviaIndex(prevIdx);
    setTriviaRevealed(false);
    setTriviaReboundActive(false);
    resetBuzzer();
    syncTriviaState(prevIdx, false, false);
  };

  const handleRandomTrivia = () => {
    const randIdx = Math.floor(Math.random() * triviaBank.length);
    setTriviaIndex(randIdx);
    setTriviaRevealed(false);
    setTriviaReboundActive(false);
    resetBuzzer();
    syncTriviaState(randIdx, false, false);
  };

  const handleToggleTriviaReveal = () => {
    const nextRev = !triviaRevealed;
    setTriviaRevealed(nextRev);
    syncTriviaState(triviaIndex, nextRev, triviaReboundActive);
  };

  const handleValidateTriviaHit = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, 2);
      setRoundHits((prev) => ({
        ...prev,
        [targetTeam.id]: (prev[targetTeam.id] || 0) + 1,
      }));
    }
    setTriviaRevealed(true);
    setTriviaReboundActive(false);
    resetBuzzer();
    syncTriviaState(triviaIndex, true, false);
    soundFX.playVictory();
  };

  const handleValidateTriviaFail = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, -1);
    }
    setTriviaReboundActive(true);
    resetBuzzer();
    syncTriviaState(triviaIndex, triviaRevealed, true);
    soundFX.playFail();
  };

  const handleValidateTriviaReboundHit = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, 1);
      setRoundHits((prev) => ({
        ...prev,
        [targetTeam.id]: (prev[targetTeam.id] || 0) + 1,
      }));
    }
    setTriviaRevealed(true);
    setTriviaReboundActive(false);
    resetBuzzer();
    syncTriviaState(triviaIndex, true, false);
    soundFX.playVictory();
  };

  // ==========================================================================
  // ⚡ 1, 2, 3 ¿YA? - ESTADO Y HANDLERS
  // ==========================================================================
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

    const remaining = teams.filter((t) => t.is_active && !nextEliminated.includes(t.id));
    if (remaining.length === 1) {
      // ¡ÚLTIMO EQUIPO EN PIE GANA!
      const winnerId = remaining[0].id;
      setRoundHits((prev) => ({
        ...prev,
        [winnerId]: (prev[winnerId] || 0) + 1,
      }));
      handleScoreChange(winnerId, 5);
      soundFX.playVictory();
    }

    const nextTeamIdx = udtActiveTeamIndex % (remaining.length || 1);
    setUdtActiveTeamIndex(nextTeamIdx);
    syncUdtState(udtPromptIndex, remaining[nextTeamIdx]?.id, nextEliminated, null, false);
  };

  const handleResetUdtRound = () => {
    setUdtEliminatedTeamIds([]);
    setUdtPromptIndex(0);
    setUdtActiveTeamIndex(0);
    setUdtCountdown(null);
    setUdtIsTimerRunning(false);
    syncUdtState(0, teams.find((t) => t.is_active)?.id, [], null, false);
  };

  // ==========================================================================
  // 🎱 BINGO - ESTADO Y HANDLERS
  // ==========================================================================
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

  // ==========================================================================
  // 🎭 MÍMICA - ESTADO Y HANDLERS
  // ==========================================================================
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
        activeTeamId: selectedTeamCatalog ? teams.find(t => t.team_index === selectedTeamCatalog.index)?.id : undefined,
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
      const secsToStart = (mimicaTimerSeconds === null || mimicaTimerSeconds <= 0) ? 90 : mimicaTimerSeconds;
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


  // ==========================================================================
  // 🎬 ADIVINA LA PELÍCULA - VALIDACIÓN AUTOMÁTICA SEGÚN PISTAS
  // ==========================================================================
  const autoMoviePoints = movieFrameLevel === 1 ? 3 : movieFrameLevel === 2 ? 2 : 1;

  const handleValidateMovieHitAuto = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (!targetTeam) {
      alert('Selecciona un equipo primero');
      return;
    }

    handleScoreChange(targetTeam.id, autoMoviePoints);
    setRoundHits((prev) => ({
      ...prev,
      [targetTeam.id]: (prev[targetTeam.id] || 0) + 1,
    }));
    setMovieRevealed(true);
    if (isLocked) {
      resetBuzzer();
    }
    syncMovieState(movieIndex, movieFrameLevel, true);
    soundFX.playVictory();
  };

  const handleValidateMovieMissAuto = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, -1);
    }
    if (isLocked) {
      resetBuzzer();
    }
    soundFX.playFail();
  };

  const handleValidateBabyPhotoHit = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, 2);
      setRoundHits((prev) => ({
        ...prev,
        [targetTeam.id]: (prev[targetTeam.id] || 0) + 1,
      }));
    }
    setBabyPhotoRevealed(true);
    if (isLocked) resetBuzzer();
    syncBabyPhotoState(babyPhotoIndex, true);
    soundFX.playVictory();
  };

  const handleValidateBabyPhotoMiss = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, -1);
    }
    if (isLocked) resetBuzzer();
    soundFX.playFail();
  };

  const handleValidateMusicHit = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, 2);
      setRoundHits((prev) => ({
        ...prev,
        [targetTeam.id]: (prev[targetTeam.id] || 0) + 1,
      }));
    }
    setMusicRevealed(true);
    setMusicPlaying(true);
    if (isLocked) resetBuzzer();
    syncMusicState(true, true);
    soundFX.playVictory();
  };

  const handleValidateMusicMiss = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, -1);
    }
    setMusicPlaying(true);
    if (isLocked) resetBuzzer();
    syncMusicState(true, false);
    soundFX.playFail();
  };

  // ==========================================================================
  // 🎵 ADIVINA LA CANCIÓN - 100% CONTROL SPOTIFY
  // ==========================================================================
  const [musicBank, setMusicBank] = useState<SongTrack[]>(() => {
    const saved = localStorage.getItem(`party_music_bank_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [currentSongTrack, setCurrentSongTrack] = useState<SongTrack | null>(() => {
    const saved = localStorage.getItem(`party_current_song_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicRevealed, setMusicRevealed] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [musicSearchResults, setMusicSearchResults] = useState<SongTrack[]>([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [spotifyPlaylistInput, setSpotifyPlaylistInput] = useState('');
  const [isImportingPlaylist, setIsImportingPlaylist] = useState(false);
  const [musicSearchMode, setMusicSearchMode] = useState<'search' | 'playlist' | 'bank'>('search');
  // Estados para la gestión y proyección de cartas de poder
  const [activeCardOnScreen, setActiveCardOnScreen] = useState<{
    card: PowerCard;
    teamId?: string;
    teamName: string;
    targetName?: string;
    sensoryLimitation?: string;
    recoveredCard?: PowerCard;
  } | null>(null);

  const [bankChoiceState, setBankChoiceState] = useState<{
    teamId: string;
    teamName: string;
    cards: [PowerCard, PowerCard];
  } | null>(null);

  const [timeTravelModal, setTimeTravelModal] = useState<{
    teamId: string;
    teamName: string;
  } | null>(null);

  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [targetModalState, setTargetModalState] = useState<{
    card: PowerCard;
    teamId: string;
  } | null>(null);
  const [returnCardModal, setReturnCardModal] = useState<{
    card: PowerCard;
  } | null>(null);
  const [testFinishedModal, setTestFinishedModal] = useState<{
    gameTitle: string;
    gameId: string;
    suggestedNextGame?: GameDefinition;
  } | null>(null);
  const [roundHits, setRoundHits] = useState<Record<string, number>>({});
  const [manualPodiumRanks, setManualPodiumRanks] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'live' | 'cards' | 'teams' | 'catalog' | 'soundboard'>('live');

  const syncMusicState = (
    playing: boolean,
    revealed: boolean,
    trackData?: SongTrack | null
  ) => {
    const song = trackData !== undefined ? trackData : currentSongTrack;
    roomSync.broadcast({
      type: 'MUSIC_STATE_UPDATE',
      payload: {
        trackIndex: 0,
        isPlaying: playing,
        isRevealed: revealed,
        trackData: song || undefined,
      },
    });
  };

  // Auto-pausar la música en el Host si alguien pulsa el buzzer en el móvil (solo si aún no está revelada)
  useEffect(() => {
    if (isLocked && musicPlaying && !musicRevealed) {
      setMusicPlaying(false);
      syncMusicState(false, musicRevealed);
    }
  }, [isLocked, musicRevealed]);

  // Temporizador de seguridad: las previews de Spotify duran 30s. Si termina en TV o se pierde señal, auto-restablecer botón a "Reproducir"
  useEffect(() => {
    if (!musicPlaying) return;
    const timer = setTimeout(() => {
      setMusicPlaying(false);
      syncMusicState(false, musicRevealed);
    }, 31000);
    return () => clearTimeout(timer);
  }, [musicPlaying, musicRevealed]);

  const handleTogglePlayMusic = () => {
    const nextPlaying = !musicPlaying;
    setMusicPlaying(nextPlaying);
    syncMusicState(nextPlaying, musicRevealed);
  };

  const handleToggleRevealMusic = () => {
    const nextRevealed = !musicRevealed;
    setMusicRevealed(nextRevealed);
    syncMusicState(musicPlaying, nextRevealed);
  };

  const handleSelectSong = (track: SongTrack, autoPlay: boolean = true) => {
    setCurrentSongTrack(track);
    localStorage.setItem(`party_current_song_${roomCode}`, JSON.stringify(track));
    const exists = musicBank.some((s) => s.id === track.id);
    if (!exists) {
      const updatedBank = [track, ...musicBank];
      setMusicBank(updatedBank);
      localStorage.setItem(`party_music_bank_${roomCode}`, JSON.stringify(updatedBank));
    }
    setMusicPlaying(autoPlay);
    setMusicRevealed(false);
    resetBuzzer();
    syncMusicState(autoPlay, false, track);
  };

  const handlePickRandomSong = () => {
    if (musicBank.length === 0) return;
    const candidates = musicBank.length > 1 && currentSongTrack
      ? musicBank.filter((t) => t.id !== currentSongTrack.id)
      : musicBank;
    const randomTrack = candidates[Math.floor(Math.random() * candidates.length)];
    handleSelectSong(randomTrack, true);
  };

  const handleRemoveTrackFromBank = (trackId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = musicBank.filter((t) => t.id !== trackId);
    setMusicBank(updated);
    localStorage.setItem(`party_music_bank_${roomCode}`, JSON.stringify(updated));
    if (currentSongTrack?.id === trackId) {
      const nextSong = updated[0] || null;
      setCurrentSongTrack(nextSong);
      if (nextSong) {
        localStorage.setItem(`party_current_song_${roomCode}`, JSON.stringify(nextSong));
      } else {
        localStorage.removeItem(`party_current_song_${roomCode}`);
      }
      setMusicPlaying(false);
      setMusicRevealed(false);
      resetBuzzer();
      syncMusicState(false, false, nextSong);
    }
  };

  const handleClearMusicBank = () => {
    if (!confirm('¿Seguro que deseas vaciar las canciones cargadas?')) return;
    setMusicBank([]);
    setCurrentSongTrack(null);
    localStorage.removeItem(`party_music_bank_${roomCode}`);
    localStorage.removeItem(`party_current_song_${roomCode}`);
    setMusicPlaying(false);
    setMusicRevealed(false);
    resetBuzzer();
    syncMusicState(false, false, null);
  };

  const handleSearchMusicOnline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!musicSearchQuery.trim()) return;
    setIsSearchingMusic(true);
    try {
      const results = await searchSpotifyTracks(musicSearchQuery.trim());
      setMusicSearchResults(results);
    } catch (err) {
      console.error('Error al buscar temas en Spotify:', err);
    } finally {
      setIsSearchingMusic(false);
    }
  };

  const handleImportPlaylistFromSpotify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!spotifyPlaylistInput.trim()) return;
    setIsImportingPlaylist(true);
    try {
      const { tracks, playlistName } = await fetchSpotifyPlaylistTracks(spotifyPlaylistInput.trim(), 'Spotify');
      if (tracks.length === 0) {
        alert('No se encontraron canciones con preview disponible en esa playlist de Spotify.');
        return;
      }
      const existingIds = new Set(musicBank.map((s) => s.id));
      const newTracks = tracks.filter((t) => !existingIds.has(t.id));
      const updatedBank = [...newTracks, ...musicBank];
      setMusicBank(updatedBank);
      localStorage.setItem(`party_music_bank_${roomCode}`, JSON.stringify(updatedBank));
      
      if (!currentSongTrack && updatedBank.length > 0) {
        setCurrentSongTrack(updatedBank[0]);
        localStorage.setItem(`party_current_song_${roomCode}`, JSON.stringify(updatedBank[0]));
        syncMusicState(false, false, updatedBank[0]);
      }
      setSpotifyPlaylistInput('');
      setMusicSearchMode('bank');
      alert(`🎉 ¡Se han importado ${newTracks.length} canciones oficiales de Spotify de la playlist "${playlistName}"!`);
    } catch (err: any) {
      alert(`Error al importar playlist de Spotify: ${err.message || err}`);
    } finally {
      setIsImportingPlaylist(false);
    }
  };

  const handleSelectSearchedTrack = (track: SongTrack) => {
    handleSelectSong(track, true);
    setMusicSearchResults([]);
    setMusicSearchQuery('');
  };

  // ==========================================================================
  // 🃏 SISTEMA DE CARTAS DE PODER (ESTADO Y HANDLERS)
  // ==========================================================================
  const [powerCards, setPowerCards] = useState<PowerCardsState>(() => {
    const saved = localStorage.getItem(`party_power_cards_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return createInitialPowerCardsState();
  });

  const [selectedBonusTeam, setSelectedBonusTeam] = useState<string>('random');

  useEffect(() => {
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(powerCards));
  }, [powerCards, roomCode]);

  const handleDealInitialCards = () => {
    const activeTeamIds = activeTeams.map((t) => t.id);
    if (activeTeamIds.length === 0) return;
    const { nextState, dealt } = dealInitialCardsToTeams(powerCards, activeTeamIds);
    if (dealt.length === 0) {
      alert('¡Todos los equipos ya tienen el número máximo permitido (3 cartas)!');
      return;
    }
    setPowerCards(nextState);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });
  };

  const handleDealBonusCard = (chosenTeamId?: string) => {
    const targetId =
      chosenTeamId && chosenTeamId !== 'random'
        ? chosenTeamId
        : activeTeams.length > 0
        ? activeTeams[Math.floor(Math.random() * activeTeams.length)].id
        : null;

    if (!targetId) return;

    // Remontada invisible: A partir de la 5.ª prueba (índice 4+) y solo para puestos 4.º o peor
    const currentGameIndex = GAMES_CATALOG.findIndex((g) => g.id === (room.active_game_id || activeGame.id));
    const sortedTeams = [...activeTeams].sort((a, b) => b.score - a.score);
    const teamRank = sortedTeams.findIndex((t) => t.id === targetId) + 1;
    const isUnderdog = currentGameIndex >= 4 && teamRank >= 4;

    const { nextState, cardId, isFull } = dealCardToSingleTeam(powerCards, targetId, { isUnderdog });
    if (isFull) {
      const teamObj = activeTeams.find((t) => t.id === targetId);
      alert(`¡El equipo ${teamObj?.name || 'elegido'} ya tiene 3 cartas (el máximo permitido)! Debe jugar alguna antes de recibir más.`);
      return;
    }
    if (!cardId) {
      alert('¡El mazo común se ha quedado sin cartas! Se han reciclado los descartes si estaban disponibles.');
      return;
    }
    setPowerCards(nextState);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });
  };

  const handlePlayCardDirectly = (
    sourceTeamId: string,
    cardId: string,
    targetTeamId?: string,
    targetPlayerName?: string,
    targetCardId?: string
  ) => {
    const card = getPowerCardById(cardId);
    const team = activeTeams.find((t) => t.id === sourceTeamId);
    if (!card || !team) return;

    if (card.requiresTarget === 'team' && !targetTeamId) {
      setTargetModalState({ card, teamId: sourceTeamId });
      return;
    }

    if (card.requiresTarget === 'player' && !targetPlayerName) {
      setTargetModalState({ card, teamId: sourceTeamId });
      return;
    }

    // Validación especial para El Ave Fénix (Legendaria): A partir de la 5ª prueba y solo si vas 4º o peor
    if (cardId === 'ave_fenix') {
      const currentGameIndex = GAMES_CATALOG.findIndex((g) => g.id === (room.active_game_id || activeGame.id));
      const sortedTeams = [...activeTeams].sort((a, b) => b.score - a.score);
      const teamRank = sortedTeams.findIndex((t) => t.id === sourceTeamId) + 1;

      if (currentGameIndex >= 0 && currentGameIndex < 4) {
        soundFX.playSound('buzz');
        alert(
          `🔥 ¡EL AVE FÉNIX NO PUEDE DESPEGAR AÚN!\nEsta legendaria solo puede jugarse a partir de la 5.ª prueba (prueba actual: ${currentGameIndex + 1}.ª). La carta vuelve a la mano.`
        );
        return;
      }

      if (teamRank > 0 && teamRank < 4) {
        soundFX.playSound('buzz');
        alert(
          `🔥 ¡EL AVE FÉNIX SOLO AYUDA A LOS CAÍDOS!\nSolo puede jugarse si el equipo va 4.º o peor en la clasificación (puesto actual: ${teamRank}.º con ${team.score} pts). La carta vuelve a la mano.`
        );
        return;
      }
    }

    const targetTeam = targetTeamId ? activeTeams.find((t) => t.id === targetTeamId) : undefined;

    // Determinar equipo objetivo efectivo (si se especificó un jugador, resolver su equipo)
    let effectiveTargetTeamId = targetTeamId;
    if (!effectiveTargetTeamId && targetPlayerName) {
      const pMatch = players.find(
        (p) => p.nickname.toLowerCase().trim() === targetPlayerName.toLowerCase().trim()
      );
      if (pMatch) {
        effectiveTargetTeamId = pMatch.team_id || activeTeams.find((t) => t.team_index === pMatch.team_index)?.id;
      }
    }

    // Comprobar si el equipo objetivo tiene un ESCUDO activo que bloquee cartas dañinas
    const isHarmfulCard = [
      'mal_de_ojo',
      'maldicion_comun',
      'baneo',
      'bomba',
      'cambio_forzoso',
      'caza_lider',
      'robo',
      'la_sentencia',
      'el_cuarto_mono',
      'titiritero',
      'robo_siglo',
      'impuesto_padrino',
    ].includes(cardId);

    const activeShield = effectiveTargetTeamId
      ? powerCards.activeEffects.find((e) => e.cardId === 'escudo' && e.sourceTeamId === effectiveTargetTeamId)
      : undefined;

    if (isHarmfulCard && activeShield) {
      const victimTeam = activeTeams.find((t) => t.id === effectiveTargetTeamId);
      soundFX.playSound('heroic');
      alert(
        `🛡️ ¡ESCUDO ACTIVADO! ${victimTeam?.name || 'El equipo rival'} tenía un Escudo activo que ha bloqueado y anulado la carta "${card.name}". Ambas cartas van al descarte.`
      );

      // Descartar la carta jugada y consumir el escudo
      const stateWithPlayed = executePlayCard(powerCards, sourceTeamId, cardId, effectiveTargetTeamId, targetPlayerName);
      const stateShieldConsumed: PowerCardsState = {
        ...stateWithPlayed,
        activeEffects: stateWithPlayed.activeEffects.filter(
          (e) => e.id !== activeShield.id && e.cardId !== cardId
        ),
        discardPile: [...stateWithPlayed.discardPile, 'escudo'],
      };
      setPowerCards(stateShieldConsumed);
      localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(stateShieldConsumed));
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: stateShieldConsumed });

      const animPayload = {
        type: 'play' as const,
        teamName: team.name,
        teamId: team.id,
        teamColorHex: team.color_hex,
        card,
        targetName: `🛡️ ¡Bloqueado por Escudo de ${victimTeam?.name || 'Rival'}!`,
      };
      roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
      setActiveCardOnScreen(animPayload);
      return;
    }

    let sensoryLimitationText: string | undefined = undefined;
    let recoveredCardObj: PowerCard | undefined = undefined;

    // Caso Especial 1: BANCO DE CARTAS
    if (cardId === 'banco_cartas') {
      const currentGameIndex = GAMES_CATALOG.findIndex((g) => g.id === (room.active_game_id || activeGame.id));
      const sortedTeams = [...activeTeams].sort((a, b) => b.score - a.score);
      const teamRank = sortedTeams.findIndex((t) => t.id === sourceTeamId) + 1;
      const isUnderdog = currentGameIndex >= 4 && teamRank >= 4;

      const { nextState, drawnCards } = executeDrawTwoForBank(powerCards, { isUnderdog });
      if (!drawnCards) {
        alert('¡No hay suficientes cartas en el mazo ni en descartes para el Banco de Cartas!');
        return;
      }
      // Descartar la carta jugada
      const playedState = executePlayCard(nextState, sourceTeamId, cardId);
      setPowerCards(playedState);
      localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(playedState));
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: playedState });

      const c1 = getPowerCardById(drawnCards[0])!;
      const c2 = getPowerCardById(drawnCards[1])!;
      setBankChoiceState({
        teamId: sourceTeamId,
        teamName: team.name,
        cards: [c1, c2],
      });

      const animPayload = {
        type: 'play' as const,
        teamName: team.name,
        teamId: team.id,
        teamColorHex: team.color_hex,
        card,
      };
      roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
      setActiveCardOnScreen(animPayload);
      return;
    }

    // Caso Especial 2: ROBO
    if (cardId === 'robo' && targetTeamId) {
      const { nextState, stolenCardId } = executeStealCard(powerCards, sourceTeamId, targetTeamId);
      if (!stolenCardId) {
        alert(`¡El equipo ${targetTeam?.name || 'rival'} no tiene cartas para robar!`);
        return;
      }
      const finalState = executePlayCard(nextState, sourceTeamId, cardId, targetTeamId);
      setPowerCards(finalState);
      localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(finalState));
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: finalState });

      const animPayload = {
        type: 'play' as const,
        teamName: team.name,
        teamId: team.id,
        teamColorHex: team.color_hex,
        card,
        targetName: targetTeam?.name,
      };
      roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
      setActiveCardOnScreen(animPayload);
      return;
    }

    // Caso Especial 3: INTERCAMBIO DE CARTAS
    if (cardId === 'intercambio_cartas' && targetTeamId) {
      const { nextState, receivedCardId } = executeSwapCard(powerCards, sourceTeamId, targetTeamId, cardId);
      const finalState = executePlayCard(nextState, sourceTeamId, cardId, targetTeamId);
      setPowerCards(finalState);
      localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(finalState));
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: finalState });

      const animPayload = {
        type: 'play' as const,
        teamName: team.name,
        teamId: team.id,
        teamColorHex: team.color_hex,
        card,
        targetName: targetTeam?.name,
      };
      roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
      setActiveCardOnScreen(animPayload);
      return;
    }

    // Caso Especial 4: VIAJE EN EL TIEMPO
    if (cardId === 'viaje_tiempo') {
      if (targetCardId) {
        const stateWithRecovered = executeRecoverDiscardedCard(powerCards, sourceTeamId, targetCardId);
        const finalState = executePlayCard(stateWithRecovered, sourceTeamId, cardId);
        setPowerCards(finalState);
        localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(finalState));
        roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: finalState });
        recoveredCardObj = getPowerCardById(targetCardId);

        const animPayload = {
          type: 'play' as const,
          teamName: team.name,
          teamId: team.id,
          teamColorHex: team.color_hex,
          card,
          recoveredCard: recoveredCardObj,
          targetName: recoveredCardObj ? `Recupera: ${recoveredCardObj.name}` : undefined,
        };
        roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
        setActiveCardOnScreen(animPayload);
        return;
      } else {
        if (powerCards.discardPile.length === 0) {
          alert('¡No hay cartas en la pila de descartes para recuperar!');
          return;
        }
        setTimeTravelModal({ teamId: sourceTeamId, teamName: team.name });
        return;
      }
    }

    // Caso Especial 5: EL CUARTO MONO
    if (cardId === 'el_cuarto_mono') {
      const limitation = getRandomSensoryLimitation();
      sensoryLimitationText = `${limitation.emoji} ${limitation.label}: ${limitation.rule}`;
    }

    // Caso Especial 5.1: EL TITIRITERO (Sabotaje cómico)
    if (cardId === 'titiritero') {
      const puppetRules = [
        '🙃 Jugar de espaldas a la pantalla',
        '🎶 Responder cantando como en un musical',
        '🗣️ Hablar con acento extranjero exagerado',
        '💃 Bailar sin parar durante toda la prueba',
        '🤖 Hablar como robot sin doblar articulaciones',
      ];
      const randomRule = puppetRules[Math.floor(Math.random() * puppetRules.length)];
      sensoryLimitationText = `🎭 ${randomRule}`;
    }

    // Caso Especial 6: MAL DE OJO / MALDICIÓN COMÚN (-2 puntos inmediatos al rival objetivo)
    if (cardId === 'mal_de_ojo' || cardId === 'maldicion_comun') {
      const victimId = targetTeamId || sourceTeamId;
      handleScoreChange(victimId, -2);
    }

    // Caso Especial 7: LA MALDICIÓN ÉPICA (Patata caliente: duplica fallos y se pasa a rival)
    if (cardId === 'la_maldicion') {
      sensoryLimitationText = '☠️ Maldición activa (Fallos restan el DOBLE)';
    }

    // Caso Especial 8: ESCUDO (Protección activa durante la prueba actual)
    if (cardId === 'escudo') {
      sensoryLimitationText = '🛡️ Escudo protector activo en esta prueba';
    }

    // Caso Especial 9: EL AVE FÉNIX (Triplica x3 puntos conseguidos en la prueba)
    if (cardId === 'ave_fenix') {
      sensoryLimitationText = '🔥 Puntos Triplicados (x3)';
    }

    const nextState = executePlayCard(
      powerCards,
      sourceTeamId,
      cardId,
      targetTeamId,
      targetPlayerName,
      sensoryLimitationText
    );
    setPowerCards(nextState);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });

    const animPayload = {
      type: 'play' as const,
      teamName: team.name,
      teamId: team.id,
      teamColorHex: team.color_hex,
      card,
      targetName: targetPlayerName || targetTeam?.name,
      sensoryLimitation: sensoryLimitationText,
    };
    roomSync.broadcast({ type: 'POWER_CARD_ANIMATION', payload: animPayload });
    setActiveCardOnScreen(animPayload);
  };

  const handleDismissCardOnScreen = () => {
    setActiveCardOnScreen(null);
    roomSync.broadcast({ type: 'DISMISS_POWER_CARD_ANIMATION' });
  };

  const handleSelectBankChoice = (chosenCardId: string, rejectedCardId: string) => {
    if (!bankChoiceState) return;
    const nextState = executeChooseBankCard(
      powerCards,
      bankChoiceState.teamId,
      chosenCardId,
      rejectedCardId
    );
    setPowerCards(nextState);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });
    setBankChoiceState(null);
  };

  const handleInitiatePlayCard = (teamId: string, card: PowerCard) => {
    if (card.requiresTarget === 'team' || card.requiresTarget === 'player') {
      setTargetModalState({ card, teamId });
      return;
    }
    if (card.requiresTarget === 'card') {
      const team = activeTeams.find((t) => t.id === teamId);
      setTimeTravelModal({ teamId, teamName: team?.name || 'Equipo' });
      return;
    }
    handlePlayCardDirectly(teamId, card.id);
  };

  const handleRemoveActiveEffect = (effectId: string) => {
    const nextEffects = powerCards.activeEffects.filter((e) => e.id !== effectId);
    const nextState = { ...powerCards, activeEffects: nextEffects };
    setPowerCards(nextState);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });
  };

  const handleResetPowerCards = () => {
    if (!confirm('¿Seguro que quieres reiniciar el mazo de Cartas de Poder y vaciar las manos de todos los equipos?')) return;
    const initial = createInitialPowerCardsState();
    setPowerCards(initial);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(initial));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: initial });
  };

  // Acciones de Gestión de Capitanes
  const handleSetCaptain = (teamId: string, playerId: string) => {
    setPlayers((prev) => {
      // Si el jugador ya era el capitán, deseleccionarlo (quitar capitanía)
      const isAlreadyCaptain = prev.some(
        (p) =>
          (p.team_id === teamId || p.team_index === teams.find((t) => t.id === teamId)?.team_index) &&
          p.id === playerId &&
          p.is_captain
      );
      const targetCaptainId = isAlreadyCaptain ? '' : playerId;

      const updated = prev.map((p) => {
        if (p.team_id === teamId || p.team_index === teams.find((t) => t.id === teamId)?.team_index) {
          return { ...p, is_captain: targetCaptainId ? p.id === targetCaptainId : false };
        }
        return p;
      });
      localStorage.setItem(`party_players_${roomCode}`, JSON.stringify(updated));
      roomSync.broadcast({
        type: 'SET_CAPTAIN',
        payload: { teamId, playerId: targetCaptainId },
      });
      return updated;
    });
  };

  const handlePlaySoundEffect = (soundName: string) => {
    soundFX.playSound(soundName);
    roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: soundName } });
  };

  const handleToggleCaptainDuel = () => {
    const nextActive = !captainDuel?.isActive;
    const nextState: CaptainDuelState = {
      isActive: nextActive,
      title: '⚔️ MINIDUELO DE CAPITANES',
    };
    setCaptainDuel(nextState);
    roomSync.broadcast({
      type: 'CAPTAIN_DUEL_STATE',
      payload: nextState,
    });
    resetBuzzer();
  };

  const handleClearCaptainGambles = (teamId?: string) => {
    if (teamId) {
      setCaptainGambles((prev) => {
        const next = { ...prev };
        delete next[teamId];
        return next;
      });
      roomSync.broadcast({ type: 'CLEAR_CAPTAIN_GAMBLES', payload: { teamId } });
    } else {
      setCaptainGambles({});
      roomSync.broadcast({ type: 'CLEAR_CAPTAIN_GAMBLES' });
    }
  };

  // Guardar en localStorage para persistencia local
  useEffect(() => {
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(room));
  }, [room, roomCode]);

  useEffect(() => {
    localStorage.setItem(`party_teams_${roomCode}`, JSON.stringify(teams));
  }, [teams, roomCode]);

  useEffect(() => {
    localStorage.setItem(`party_players_${roomCode}`, JSON.stringify(players));
  }, [players, roomCode]);

  // Sincronizar automáticamente el equipo seleccionado para puntos con el ganador del buzzer si existe
  useEffect(() => {
    if (isLocked && winner) {
      const matched = teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId);
      if (matched) {
        setSelectedTeamForPoints(matched.id);
      }
    }
  }, [isLocked, winner, teams]);

  // Referencias para que los callbacks de eventos siempre lean el estado actual
  const roomRef = useRef(room);
  useEffect(() => { roomRef.current = room; }, [room]);
  const teamsRef = useRef(teams);
  useEffect(() => { teamsRef.current = teams; }, [teams]);
  const playersRef = useRef(players);
  useEffect(() => { playersRef.current = players; }, [players]);
  const powerCardsRef = useRef(powerCards);
  useEffect(() => { powerCardsRef.current = powerCards; }, [powerCards]);
  const captainDuelRef = useRef(captainDuel);
  useEffect(() => { captainDuelRef.current = captainDuel; }, [captainDuel]);

  // Escuchar eventos de sincronización entrantes
  useEffect(() => {
    roomSync.broadcast({ type: 'REQUEST_PLAYERS_SYNC' });

    const unsubscribe = roomSync.onEvent((event) => {
      if (event.type === 'PLAYER_JOINED') {
        setPlayers((prev) => {
          const exists = prev.some((p) => p.id === event.payload.id);
          const updated = exists
            ? prev.map((p) => (p.id === event.payload.id ? event.payload : p))
            : [...prev, event.payload];
          localStorage.setItem(`party_players_${roomCode}`, JSON.stringify(updated));
          setTimeout(() => {
            roomSync.broadcast({ type: 'PLAYERS_UPDATE', payload: updated });
          }, 30);
          return updated;
        });

        // Enviar estado actual de la sala para sincronizar al jugador reconectado
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
        roomSync.broadcast({ type: 'PLAYERS_UPDATE', payload: playersRef.current });
        if (powerCardsRef.current) {
          roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: powerCardsRef.current });
        }
        if (captainDuelRef.current) {
          roomSync.broadcast({ type: 'CAPTAIN_DUEL_STATE', payload: captainDuelRef.current });
        }
        if (roomRef.current.active_game_id === 'music') {
          syncMusicState(musicPlaying, musicRevealed);
        }
      } else if (event.type === 'PLAYER_UPDATED') {
        setPlayers((prev) => {
          const exists = prev.some((p) => p.id === event.payload.id);
          const updated = exists
            ? prev.map((p) => (p.id === event.payload.id ? event.payload : p))
            : [...prev, event.payload];
          localStorage.setItem(`party_players_${roomCode}`, JSON.stringify(updated));
          setTimeout(() => {
            roomSync.broadcast({ type: 'PLAYERS_UPDATE', payload: updated });
          }, 30);
          return updated;
        });
      } else if (event.type === 'PLAYERS_UPDATE') {
        setPlayers(event.payload);
      } else if (event.type === 'RETURN_TO_LOBBY') {
        setRoom((prev) => ({ ...prev, status: 'lobby' }));
      } else if (event.type === 'SWITCH_GAME') {
        setRoom((prev) => ({
          ...prev,
          status: event.payload.status,
          current_game: event.payload.current_game,
          active_game_id: event.payload.game_id || prev.active_game_id,
        }));
      } else if (event.type === 'ROOM_UPDATE') {
        setRoom((prev) => ({ ...prev, ...event.payload }));
      } else if (event.type === 'TEAMS_UPDATE') {
        setTeams(event.payload);
      } else if (event.type === 'MUSIC_STATE_UPDATE') {
        setMusicPlaying(event.payload.isPlaying);
        if (event.payload.isRevealed !== undefined) {
          setMusicRevealed(event.payload.isRevealed);
        }
        if (event.payload.trackData !== undefined && event.payload.trackData !== null) {
          setCurrentSongTrack(event.payload.trackData);
        }
      } else if (event.type === 'MOVIE_STATE_UPDATE') {
        setMovieIndex(event.payload.movieIndex);
        setMovieFrameLevel(event.payload.frameLevel);
        setMovieRevealed(event.payload.isRevealed);
        if (event.payload.categoryFilter) {
          setMovieCategoryFilter(event.payload.categoryFilter as any);
        }
      } else if (event.type === 'POWER_CARD_PLAY_REQUEST') {
        const { sourceTeamId, sourceTeamName, cardId, targetTeamId, targetTeamName, targetPlayerName, targetCardId } = event.payload;
        handlePlayCardDirectly(sourceTeamId, cardId, targetTeamId, targetPlayerName, targetCardId);
      } else if (event.type === 'JUKEBOX_STATE_SYNC') {
        setJukeboxState(event.payload);
      } else if (event.type === 'PODIUM_PAGE_CHANGE') {
        setPodiumPage(event.payload.page);
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
      } else if (event.type === 'REQUEST_PLAYERS_SYNC') {
        if (powerCardsRef.current) {
          roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: powerCardsRef.current });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomSync]);

  // Carga inicial de Supabase si está disponible
  useEffect(() => {
    if (!isSupabaseConfigured || !roomCode) return;

    async function loadData() {
      const { data: r } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
      if (r) {
        setRoom(r);
        const { data: t } = await supabase.from('teams').select('*').eq('room_id', r.id).order('team_index');
        if (t) setTeams(t);
        const { data: p } = await supabase.from('players').select('*').eq('room_id', r.id);
        if (p) setPlayers(p);
      }
    }
    loadData();
  }, [roomCode]);

  // Acción: Iniciar Presentación oficial del Show
  const handleStartPresentation = () => {
    const updatedRoom: Room = { ...room, status: 'presentation', presentation_slide: 0 };
    setRoom(updatedRoom);
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(updatedRoom));
    roomSync.broadcast({ type: 'PRESENTATION_SLIDE', payload: { slide: 0 } });
    roomSync.broadcast({ type: 'ROOM_UPDATE', payload: { status: 'presentation', presentation_slide: 0 } });
  };

  // Acción: Cambiar diapositiva de presentación (0 = 10 Minijuegos, 1 = Cartas y Rarezas)
  const handleSetPresentationSlide = (slide: number) => {
    const updatedRoom: Room = { ...room, status: 'presentation', presentation_slide: slide };
    setRoom(updatedRoom);
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(updatedRoom));
    roomSync.broadcast({ type: 'PRESENTATION_SLIDE', payload: { slide } });
    roomSync.broadcast({ type: 'ROOM_UPDATE', payload: { status: 'presentation', presentation_slide: slide } });
  };

  // Acción: Limpiar manualmente todos los efectos activos de cartas de poder
  const handleClearAllActiveEffects = () => {
    if (!powerCards || powerCards.activeEffects.length === 0) return;
    const newDiscard = [...powerCards.discardPile];
    powerCards.activeEffects.forEach((eff) => {
      if (!newDiscard.includes(eff.cardId)) newDiscard.push(eff.cardId);
    });
    const updatedCards: PowerCardsState = {
      ...powerCards,
      activeEffects: [],
      discardPile: newDiscard,
    };
    setPowerCards(updatedCards);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(updatedCards));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: updatedCards });
  };

  // Acción: Finalizar Prueba Activa (caduca cartas activas, resetea música y abre veredicto)
  const handleFinishTest = (gameTitle?: string, winnerTeamName?: string) => {
    const activeTitle = gameTitle || activeGame.title;

    // 1. Detener música si estaba reproduciéndose
    if (musicPlaying) {
      setMusicPlaying(false);
      syncMusicState(false, musicRevealed, currentSongTrack);
    }

    // 2. Resetear pulsador
    resetBuzzer();

    // 3. Los efectos activos de cartas se mantienen vigentes para que el anfitrión pueda revisarlos y resolverlos en el modal de veredicto

    // 4. Limpiar apuestas de capitanes
    setCaptainGambles({});
    localStorage.removeItem(`party_captain_gambles_${roomCode}`);
    roomSync.broadcast({ type: 'CLEAR_CAPTAIN_GAMBLES', payload: {} });

    // 5. Emitir evento sincronizado TEST_FINISHED para la TV y jugadores
    roomSync.broadcast({
      type: 'TEST_FINISHED',
      payload: {
        gameTitle: activeTitle,
        winnerTeamName,
      },
    });

    // 6. Encontrar siguiente minijuego en el catálogo de 10
    const currentIndex = GAMES_CATALOG.findIndex((g) => g.id === (room.active_game_id || activeGame.id));
    const nextGame =
      currentIndex >= 0 && currentIndex < GAMES_CATALOG.length - 1
        ? GAMES_CATALOG[currentIndex + 1]
        : undefined;

    // 7. Abrir modal resumen de prueba finalizada para el anfitrión
    setTestFinishedModal({
      gameTitle: activeTitle,
      gameId: room.active_game_id || activeGame.id,
      suggestedNextGame: nextGame,
    });
  };

  // Acción: Volver al Lobby
  const handleReturnToLobby = async () => {
    handleClearAllActiveEffects();
    const updatedRoom: Room = { ...room, status: 'lobby' };
    setRoom(updatedRoom);

    if (musicPlaying) {
      setMusicPlaying(false);
      syncMusicState(false, musicRevealed, currentSongTrack);
    }

    roomSync.broadcast({ type: 'RETURN_TO_LOBBY' });
    roomSync.broadcast({ type: 'JUKEBOX_COMMAND', payload: { action: 'play' } });

    if (isSupabaseConfigured) {
      await supabase.from('rooms').update({ status: 'lobby' }).eq('code', roomCode);
    }
  };

  // Acción: Seleccionar Juego Específico (asigna automáticamente el motor y reglas)
  const handleSelectGame = async (game: GameDefinition) => {
    setRoundHits({});
    setManualPodiumRanks({});
    const updatedRoom: Room = {
      ...room,
      status: 'playing',
      current_game: game.engine,
      active_game_id: game.id,
    };
    setRoom(updatedRoom);
    resetBuzzer();
    setActiveTab('live');

    // Al cambiar o iniciar juego, caducar cualquier efecto activo de cartas anterior
    if (powerCards && powerCards.activeEffects.length > 0) {
      const newDiscard = [...powerCards.discardPile];
      powerCards.activeEffects.forEach((eff) => {
        if (!newDiscard.includes(eff.cardId)) newDiscard.push(eff.cardId);
      });
      const updatedCards: PowerCardsState = {
        ...powerCards,
        activeEffects: [],
        discardPile: newDiscard,
      };
      setPowerCards(updatedCards);
      localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(updatedCards));
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: updatedCards });
    }

    roomSync.broadcast({
      type: 'SWITCH_GAME',
      payload: {
        status: 'playing',
        current_game: game.engine,
        game_id: game.id,
      },
    });

    if (game.id === 'movies') {
      syncMovieState(movieIndex, movieFrameLevel, movieRevealed);
    }
    if (game.id === 'fotos_proyector') {
      syncBabyPhotoState(babyPhotoIndex, babyPhotoRevealed);
    }

    if (isSupabaseConfigured) {
      await supabase.from('rooms').update({
        status: 'playing',
        current_game: game.engine,
      }).eq('code', roomCode);
    }
  };

  // Finalizar velada completa y mostrar The Speakeasy Gazette en la TV
  const handleFinishShowAndShowGazette = async () => {
    const updatedRoom: Room = {
      ...room,
      status: 'podium',
    };
    setRoom(updatedRoom);
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(updatedRoom));
    roomSync.broadcast({
      type: 'ROOM_UPDATE',
      payload: { status: 'podium' },
    });
    roomSync.broadcast({ type: 'JUKEBOX_COMMAND', payload: { action: 'play' } });
    soundFX.playVictory();

    if (isSupabaseConfigured) {
      await supabase.from('rooms').update({
        status: 'podium',
      }).eq('code', roomCode);
    }
  };


  // Modificar puntuación manual con celebración y sincronización a TV
  const handleScoreChange = async (teamId: string, delta: number, silent?: boolean) => {
    let effectiveDelta = delta;

    // EFECTO DOBLE (Carta de Poder): Si el equipo tiene el efecto Doble activo y gana puntos
    const hasDobleActive = powerCardsRef.current?.activeEffects.some(
      (e) => e.sourceTeamId === teamId && e.cardId === 'doble'
    );
    if (hasDobleActive && delta > 0) {
      effectiveDelta = effectiveDelta * 2;
    }

    if (captainGambles[teamId] && delta !== 0) {
      // Si el capitán apostó Doble o Nada:
      // Si acertó (delta > 0), duplica los puntos ganados (x2).
      if (delta > 0) {
        effectiveDelta = effectiveDelta * 2;
      }
      // Consumir y limpiar la apuesta tras aplicar el resultado del turno
      handleClearCaptainGambles(teamId);
    }

    const updated = teams.map((t) =>
      t.id === teamId ? { ...t, score: Math.max(0, t.score + effectiveDelta) } : t
    );
    setTeams(updated);

    roomSync.broadcast({ type: 'TEAMS_UPDATE', payload: updated });

    // Los sonidos y confeti solo deben sonar MIENTRAS se está jugando activamente el juego
    const isActivelyPlaying = room.status === 'playing' && !testFinishedModal;
    const shouldPlaySound = !silent && isActivelyPlaying;

    if (shouldPlaySound) {
      if (effectiveDelta > 0) {
        roomSync.broadcast({ type: 'TRIGGER_CONFETTI', payload: { teamId } });
        soundFX.playSuccess();
        setShowCoinBurst(true);
        setTimeout(() => setShowCoinBurst(false), 2200);
      } else if (effectiveDelta < 0) {
        soundFX.playFail();
      }
    }

    if (isSupabaseConfigured) {
      const targetTeam = teams.find((t) => t.id === teamId);
      if (targetTeam) {
        await supabase
          .from('teams')
          .update({ score: Math.max(0, targetTeam.score + effectiveDelta) })
          .eq('id', teamId);
      }
    }
  };

  /**
   * Devolver una carta a la mano de un equipo (p. ej. si se jugó por error o a destiempo)
   */
  const handleReturnCardToTeam = (
    teamId: string,
    cardId: string,
    options?: {
      removeEffectId?: string;
      restorePoints?: number;
      dismissScreen?: boolean;
    }
  ) => {
    const card = getPowerCardById(cardId);
    if (!card) return;

    // 1. Quitar una instancia de la carta de la pila de descartes
    const discard = [...powerCards.discardPile];
    const discardIdx = discard.lastIndexOf(cardId);
    if (discardIdx !== -1) {
      discard.splice(discardIdx, 1);
    }

    // 2. Añadir la carta de vuelta a la mano del equipo
    const currentHand = powerCards.teamHands[teamId] || [];
    const nextHands = {
      ...powerCards.teamHands,
      [teamId]: [...currentHand, cardId],
    };

    // 3. Limpiar efectos activos asociados si procede
    let nextEffects = [...powerCards.activeEffects];
    if (options?.removeEffectId) {
      nextEffects = nextEffects.filter((e) => e.id !== options.removeEffectId);
    } else {
      // Buscar si hay algún efecto pendiente de esta carta para este equipo
      nextEffects = nextEffects.filter((e) => !(e.cardId === cardId && e.sourceTeamId === teamId));
    }

    const nextPowerCards: PowerCardsState = {
      ...powerCards,
      activeEffects: nextEffects,
      discardPile: discard,
      teamHands: nextHands,
    };

    setPowerCards(nextPowerCards);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextPowerCards));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextPowerCards });

    // 4. Si está proyectándose en la TV, quitarla
    if (options?.dismissScreen !== false && activeCardOnScreen && activeCardOnScreen.card.id === cardId) {
      handleDismissCardOnScreen();
    }

    // 5. Si tenía penalización de puntos asociada, restaurarla
    let pointsToRestore = options?.restorePoints || 0;
    if ((cardId === 'mal_de_ojo' || cardId === 'maldicion_comun') && !options?.restorePoints) {
      pointsToRestore = 2;
    } else if (cardId === 'la_maldicion' && !options?.restorePoints) {
      pointsToRestore = 3;
    }
    if (pointsToRestore > 0) {
      handleScoreChange(teamId, pointsToRestore);
    }

    soundFX.playSound('buzzer');
    const team = activeTeams.find((t) => t.id === teamId);
    alert(`↩ Carta "${card.name}" devuelta a la mano de ${team?.name || 'su equipo'}.${pointsToRestore > 0 ? ` (+${pointsToRestore} pts restaurados)` : ''}`);
  };

  /**
   * Retirar/Descartar una carta de la mano de un equipo (p. ej. si se repartió por error)
   */
  const handleRevokeCardFromTeam = (teamId: string, cardId: string) => {
    const card = getPowerCardById(cardId);
    if (!card) return;

    const currentHand = powerCards.teamHands[teamId] || [];
    const idx = currentHand.indexOf(cardId);
    if (idx === -1) return;

    const nextHand = [...currentHand];
    nextHand.splice(idx, 1);

    const nextPowerCards: PowerCardsState = {
      ...powerCards,
      teamHands: {
        ...powerCards.teamHands,
        [teamId]: nextHand,
      },
      discardPile: [...powerCards.discardPile, cardId],
    };

    setPowerCards(nextPowerCards);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextPowerCards));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextPowerCards });

    const team = activeTeams.find((t) => t.id === teamId);
    alert(`✕ Carta "${card.name}" retirada de la mano de ${team?.name || 'su equipo'} y enviada al descarte.`);
  };

  // Aplicar acción de puntuación específica del juego activo
  const handleApplyScoreAction = (option: ScoringOption) => {
    const targetTeamId = selectedTeamForPoints || (winner ? teams.find(t => t.team_index === winner.teamIndex)?.id : null) || activeTeams[0]?.id;
    if (!targetTeamId) return;

    handleScoreChange(targetTeamId, option.delta);
    if (option.delta > 0) {
      setRoundHits((prev) => ({
        ...prev,
        [targetTeamId]: (prev[targetTeamId] || 0) + 1,
      }));
    }

    // LÓGICA AUTOMÁTICA PARA ADIVINA LA CANCIÓN:
    if (room.active_game_id === 'music') {
      if (option.delta > 0) {
        // 1. ACIERTO: Revelar la canción en la TV
        setMusicRevealed(true);
        setMusicPlaying(true);
        if (isLocked) {
          resetBuzzer();
        }
        syncMusicState(true, true);
      } else {
        // 2. FALLO (o pasa): Reanudar el preview desde donde se pausó para que sigan jugando
        setMusicPlaying(true);
        if (isLocked) {
          resetBuzzer();
        }
        syncMusicState(true, false);
      }
    } else if (room.active_game_id === 'movies') {
      // LÓGICA AUTOMÁTICA PARA ADIVINA LA PELÍCULA (EMOJIS):
      if (option.delta > 0) {
        // 1. ACIERTO: Marcar como resuelta y revelar el título en grande en la TV
        setMovieRevealed(true);
        if (isLocked) {
          resetBuzzer();
        }
        syncMovieState(movieIndex, movieFrameLevel, true);
        soundFX.playVictory();
      } else {
        // 2. FALLO: Resetear el pulsador para dar oportunidad de rebote a otros equipos
        if (isLocked) {
          resetBuzzer();
        }
      }
    } else {
      // Si había un buzzer activo en otros juegos, resetearlo tras emitir veredicto
      if (isLocked) {
        resetBuzzer();
      }
    }
  };

  // Cambiar cantidad de equipos (2 a 6)
  // Cambiar cantidad de equipos (2 a TEAMS_CATALOG.length)
  const handleTeamCountChange = async (newCount: number) => {
    if (newCount < 2 || newCount > TEAMS_CATALOG.length) return;

    const updatedTeams = teams.map((t) => ({ ...t, is_active: t.team_index <= newCount }));
    const updatedRoom = { ...room, active_teams_count: newCount };

    setRoom(updatedRoom);
    setTeams(updatedTeams);

    roomSync.broadcast({ type: 'ROOM_UPDATE', payload: { active_teams_count: newCount } });
    roomSync.broadcast({ type: 'TEAMS_UPDATE', payload: updatedTeams });

    if (isSupabaseConfigured) {
      await supabase.rpc('set_active_teams_count', {
        p_room_id: room.id,
        p_count: newCount,
      });
    }
  };

  const activeTeams = teams.filter((t) => t.is_active);
  const selectedTeamObj = teams.find((t) => t.id === selectedTeamForPoints);
  const selectedTeamCatalog = selectedTeamObj
    ? TEAMS_CATALOG.find((c) => c.index === selectedTeamObj.team_index)
    : null;

  const currentVerdict: TestVerdictCalculation = useMemo(() => {
    if (!testFinishedModal) {
      return {
        gameId: '',
        gameTitle: '',
        results: [],
        consumedEffectIds: [],
      };
    }
    return calculateTestVerdict({
      gameId: testFinishedModal.gameId,
      gameTitle: testFinishedModal.gameTitle,
      teams: activeTeams,
      roundHits,
      manualRanks: manualPodiumRanks,
      activeEffects: powerCards.activeEffects,
    });
  }, [testFinishedModal, activeTeams, roundHits, manualPodiumRanks, powerCards.activeEffects]);

  const handleApplyAutomatedVerdict = () => {
    if (!testFinishedModal || currentVerdict.results.length === 0) return;

    // 1. Sumar puntos finales calculados de la prueba a cada equipo
    const updatedTeams = teams.map((t) => {
      const res = currentVerdict.results.find((r) => r.teamId === t.id);
      if (!res) return t;
      return {
        ...t,
        score: Math.max(0, t.score + res.finalPoints),
      };
    });
    setTeams(updatedTeams);
    localStorage.setItem(`party_teams_${roomCode}`, JSON.stringify(updatedTeams));
    roomSync.broadcast({ type: 'TEAMS_UPDATE', payload: updatedTeams });

    // 2. Archivar y descartar los efectos de cartas resueltos en esta prueba
    if (currentVerdict.consumedEffectIds.length > 0) {
      const nextEffects = powerCards.activeEffects.filter(
        (eff) => !currentVerdict.consumedEffectIds.includes(eff.id)
      );
      const consumedCardIds = powerCards.activeEffects
        .filter((eff) => currentVerdict.consumedEffectIds.includes(eff.id))
        .map((eff) => eff.cardId);
      const nextDiscard = [...powerCards.discardPile, ...consumedCardIds];
      const nextPowerCards: PowerCardsState = {
        ...powerCards,
        activeEffects: nextEffects,
        discardPile: nextDiscard,
      };
      setPowerCards(nextPowerCards);
      localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextPowerCards));
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextPowerCards });
    }

    // 3. Sincronizar veredicto a la TV y jugadores
    roomSync.broadcast({
      type: 'TEST_VERDICT_APPLIED',
      payload: {
        gameTitle: testFinishedModal.gameTitle,
        results: currentVerdict.results,
      },
    });

    // 4. Celebración con sonido y monedas
    soundFX.playVictory();
    setShowCoinBurst(true);
    setTimeout(() => setShowCoinBurst(false), 2500);

    if (isSupabaseConfigured) {
      currentVerdict.results.forEach(async (res) => {
        const tObj = updatedTeams.find((t) => t.id === res.teamId);
        if (tObj) {
          await supabase.from('teams').update({ score: tObj.score }).eq('id', tObj.id);
        }
      });
    }

    // 5. Resetear contadores de aciertos y puestos de la prueba
    setRoundHits({});
    setManualPodiumRanks({});
    setTestFinishedModal(null);
  };

  const renderTeamsScoreboard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {activeTeams.map((team) => {
        const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
        const teamMembers = players.filter((p) => p.team_id === team.id || p.team_index === team.team_index);

        return (
          <div
            key={team.id}
            className={`p-4 rounded-2xl border ${cat.twBorder} bg-slate-900/90 flex flex-col justify-between shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Equipo {team.team_index}</span>
                <span className={`text-base font-black uppercase ${cat.twText}`}>{team.name}</span>
                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                  {teamMembers.length} {teamMembers.length === 1 ? 'jugador' : 'jugadores'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black font-mono text-white">{team.score}</span>
                <span className="text-[10px] text-slate-400 block font-bold">PTS</span>
              </div>
            </div>

            {/* Lista de Miembros con Selector de Capitán */}
            {teamMembers.length > 0 && (
              <div className="my-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 w-full flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>Miembros:</span>
                </span>
                {teamMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSetCaptain(team.id, m.id)}
                    title={m.is_captain ? 'Capitán activo (Clic para desasignar o deshacer capitanía)' : 'Nombrar Capitán a este jugador'}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
                      m.is_captain
                        ? 'bg-amber-400 hover:bg-red-500 hover:text-white text-slate-950 font-black shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Crown className={`w-3 h-3 ${m.is_captain ? 'fill-current' : 'text-slate-400'}`} />
                    <span>{m.nickname}</span>
                    {m.is_captain && <span className="text-[9px] opacity-80 ml-0.5">✕</span>}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-1.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleScoreChange(team.id, 5)}
                className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-black py-2 rounded-xl border border-amber-500/30 active:scale-95"
              >
                +5
              </button>
              <button
                onClick={() => handleScoreChange(team.id, 2)}
                className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-black py-2 rounded-xl border border-emerald-500/30 active:scale-95"
              >
                +2
              </button>
              <button
                onClick={() => handleScoreChange(team.id, 1)}
                className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-black py-2 rounded-xl border border-blue-500/30 active:scale-95"
              >
                +1
              </button>
              <button
                onClick={() => handleScoreChange(team.id, -1)}
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-black py-2 rounded-xl border border-red-500/30 active:scale-95"
              >
                -1
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderActiveEffects = () => {
    if (powerCards.activeEffects.length === 0) return null;
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 p-3 sm:p-4 rounded-2xl space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Efectos de Poder Activos en Esta Prueba:</span>
            <span className="sm:hidden">Efectos Activos ({powerCards.activeEffects.length}):</span>
          </span>
          <button
            onClick={handleClearAllActiveEffects}
            className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow shrink-0"
            title="Caducar y descartar todos los efectos activos inmediatamente"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
            <span className="hidden sm:inline">Limpiar Efectos</span>
            <span className="sm:hidden">Limpiar</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {powerCards.activeEffects.map((eff) => {
            const team = activeTeams.find((t) => t.id === eff.sourceTeamId);
            const targetTeam = eff.targetTeamId ? activeTeams.find((t) => t.id === eff.targetTeamId) : null;
            return (
              <div
                key={eff.id}
                className="bg-slate-950/95 border-2 border-amber-400/50 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs flex flex-wrap items-center gap-1.5 sm:gap-2 shadow-lg"
              >
                <span>{eff.cardEmoji}</span>
                <strong className="text-white font-bold">{eff.cardName}</strong>
                <span className="text-amber-300 font-bold">({team?.name || eff.sourceTeamName})</span>
                {targetTeam && (
                  <span className="text-red-300 font-bold flex items-center gap-0.5">
                    <span>➔ 🎯</span>
                    <span>{targetTeam.name}</span>
                  </span>
                )}
                {eff.targetPlayerName && (
                  <span className="text-red-300 font-bold flex items-center gap-0.5">
                    <span>➔ 👤</span>
                    <span>{eff.targetPlayerName}</span>
                  </span>
                )}
                {eff.sensoryLimitation && (
                  <span className="bg-purple-950/80 border border-purple-400/50 text-purple-200 px-2 py-0.5 rounded text-[11px] font-bold">
                    {eff.sensoryLimitation}
                  </span>
                )}

                {/* BOTONES INTERACTIVOS SEGÚN LA CARTA */}
                {eff.cardId === 'bomba' && eff.targetTeamId && (
                  <button
                    onClick={() => {
                      handleScoreChange(eff.targetTeamId!, -3);
                      handleRemoveActiveEffect(eff.id);
                    }}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[10px] shadow"
                  >
                    💣 Detonar (-3 pts)
                  </button>
                )}

                {eff.cardId === 'objetivo' && (
                  <button
                    onClick={() => {
                      handleScoreChange(eff.sourceTeamId, 2);
                      handleRemoveActiveEffect(eff.id);
                    }}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] shadow"
                  >
                    🎯 Cobrar (+2 pts)
                  </button>
                )}

                {eff.cardId === 'caza_lider' && (
                  <button
                    onClick={() => {
                      if (eff.targetTeamId) {
                        handleScoreChange(eff.targetTeamId, -3);
                      }
                      handleScoreChange(eff.sourceTeamId, 3);
                      handleRemoveActiveEffect(eff.id);
                    }}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[10px] shadow"
                  >
                    👑 Destronar (-3 rival / +3 tú)
                  </button>
                )}

                {eff.cardId === 'ruleta_rusa' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        handleScoreChange(eff.sourceTeamId, 6);
                        handleRemoveActiveEffect(eff.id);
                      }}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] shadow"
                    >
                      +6 pts (1º-2º)
                    </button>
                    <button
                      onClick={() => {
                        handleScoreChange(eff.sourceTeamId, -4);
                        handleRemoveActiveEffect(eff.id);
                      }}
                      className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[10px] shadow"
                    >
                      -4 pts (3º-5º)
                    </button>
                  </div>
                )}

                {eff.cardId === 'la_sentencia' && eff.targetTeamId && (
                  <button
                    onClick={() => {
                      handleScoreChange(eff.targetTeamId!, -4);
                      handleRemoveActiveEffect(eff.id);
                    }}
                    className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold text-[10px] shadow"
                  >
                    💀 Ejecutar (-4 pts)
                  </button>
                )}

                {eff.cardId === 'golpe_maestro' && (
                  <button
                    onClick={() => {
                      const otherTeams = activeTeams.filter((t) => t.id !== eff.sourceTeamId);
                      let stolenTotal = 0;
                      const updated = teams.map((t) => {
                        if (t.id === eff.sourceTeamId) return t;
                        if (t.is_active && t.score > 0) {
                          stolenTotal += 1;
                          return { ...t, score: Math.max(0, t.score - 1) };
                        }
                        return t;
                      });
                      const finalTeams = updated.map((t) =>
                        t.id === eff.sourceTeamId ? { ...t, score: t.score + stolenTotal } : t
                      );
                      setTeams(finalTeams);
                      roomSync.broadcast({ type: 'TEAMS_UPDATE', payload: finalTeams });
                      handleRemoveActiveEffect(eff.id);
                      alert(`💥 ¡Golpe Maestro! ${stolenTotal} pts recolectados de los rivales.`);
                    }}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-black text-[10px] shadow"
                  >
                    💥 Golpe Maestro (+1 de c/u)
                  </button>
                )}

                {eff.cardId === 'robo_siglo' && eff.targetTeamId && (
                  <button
                    onClick={() => {
                      const tTeam = teams.find((t) => t.id === eff.targetTeamId);
                      const pts = prompt(`¿Cuántos puntos ganó ${tTeam?.name || 'el rival'} en esta prueba? (Se robará el 50%)`, '4');
                      const num = parseInt(pts || '0', 10);
                      if (num > 0) {
                        const steal = Math.round(num * 0.5);
                        handleScoreChange(eff.targetTeamId!, -steal);
                        handleScoreChange(eff.sourceTeamId, steal);
                        handleRemoveActiveEffect(eff.id);
                        alert(`👑 ¡Robo del Siglo! Has transferido ${steal} pts a tu equipo.`);
                      }
                    }}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-black text-[10px] shadow"
                  >
                    👑 Robo 50%
                  </button>
                )}

                {eff.cardId === 'impuesto_padrino' && (
                  <button
                    onClick={() => {
                      const pts = prompt(
                        `¿Cuántos puntos consiguió el equipo vencedor en 1.er puesto?\n(Se transferirá el 50% al equipo ${eff.sourceTeamName})`,
                        '4'
                      );
                      const num = parseInt(pts || '0', 10);
                      if (num > 0) {
                        const half = Math.round(num * 0.5);
                        handleScoreChange(eff.sourceTeamId, half);
                        handleRemoveActiveEffect(eff.id);
                        alert(`🎩 ¡Impuesto del Padrino cobrado! +${half} pts transferidos a ${eff.sourceTeamName}.`);
                      }
                    }}
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-black text-[10px] shadow"
                  >
                    🎩 Impuesto 50%
                  </button>
                )}

                {eff.cardId === 'ave_fenix' && (
                  <button
                    onClick={() => {
                      const pts = prompt(
                        `¿Cuántos puntos base consiguió ${eff.sourceTeamName} en esta prueba?\n(Se sumará el x2 adicional para alcanzar el triple x3)`,
                        '3'
                      );
                      const num = parseInt(pts || '0', 10);
                      if (num > 0) {
                        const bonus = num * 2;
                        handleScoreChange(eff.sourceTeamId, bonus);
                        handleRemoveActiveEffect(eff.id);
                        alert(`🔥 ¡EL AVE FÉNIX RESURGE! +${bonus} pts sumados a ${eff.sourceTeamName} (Total x3 = ${num * 3} pts).`);
                      }
                    }}
                    className="px-2 py-1 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white rounded-lg font-black text-[10px] shadow"
                  >
                    🔥 Triplicar x3
                  </button>
                )}

                <button
                  onClick={() => {
                    handleReturnCardToTeam(eff.sourceTeamId, eff.cardId, { removeEffectId: eff.id });
                  }}
                  className="ml-1 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-[10px] font-bold rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow"
                  title="Anular efecto y devolver esta carta a la mano de su equipo"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Devolver</span>
                </button>

                <button
                  onClick={() => handleRemoveActiveEffect(eff.id)}
                  className="ml-1 text-slate-500 hover:text-red-400 text-xs font-bold p-1 rounded"
                  title="Quitar efecto sin devolver carta"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSoundboard = () => (
    <div className="space-y-4">
      {/* HILO MUSICAL SPEAKEASY CON CONTROL DJ REMOTO (SUENA EN LA TV) */}
      <SpeakeasyJukeboxWidget
        variant="host"
        externalState={jukeboxState}
        onCommand={(cmd) => {
          roomSync.broadcast({
            type: 'JUKEBOX_COMMAND',
            payload: cmd,
          });
        }}
      />

      <section className="bg-slate-900/90 border-2 border-slate-800 hover:border-amber-400/50 transition-all rounded-3xl p-5 shadow-2xl space-y-3 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Efectos de Sonido en Vivo (Soundboard)
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                Sincronizado con TV
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Dispara sonidos al instante para ambientar respuestas, fallos, suspense o victorias.
            </p>
          </div>
        </div>
        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
          Audio WebAPI • Suena en Host y TV
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <button
          onClick={() => handlePlaySoundEffect('fail')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-red-400"
          title="Sonido de fallo o respuesta incorrecta"
        >
          <span className="text-2xl">❌</span>
          <span className="text-center leading-tight">Fallo / Error</span>
        </button>

        <button
          onClick={() => handlePlaySoundEffect('victory')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-amber-400"
          title="Fanfarria triunfal de victoria"
        >
          <span className="text-2xl">🏆</span>
          <span className="text-center leading-tight">¡Victoria!</span>
        </button>

        <button
          onClick={() => handlePlaySoundEffect('success')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-emerald-400"
          title="Acierto correcto"
        >
          <span className="text-2xl">✅</span>
          <span className="text-center leading-tight">Acierto</span>
        </button>

        <button
          onClick={() => handlePlaySoundEffect('drumroll')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-purple-400"
          title="Redoble de tambor con platillazo"
        >
          <span className="text-2xl">🥁</span>
          <span className="text-center leading-tight">Redoble</span>
        </button>

        <button
          onClick={() => handlePlaySoundEffect('applause')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-blue-400"
          title="Aplausos del público"
        >
          <span className="text-2xl">👏</span>
          <span className="text-center leading-tight">Aplausos</span>
        </button>

        <button
          onClick={() => handlePlaySoundEffect('airhorn')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/40 text-orange-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-orange-400"
          title="Bocinazo DJ / Fiesta"
        >
          <span className="text-2xl">📢</span>
          <span className="text-center leading-tight">Airhorn</span>
        </button>

        <button
          onClick={() => handlePlaySoundEffect('suspense')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-indigo-400"
          title="Golpe de misterio y tensión"
        >
          <span className="text-2xl">😨</span>
          <span className="text-center leading-tight">Tensión</span>
        </button>

        <button
          onClick={() => handlePlaySoundEffect('buzzer')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-500/40 text-yellow-300 font-black text-xs gap-1.5 active:scale-95 transition-all shadow-md hover:border-yellow-400"
          title="Sonido de pulsador arcade"
        >
          <span className="text-2xl">⚡</span>
          <span className="text-center leading-tight">Pulsador</span>
        </button>
      </div>

      {/* SECCIÓN TEMÁTICA: EFECTOS 1930s SPEAKEASY & CASINO */}
      <div className="pt-4 border-t border-amber-500/20 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎷</span>
          <div>
            <h4 className="text-xs font-broadway uppercase tracking-wider text-gold-gradient">
              Efectos Temáticos Speakeasy & Casino 1930s
            </h4>
            <p className="text-[11px] text-amber-200/70 font-vintage">
              Sonidos táctiles procedimentales de naipes, fichas de casino y metales de big band.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => handlePlaySoundEffect('card_snap')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#160e08] hover:bg-[#22150c] border border-amber-500/40 text-amber-200 font-vintage font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
            title="Chasquido nítido de naipe sobre tapete verde"
          >
            <span className="text-2xl">🎴</span>
            <span className="text-center leading-tight">Chasquido Carta</span>
          </button>

          <button
            onClick={() => handlePlaySoundEffect('card_slam')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-amber-950/70 to-[#120b06] hover:brightness-110 border border-[#d4af37] text-amber-300 font-broadway font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
            title="Impacto cinemático de naipe con resplandor mágico"
          >
            <span className="text-2xl animate-pulse">💥</span>
            <span className="text-center leading-tight">Impacto Naipe</span>
          </button>

          <button
            onClick={() => handlePlaySoundEffect('chips')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#160e08] hover:bg-[#22150c] border border-amber-500/40 text-amber-200 font-vintage font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
            title="Tintineo de fichas de casino de arcilla"
          >
            <span className="text-2xl">🪙</span>
            <span className="text-center leading-tight">Fichas Casino</span>
          </button>

          <button
            onClick={() => handlePlaySoundEffect('deco_bell')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#160e08] hover:bg-[#22150c] border border-amber-500/40 text-amber-200 font-vintage font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
            title="Campana de conserje / boxeo 1930s"
          >
            <span className="text-2xl">🛎️</span>
            <span className="text-center leading-tight">Campana Déco</span>
          </button>

          <button
            onClick={() => handlePlaySoundEffect('speakeasy_brass')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#160e08] hover:bg-[#22150c] border border-amber-500/40 text-amber-200 font-vintage font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
            title="Fanfarria de metales Big Band años 30"
          >
            <span className="text-2xl">🎺</span>
            <span className="text-center leading-tight">Brass 1930s</span>
          </button>

          <button
            onClick={() => handlePlaySoundEffect('wah_wah')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#160e08] hover:bg-[#22150c] border border-amber-500/40 text-amber-200 font-vintage font-bold text-xs gap-1 active:scale-95 transition-all shadow-deco-gold"
            title="Trompeta cómica Rubber-Hose Wah-Wah"
          >
            <span className="text-2xl">🤡</span>
            <span className="text-center leading-tight">Wah-Wah Fail</span>
          </button>
        </div>
      </div>
    </section>
  </div>
  );

  const renderQuickSoundStrip = () => (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-2 flex items-center justify-between gap-1 shadow-md">
      <div className="flex items-center gap-1 pl-1 text-[11px] font-bold text-slate-400 whitespace-nowrap">
        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Sonidos:</span>
      </div>
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={() => handlePlaySoundEffect('fail')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-500/40 text-red-300 font-black text-xs active:scale-95 transition-all flex items-center gap-1"
          title="Fallo / Error"
        >
          <span className="text-base sm:text-sm">❌</span>
          <span className="hidden sm:inline">Fallo</span>
        </button>
        <button
          onClick={() => handlePlaySoundEffect('success')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 font-black text-xs active:scale-95 transition-all flex items-center gap-1"
          title="Acierto"
        >
          <span className="text-base sm:text-sm">🎯</span>
          <span className="hidden sm:inline">Acierto</span>
        </button>
        <button
          onClick={() => handlePlaySoundEffect('victory')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300 font-black text-xs active:scale-95 transition-all flex items-center gap-1"
          title="Victoria"
        >
          <span className="text-base sm:text-sm">🏆</span>
          <span className="hidden sm:inline">Victoria</span>
        </button>
        <button
          onClick={() => handlePlaySoundEffect('drumroll')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 font-black text-xs active:scale-95 transition-all flex items-center gap-1"
          title="Redoble"
        >
          <span className="text-base sm:text-sm">🥁</span>
          <span className="hidden sm:inline">Redoble</span>
        </button>
        <button
          onClick={() => handlePlaySoundEffect('applause')}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/70 border border-blue-500/40 text-blue-300 font-black text-xs active:scale-95 transition-all flex items-center gap-1"
          title="Aplausos"
        >
          <span className="text-base sm:text-sm">👏</span>
          <span className="hidden sm:inline">Aplausos</span>
        </button>
      </div>
      <button
        onClick={() => setActiveTab('soundboard')}
        className="text-[11px] text-slate-400 hover:text-amber-400 font-bold px-1.5 py-1 transition-colors whitespace-nowrap"
        title="Ver todos los efectos"
      >
        <span className="hidden sm:inline">Todos</span>
        <span>→</span>
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#08080c] text-white font-sans p-4 md:p-6 max-w-4xl mx-auto space-y-6 select-none relative">
      {/* Celebración con fuente física balística de fichas y monedas */}
      <CoinBurstCelebration active={showCoinBurst} onComplete={() => setShowCoinBurst(false)} />

      {/* HEADER ANFITRIÓN (CONSOLA DE RADIO / PIT BOSS 1930s) */}
      <header className="flex items-center justify-between border-b border-[#d4af37]/35 pb-3 gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-broadway uppercase tracking-wider text-gold-gradient truncate">
              Sala {roomCode}
            </h1>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-broadway uppercase tracking-wider ${
              room.status === 'lobby'
                ? 'bg-amber-500/15 text-amber-300 border border-[#d4af37]/40'
                : room.status === 'presentation'
                ? 'bg-gold-gradient text-slate-950 font-black'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {room.status === 'lobby' ? 'Lobby' : room.status === 'presentation' ? 'Presentación' : 'En Juego'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <Link
            to={`/room/${roomCode}/tv`}
            target="_blank"
            className="bg-[#0c0c14] hover:bg-[#14141e] border-2 border-[#d4af37]/40 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-vintage font-bold text-amber-200 flex items-center gap-1.5 transition-all shadow-sm"
            title="Abrir pantalla TV"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-broadway text-xs">Abrir TV</span>
            <span className="sm:hidden font-broadway text-xs">TV</span>
          </Link>
          <div className="bg-[#0c0c14] border border-[#d4af37]/30 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-vintage font-bold flex items-center gap-1.5 text-amber-300 shadow-sm">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-broadway">{players.length}</span>
            <span className="hidden sm:inline font-vintage">conectados</span>
          </div>
        </div>
      </header>

      {/* BARRA DE ESTADO GLOBAL Y BOTÓN PRINCIPAL */}
      <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-deco-gold ${
        room.status === 'playing'
          ? 'bg-[#0c0c14]/95 border-[#d4af37]/60'
          : room.status === 'presentation'
          ? 'bg-[#120f18]/95 border-[#d4af37]/60'
          : 'bg-[#0c0c14]/90 border-[#d4af37]/35'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          <div className="text-2xl sm:text-3xl p-1.5 sm:p-2 bg-[#14141e] rounded-xl sm:rounded-2xl border border-[#d4af37]/30 flex-shrink-0 shadow-inner">
            {room.status === 'presentation'
              ? '✨'
              : room.status === 'podium' || room.status === 'ended'
              ? '🏆'
              : activeGame.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] uppercase font-vintage font-bold tracking-widest text-amber-300 block truncate">
              {room.status === 'lobby'
                ? 'SALA EN ESPERA'
                : room.status === 'presentation'
                ? 'PRESENTACIÓN EN TV'
                : room.status === 'podium' || room.status === 'ended'
                ? 'CEREMONIA DE CLAUSURA'
                : activeGame.category}
            </span>
            <span className="text-sm sm:text-base font-broadway uppercase tracking-wide text-white block truncate">
              {room.status === 'lobby'
                ? 'Lobby de Convocatoria'
                : room.status === 'presentation'
                ? ((room.presentation_slide || 0) === 1 ? 'Cartas y Rarezas' : '10 Minijuegos Show')
                : room.status === 'podium' || room.status === 'ended'
                ? 'The Speakeasy Gazette'
                : activeGame.title}
            </span>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN SEGÚN ESTADO */}
        <div className="w-full sm:w-auto flex-shrink-0">
          {room.status === 'playing' ? (
            <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
              <button
                onClick={() => handleFinishTest()}
                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-broadway text-xs uppercase px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 active:scale-95 transition-all border border-red-400/40"
                title="Finalizar prueba actual, limpiar efectos y abrir veredicto"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Finalizar Prueba</span>
                <span className="sm:hidden">Finalizar</span>
              </button>

              <button
                onClick={handleFinishShowAndShowGazette}
                className="bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-xs uppercase px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 shadow-deco-gold active:scale-95 transition-all border border-[#f5eedb]/40"
                title="Proyectar portada de The Speakeasy Gazette y podio final en la TV"
              >
                <Trophy className="w-3.5 h-3.5 fill-slate-950 text-slate-950 shrink-0" />
                <span className="hidden sm:inline">Fin de Velada</span>
                <span className="sm:hidden">Periódico</span>
              </button>

              <button
                onClick={handleReturnToLobby}
                className="bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/40 text-amber-200 font-broadway text-xs uppercase px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1 shadow active:scale-95 transition-all"
                title="Volver al Lobby"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden md:inline">Lobby</span>
                <span className="md:hidden">Salir</span>
              </button>
            </div>
          ) : room.status === 'podium' || room.status === 'ended' ? (
            <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
              <button
                onClick={() => {
                  setPodiumPage('podium');
                  roomSync.broadcast({ type: 'PODIUM_PAGE_CHANGE', payload: { page: 'podium' } });
                }}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl font-broadway text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                  podiumPage === 'podium'
                    ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold border border-[#f5eedb]/40'
                    : 'bg-[#14141e] text-amber-200/80 border border-[#d4af37]/30 hover:text-white'
                }`}
                title="Mostrar Gran Campeón en la TV"
              >
                <Crown className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">🏆 Ver Campeón</span>
                <span className="sm:hidden">Campeón</span>
              </button>
              <button
                onClick={() => {
                  setPodiumPage('medals');
                  roomSync.broadcast({ type: 'PODIUM_PAGE_CHANGE', payload: { page: 'medals' } });
                }}
                className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl font-broadway text-xs uppercase flex items-center justify-center gap-1.5 transition-all ${
                  podiumPage === 'medals'
                    ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold border border-[#f5eedb]/40'
                    : 'bg-[#14141e] text-amber-200/80 border border-[#d4af37]/30 hover:text-white'
                }`}
                title="Mostrar Medallas y Salón de la Infamia en la TV"
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">🎖️ Ver Medallas</span>
                <span className="sm:hidden">Medallas</span>
              </button>
              <button
                onClick={handleReturnToLobby}
                className="bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/40 text-amber-200 font-broadway text-xs uppercase px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl flex items-center justify-center gap-1 shadow active:scale-95 transition-all"
                title="Volver al Lobby de convocatoria"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Salón</span>
              </button>
            </div>
          ) : room.status === 'presentation' ? (
            <>
              <button
                onClick={() => handleSelectGame(GAMES_CATALOG[0])}
                className="bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-xs uppercase px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 shadow-deco-gold active:scale-95 transition-all border border-[#f5eedb]/40"
                title="Iniciar Prueba 1: Adivina la Canción"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span className="hidden sm:inline">Empezar Juego 1</span>
                <span className="sm:hidden">Juego 1</span>
              </button>

              <button
                onClick={handleReturnToLobby}
                className="bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/40 text-amber-200 font-broadway text-xs uppercase p-2 sm:px-3 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center gap-1 shadow active:scale-95 transition-all"
                title="Volver al Lobby"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Lobby</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectGame(GAMES_CATALOG[0])}
                className="bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-xs uppercase px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 shadow-deco-gold active:scale-95 transition-all border border-[#f5eedb]/40"
                title="Iniciar la velada con el Juego 1"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Iniciar Show</span>
              </button>

              <button
                onClick={handleFinishShowAndShowGazette}
                className="bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/40 text-amber-300 hover:text-white font-broadway text-xs uppercase px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center gap-1.5 shadow active:scale-95 transition-all"
                title="Ver portada del periódico The Speakeasy Gazette"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Ver Periódico</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MANDO REMOTO DE LA PRESENTACIÓN EN MÓVIL (CUANDO STATUS ES PRESENTATION) */}
      {room.status === 'presentation' && (
        <div className="p-3 sm:p-4 bg-[#0c0c14]/90 border-2 border-[#d4af37]/45 rounded-2xl sm:rounded-3xl space-y-3 shadow-deco-gold">
          <div className="flex items-center justify-between">
            <span className="text-xs font-broadway uppercase tracking-wider text-gold-gradient flex items-center gap-1.5">
              <span>📽️</span> Mando de Diapositivas en TV:
            </span>
            <span className="text-[11px] font-vintage text-amber-200/70">
              Diapositiva {(room.presentation_slide || 0) + 1} de 2
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSetPresentationSlide(0)}
              className={`p-2.5 sm:p-3 rounded-xl border text-xs font-broadway uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                (room.presentation_slide || 0) === 0
                  ? 'bg-gold-gradient text-slate-950 border-[#f5eedb] shadow-deco-gold font-black'
                  : 'bg-[#14141e] text-amber-200/70 border-[#d4af37]/30 hover:bg-[#1a1a28]'
              }`}
            >
              <span>🏆</span>
              <span className="truncate">1. Los 10 Minijuegos</span>
            </button>
            <button
              onClick={() => handleSetPresentationSlide(1)}
              className={`p-2.5 sm:p-3 rounded-xl border text-xs font-broadway uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                (room.presentation_slide || 0) === 1
                  ? 'bg-gold-gradient text-slate-950 border-[#f5eedb] shadow-deco-gold font-black'
                  : 'bg-[#14141e] text-amber-200/70 border-[#d4af37]/30 hover:bg-[#1a1a28]'
              }`}
            >
              <span>🃏</span>
              <span className="truncate">2. Cartas y Rarezas</span>
            </button>
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGACIÓN POR PESTAÑAS (TABS DEL ANFITRIÓN: 5 COLUMNAS EN MÓVIL) */}
      <nav className="sticky top-2 z-30 grid grid-cols-5 gap-1 p-1 bg-[#0c0c14]/95 border-2 border-[#d4af37]/45 rounded-2xl shadow-deco-gold backdrop-blur-xl">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-broadway text-[10px] sm:text-xs uppercase tracking-wider transition-all active:scale-95 ${
            activeTab === 'live'
              ? 'bg-gold-gradient text-slate-950 shadow-md font-black'
              : 'bg-[#14141e]/80 hover:bg-[#1c1c2b] text-amber-200/70 hover:text-white border border-[#d4af37]/20 font-medium'
          }`}
          title="Consola en directo"
        >
          <span className="text-base sm:text-sm">🎮</span>
          <span className="truncate">Directo</span>
          {room.status === 'playing' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-broadway text-[10px] sm:text-xs uppercase tracking-wider transition-all active:scale-95 relative ${
            activeTab === 'cards'
              ? 'bg-gold-gradient text-slate-950 shadow-md font-black'
              : 'bg-[#14141e]/80 hover:bg-[#1c1c2b] text-amber-200/70 hover:text-white border border-[#d4af37]/20 font-medium'
          }`}
          title="Cartas de poder"
        >
          <span className="text-base sm:text-sm">🃏</span>
          <span className="truncate">Cartas</span>
          {powerCards.activeEffects.length > 0 && (
            <span className="text-[9px] bg-slate-950 text-amber-300 border border-amber-400 px-1 rounded-full font-black">
              {powerCards.activeEffects.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all active:scale-95 ${
            activeTab === 'teams'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50'
          }`}
          title="Equipos y jugadores"
        >
          <span className="text-base sm:text-sm">👥</span>
          <span className="truncate">Equipos</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all active:scale-95 ${
            activeTab === 'catalog'
              ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50'
          }`}
          title="Catálogo de juegos"
        >
          <span className="text-base sm:text-sm">🎲</span>
          <span className="truncate">Juegos</span>
        </button>

        <button
          onClick={() => setActiveTab('soundboard')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all active:scale-95 ${
            activeTab === 'soundboard'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50'
          }`}
          title="Sonidos"
        >
          <span className="text-base sm:text-sm">🔊</span>
          <span className="truncate">Sonidos</span>
        </button>
      </nav>

      {/* PESTAÑA: EN DIRECTO (ARBITRAJE, MINISOUNDBOARD, EFECTOS Y MARCADOR RÁPIDO) */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* TIRA RÁPIDA DE SONIDOS */}
          {renderQuickSoundStrip()}

          {/* SECCIÓN DINÁMICA: CONSOLA DE ARBITRAJE DEL JUEGO ACTIVO */}
          {room.status === 'playing' ? (
            <section className="bg-slate-900/90 border-2 border-amber-400/40 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest flex items-center gap-1.5 flex-wrap">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">MESA DE PUNTUACIÓN</span>
                <span className="sm:hidden">PUNTOS</span>
                <span className="bg-amber-500/20 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold normal-case">
                  {activeGame.participantsLabel}
                </span>
              </span>
              <h2 className="text-lg sm:text-xl font-black">{activeGame.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">{activeGame.participantsDescription}</p>
            </div>

            {/* Selector de equipo al que asignar puntos */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-400 font-bold whitespace-nowrap flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Asignar a:</span>
              </span>
              {activeTeams.map((team) => {
                const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
                const isSelected = selectedTeamForPoints === team.id;
                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamForPoints(team.id)}
                    className={`px-2.5 py-1.5 sm:px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? `${cat?.twBg} ${cat?.twContrastText || 'text-slate-950'} shadow-md scale-105 ${cat?.index === 5 ? 'border border-zinc-400' : ''}`
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? (cat?.twContrastText === 'text-white' ? 'bg-white' : 'bg-slate-950') : cat?.twBg} ${cat?.index === 5 && !isSelected ? 'border border-zinc-500' : ''}`} />
                    <span>{team.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTROL DEL SISTEMA DE CAPITANES: MINIDUELO Y APUESTAS */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Miniduelo <span className="hidden sm:inline">de Capitanes</span>
                  </span>
                  {captainDuel?.isActive && (
                    <span className="bg-red-500/25 border border-red-500/50 text-red-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                      <Swords className="w-3 h-3" />
                      <span className="hidden sm:inline">DUELO ACTIVO EN TV & MÓVILES</span>
                      <span className="sm:hidden">ACTIVO</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
                  {captainDuel?.isActive
                    ? '¡Atención! Solo los capitanes 👑 tienen el pulsador habilitado. El resto de jugadores tienen el buzzer bloqueado.'
                    : 'Activa un desempate o duelo rápido donde solo pueden pulsar los capitanes de cada equipo.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleCaptainDuel}
              className={`w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md whitespace-nowrap ${
                captainDuel?.isActive
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>{captainDuel?.isActive ? 'Terminar Duelo' : 'Iniciar Duelo'}</span>
            </button>
          </div>

          {/* APUESTAS DOBLE O NADA ACTIVAS DE LOS CAPITANES */}
          {Object.values(captainGambles).length > 0 && (
            <div className="p-3.5 bg-amber-500/15 border border-amber-400/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0 animate-pulse" />
                <div>
                  <span className="text-xs font-black text-amber-300 uppercase block tracking-wider">
                    ⭐ Apuesta Doble o Nada del Capitán en Curso:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.values(captainGambles).map((g) => (
                      <span
                        key={g.teamId}
                        className="text-xs text-white font-bold bg-slate-900/90 px-3 py-1 rounded-xl border border-amber-400/40 flex items-center gap-1.5"
                      >
                        <span>👑 {g.playerName}</span>
                        <span className="text-amber-400">({g.teamName})</span>
                        <strong className="text-emerald-400 font-mono">x2 PUNTOS</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleClearCaptainGambles()}
                className="text-xs text-slate-400 hover:text-white bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700 active:scale-95 transition-all"
              >
                Limpiar Apuesta
              </button>
            </div>
          )}

          {/* ESTADO DEL BUZZER (SI EL JUEGO USA MOTOR BUZZER) */}
          {activeGame.engine === 'buzzer' && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                <div>
                  <span className="text-xs text-slate-400 block font-bold uppercase">Estado del Pulsador</span>
                  {isLocked && winner ? (
                    <span className="text-base font-black text-amber-400">
                      ¡Ha pulsado <span className="text-white">{winner.playerName}</span> ({winner.teamName})!
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-emerald-400">
                      Esperando que algún equipo pulse el botón...
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  resetBuzzer();
                  if (room.active_game_id === 'music' && !musicRevealed) {
                    setMusicPlaying(true);
                    syncMusicState(true, false);
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desbloquear Pulsador</span>
                <span className="sm:hidden">Desbloquear</span>
              </button>
            </div>
          )}

          {/* BOTONES DE PUNTUACIÓN SEGÚN LAS REGLAS EXACTAS DEL JUEGO */}
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block mb-2">
              Selecciona el resultado obtenido por {selectedTeamCatalog ? selectedTeamCatalog.name : 'el equipo seleccionado'}:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {activeGame.scoringOptions.map((opt) => {
                const colorClasses =
                  opt.color === 'emerald'
                    ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/40 text-emerald-300'
                    : opt.color === 'red'
                    ? 'bg-red-600/20 hover:bg-red-600/30 border-red-500/40 text-red-300'
                    : opt.color === 'blue'
                    ? 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/40 text-blue-300'
                    : opt.color === 'amber'
                    ? 'bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/40 text-amber-300'
                    : opt.color === 'purple'
                    ? 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/40 text-purple-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300';

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleApplyScoreAction(opt)}
                    className={`p-3 rounded-2xl border flex flex-col justify-between text-left transition-all active:scale-95 shadow-md ${colorClasses}`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-black">{opt.label}</span>
                      <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-black/30 border border-white/10">
                        {opt.badge}
                      </span>
                    </div>
                    {opt.description && (
                      <span className="text-[10px] opacity-70 block">{opt.description}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

              {/* MINIJUEGO: ADIVINA LA CANCIÓN (SPOTIFY) */}
              {room.active_game_id === 'music' && (
                <HostMusicControls
                  currentSongTrack={currentSongTrack}
                  musicPlaying={musicPlaying}
                  musicRevealed={musicRevealed}
                  musicBank={musicBank}
                  musicSearchMode={musicSearchMode}
                  onSetMusicSearchMode={setMusicSearchMode}
                  musicSearchQuery={musicSearchQuery}
                  onSetMusicSearchQuery={setMusicSearchQuery}
                  musicSearchResults={musicSearchResults}
                  isSearchingMusic={isSearchingMusic}
                  spotifyPlaylistInput={spotifyPlaylistInput}
                  onSetSpotifyPlaylistInput={setSpotifyPlaylistInput}
                  isImportingPlaylist={isImportingPlaylist}
                  onTogglePlayMusic={handleTogglePlayMusic}
                  onToggleRevealMusic={handleToggleRevealMusic}
                  onValidateMusicHit={handleValidateMusicHit}
                  onValidateMusicMiss={handleValidateMusicMiss}
                  onPickRandomSong={handlePickRandomSong}
                  onSelectSong={handleSelectSong}
                  onRemoveTrackFromBank={handleRemoveTrackFromBank}
                  onClearMusicBank={handleClearMusicBank}
                  onSearchMusicOnline={handleSearchMusicOnline}
                  onImportPlaylistFromSpotify={handleImportPlaylistFromSpotify}
                  onSelectSearchedTrack={handleSelectSearchedTrack}
                />
              )}

              {/* MINIJUEGO: ADIVINA LA PELÍCULA (EMOJIS) */}
              {room.active_game_id === 'movies' && (
                <HostMoviesControls
                  activePackName={activePackName}
                  onLoadOfficialPack={handleLoadOfficialPack}
                  onUploadJson={handleUploadJson}
                  onResetToDemo={handleResetToDemo}
                  movieIndex={movieIndex}
                  filteredMovies={filteredMovies}
                  movieCategoryFilter={movieCategoryFilter}
                  onCategoryFilterChange={handleCategoryFilterChange}
                  currentMovie={currentMovie}
                  movieRevealed={movieRevealed}
                  onToggleReveal={handleToggleReveal}
                  movieFrameLevel={movieFrameLevel}
                  onSetFrameLevel={handleSetFrameLevel}
                  autoMoviePoints={autoMoviePoints}
                  onValidateMovieHitAuto={handleValidateMovieHitAuto}
                  onValidateMovieMissAuto={handleValidateMovieMissAuto}
                  onPrevMovie={handlePrevMovie}
                  onNextMovie={handleNextMovie}
                />
              )}

              {/* MINIJUEGO: FOTOS PROYECTOR (BEBÉS) */}
              {activeGame.id === 'fotos_proyector' && (
                <HostBabyPhotosControls
                  babyPhotoIndex={babyPhotoIndex}
                  babyPhotosList={babyPhotosList}
                  currentBabyPhoto={currentBabyPhoto}
                  babyPhotoRevealed={babyPhotoRevealed}
                  onToggleBabyPhotoReveal={handleToggleBabyPhotoReveal}
                  onValidateBabyPhotoHit={handleValidateBabyPhotoHit}
                  onValidateBabyPhotoMiss={handleValidateBabyPhotoMiss}
                  onSelectBabyPhotoDirect={handleSelectBabyPhotoDirect}
                  onPrevBabyPhoto={handlePrevBabyPhoto}
                  onNextBabyPhoto={handleNextBabyPhoto}
                />
              )}

              {/* MINIJUEGO: PREGUNTAS TRIVIAL */}
              {activeGame.id === 'trivial' && (
                <HostTriviaControls
                  currentTriviaQuestion={currentTriviaQuestion}
                  triviaIndex={triviaIndex}
                  triviaBank={triviaBank}
                  triviaReboundActive={triviaReboundActive}
                  winner={winner}
                  triviaRevealed={triviaRevealed}
                  onRandomTrivia={handleRandomTrivia}
                  onValidateTriviaHit={handleValidateTriviaHit}
                  onValidateTriviaFail={handleValidateTriviaFail}
                  onValidateTriviaReboundHit={handleValidateTriviaReboundHit}
                  onToggleTriviaReveal={handleToggleTriviaReveal}
                  onPrevTrivia={handlePrevTrivia}
                  onNextTrivia={handleNextTrivia}
                />
              )}

              {/* MINIJUEGO: 1, 2, 3 ¿YA? */}
              {activeGame.id === 'un_dos_tres' && (
                <HostUnDosTresControls
                  currentUdtChallenge={currentUdtChallenge}
                  aliveTeams={aliveTeams}
                  activeTeams={activeTeams}
                  currentUdtTeam={currentUdtTeam}
                  onResetUdtRound={handleResetUdtRound}
                  onStartUdtTimer={handleStartUdtTimer}
                  onPassUdtRound={handlePassUdtRound}
                  onEliminateUdtTeam={handleEliminateUdtTeam}
                />
              )}

              {/* MINIJUEGO: BINGO */}
              {activeGame.id === 'bingo' && (
                <HostBingoControls
                  bingoDrawnBalls={bingoDrawnBalls}
                  bingoCurrentBall={bingoCurrentBall}
                  bingoIsSpinning={bingoIsSpinning}
                  onResetBingo={handleResetBingo}
                  onDrawBingoBall={handleDrawBingoBall}
                  teams={teams}
                  selectedTeamCatalog={selectedTeamCatalog}
                  onScoreChange={handleScoreChange}
                />
              )}

              {/* MINIJUEGO: MÍMICA */}
              {activeGame.id === 'mimica' && (
                <HostMimicaControls
                  currentMimicaCard={currentMimicaCard}
                  mimicaCardIndex={mimicaCardIndex}
                  mimicaCards={mimicaCards}
                  onPickRandomMimicaCard={handlePickRandomMimicaCard}
                  mimicaIsRunning={mimicaIsRunning}
                  mimicaTimerSeconds={mimicaTimerSeconds}
                  onToggleMimicaTimer={handleToggleMimicaTimer}
                  mimicaHitsCount={mimicaHitsCount}
                  onAddMimicaHit={handleAddMimicaHit}
                  onSubtractMimicaHit={handleSubtractMimicaHit}
                  onResetMimicaRound={handleResetMimicaRound}
                  onNextMimicaCard={handleNextMimicaCard}
                />
              )}

              {/* MINIJUEGO: TELÉFONO DIBUJADO */}
              {activeGame.id === 'drawing' && (
                <HostDrawingControls />
              )}

        </section>
      ) : room.status === 'podium' || room.status === 'ended' ? (
        <div className="space-y-4">
          <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-6 shadow-deco-gold space-y-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gold-gradient text-slate-950 flex items-center justify-center mx-auto text-3xl shadow-deco-gold animate-bounce">
              🏆
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <span className="text-xs uppercase font-broadway tracking-widest text-amber-300 font-bold block">
                CEREMONIA DE CLAUSURA EN DIRECTO EN LA TV
              </span>
              <h3 className="text-2xl font-broadway uppercase text-gold-gradient">
                The Speakeasy Gazette (1931)
              </h3>
              <p className="text-xs font-vintage text-amber-100/80">
                La pantalla de TV está proyectando la portada de prensa de época, con el equipo ganador y el escenario 3D Art Déco animado (fichas de póker flotantes, abanico de sol dorado y focos teatrales).
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setPodiumPage('podium');
                  roomSync.broadcast({ type: 'PODIUM_PAGE_CHANGE', payload: { page: 'podium' } });
                }}
                className={`px-5 py-3 rounded-2xl font-broadway text-xs uppercase flex items-center gap-2 transition-all shadow-md ${
                  podiumPage === 'podium'
                    ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold border border-[#f5eedb]'
                    : 'bg-[#14141e] text-amber-200 border border-[#d4af37]/40 hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>📰 Primera Plana: El Gran Golpe</span>
              </button>

              <button
                onClick={() => {
                  setPodiumPage('medals');
                  roomSync.broadcast({ type: 'PODIUM_PAGE_CHANGE', payload: { page: 'medals' } });
                }}
                className={`px-5 py-3 rounded-2xl font-broadway text-xs uppercase flex items-center gap-2 transition-all shadow-md ${
                  podiumPage === 'medals'
                    ? 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold border border-[#f5eedb]'
                    : 'bg-[#14141e] text-amber-200 border border-[#d4af37]/40 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>🎖️ Segunda Plana: Salón de la Infamia</span>
              </button>

              <button
                onClick={handleReturnToLobby}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs uppercase flex items-center gap-2 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>Volver al Salón (Lobby)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* MÓDULO INDIVIDUAL DE PRESENTACIÓN INICIAL DEL EVENTO */}
          <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-2 border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-3xl shrink-0 shadow-lg">
                📽️
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-purple-300 block">
                  Paso Previo al Show
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">Presentación Oficial del Evento</h3>
                <p className="text-xs text-slate-400 mt-0.5 max-w-md">
                  Proyecta en la TV los 10 minijuegos y la explicación del funcionamiento de las cartas y sus 4 rarezas antes de comenzar a jugar.
                </p>
              </div>
            </div>
            <button
              onClick={handleStartPresentation}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all shrink-0 border border-purple-400/40"
              title="Proyectar presentación oficial en la TV"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Proyectar Presentación</span>
            </button>
          </div>

          <div className="bg-slate-900/80 border-2 border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl">
              📺
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-xl font-black text-white">Sala en Pantalla de Espera (Lobby)</h3>
              <p className="text-xs text-slate-400">
                La TV está proyectando el código QR y la formación de equipos. Selecciona un minijuego del catálogo para empezar a jugar.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleSelectGame(GAMES_CATALOG[0])}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-green-500/25 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Empezar con {GAMES_CATALOG[0].title}</span>
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs uppercase flex items-center gap-2 active:scale-95 transition-all"
              >
                <Gamepad2 className="w-4 h-4 text-purple-400" />
                <span>Ver Catálogo Completo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRA DE FINALIZACIÓN DE PRUEBA ACTIVA */}
      {room.status === 'playing' && (
        <div className="flex items-center justify-between bg-slate-900/95 border border-red-500/40 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-lg gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl p-1.5 bg-red-950/60 rounded-xl border border-red-500/30 shrink-0">🏁</span>
            <div className="min-w-0">
              <span className="text-xs font-black uppercase text-white block truncate">
                {activeGame.title} en curso
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Concluye la prueba, caduca las cartas y asigna puntuaciones finales
              </span>
            </div>
          </div>
          <button
            onClick={() => handleFinishTest()}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md shadow-red-600/30 active:scale-95 transition-all border border-red-400/40 shrink-0"
            title="Finalizar esta prueba"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Finalizar Prueba</span>
            <span className="sm:hidden">Finalizar</span>
          </button>
        </div>
      )}

      {/* EFECTOS DE CARTAS ACTIVOS EN ESTA PRUEBA */}
      {renderActiveEffects()}

      {/* MARCADOR EN VIVO Y PUNTUACIÓN RÁPIDA */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-3.5 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white truncate">
              Marcador <span className="hidden sm:inline">en Vivo (+5, +2, +1, -1)</span>
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('teams')}
            className="text-[11px] text-slate-400 hover:text-emerald-400 font-bold transition-colors flex items-center gap-1 shrink-0"
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Gestionar Equipos</span>
            <span>→</span>
          </button>
        </div>
        {renderTeamsScoreboard()}
      </section>
    </div>
  )}

  {/* PESTAÑA: SISTEMA DE CARTAS DE PODER */}
  {activeTab === 'cards' && (
    <HostPowerCardsTab
      powerCards={powerCards}
      activeTeams={activeTeams}
      selectedBonusTeam={selectedBonusTeam}
      onSetSelectedBonusTeam={setSelectedBonusTeam}
      onDealInitialCards={handleDealInitialCards}
      onDealBonusCard={handleDealBonusCard}
      onResetPowerCards={handleResetPowerCards}
      onOpenDiscardModal={() => setIsDiscardModalOpen(true)}
      onClearAllActiveEffects={handleClearAllActiveEffects}
      onRemoveActiveEffect={handleRemoveActiveEffect}
      onScoreChange={handleScoreChange}
      onInitiatePlayCard={handleInitiatePlayCard}
      onPlayCardDirectly={handlePlayCardDirectly}
      onRevokeCardFromTeam={handleRevokeCardFromTeam}
    />
  )}

  {/* PESTAÑA: CATÁLOGO DE JUEGOS */}
  {activeTab === 'catalog' && (
    <div className="space-y-6">
      {/* CATÁLOGO DE JUEGOS: SELECCIÓN AUTOMÁTICA DEL MOTOR */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-indigo-400" />
              Catálogo de Minijuegos
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
              Elige el juego y el motor (Pulsador, Retos o Duelos) se adaptará automáticamente con sus reglas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {GAMES_CATALOG.map((game) => {
            const isSelected = room.active_game_id === game.id && room.status === 'playing';

            return (
              <button
                key={game.id}
                onClick={() => handleSelectGame(game)}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden active:scale-98 flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/15 text-white shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{game.emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {game.category}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white">{game.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{game.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] gap-1">
                  <span className="text-amber-300 font-bold bg-amber-500/10 border border-amber-400/20 px-2 py-0.5 rounded-full text-[10px]">
                    {game.participantsLabel}
                  </span>
                  {isSelected && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> En Pantalla
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  )}

  {/* PESTAÑA: EQUIPOS & JUGADORES */}
  {activeTab === 'teams' && (
    <HostTeamsScoreboard
      room={room}
      activeTeams={activeTeams}
      teams={teams}
      players={players}
      onTeamCountChange={handleTeamCountChange}
      onScoreChange={handleScoreChange}
      onSetCaptain={handleSetCaptain}
      onClearPlayers={() => {
        setPlayers([]);
        localStorage.removeItem(`party_players_${roomCode}`);
        roomSync.broadcast({ type: 'PLAYERS_UPDATE', payload: [] });
      }}
      onRescanPlayers={() => roomSync.broadcast({ type: 'REQUEST_PLAYERS_SYNC' })}
    />
  )}

  {/* PESTAÑA: MESA DE EFECTOS DE SONIDO COMPLETA */}
  {activeTab === 'soundboard' && (
    <div className="space-y-6">
      {renderSoundboard()}
    </div>
  )}

      {/* BANNER FLOTANTE: CARTA PROYECTADA EN TV (ADAPTADO A MÓVIL) */}
      {activeCardOnScreen && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-md z-50 bg-slate-900/95 border-2 border-amber-400 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2 animate-bounce">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl flex-shrink-0">{activeCardOnScreen.card.emoji}</span>
            <div className="min-w-0">
              <span className="text-[9px] text-amber-400 font-black uppercase tracking-wider block truncate">
                En TV • {activeCardOnScreen.teamName}
              </span>
              <span className="text-xs sm:text-sm font-black text-white block truncate">
                {activeCardOnScreen.card.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => {
                const teamId = activeCardOnScreen.teamId || activeTeams.find((t) => t.name === activeCardOnScreen.teamName)?.id;
                if (teamId) {
                  handleReturnCardToTeam(teamId, activeCardOnScreen.card.id);
                } else {
                  handleDismissCardOnScreen();
                }
              }}
              className="px-2.5 sm:px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black uppercase rounded-xl shadow active:scale-95 transition-all flex items-center gap-1"
              title="Anular jugada y devolver carta a su equipo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Devolver</span>
            </button>
            <button
              onClick={handleDismissCardOnScreen}
              className="p-2 sm:px-3 sm:py-2 bg-red-600 hover:bg-red-500 text-white text-[11px] sm:text-xs font-black uppercase rounded-xl shadow active:scale-95 transition-all flex items-center gap-1"
              title="Quitar de la TV"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitar</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: BANCO DE CARTAS (ELEGIR 1 DE LAS 2 ROBADAS) */}
      {bankChoiceState && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-center">
            <div>
              <span className="text-3xl">🏛️</span>
              <h3 className="text-xl font-black text-white uppercase mt-1">Banco de Cartas</h3>
              <p className="text-xs text-indigo-300 font-medium">
                Equipo: <strong className="text-white">{bankChoiceState.teamName}</strong>. Elige 1 carta para su mano. La otra volverá al mazo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
              {bankChoiceState.cards.map((c, idx) => {
                const otherCard = bankChoiceState.cards[1 - idx];
                return (
                  <div key={c.id} className="flex flex-col items-center gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 w-full">
                    <PowerCardView card={c} size="md" />
                    <button
                      onClick={() => handleSelectBankChoice(c.id, otherCard.id)}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md active:scale-95 transition-all"
                    >
                      ✓ Quedarse con esta
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIAJE EN EL TIEMPO (RECUPERAR DEL DESCARTE) */}
      {timeTravelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏳</span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">Viaje en el Tiempo</h3>
                  <p className="text-xs text-amber-300">
                    Equipo: <strong className="text-white">{timeTravelModal.teamName}</strong>. Elige una carta descartada para recuperarla.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTimeTravelModal(null)}
                className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {powerCards.discardPile.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No hay cartas en la pila de descartes.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {powerCards.discardPile.map((cId, idx) => {
                  const card = getPowerCardById(cId);
                  if (!card) return null;
                  return (
                    <div
                      key={`${cId}_${idx}`}
                      onClick={() => {
                        handlePlayCardDirectly(timeTravelModal.teamId, 'viaje_tiempo', undefined, undefined, cId);
                        setTimeTravelModal(null);
                      }}
                      className="cursor-pointer hover:scale-105 transition-transform flex flex-col items-center p-2 bg-slate-950 rounded-xl border border-slate-800 hover:border-amber-400"
                    >
                      <PowerCardView card={card} size="sm" />
                      <span className="text-[10px] font-bold text-amber-300 uppercase mt-2">
                        Recuperar ➔
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: PILA DE DESCARTES (VISUALIZADOR GENERAL) */}
      {isDiscardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪦</span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">Pila de Descartes</h3>
                  <p className="text-xs text-slate-400">
                    Total: {powerCards.discardPile.length} cartas jugadas hasta ahora
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDiscardModalOpen(false)}
                className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {powerCards.discardPile.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No se ha descartado ninguna carta todavía.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {powerCards.discardPile.map((cId, idx) => {
                  const card = getPowerCardById(cId);
                  if (!card) return null;
                  return (
                    <div key={`${cId}_${idx}`} className="flex flex-col items-center p-2.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <PowerCardView card={card} size="sm" />
                      <button
                        onClick={() => setReturnCardModal({ card })}
                        className="w-full px-2 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 active:scale-95 transition-all shadow"
                        title="Devolver esta carta a la mano de un equipo"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>↩ Devolver a Equipo</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SELECCIONAR EQUIPO AL QUE DEVOLVER CARTA */}
      {returnCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{returnCardModal.card.emoji}</span>
                <div>
                  <h3 className="text-base font-black text-white uppercase">
                    Devolver "{returnCardModal.card.name}"
                  </h3>
                  <p className="text-xs text-amber-300">
                    Selecciona a qué equipo devolver esta carta a su mano
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReturnCardModal(null)}
                className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {activeTeams.map((team) => {
                const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
                const currentCards = powerCards.teamHands[team.id]?.length || 0;
                return (
                  <button
                    key={team.id}
                    onClick={() => {
                      handleReturnCardToTeam(team.id, returnCardModal.card.id);
                      setReturnCardModal(null);
                    }}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-98 ${cat?.twBorder || 'border-slate-700'} bg-slate-800/80 hover:bg-slate-700/80`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3.5 h-3.5 rounded-full ${cat?.twBg || 'bg-amber-400'}`} />
                      <div className="text-left">
                        <span className={`text-xs font-black uppercase block ${cat?.twText || 'text-white'}`}>
                          {team.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Tiene actualmente {currentCards} {currentCards === 1 ? 'carta' : 'cartas'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      Entregar ➔
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SELECCIONAR EQUIPO O JUGADOR RIVAL OBJETIVO */}
      {targetModalState && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{targetModalState.card.emoji}</span>
                <div>
                  <h3 className="text-base font-black text-white uppercase">
                    Objetivo para "{targetModalState.card.name}"
                  </h3>
                  <p className="text-xs text-amber-300">
                    Equipo emisor: <strong>{activeTeams.find((t) => t.id === targetModalState.teamId)?.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTargetModalState(null)}
                className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SI REQUIERE EQUIPO */}
            {targetModalState.card.requiresTarget === 'team' && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Haz clic en el equipo rival objetivo:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeTeams
                    .filter((t) => t.id !== targetModalState.teamId)
                    .map((rival) => {
                      const rivalCat = TEAMS_CATALOG.find((c) => c.index === rival.team_index);
                      const rivalMembers = players.filter((p) => p.team_id === rival.id || p.team_index === rival.team_index);
                      return (
                        <button
                          key={rival.id}
                          onClick={() => {
                            handlePlayCardDirectly(targetModalState.teamId, targetModalState.card.id, rival.id);
                            setTargetModalState(null);
                          }}
                          className={`p-3.5 rounded-2xl border ${rivalCat?.twBorder || 'border-slate-700'} bg-slate-950/80 hover:scale-102 hover:shadow-lg transition-all text-left flex items-center justify-between group`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3.5 h-3.5 rounded-full ${rivalCat?.twBg}`} />
                            <div>
                              <span className={`text-sm font-black uppercase ${rivalCat?.twText || 'text-white'}`}>
                                {rival.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-medium">
                                {rivalMembers.length} miembros • {rival.score} pts
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform uppercase">
                            Elegir ➔
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* SI REQUIERE JUGADOR */}
            {targetModalState.card.requiresTarget === 'player' && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Haz clic en el jugador rival objetivo:
                </span>
                {(() => {
                  const rivalPlayersList = players.filter(
                    (p) =>
                      p.team_id !== targetModalState.teamId &&
                      p.team_index !== activeTeams.find((t) => t.id === targetModalState.teamId)?.team_index
                  );
                  if (rivalPlayersList.length === 0) {
                    return (
                      <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 text-center space-y-2">
                        <p className="text-xs text-slate-400">No hay jugadores rivales conectados actualmente.</p>
                        <input
                          type="text"
                          placeholder="Escribe el nombre del jugador rival y pulsa Enter..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              handlePlayCardDirectly(
                                targetModalState.teamId,
                                targetModalState.card.id,
                                undefined,
                                e.currentTarget.value.trim()
                              );
                              setTargetModalState(null);
                            }
                          }}
                        />
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {rivalPlayersList.map((p) => {
                        const pTeam = activeTeams.find((t) => t.id === p.team_id || t.team_index === p.team_index);
                        const pCat = pTeam ? TEAMS_CATALOG.find((c) => c.index === pTeam.team_index) : null;
                        const isBaneoCard = targetModalState.card.id === 'baneo';
                        const isAlreadyBanned = (powerCards.bannedPlayerNames || []).includes(p.nickname.toLowerCase().trim());
                        const isDisabled = isBaneoCard && isAlreadyBanned;

                        return (
                          <button
                            key={p.id}
                            disabled={isDisabled}
                            onClick={() => {
                              if (isDisabled) return;
                              handlePlayCardDirectly(
                                targetModalState.teamId,
                                targetModalState.card.id,
                                pTeam?.id,
                                p.nickname
                              );
                              setTargetModalState(null);
                            }}
                            className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between group ${
                              isDisabled
                                ? 'border-red-900/40 bg-slate-950/40 opacity-40 cursor-not-allowed'
                                : 'border-slate-800 bg-slate-950/90 hover:border-amber-400 hover:scale-102 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{isDisabled ? '🚫' : p.badge_emoji || '👤'}</span>
                              <div>
                                <span className="text-xs font-black text-white block leading-tight">{p.nickname}</span>
                                <span className={`text-[9px] font-bold uppercase ${pCat?.twText || 'text-slate-400'}`}>
                                  {pCat?.name || pTeam?.name || 'Rival'}
                                </span>
                              </div>
                            </div>
                            {isDisabled ? (
                              <span className="text-[9px] font-bold text-red-400 bg-red-950/60 border border-red-800/50 px-1.5 py-0.5 rounded">
                                Ya baneado
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                                Elegir ➔
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: VEREDICTO AUTOMÁTICO DE PRUEBA FINALIZADA */}
      {testFinishedModal && (
        <HostTestVerdictModal
          testFinishedModal={testFinishedModal}
          onClose={() => setTestFinishedModal(null)}
          currentVerdict={currentVerdict}
          teams={teams}
          activeTeams={activeTeams}
          manualPodiumRanks={manualPodiumRanks}
          onSetManualPodiumRanks={setManualPodiumRanks}
          onSetRoundHits={setRoundHits}
          onApplyVerdict={handleApplyAutomatedVerdict}
          selectedBonusTeam={selectedBonusTeam}
          onSetSelectedBonusTeam={setSelectedBonusTeam}
          onDealBonusCard={handleDealBonusCard}
          powerCards={powerCards}
          onClearAllActiveEffects={handleClearAllActiveEffects}
          onTransferMaldicion={(sourceTeam, targetTeam) => {
            const fromH = [...(powerCards.teamHands[sourceTeam.id] || [])];
            const cardIdx = fromH.indexOf('la_maldicion');
            if (cardIdx !== -1) fromH.splice(cardIdx, 1);
            const targetHand = powerCards.teamHands[targetTeam.id] || [];
            const wasFull = targetHand.length >= 3;
            const toH = [...targetHand, 'la_maldicion'];
            const nextState = {
              ...powerCards,
              teamHands: {
                ...powerCards.teamHands,
                [sourceTeam.id]: fromH,
                [targetTeam.id]: toH,
              },
            };
            setPowerCards(nextState);
            localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
            roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });
            alert(`☠️ ¡La Maldición ha sido transferida de ${sourceTeam.name} a ${targetTeam.name}!${wasFull ? `\n\n⚠️ ${targetTeam.name} ya tenía ${targetHand.length} cartas: La Maldición entra como carga parásita bloqueando cualquier nuevo robo de cartas hasta que jueguen cartas de su mano.` : ''}`);
          }}
          onSelectNextGame={(game) => {
            setTestFinishedModal(null);
            handleSelectGame(game);
          }}
          onReturnToLobby={() => {
            setTestFinishedModal(null);
            handleReturnToLobby();
          }}
        />
      )}
    </main>
  );
}

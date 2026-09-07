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
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TEAMS_CATALOG, SAMPLE_CHALLENGES } from '../lib/constants';
import { Room, Team, Player, MinigameType, CaptainGamble, CaptainDuelState } from '../lib/types';
import { soundFX } from '../lib/audio';
import { useBuzzerRace } from '../lib/useBuzzerRace';
import { RoomSync, getRoomSync } from '../lib/roomSync';
import { GAMES_CATALOG, GameDefinition } from '../lib/games';
import { MOVIES_DATABASE, MovieItem } from '../lib/moviesData';
import { DEV_MOCK_BABY_PHOTOS, BabyPhotoItem } from '../lib/babyPhotosData';
import { SongTrack } from '../lib/musicData';
import { PowerCardsState, PowerCard } from '../lib/powerCards';
import UnoPowerCard from '../components/UnoPowerCard';
import { RetroGridBackground } from '../components/RetroGridBackground';
import { TeamScoreCard } from '../components/TeamScoreCard';
import { getTeamTheme } from '../lib/teamThemes';
import { useGameAudio } from '../lib/useGameAudio';
import { triggerTeamConfetti } from '../lib/triggerTeamConfetti';
import { TwemojiText } from '../components/TwemojiText';
import { GameIcon } from '../components/GameIcon';
import { generateAvatarDataUri, DiceBearStyle } from '../lib/dicebear';

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

  // Instancia de sincronización multi-pantalla como pantalla de TV
  const roomSync = useMemo(() => getRoomSync(roomCode, 'tv'), [roomCode]);

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
  } | null>(null);

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
  const musicAudioRef = React.useRef<HTMLAudioElement | null>(null);

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

  // Manejo del elemento de audio HTML5 según musicPlaying
  useEffect(() => {
    if (!musicAudioRef.current) return;
    // Si la canción está revelada (acierto validado por el host), suena la música para celebrar
    const shouldPlay = musicPlaying && (!buzzerLocked || musicRevealed);
    if (shouldPlay) {
      musicAudioRef.current.play().catch((err) => {
        console.warn('Auto-play bloqueado o error en preview:', err);
      });
    } else {
      musicAudioRef.current.pause();
    }
  }, [musicPlaying, currentSong, buzzerLocked, musicRevealed]);

  // Estados de Capitanes
  const [captainGambles, setCaptainGambles] = useState<Record<string, CaptainGamble>>({});
  const [captainDuel, setCaptainDuel] = useState<CaptainDuelState | null>(null);

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
      } else if (event.type === 'RETURN_TO_LOBBY') {
        setRoom((prev) => ({ ...prev, status: 'lobby' }));
        resetBuzzer();
        setTimerSeconds(null);
        setMusicPlaying(false);
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
        // Solo mostrar cartas en pantalla cuando son USADAS/JUGADAS, nunca al repartir
        if (event.payload.type === 'play') {
          soundFX.playPowerCard();
          setActiveCardAnimation(event.payload);
          setTimeout(() => {
            setActiveCardAnimation((curr) => (curr === event.payload ? null : curr));
          }, 5500);
        }
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
      } else if (event.type === 'PLAY_SOUND') {
        soundFX.playSound(event.payload.sound);
      } else if (event.type === 'LAUNCH_TIMER') {
        setTimerSeconds(event.payload.seconds);
      } else if (event.type === 'TRIGGER_CONFETTI') {
        playVictory();
        triggerTeamConfetti(event.payload?.teamId || winningTeamCatalog?.index);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomSync, resetBuzzer]);


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
  const currentChallenge = SAMPLE_CHALLENGES[currentChallengeIndex];

  return (
    <main className="min-h-screen w-full bg-slate-950 text-white font-sans overflow-hidden flex flex-col justify-between p-6 select-none relative">
      {/* FONDO RETRO-GRID DINÁMICO ACELERADO POR GPU */}
      <RetroGridBackground activeTeamColor={winningTeamCatalog?.colorHex} />

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

      {/* HEADER TV / PROYECTOR */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-4 z-20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30">
            <GameIcon name="Tv" size={32} color="#FFFFFF" glow={true} weight="fill" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-arcade uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-pink-500 to-purple-400">
              {room.title || 'GAME SHOW ARENA'}
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <GameIcon name="Sparkle" size={16} color="#FBBF24" glow="#FBBF24" weight="fill" />
              {room.status === 'lobby' ? (
                <span>Lobby de Convocatoria • Esperando Jugadores</span>
              ) : (
                <span className="text-white font-bold flex items-center gap-1.5">
                  <TwemojiText className="text-base">{activeGame.emoji}</TwemojiText>
                  <span className="uppercase">{activeGame.title}</span>
                  <span className="text-xs text-amber-400 font-normal">({activeGame.category})</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* CABECERA PASIVA DE LA TV (SIN BOTONES CLICABLES) */}
        <div className="flex items-center gap-3">
          {/* MINI QR EN LA ESQUINA DURANTE LAS PRUEBAS/SHOW */}
          {room.status !== 'lobby' && joinUrl && (
            <div className="flex items-center gap-2.5 bg-slate-900/95 border border-slate-700/80 rounded-2xl px-3 py-1.5 shadow-xl backdrop-blur-md">
              <div className="p-1 bg-white rounded-lg shadow-sm">
                <QRCodeSVG value={joinUrl} size={42} level="L" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[9px] uppercase font-black text-amber-400 tracking-wider block">
                  ¿Reconectar?
                </span>
                <span className="text-[11px] font-bold text-slate-200 block">
                  Escanea el QR
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-700/60 rounded-2xl px-5 py-2 shadow-2xl backdrop-blur-md">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 block font-bold">SALA</span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 justify-end font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> EN VIVO
              </span>
            </div>
            <div className="text-4xl font-black font-mono tracking-widest text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">
              {roomCode}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      {room.status === 'lobby' ? (
        /* ================= VISTA LOBBY ================= */
        <section className="flex-1 grid grid-cols-12 gap-6 my-6 z-10">
          {/* PANEL QR LATERAL */}
          <div className="col-span-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between backdrop-blur-xl shadow-2xl">
            <div className="text-center w-full">
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-200">Únete con tu Móvil</h2>
              <p className="text-xs text-slate-400 mt-0.5">Sin apps ni descargas. Solo escanea.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.12)] my-2">
              {joinUrl ? (
                <QRCodeSVG value={joinUrl} size={170} level="H" />
              ) : (
                <div className="w-[170px] h-[170px] bg-slate-800 animate-pulse rounded-lg" />
              )}
            </div>

            {/* CONTADOR DE JUGADORES */}
            <div className="w-full bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GameIcon name="Users" size={22} color="#818CF8" glow="#818CF8" weight="fill" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Jugadores</span>
                  <span className="text-base font-black text-white">{players.length} conectados</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Equipos</span>
                <span className="text-base font-black text-amber-400">{activeTeams.length} / {TEAMS_CATALOG.length}</span>
              </div>
            </div>

            {/* JUGADORES ENTRADOS QUE ESTÁN ELIGIENDO BANDO */}
            {unassignedPlayers.length > 0 && (
              <div className="w-full bg-amber-500/10 border-2 border-amber-400/30 rounded-2xl p-3 my-2 text-left animate-pulse">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1.5 flex items-center gap-1">
                  <GameIcon name="Lightning" size={14} color="#FBBF24" weight="fill" glow="#FBBF24" />
                  <span>Recién entrados ({unassignedPlayers.length}):</span>
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {unassignedPlayers.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-900/90 border border-amber-400/40 px-2 py-1 rounded-xl text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-sm"
                    >
                      <div className="w-4 h-4 rounded-md bg-slate-950 overflow-hidden shrink-0">
                        <img
                          src={generateAvatarDataUri(p.avatar_seed || p.nickname, (p.avatar_style as any) || 'avataaars')}
                          alt={p.nickname}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {p.badge_emoji && <TwemojiText className="text-[10px]">{p.badge_emoji}</TwemojiText>}
                      <span>{p.nickname}</span>
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
            {activeTeams.map((team) => {
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
                />
              );
            })}
          </div>
        </section>
      ) : (
        /* ================= VISTA ESCENARIO DE JUEGO ================= */
        <section className="flex-1 flex flex-col justify-center items-center my-4 z-10 w-full max-w-6xl mx-auto">
          {/* BANNER SUPERIOR CON REGLAS Y PUNTUACIONES DEL JUEGO SELECCIONADO */}
          <div className="mb-5 flex flex-col md:flex-row items-center justify-between bg-slate-900/90 border border-slate-800 px-6 py-3 rounded-2xl w-full max-w-4xl gap-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeGame.emoji}</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  {activeGame.category}
                </span>
                <h3 className="text-lg font-black text-white">{activeGame.title}</h3>
              </div>
            </div>

            {/* Puntuaciones de este juego proyectadas en TV */}
            <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-end">
              {activeGame.scoringOptions.map((opt) => (
                <span
                  key={opt.id}
                  className="bg-slate-800/90 text-slate-200 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-slate-700 flex items-center gap-1.5"
                >
                  <span>{opt.label}</span>
                  <span className="text-amber-400 font-mono font-black">{opt.badge}</span>
                </span>
              ))}
            </div>
          </div>

          {/* BANNER MINIDUELO DE CAPITANES (SI ESTÁ ACTIVO) */}
          {captainDuel?.isActive && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 w-full max-w-4xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 border-2 border-amber-300 rounded-2xl px-6 py-3.5 text-center shadow-[0_0_35px_rgba(239,68,68,0.5)] flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-amber-300 animate-bounce shrink-0 drop-shadow-md" />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-200 block">
                    ⚔️ DESAFÍO DIRECTO ENTRE LÍDERES
                  </span>
                  <h4 className="text-xl font-black text-white uppercase tracking-wider font-arcade drop-shadow-sm">
                    {captainDuel.title || 'MINIDUELO DE CAPITANES'}
                  </h4>
                </div>
              </div>
              <div className="bg-slate-950/70 border border-amber-300/40 rounded-xl px-4 py-2 text-right">
                <span className="text-[10px] text-amber-300 uppercase font-black block">REGLA EXCLUSIVA</span>
                <span className="text-xs text-white font-bold">Solo pueden pulsar los Capitanes 👑</span>
              </div>
            </motion.div>
          )}

          {/* BANNER APUESTAS DOBLE O NADA DE CAPITANES */}
          {Object.values(captainGambles).length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 max-w-4xl">
              {Object.values(captainGambles).map((gamble) => (
                <div
                  key={gamble.teamId}
                  className="bg-amber-500/20 border-2 border-amber-400/80 text-amber-200 px-4 py-1.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg backdrop-blur-md animate-pulse"
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>
                    ¡Capitán de <strong className="text-white uppercase">{gamble.teamName}</strong> arriesga: DOBLE O NADA (x2 PUNTOS)!
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TIRA DE EFECTOS DE CARTAS DE PODER ACTIVOS */}
          {powerCards && powerCards.activeEffects.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 max-w-4xl">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1 shadow-sm">
                <Zap className="w-3 h-3" /> Poderes en Juego:
              </span>
              {powerCards.activeEffects.map((eff) => {
                const team = activeTeams.find((t) => t.id === eff.sourceTeamId);
                const targetTeam = eff.targetTeamId ? activeTeams.find((t) => t.id === eff.targetTeamId) : null;
                return (
                  <span
                    key={eff.id}
                    className="bg-slate-900/90 border border-amber-400/40 text-xs px-3 py-1 rounded-xl text-slate-200 font-bold flex items-center gap-1.5 shadow-md backdrop-blur-md"
                  >
                    <span>{eff.cardEmoji}</span>
                    <strong className="text-white">{eff.cardName}</strong>
                    <span className="text-slate-400">({team?.name || eff.sourceTeamName})</span>
                    {targetTeam && <span className="text-red-400 font-extrabold">➔ {targetTeam.name}</span>}
                    {eff.targetPlayerName && <span className="text-red-400 font-extrabold">➔ {eff.targetPlayerName}</span>}
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
                  {/* ESCENARIO DE ADIVINANZA CON EMOJIS */}
                  <div className="relative w-full rounded-3xl overflow-hidden border-4 border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.9)] bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 md:p-10 text-center">
                    {/* Viñeta e iluminación decorativa */}
                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-500/20 blur-[90px] pointer-events-none" />

                    {/* Cabecera del misterio: Género, Año y Nivel de Pista */}
                    <div className="flex items-center justify-between mb-8 z-20 relative">
                      <div className="bg-slate-950/80 backdrop-blur-md border border-amber-400/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black text-amber-300 shadow-lg">
                        <Clapperboard className="w-4 h-4 text-amber-400" />
                        <span>{currentMovie.genreEmoji} {currentMovie.category}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-white font-mono">Año {currentMovie.year}</span>
                      </div>

                      <div className="bg-slate-950/80 backdrop-blur-md border border-indigo-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-slate-200 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span className="font-mono">
                          {movieFrameLevel === 1 && '🎯 Pista 1: 2 Emojis (+5 pts)'}
                          {movieFrameLevel === 2 && '🔍 Pista 2: 4 Emojis (+3 pts)'}
                          {movieFrameLevel === 3 && '⭐ Pista 3: Todos los Emojis (+1 pt)'}
                          {movieFrameLevel >= 4 && '💡 Pista 4: + Pista de Texto (+1 pt)'}
                        </span>
                      </div>
                    </div>

                    {/* CONTENEDOR CENTRAL DE EMOJIS GIGANTES */}
                    <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 py-8 px-4 my-2 bg-slate-950/70 border-2 border-slate-800/80 rounded-3xl shadow-inner backdrop-blur-md min-h-[160px]">
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
                        className="mt-5 bg-amber-500/10 border border-amber-400/30 rounded-2xl px-5 py-3 text-amber-200 text-xs md:text-sm font-semibold max-w-2xl mx-auto shadow-md"
                      >
                        <span className="font-black uppercase tracking-wider text-amber-400 mr-2">Pista Secreta:</span>
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
                          className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-6 text-center"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3 border border-amber-500/40">
                            🎉 ¡PELÍCULA RESUELTA!
                          </div>
                          <h2 className="text-4xl md:text-6xl font-black font-arcade uppercase text-white drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]">
                            {currentMovie.title}
                          </h2>
                          {currentMovie.originalTitle && currentMovie.originalTitle !== currentMovie.title && (
                            <p className="text-base text-slate-400 mt-1 italic font-medium">
                              "{currentMovie.originalTitle}"
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-4 text-xs md:text-sm text-slate-300">
                            <span className="bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 font-bold">
                              Año {currentMovie.year}
                            </span>
                            {currentMovie.director && (
                              <span className="bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 font-medium">
                                Dir: <strong className="text-white">{currentMovie.director}</strong>
                              </span>
                            )}
                            <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-xl border border-amber-500/40 font-bold">
                              {currentMovie.category}
                            </span>
                          </div>

                          {/* Explicación de los emojis */}
                          <div className="mt-6 bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl max-w-xl text-xs md:text-sm text-slate-300 text-left">
                            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                              Descifrado del Acertijo:
                            </span>
                            {currentMovie.explanation}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* OVERLAY DEL BUZZER CUANDO ALGUIEN PULSA EN MODO PELÍCULA */}
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
              ) : activeGame.id === 'fotos_proyector' ? (
                /* VISTA CINEMATOGRÁFICA DE FOTOS PROYECTOR (BEBÉS) */
                <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                  <div className="w-full bg-slate-900/90 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    {/* Cabecera: Número de foto, categoría y regla anti-infracción */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 z-20 relative">
                      <div className="bg-slate-950/80 backdrop-blur-md border border-amber-400/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black text-amber-300 shadow-lg">
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span>FOTO {babyPhotoIndex + 1} DE {DEV_MOCK_BABY_PHOTOS.length}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-white/80 font-medium">¿Famoso o Concursante? 🕵️</span>
                      </div>

                      <div className="bg-red-500/20 border border-red-500/40 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold text-red-200 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                        <span>🚫 ¡Si es tu propia foto NO pulses! (−2 pts)</span>
                      </div>
                    </div>

                    {/* MARCO DE LA FOTO PROYECTADA */}
                    <div className="relative flex items-center justify-center min-h-[300px] max-h-[420px] rounded-2xl overflow-hidden bg-black/60 border-4 border-slate-800 shadow-inner p-3">
                      <motion.img
                        key={`${currentBabyPhoto.id}_${babyPhotoIndex}`}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35 }}
                        src={currentBabyPhoto.imageUrl}
                        alt="Foto de Bebé"
                        className="max-h-[350px] md:max-h-[390px] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                      />

                      {/* Luz sutil de proyector en la parte superior */}
                      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-400/10 blur-3xl pointer-events-none" />
                    </div>

                    {/* OVERLAY: REVELADO DE IDENTIDAD CUANDO EL ANFITRIÓN LO ACTIVA */}
                    <AnimatePresence>
                      {babyPhotoRevealed && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-6 text-center"
                        >
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3 border border-amber-500/40">
                            🎉 ¡IDENTIDAD REVELADA!
                          </div>
                          <h2 className="text-4xl md:text-6xl font-black font-arcade uppercase text-white drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]">
                            {currentBabyPhoto.personName}
                          </h2>
                          {currentBabyPhoto.ownerPlayerName ? (
                            <div className="mt-3 inline-block bg-red-500/20 border border-red-500/40 px-4 py-1.5 rounded-xl text-xs font-bold text-red-200">
                              👤 ¡Foto de <strong className="text-white">{currentBabyPhoto.ownerPlayerName}</strong>! (¡No podía pulsar!)
                            </div>
                          ) : null}
                          {currentBabyPhoto.hint && (
                            <p className="mt-4 text-xs md:text-sm text-slate-300 italic max-w-md bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
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
                    <audio
                      ref={musicAudioRef}
                      src={currentSong.previewUrl}
                      preload="auto"
                      onEnded={() => setMusicPlaying(false)}
                    />

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
                          className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-zinc-900 border-4 border-slate-700/80 shadow-[0_0_35px_rgba(0,0,0,0.8)] relative flex items-center justify-center"
                        >
                          {/* Ranuras concéntricas del vinilo */}
                          <div className="absolute inset-2 rounded-full border border-slate-800/80" />
                          <div className="absolute inset-5 rounded-full border border-slate-700/50" />
                          <div className="absolute inset-9 rounded-full border border-slate-800/80" />
                          <div className="absolute inset-14 rounded-full border border-slate-700/40" />

                          {/* Reflejo de luz en el vinilo */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

                          {/* Galleta central del vinilo con logo/arte */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 border-2 border-white/20 flex items-center justify-center shadow-lg relative overflow-hidden">
                            {musicRevealed && (currentSong.coverUrl || currentSong.albumArt) ? (
                              <img
                                src={currentSong.coverUrl || currentSong.albumArt}
                                alt={currentSong.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Music className="w-7 h-7 text-white drop-shadow" />
                            )}
                            {/* Agujero central */}
                            <div className="absolute w-4 h-4 rounded-full bg-black border border-white/20" />
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
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2 border border-pink-500/30">
                                🎧 PISTA DE AUDIO
                              </div>
                              <h3 className="text-2xl sm:text-3xl font-black font-arcade text-white tracking-wide">
                                ¿QUÉ CANCIÓN ES?
                              </h3>
                              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                                ¡El primer concursante en presionar el pulsador responderá con el Título, Artista o Ambos!
                              </p>

                              {/* BARRAS DE ECUALIZADOR DINÁMICAS */}
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
                                    className="w-2 sm:w-2.5 rounded-full bg-gradient-to-t from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_8px_rgba(236,72,153,0.5)]"
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
                    <div className="w-full bg-slate-900/90 border-2 border-emerald-500/30 rounded-3xl p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl text-center">
                      <div className="w-24 h-24 mx-auto rounded-3xl bg-emerald-500/10 border-2 border-emerald-400/40 flex items-center justify-center animate-pulse mb-5 shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                        <Music className="w-12 h-12 text-emerald-400" />
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider mb-3 border border-emerald-500/30">
                        🟢 Catálogo Oficial de Spotify
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black font-arcade text-white tracking-wide">
                        ESPERANDO TEMAZO DE SPOTIFY...
                      </h2>
                      <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                        El anfitrión está seleccionando temazos o importando una playlist desde Spotify en su mando.
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
                        className="p-8 md:p-10 rounded-3xl bg-slate-900/90 border-4 shadow-2xl max-w-2xl mx-auto backdrop-blur-2xl text-center"
                        style={{ borderColor: buzzerWinner.teamColorHex }}
                      >
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest text-amber-300 mb-4">
                          ⚡ ¡TURNO DE RESPUESTA!
                        </div>

                        {/* AVATAR GIGANTE DEL GANADOR EN PANTALLA DE TV */}
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <div
                              className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-slate-950 border-4 p-1 shadow-2xl overflow-hidden flex items-center justify-center"
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
                              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                                <TwemojiText className="text-lg">{winnerEmoji}</TwemojiText>
                              </div>
                            )}
                          </div>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-black font-arcade uppercase text-white drop-shadow-md flex items-center justify-center gap-3">
                          <span>{buzzerWinner.playerName}</span>
                          {isWinnerCaptain && (
                            <span title="¡Capitán del equipo!" className="inline-flex items-center text-amber-400">
                              <Crown className="w-10 h-10 md:w-12 md:h-12 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-bounce" />
                            </span>
                          )}
                        </h2>
                        <p
                          className="text-2xl md:text-3xl font-black uppercase mt-1"
                          style={{ color: buzzerWinner.teamColorHex }}
                        >
                          {buzzerWinner.teamName}
                        </p>

                        {/* Indicador pasivo en TV */}
                        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-sm font-bold text-amber-300">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                          <span>Esperando veredicto del Anfitrión en su mando...</span>
                        </div>
                      </motion.div>
                    );
                  })() : (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-28 h-28 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-center animate-pulse mb-5">
                        <Flame className="w-14 h-14 text-amber-400" />
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black font-arcade tracking-wider uppercase text-white">
                        ¡ATENTOS AL PULSADOR!
                      </h2>
                      <p className="text-slate-400 text-base mt-2">
                        El primer equipo en presionar el botón de su móvil responderá.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          )}

          {/* MOTOR B: CADENA / DIBUJAR / RETOS */}
          {activeGame.engine === 'challenges' && (
            <div className="w-full text-center max-w-3xl bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Palette className="w-4 h-4" /> Cadena de 5 Pasos
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                Teléfono Descalabrado de Dibujo
              </h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6">
                J1 ve palabra y dibuja ➔ J2 adivina ➔ J3 dibuja ➔ J4 adivina ➔ J5 dibuja la obra final.
              </p>

              {/* Temporizador gigante */}
              <div className="my-4">
                <div className={`text-7xl font-black font-mono ${timerSeconds !== null && timerSeconds <= 5 ? 'text-red-500 animate-ping' : 'text-amber-400'}`}>
                  {timerSeconds !== null ? `${timerSeconds}s` : '--'}
                </div>
              </div>

              <div className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                ⏱️ Tiempo y puntuación controlados en directo por el Anfitrión
              </div>
            </div>
          )}

          {/* MOTOR C: DUELOS & JUEGOS DE MESA (Blackjack, Dominó, Parchís, UNO) */}
          {activeGame.engine === 'duel' && (
            <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Swords className="w-4 h-4" /> Torneo de Mesa: {activeGame.title}
              </div>
              <h2 className="text-3xl md:text-5xl font-black font-arcade uppercase text-white mb-2">
                CLASIFICACIÓN FINAL
              </h2>
              <p className="text-slate-400 text-xs md:text-sm mb-6 max-w-xl mx-auto">
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
                      className={`p-4 rounded-2xl border-2 ${catalog.twBorder} bg-slate-950/80 flex flex-col justify-between shadow-lg`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${catalog.twBg} mx-auto mb-2`} />
                      <span className={`text-base font-black uppercase ${catalog.twText}`}>{team.name}</span>
                      <span className="text-3xl font-black font-mono text-white mt-2">{team.score}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">puntos</span>
                    </div>
                  );
                })}
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center justify-center gap-1.5">
                <Trophy className="w-4 h-4" /> Clasificación y puntos gestionados en directo por el Anfitrión
              </div>
            </div>
          )}
        </section>
      )}

      {/* MARCADOR INFERIOR PERMANENTE EN TV (DURANTE LAS PRUEBAS / JUEGOS) */}
      {room.status !== 'lobby' && (
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
                    activeEffects={{
                      hasDouble,
                      hasBomb,
                      hasGamble: hasCaptainGamble,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </footer>
      )}

      {/* MODAL CINEMATOGRÁFICO DE CARTA DE PODER EN TV */}
      <AnimatePresence>
        {activeCardAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 select-none"
          >
            <div className="relative max-w-sm w-full text-center">
              {/* Resplandor épico */}
              <div
                className="absolute -inset-6 rounded-3xl opacity-60 blur-3xl pointer-events-none transition-all"
                style={{ backgroundColor: activeCardAnimation.card.glowColorHex }}
              />

              <div className="relative bg-slate-900/95 border-4 border-amber-400/80 rounded-3xl p-6 shadow-[0_0_80px_rgba(0,0,0,0.9)] space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-widest border border-amber-500/40">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {activeCardAnimation.type === 'deal' ? '🎁 NUEVA CARTA REPARTIDA' : '⚡ ¡CARTA ACTIVADA!'}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white font-arcade uppercase">
                  {activeCardAnimation.teamName}
                </h3>

                {/* CARTA DE PODER ESTILO UNO EN ESPAÑOL */}
                <div className="flex justify-center my-3">
                  <UnoPowerCard card={activeCardAnimation.card} size="lg" />
                </div>

                {activeCardAnimation.targetName && (
                  <div className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-2 text-xs text-red-200 font-bold">
                    🎯 Objetivo: <span className="text-white font-black">{activeCardAnimation.targetName}</span>
                  </div>
                )}

                {/* Barra de progreso de auto-cierre */}
                <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden mt-3">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5.5, ease: 'linear' }}
                    className="bg-amber-400 h-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

import React, { useEffect, useState, useMemo } from 'react';
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
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { soundFX } from '../lib/audio';
import { TEAMS_CATALOG } from '../lib/constants';
import { Room, Team, Player, MinigameType, CaptainGamble, CaptainDuelState } from '../lib/types';
import { useBuzzerRace } from '../lib/useBuzzerRace';
import { RoomSync } from '../lib/roomSync';
import { GAMES_CATALOG, GameDefinition, ScoringOption } from '../lib/games';
import { MOVIES_DATABASE, DEV_MOCK_MOVIES, MovieItem } from '../lib/moviesData';
import { DEV_MOCK_BABY_PHOTOS, BabyPhotoItem } from '../lib/babyPhotosData';
import {
  PowerCardsState,
  PowerCard,
  MASTER_POWER_CARDS,
  createInitialPowerCardsState,
  dealInitialCardsToTeams,
  dealCardToSingleTeam,
  executePlayCard,
  executeStealCard,
  getPowerCardById,
} from '../lib/powerCards';

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

  // Estados del Sistema de Capitanes
  const [captainGambles, setCaptainGambles] = useState<Record<string, CaptainGamble>>({});
  const [captainDuel, setCaptainDuel] = useState<CaptainDuelState | null>(null);

  const { resetBuzzer, isLocked, winner } = useBuzzerRace({ roomCode, isHostOrTv: true });

  // Instancia de sincronización multi-pantalla
  const roomSync = useMemo(() => new RoomSync(roomCode), [roomCode]);

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

    if (dealt.length > 0) {
      const firstCard = getPowerCardById(dealt[0].cardId);
      if (firstCard) {
        roomSync.broadcast({
          type: 'POWER_CARD_ANIMATION',
          payload: {
            type: 'deal',
            teamName: '¡Reparto Inicial!',
            card: firstCard,
          },
        });
      }
    }
  };

  const handleDealBonusCard = (chosenTeamId?: string) => {
    const targetId =
      chosenTeamId && chosenTeamId !== 'random'
        ? chosenTeamId
        : activeTeams.length > 0
        ? activeTeams[Math.floor(Math.random() * activeTeams.length)].id
        : null;

    if (!targetId) return;

    const { nextState, cardId, isFull } = dealCardToSingleTeam(powerCards, targetId);
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

    const card = getPowerCardById(cardId);
    const team = activeTeams.find((t) => t.id === targetId);
    if (card && team) {
      roomSync.broadcast({
        type: 'POWER_CARD_ANIMATION',
        payload: {
          type: 'deal',
          teamName: team.name,
          card,
        },
      });
    }
  };

  const handlePlayCardDirectly = (
    sourceTeamId: string,
    cardId: string,
    targetTeamId?: string,
    targetPlayerName?: string
  ) => {
    const card = getPowerCardById(cardId);
    const team = activeTeams.find((t) => t.id === sourceTeamId);
    const targetTeam = targetTeamId ? activeTeams.find((t) => t.id === targetTeamId) : undefined;

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
      if (card && team) {
        roomSync.broadcast({
          type: 'POWER_CARD_ANIMATION',
          payload: {
            type: 'play',
            teamName: team.name,
            card,
            targetName: targetTeam?.name,
          },
        });
      }
      return;
    }

    const nextState = executePlayCard(powerCards, sourceTeamId, cardId, targetTeamId, targetPlayerName);
    setPowerCards(nextState);
    localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextState));
    roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextState });

    if (card && team) {
      roomSync.broadcast({
        type: 'POWER_CARD_ANIMATION',
        payload: {
          type: 'play',
          teamName: team.name,
          card,
          targetName: targetPlayerName || targetTeam?.name,
        },
      });
    }
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

  const handleClearCaptainGambles = () => {
    setCaptainGambles({});
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
      } else if (event.type === 'MOVIE_STATE_UPDATE') {
        setMovieIndex(event.payload.movieIndex);
        setMovieFrameLevel(event.payload.frameLevel);
        setMovieRevealed(event.payload.isRevealed);
        if (event.payload.categoryFilter) {
          setMovieCategoryFilter(event.payload.categoryFilter as any);
        }
      } else if (event.type === 'POWER_CARD_PLAY_REQUEST') {
        const { sourceTeamId, sourceTeamName, cardId, targetTeamId, targetTeamName, targetPlayerName } = event.payload;
        handlePlayCardDirectly(sourceTeamId, cardId, targetTeamId, targetPlayerName);
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
      } else if (event.type === 'CAPTAIN_DUEL_STATE') {
        setCaptainDuel(event.payload);
      } else if (event.type === 'REQUEST_PLAYERS_SYNC') {
        roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: powerCards });
      }
    });

    return () => {
      unsubscribe();
      roomSync.destroy();
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

  // Acción: Volver al Lobby
  const handleReturnToLobby = async () => {
    const updatedRoom: Room = { ...room, status: 'lobby' };
    setRoom(updatedRoom);

    roomSync.broadcast({ type: 'RETURN_TO_LOBBY' });

    if (isSupabaseConfigured) {
      await supabase.from('rooms').update({ status: 'lobby' }).eq('code', roomCode);
    }
  };

  // Acción: Seleccionar Juego Específico (asigna automáticamente el motor y reglas)
  const handleSelectGame = async (game: GameDefinition) => {
    const updatedRoom: Room = {
      ...room,
      status: 'playing',
      current_game: game.engine,
      active_game_id: game.id,
    };
    setRoom(updatedRoom);
    resetBuzzer();

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

  // Modificar puntuación manual
  const handleScoreChange = async (teamId: string, delta: number) => {
    const updated = teams.map((t) =>
      t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t
    );
    setTeams(updated);

    roomSync.broadcast({ type: 'TEAMS_UPDATE', payload: updated });

    if (isSupabaseConfigured) {
      const targetTeam = teams.find((t) => t.id === teamId);
      if (targetTeam) {
        await supabase
          .from('teams')
          .update({ score: Math.max(0, targetTeam.score + delta) })
          .eq('id', teamId);
      }
    }
  };

  // Aplicar acción de puntuación específica del juego activo
  const handleApplyScoreAction = (option: ScoringOption) => {
    const targetTeamId = selectedTeamForPoints || (winner ? teams.find(t => t.team_index === winner.teamIndex)?.id : null) || activeTeams[0]?.id;
    if (!targetTeamId) return;

    handleScoreChange(targetTeamId, option.delta);

    // Si había un buzzer activo, resetearlo tras emitir veredicto
    if (isLocked) {
      resetBuzzer();
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

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-6 max-w-4xl mx-auto space-y-6 select-none">
      {/* HEADER ANFITRIÓN */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            CONSOLA DEL ANFITRIÓN
          </span>
          <h1 className="text-2xl font-black flex items-center gap-3">
            Sala {roomCode}
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
              room.status === 'lobby' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {room.status === 'lobby' ? 'En Lobby' : 'En Juego'}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/room/${roomCode}/tv`}
            target="_blank"
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" /> Abrir TV
          </Link>
          <div className="bg-slate-900 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 text-indigo-300">
            <Users className="w-4 h-4" />
            <span className="font-mono">{players.length} conectados</span>
          </div>
        </div>
      </header>

      {/* BARRA DE ESTADO GLOBAL Y BOTÓN PRINCIPAL */}
      <div className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
        room.status === 'playing'
          ? 'bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-slate-900 border-amber-400/40'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="text-3xl p-2 bg-slate-800 rounded-2xl border border-slate-700">
            {activeGame.emoji}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              {room.status === 'lobby' ? 'ESTADO: ESPERANDO EN LOBBY' : `JUEGO ACTIVO (${activeGame.category})`}
            </span>
            <span className="text-lg font-black text-white block">
              {room.status === 'lobby' ? 'Lobby de Convocatoria' : activeGame.title}
            </span>
            <span className="text-[11px] text-amber-400 font-semibold">
              Motor: {activeGame.engine === 'buzzer' ? '⚡ Pulsador Rápido' : activeGame.engine === 'challenges' ? '⏱ Retos & Temporizador' : '⚔️ Duelos & Mesa'}
            </span>
          </div>
        </div>

        {/* BOTÓN VOLVER AL LOBBY / COMENZAR */}
        {room.status === 'playing' ? (
          <button
            onClick={handleReturnToLobby}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-slate-500 text-white font-black text-xs uppercase px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Volver al Lobby (QR & Equipos)</span>
          </button>
        ) : (
          <button
            onClick={() => handleSelectGame(GAMES_CATALOG[0])}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs uppercase px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>¡Comenzar: Adivina la Canción!</span>
          </button>
        )}
      </div>

      {/* MESA DE EFECTOS DE SONIDO EN VIVO (SOUNDBOARD DEL ANFITRIÓN) */}
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
      </section>

      {/* SECCIÓN DINÁMICA: CONSOLA DE ARBITRAJE DEL JUEGO ACTIVO */}
      {room.status === 'playing' && (
        <section className="bg-slate-900/90 border-2 border-amber-400/40 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest flex items-center gap-1.5">
                <Award className="w-4 h-4" /> MESA DE PUNTUACIÓN AUTOMÁTICA
              </span>
              <h2 className="text-xl font-black">{activeGame.title}</h2>
            </div>

            {/* Selector de equipo al que asignar puntos */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Asignar a:</span>
              {activeTeams.map((team) => {
                const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
                const isSelected = selectedTeamForPoints === team.id;
                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamForPoints(team.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Miniduelo de Capitanes (Tie-Break)
                  </span>
                  {captainDuel?.isActive && (
                    <span className="bg-red-500/25 border border-red-500/50 text-red-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                      ⚔️ DUELO ACTIVO EN TV & MÓVILES
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {captainDuel?.isActive
                    ? '¡Atención! Solo los capitanes 👑 tienen el pulsador habilitado. El resto de jugadores tienen el buzzer bloqueado.'
                    : 'Activa un desempate o duelo rápido donde solo pueden pulsar los capitanes de cada equipo.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleCaptainDuel}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md whitespace-nowrap ${
                captainDuel?.isActive
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>{captainDuel?.isActive ? 'Terminar Miniduelo' : '⚔️ Iniciar Miniduelo'}</span>
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
                onClick={handleClearCaptainGambles}
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
                onClick={resetBuzzer}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Desbloquear Pulsador
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

          {/* CONTROLES ESPECÍFICOS PARA ADIVINA LA PELÍCULA CON EMOJIS */}
          {room.active_game_id === 'movies' && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              {/* BARRA DE GESTIÓN DE PACK / PROTECCIÓN ANTI-SPOILERS */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 font-medium">Pack Activo: </span>
                    <strong className="text-white font-semibold">{activePackName}</strong>
                    {activePackName.includes('Demo') && (
                      <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        🛡️ Modo Anti-Spoiler Activo
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={handleLoadOfficialPack}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    title="Cargar las 21 películas oficiales para la fiesta"
                  >
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>Cargar Pack Oficial Fiesta</span>
                  </button>

                  <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
                    <FolderUp className="w-3.5 h-3.5" />
                    <span>Subir JSON</span>
                    <input type="file" accept=".json" onChange={handleUploadJson} className="hidden" />
                  </label>

                  {!activePackName.includes('Demo') && (
                    <button
                      onClick={handleResetToDemo}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-[11px] font-medium"
                      title="Volver a las películas de prueba para seguir desarrollando sin spoilers"
                    >
                      Volver a Modo Demo
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Película en Pantalla ({movieIndex + 1}/{filteredMovies.length})
                  </span>
                </div>

                {/* Filtros por Categoría: Taquillazos, Disney/Pixar, Terror */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {(['Todos', 'Taquillazos', 'Disney / Pixar', 'Terror'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryFilterChange(cat)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                        movieCategoryFilter === cat
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {cat === 'Taquillazos' ? '🍿 Taquillazos' : cat === 'Disney / Pixar' ? '🏰 Disney / Pixar' : cat === 'Terror' ? '👻 Terror' : '🎬 Todos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* TARJETA DE CHIVATO SECRETO PARA EL ANFITRIÓN */}
              <div className="bg-slate-950/80 border border-amber-400/30 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentMovie.genreEmoji}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {currentMovie.category} • Año {currentMovie.year}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {currentMovie.title}
                    {currentMovie.originalTitle && currentMovie.originalTitle !== currentMovie.title && (
                      <span className="text-xs text-slate-400 font-normal ml-2">({currentMovie.originalTitle})</span>
                    )}
                  </h3>
                  {currentMovie.director && (
                    <p className="text-xs text-slate-400">
                      Director: <span className="text-slate-200 font-semibold">{currentMovie.director}</span>
                    </p>
                  )}

                  {/* Emojis mostrados por fases al host */}
                  <div className="flex flex-wrap items-center gap-2 py-1">
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 text-base">
                      <span className="text-[10px] text-amber-400 font-black uppercase">P1 (2 emojis):</span>
                      {currentMovie.emojisStage1.map((em, idx) => (
                        <span key={idx}>{em}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 text-base">
                      <span className="text-[10px] text-sky-400 font-black uppercase">P2 (4 emojis):</span>
                      {currentMovie.emojisStage2.map((em, idx) => (
                        <span key={idx}>{em}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 text-base">
                      <span className="text-[10px] text-emerald-400 font-black uppercase">P3 (Completo):</span>
                      {currentMovie.emojisFull.map((em, idx) => (
                        <span key={idx}>{em}</span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-amber-300/90 italic bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                    💡 Significado: {currentMovie.explanation}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={handleToggleReveal}
                    className={`flex-1 md:flex-none px-4 py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      movieRevealed
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {movieRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{movieRevealed ? 'Ocultar Solución en TV' : '¡Revelar Título en TV!'}</span>
                  </button>
                </div>
              </div>

              {/* SELECTOR DE NIVEL DE PISTA / EMOJIS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Pista en TV:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleSetFrameLevel(1)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        movieFrameLevel === 1
                          ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      P1: 2 Emojis (+5)
                    </button>
                    <button
                      onClick={() => handleSetFrameLevel(2)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        movieFrameLevel === 2
                          ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      P2: 4 Emojis (+3)
                    </button>
                    <button
                      onClick={() => handleSetFrameLevel(3)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        movieFrameLevel === 3
                          ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      P3: Todos los Emojis (+1)
                    </button>
                    <button
                      onClick={() => handleSetFrameLevel(4)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        movieFrameLevel === 4
                          ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      P4: + Pistas (+1)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMovie}
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 active:scale-95 transition-all"
                    title="Película anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMovie}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <span>Siguiente Película</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONTROL ESPECÍFICO: FOTOS PROYECTOR (BEBÉS) */}
          {activeGame.id === 'fotos_proyector' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Proyector de Diapositivas ({babyPhotoIndex + 1}/{babyPhotosList.length})
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
                  <span>🚫 Regla: Si es su foto, −2 pts si pulsa</span>
                </div>
              </div>

              {/* CHIVATO SECRETO PARA EL ANFITRIÓN */}
              <div className="bg-slate-950/80 border border-amber-400/30 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                {/* Miniatura previa de la foto */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/60 border-2 border-slate-700 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={currentBabyPhoto.imageUrl}
                    alt={currentBabyPhoto.personName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {currentBabyPhoto.category}
                    </span>
                    {currentBabyPhoto.ownerPlayerName && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                        Prohibido pulsar a: {currentBabyPhoto.ownerPlayerName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-white">
                    {currentBabyPhoto.personName}
                  </h3>
                  {currentBabyPhoto.hint && (
                    <p className="text-xs text-slate-400">
                      Pista: <span className="text-slate-200 font-semibold">{currentBabyPhoto.hint}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={handleToggleBabyPhotoReveal}
                    className={`flex-1 md:flex-none px-4 py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      babyPhotoRevealed
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {babyPhotoRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{babyPhotoRevealed ? 'Ocultar Solución en TV' : '¡Revelar Solución en TV!'}</span>
                  </button>
                </div>
              </div>

              {/* SELECTOR RÁPIDO DE FOTOGRAFÍAS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xl">
                  {babyPhotosList.map((photo, idx) => (
                    <button
                      key={photo.id || idx}
                      onClick={() => handleSelectBabyPhotoDirect(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        babyPhotoIndex === idx
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      Foto {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevBabyPhoto}
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 active:scale-95 transition-all"
                    title="Foto anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextBabyPhoto}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <span>Siguiente Foto</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECCIÓN: SISTEMA DE CARTAS DE PODER PARA EQUIPOS */}
      <section className="bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🃏</span>
              <h2 className="text-lg font-black text-white">Sistema de Cartas de Poder</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                Mazo Común Único
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Reparte cartas únicas al inicio o al finalizar pruebas. Los equipos las juegan desde sus móviles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDealInitialCards}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black uppercase flex items-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <span>🃏 Repartir 1 Carta a Todos (Inicio)</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <select
                value={selectedBonusTeam}
                onChange={(e) => setSelectedBonusTeam(e.target.value)}
                className="bg-slate-900 text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-700 outline-none"
              >
                <option value="random">🎲 Equipo al azar</option>
                {activeTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleDealBonusCard(selectedBonusTeam)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase flex items-center gap-1.5 active:scale-95 transition-all"
                title="Repartir 1 carta bonus al finalizar una prueba"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Dar Bonus</span>
              </button>
            </div>

            <button
              onClick={handleResetPowerCards}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 active:scale-95 transition-all"
              title="Reiniciar mazo de cartas"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* METRICS DEL MAZO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">🎴</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">En Mazo Común</span>
              <span className="text-lg font-black text-indigo-400">{powerCards.deck.length} cartas</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">En Manos</span>
              <span className="text-lg font-black text-emerald-400">
                {Object.values(powerCards.teamHands).reduce((acc, h) => acc + h.length, 0)} cartas
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">🪦</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Descartes</span>
              <span className="text-lg font-black text-slate-400">{powerCards.discardPile.length} cartas</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Efectos Activos</span>
              <span className="text-lg font-black text-amber-400">{powerCards.activeEffects.length}</span>
            </div>
          </div>
        </div>

        {/* LISTA DE EFECTOS ACTIVOS SI HAY ALGUNO */}
        {powerCards.activeEffects.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-2">
            <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Efectos de Poder Activos en Esta Prueba:
            </span>
            <div className="flex flex-wrap gap-2">
              {powerCards.activeEffects.map((eff) => {
                const team = activeTeams.find((t) => t.id === eff.sourceTeamId);
                const targetTeam = eff.targetTeamId ? activeTeams.find((t) => t.id === eff.targetTeamId) : null;
                return (
                  <div
                    key={eff.id}
                    className="bg-slate-950/90 border border-amber-400/40 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2"
                  >
                    <span>{eff.cardEmoji}</span>
                    <strong className="text-white">{eff.cardName}</strong>
                    <span className="text-slate-400">de</span>
                    <span className="text-amber-300 font-bold">{team?.name || eff.sourceTeamName}</span>
                    {targetTeam && (
                      <>
                        <span className="text-slate-400">➔ Objetivo:</span>
                        <span className="text-red-300 font-bold">{targetTeam.name}</span>
                      </>
                    )}
                    {eff.targetPlayerName && (
                      <>
                        <span className="text-slate-400">➔ Jugador:</span>
                        <span className="text-red-300 font-bold">{eff.targetPlayerName}</span>
                      </>
                    )}
                    <button
                      onClick={() => handleRemoveActiveEffect(eff.id)}
                      className="ml-2 text-slate-500 hover:text-red-400 text-xs font-bold"
                      title="Quitar efecto"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INVENTARIO DE CARTAS POR EQUIPO */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Cartas en posesión de cada equipo:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeTeams.map((team) => {
              const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
              const hand = powerCards.teamHands[team.id] || [];

              return (
                <div
                  key={team.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${cat?.twBg}`} />
                      <h4 className="text-sm font-black text-white">{team.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold bg-slate-800 px-2 py-0.5 rounded-lg text-slate-300 border border-slate-700">
                      {hand.length} {hand.length === 1 ? 'carta' : 'cartas'}
                    </span>
                  </div>

                  {/* Cartas en mano */}
                  <div className="space-y-1.5 min-h-[48px]">
                    {hand.length === 0 ? (
                      <div className="text-slate-600 text-xs italic py-2">Sin cartas en mano</div>
                    ) : (
                      hand.map((cardId) => {
                        const card = getPowerCardById(cardId);
                        if (!card) return null;

                        return (
                          <div
                            key={cardId}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{card.emoji}</span>
                              <div>
                                <span className="text-xs font-black text-white block">{card.name}</span>
                                <span className="text-[10px] text-slate-400 block">{card.tagline}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handlePlayCardDirectly(team.id, card.id)}
                              className="px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 text-[10px] font-black uppercase transition-all"
                              title="Activar carta"
                            >
                              Jugar
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATÁLOGO DE JUEGOS: SELECCIÓN AUTOMÁTICA DEL MOTOR */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-indigo-400" />
              Catálogo de Concursos y Minijuegos
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
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

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-amber-400 font-bold">
                    {game.engine === 'buzzer' ? '⚡ Pulsador' : game.engine === 'challenges' ? '⏱ Cadena/Reto' : '🎲 Clasificación'}
                  </span>
                  {isSelected && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> En Pantalla
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* LISTA DE JUGADORES EN VIVO DETECTADOS */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Jugadores Detectados en Sala ({players.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPlayers([]);
                localStorage.removeItem(`party_players_${roomCode}`);
                roomSync.broadcast({ type: 'PLAYERS_UPDATE', payload: [] });
              }}
              className="text-[11px] text-red-400 hover:text-red-300 border border-red-500/30 px-2 py-1 rounded-lg font-semibold transition-all active:scale-95"
            >
              Vaciar Lista
            </button>
            <button
              onClick={() => roomSync.broadcast({ type: 'REQUEST_PLAYERS_SYNC' })}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Re-escanear
            </button>
          </div>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
            Aún no ha entrado ningún jugador. Los nombres aparecerán aquí al instante en que introduzcan su alias.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {players.map((p) => {
              const assignedTeam = teams.find((t) => t.id === p.team_id || t.team_index === p.team_index);
              const teamCatalog = assignedTeam ? TEAMS_CATALOG.find((c) => c.index === assignedTeam.team_index) : null;

              return (
                <div
                  key={p.id}
                  className={`border px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm transition-all ${
                    p.is_captain
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                      : 'bg-slate-800/90 border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${teamCatalog ? teamCatalog.twBg : 'bg-slate-500 animate-pulse'}`} />
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    {p.nickname}
                    {p.is_captain && <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {teamCatalog ? `(${teamCatalog.name})` : '(Sin bando)'}
                  </span>
                  {assignedTeam && (
                    <button
                      onClick={() => handleSetCaptain(assignedTeam.id, p.id)}
                      title={p.is_captain ? 'Capitán activo (Clic para desasignar o deshacer)' : 'Nombrar Capitán de su equipo'}
                      className={`ml-1 px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all active:scale-95 ${
                        p.is_captain
                          ? 'bg-amber-400 hover:bg-red-500 hover:text-white text-slate-950 shadow-sm'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      <Crown className={`w-3 h-3 ${p.is_captain ? 'fill-current' : ''}`} />
                      <span>{p.is_captain ? 'Quitar Cap ✕' : 'Nombrar Cap'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CONFIGURACIÓN DINÁMICA DE EQUIPOS & MARCADOR GENERAL */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold">Número de Equipos Dinámicos</h2>
              <p className="text-xs text-slate-400">Ajusta según las personas que asistan (2 a 6)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800 p-1.5 rounded-2xl border border-slate-700 w-fit">
            <button
              disabled={room.active_teams_count <= 2}
              onClick={() => handleTeamCountChange(room.active_teams_count - 1)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl disabled:opacity-30 active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-black w-8 text-center text-amber-400 font-mono">
              {room.active_teams_count}
            </span>
            <button
              disabled={room.active_teams_count >= TEAMS_CATALOG.length}
              onClick={() => handleTeamCountChange(room.active_teams_count + 1)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl disabled:opacity-30 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODIFICADOR MANUAL DE PUNTOS RÁPIDO (+1, -1, +5) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
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
                    <span className="text-[10px] uppercase font-bold text-slate-500 w-full">Miembros:</span>
                    {teamMembers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSetCaptain(team.id, m.id)}
                        title={m.is_captain ? 'Capitán activo (Clic para desasignar o deshacer capitanía)' : 'Nombrar Capitán a este jugador'}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
                          m.is_captain
                            ? 'bg-amber-400 hover:bg-red-500 hover:text-white text-slate-950 font-black shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Crown className={`w-3 h-3 ${m.is_captain ? 'fill-current' : 'text-slate-400'}`} />
                        <span>{m.nickname} {m.is_captain ? '(✕ Quitar)' : ''}</span>
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
      </section>
    </main>
  );
}

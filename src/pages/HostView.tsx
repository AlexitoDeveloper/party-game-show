import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { JukeboxState, JUKEBOX_PLAYLIST } from '../lib/audio';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { TEAMS_CATALOG } from '../lib/constants';
import { Room, Team, Player } from '../lib/types';
import { useBuzzerRace } from '../lib/useBuzzerRace';
import { getRoomSync, mergePlayersList } from '../lib/roomSync';
import { GAMES_CATALOG, GameDefinition, ScoringOption } from '../lib/games';
import { PowerCardsState } from '../lib/powerCards';
import { CoinBurstCelebration } from '../components/particles/CoinBurstCelebration';
import { calculateTestVerdict, TestVerdictCalculation } from '../lib/testVerdict';
import { HellCasinoBackground } from '../components/deco/HellCasinoBackground';

// Custom Hooks para estado de minijuegos y cartas
import { useHostMoviesState } from '../hooks/host/useHostMoviesState';
import { useHostBabyPhotosState } from '../hooks/host/useHostBabyPhotosState';
import { useHostMusicState } from '../hooks/host/useHostMusicState';
import { useHostTriviaState } from '../hooks/host/useHostTriviaState';
import { useHostUnDosTresState } from '../hooks/host/useHostUnDosTresState';
import { useHostBingoState } from '../hooks/host/useHostBingoState';
import { useHostMimicaState } from '../hooks/host/useHostMimicaState';
import { useHostPowerCards } from '../hooks/host/useHostPowerCards';

// Componentes modulares
import { HostHeaderControls } from '../components/host/HostHeaderControls';
import { HostLivePlayingConsole } from '../components/host/HostLivePlayingConsole';
import { HostStandbySection } from '../components/host/HostStandbySection';
import { HostActiveEffectsBanner } from '../components/host/HostActiveEffectsBanner';
import { HostPowerCardsTab } from '../components/host/HostPowerCardsTab';
import { HostGameCatalogTab } from '../components/host/HostGameCatalogTab';
import { HostTeamsScoreboard } from '../components/host/HostTeamsScoreboard';
import { HostSoundboardTab } from '../components/host/HostSoundboardTab';
import { HostPowerCardModals } from '../components/host/HostPowerCardModals';
import { HostTestVerdictModal } from '../components/host/HostTestVerdictModal';
import { usePreventAccidentalNavigation } from '../hooks/usePreventAccidentalNavigation';
import { useWakeLock } from '../hooks/useWakeLock';

export default function HostView() {
  const { code } = useParams<{ code: string }>();
  const roomCode = (code || '').toUpperCase();

  // Bloquear salida accidental por botón "Atrás" físico o gestual en móviles
  usePreventAccidentalNavigation();
  // Evitar bloqueo de pantalla en dispositivos móviles / tablets
  useWakeLock();

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
      game_phase: 'briefing',
      title: savedTitle || 'GAME SHOW ARENA',
    };
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(`party_teams_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return TEAMS_CATALOG.map((item) => ({
      id: `team_${item.index}`,
      room_id: 'room_' + roomCode,
      name: item.name,
      theme: item.theme,
      color_hex: item.colorHex,
      color_tw: item.twBg,
      score: 0,
      team_index: item.index,
      is_active: item.index <= 5,
    }));
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(`party_players_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [jukeboxState, setJukeboxState] = useState<JukeboxState>(() => {
    const saved = localStorage.getItem(`party_jukebox_${roomCode}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          const trackIdx = parsed.currentTrackIndex ?? parsed.trackIndex ?? 0;
          return {
            isPlaying: !!parsed.isPlaying,
            currentTrackIndex: trackIdx,
            currentTrack: parsed.currentTrack || parsed.track || JUKEBOX_PLAYLIST[trackIdx] || JUKEBOX_PLAYLIST[0],
            volume: typeof parsed.volume === 'number' ? parsed.volume : 0.35,
            isMuted: !!parsed.isMuted,
            isDucked: !!parsed.isDucked,
            contextReason: parsed.contextReason,
            contextFactor: parsed.contextFactor,
          };
        }
      } catch {}
    }
    return {
      isPlaying: false,
      currentTrackIndex: 0,
      currentTrack: JUKEBOX_PLAYLIST[0],
      volume: 0.35,
      isMuted: false,
      isDucked: false,
    };
  });



  const [showCoinBurst, setShowCoinBurst] = useState(false);
  const [selectedTeamForPoints, setSelectedTeamForPoints] = useState<string>('');
  const [podiumPage, setPodiumPage] = useState<'podium' | 'medals'>('podium');
  const [activeTab, setActiveTab] = useState<'live' | 'cards' | 'teams' | 'catalog' | 'soundboard'>('live');
  const [roundHits, setRoundHits] = useState<Record<string, number>>({});
  const [manualPodiumRanks, setManualPodiumRanks] = useState<Record<string, number>>({});
  const [testFinishedModal, setTestFinishedModal] = useState<{
    gameTitle: string;
    gameId: string;
    suggestedNextGame?: GameDefinition;
  } | null>(null);
  const [isTvQrOpen, setIsTvQrOpen] = useState(false);

  // Instancia de sincronización multi-pantalla como anfitrión (Árbitro Maestro oficial)
  const roomSync = useMemo(() => getRoomSync(roomCode, 'host'), [roomCode]);
  const { resetBuzzer, isLocked, winner } = useBuzzerRace({
    roomCode,
    isHostOrTv: true,
    isArbitrator: true,
    roomSync,
  });

  // Proxy de audio silencioso para el Host:
  // El Host es 100% silencioso y retransmite todos los sonidos y fanfarrias exclusivamente a la TV
  const hostTvAudioProxy = useMemo(() => ({
    playSound: (sound: string) => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound } }),
    playVictory: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'success' } }),
    playFail: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'fail' } }),
    playSuccess: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'success' } }),
    playBuzzer: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'buzzer' } }),
    playBuzzerWrong: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'fail' } }),
    playDrumRoll: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'drumroll' } }),
    playApplause: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'applause' } }),
    playAirHorn: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'airhorn' } }),
    playSuspense: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'suspense' } }),
    playPowerCard: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'power_card' } }),
    playTick: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'tick' } }),
    playJoin: () => {},
    playDecoBell: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'deco_bell' } }),
    playSpeakeasyBrass: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'brass' } }),
    playWahWahFail: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'wah_wah' } }),
    playCardSnap: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'card_snap' } }),
    playCardSlam: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'card_slam' } }),
    playChipClink: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'chip_clink' } }),
  }), [roomSync]);

  // Juego activo según el ID seleccionado
  const activeGame: GameDefinition = useMemo(() => {
    const found = GAMES_CATALOG.find((g) => g.id === room.active_game_id);
    return found || GAMES_CATALOG[0];
  }, [room.active_game_id]);

  const activeTeams = teams.filter((t) => t.is_active);
  const selectedTeamObj = teams.find((t) => t.id === selectedTeamForPoints);
  const selectedTeamCatalog = selectedTeamObj
    ? TEAMS_CATALOG.find((c) => c.index === selectedTeamObj.team_index)
    : null;

  // Referencias para que los callbacks y listeners lean el estado actual
  const roomRef = useRef(room);
  useEffect(() => { roomRef.current = room; }, [room]);
  const teamsRef = useRef(teams);
  useEffect(() => { teamsRef.current = teams; }, [teams]);
  const playersRef = useRef(players);
  useEffect(() => { playersRef.current = players; }, [players]);
  const powerCardsRef = useRef<PowerCardsState | null>(null);
  const roundHitsRef = useRef(roundHits);
  useEffect(() => {
    roundHitsRef.current = roundHits;
    roomSync.broadcast({
      type: 'ROUND_HITS_UPDATE',
      payload: { roundHits, gameId: room.active_game_id || room.current_game },
    });
  }, [roundHits, room.active_game_id, room.current_game, roomSync]);

  // Modificar puntuación con celebración y sincronización a TV
  const handleScoreChange = async (teamId: string, delta: number, silent?: boolean) => {
    let effectiveDelta = delta;

    // Resolver el equipo objetivo de forma tolerante a UUIDs, team_${idx} o formato prefijado
    const targetTeam = teams.find(
      (t) =>
        t.id === teamId ||
        (teamId.startsWith('team_') && t.id.endsWith(teamId.replace('team_', ''))) ||
        (teamId.startsWith('team_') && String(t.team_index) === teamId.replace(/^.*_/, '')) ||
        String(t.team_index) === teamId
    );
    const resolvedTeamId = targetTeam ? targetTeam.id : teamId;

    const updatedTeams = teams.map((t) =>
      t.id === resolvedTeamId || t.id === teamId
        ? { ...t, score: Math.max(0, t.score + effectiveDelta) }
        : t
    );
    teamsRef.current = updatedTeams;
    setTeams(updatedTeams);
    localStorage.setItem(`party_teams_${roomCode}`, JSON.stringify(updatedTeams));

    roomSync.broadcast({
      type: 'TEAMS_UPDATE',
      payload: updatedTeams,
    });

    if (!silent) {
      if (delta > 0) {
        hostTvAudioProxy.playSuccess();
        setShowCoinBurst(true);
        setTimeout(() => setShowCoinBurst(false), 2000);
      } else {
        hostTvAudioProxy.playFail();
      }
    }

    if (isSupabaseConfigured && targetTeam) {
      await supabase.from('teams').update({
        score: Math.max(0, targetTeam.score + effectiveDelta),
      }).eq('id', targetTeam.id);
    }
  };

  // Minigame States (Hooks personalizados con proxy de audio silencioso a TV)
  const moviesState = useHostMoviesState({
    roomCode,
    roomSync,
    resetBuzzer,
    isLocked,
    winner,
    teams,
    selectedTeamCatalog,
    handleScoreChange,
    setRoundHits,
    soundFX: hostTvAudioProxy,
  });

  const babyPhotosState = useHostBabyPhotosState({
    roomCode,
    roomSync,
    resetBuzzer,
    isLocked,
    winner,
    teams,
    selectedTeamCatalog,
    handleScoreChange,
    setRoundHits,
    soundFX: hostTvAudioProxy,
  });

  const musicState = useHostMusicState({
    roomCode,
    roomSync,
    resetBuzzer,
    isLocked,
    winner,
    teams,
    selectedTeamCatalog,
    handleScoreChange,
    setRoundHits,
    soundFX: hostTvAudioProxy,
  });

  const triviaState = useHostTriviaState({
    roomSync,
    resetBuzzer,
    winner,
    teams,
    selectedTeamCatalog,
    handleScoreChange,
    setRoundHits,
    soundFX: hostTvAudioProxy,
  });

  const unDosTresState = useHostUnDosTresState({
    roomSync,
    teams,
    handleScoreChange,
    setRoundHits,
    soundFX: hostTvAudioProxy,
  });

  const bingoState = useHostBingoState({
    roomSync,
    roomCode,
    setRoundHits,
    teams,
  });
  const bingoStateRef = useRef(bingoState);
  useEffect(() => {
    bingoStateRef.current = bingoState;
  }, [bingoState]);

  const mimicaState = useHostMimicaState({
    roomSync,
    teams,
    selectedTeamCatalog,
    activeTeams,
    roundHits,
    setRoundHits,
    soundFX: hostTvAudioProxy,
  });

  const moviesStateRef = useRef(moviesState);
  useEffect(() => { moviesStateRef.current = moviesState; }, [moviesState]);
  const babyPhotosStateRef = useRef(babyPhotosState);
  useEffect(() => { babyPhotosStateRef.current = babyPhotosState; }, [babyPhotosState]);
  const musicStateRef = useRef(musicState);
  useEffect(() => { musicStateRef.current = musicState; }, [musicState]);
  const triviaStateRef = useRef(triviaState);
  useEffect(() => { triviaStateRef.current = triviaState; }, [triviaState]);
  const unDosTresStateRef = useRef(unDosTresState);
  useEffect(() => { unDosTresStateRef.current = unDosTresState; }, [unDosTresState]);
  const mimicaStateRef = useRef(mimicaState);
  useEffect(() => { mimicaStateRef.current = mimicaState; }, [mimicaState]);
  const buzzerStateRef = useRef({ isLocked, winner });
  useEffect(() => { buzzerStateRef.current = { isLocked, winner }; }, [isLocked, winner]);

  // Power Cards State (Hook personalizado con proxy de audio silencioso a TV)
  const powerCardsHook = useHostPowerCards({
    roomCode,
    room,
    roomSync,
    activeTeams,
    players,
    activeGame,
    handleScoreChange,
    soundFX: hostTvAudioProxy,
  });

  const { powerCards, setPowerCards } = powerCardsHook;
  useEffect(() => {
    powerCardsRef.current = powerCards;
  }, [powerCards]);

  const handlePlaySoundEffect = (soundName: string) => {
    // Modo anfitrión silencioso: se delega el sonido 100% a la pantalla de TV
    roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: soundName } });
  };

  const handleToggleTvQr = () => {
    setIsTvQrOpen((prev) => {
      const next = !prev;
      roomSync.broadcast({ type: 'SHOW_TV_QR', payload: { isOpen: next } });
      return next;
    });
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

  useEffect(() => {
    localStorage.setItem(`party_jukebox_${roomCode}`, JSON.stringify(jukeboxState));
  }, [jukeboxState, roomCode]);

  // Sincronización instantánea de jugadores entre pestañas en el mismo portátil (HDMI Laptop + Host tab)
  useEffect(() => {
    if (!roomCode || typeof window === 'undefined') return;
    const storageKey = `party_players_${roomCode}`;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const updated = mergePlayersList(playersRef.current, parsed);
            playersRef.current = updated;
            setPlayers(updated);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [roomCode]);

  // Sincronizar automáticamente el equipo seleccionado para puntos con el ganador del buzzer
  useEffect(() => {
    if (isLocked && winner) {
      const matched = teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId);
      if (matched) {
        setSelectedTeamForPoints(matched.id);
      }
    }
  }, [isLocked, winner, teams]);

  // Emitir foto autoritativa completa de la sala (para TV y móviles Android/iOS al entrar o reconectar)
  const broadcastFullRoomSnapshot = (overridePlayers?: Player[]) => {
    const curRoom = roomRef.current;
    roomSync.broadcast({
      type: 'ROOM_UPDATE',
      payload: {
        status: curRoom.status,
        current_game: curRoom.current_game,
        active_game_id: curRoom.active_game_id,
        active_teams_count: curRoom.active_teams_count,
        game_phase: curRoom.game_phase || 'briefing',
        presentation_slide: curRoom.presentation_slide,
        title: curRoom.title,
      },
    });
    roomSync.broadcast({
      type: 'GAME_PHASE_UPDATE',
      payload: {
        phase: curRoom.game_phase || 'briefing',
        game_id: curRoom.active_game_id || undefined,
      },
    });
    roomSync.broadcast({ type: 'TEAMS_UPDATE', payload: teamsRef.current });
    roomSync.broadcast({ type: 'PLAYERS_UPDATE', payload: overridePlayers || playersRef.current });
    if (powerCardsRef.current) {
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: powerCardsRef.current });
    }
    if (buzzerStateRef.current.isLocked && buzzerStateRef.current.winner) {
      roomSync.broadcast({ type: 'BUZZER_LOCKED', payload: buzzerStateRef.current.winner });
    } else {
      roomSync.broadcast({ type: 'BUZZER_RESET' });
    }

    if (curRoom.status === 'playing') {
      const activeId = curRoom.active_game_id;
      if (activeId === 'music') {
        const ms = musicStateRef.current;
        ms.syncMusicState(ms.musicPlaying, ms.musicRevealed);
      } else if (activeId === 'movies') {
        const mvs = moviesStateRef.current;
        mvs.syncMovieState(mvs.movieIndex, mvs.movieFrameLevel, mvs.movieRevealed, mvs.movieCategoryFilter, mvs.currentMovie);
      } else if (activeId === 'trivial') {
        const ts = triviaStateRef.current;
        ts.syncTriviaState(ts.triviaIndex, ts.triviaRevealed, ts.triviaReboundActive, ts.currentTriviaQuestion);
      } else if (activeId === 'fotos_proyector') {
        const bps = babyPhotosStateRef.current;
        bps.syncBabyPhotoState(bps.babyPhotoIndex, bps.babyPhotoRevealed, bps.currentBabyPhoto, bps.babyPhotosList.length);
      } else if (activeId === 'un_dos_tres') {
        const udt = unDosTresStateRef.current;
        udt.syncUdtState(udt.udtPromptIndex, udt.currentUdtTeam?.id, udt.udtEliminatedTeamIds, udt.udtCountdown, udt.udtIsTimerRunning, udt.currentUdtChallenge);
      } else if (activeId === 'bingo') {
        bingoStateRef.current.syncBingoState();
      } else if (activeId === 'mimica') {
        const mms = mimicaStateRef.current;
        mms.syncMimicaState(mms.mimicaHitsCount, mms.mimicaTimerSeconds, mms.mimicaIsRunning);
      }
    }

    roomSync.broadcast({
      type: 'ROUND_HITS_UPDATE',
      payload: {
        roundHits: roundHitsRef.current,
        gameId: curRoom.active_game_id || curRoom.current_game,
      },
    });
  };

  // Escuchar eventos de sincronización entrantes y pulso periódico de auto-curación para móviles Android/iOS
  useEffect(() => {
    roomSync.broadcast({ type: 'REQUEST_PLAYERS_SYNC' });
    broadcastFullRoomSnapshot();

    // Pulso periódico cada 6s para garantizar que ningún móvil Android/iOS o TV quede desincronizado tras micro-cortes de red
    const syncPulseInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      broadcastFullRoomSnapshot();
    }, 6000);

    const unsubscribe = roomSync.onEvent((event) => {
      if (event.type === 'PLAYER_JOINED') {
        const updated = mergePlayersList(playersRef.current, [event.payload]);
        playersRef.current = updated;
        setPlayers(updated);
        localStorage.setItem(`party_players_${roomCode}`, JSON.stringify(updated));
        broadcastFullRoomSnapshot(updated);
      } else if (event.type === 'REQUEST_ROOM_SYNC') {
        broadcastFullRoomSnapshot();
      } else if (event.type === 'PLAYER_UPDATED') {
        const updated = mergePlayersList(playersRef.current, [event.payload]);
        playersRef.current = updated;
        setPlayers(updated);
        localStorage.setItem(`party_players_${roomCode}`, JSON.stringify(updated));
        roomSync.broadcast({ type: 'PLAYERS_UPDATE', payload: updated });
      } else if (event.type === 'PLAYERS_UPDATE') {
        const updated = mergePlayersList(playersRef.current, event.payload);
        playersRef.current = updated;
        setPlayers(updated);
        localStorage.setItem(`party_players_${roomCode}`, JSON.stringify(updated));
      } else if (event.type === 'PLAYERS_CLEAR') {
        playersRef.current = [];
        setPlayers([]);
        localStorage.removeItem(`party_players_${roomCode}`);
        roomSync.broadcast({ type: 'PLAYERS_UPDATE', payload: [] });
      } else if (event.type === 'RETURN_TO_LOBBY') {
        setRoom((prev) => ({ ...prev, status: 'lobby' }));
      } else if (event.type === 'SWITCH_GAME') {
        setRoom((prev) => ({
          ...prev,
          status: event.payload.status,
          current_game: event.payload.current_game,
          active_game_id: event.payload.game_id || prev.active_game_id,
          game_phase: event.payload.game_phase || 'briefing',
        }));
      } else if (event.type === 'GAME_PHASE_UPDATE') {
        setRoom((prev) => ({
          ...prev,
          game_phase: event.payload.phase,
        }));
      } else if (event.type === 'ROOM_UPDATE') {
        setRoom((prev) => ({ ...prev, ...event.payload }));
      } else if (event.type === 'TEAMS_UPDATE') {
        setTeams(event.payload);
      } else if (event.type === 'POWER_CARD_PLAY_REQUEST') {
        const { sourceTeamId, cardId, targetTeamId, targetPlayerName, targetCardId } = event.payload;
        powerCardsHook.handlePlayCardDirectly(sourceTeamId, cardId, targetTeamId, targetPlayerName, targetCardId);
      } else if (event.type === 'JUKEBOX_STATE_SYNC') {
        setJukeboxState(event.payload);
      } else if (event.type === 'PODIUM_PAGE_CHANGE') {
        setPodiumPage(event.payload.page);
      } else if (event.type === 'SHOW_TV_QR') {
        setIsTvQrOpen(event.payload.isOpen);
      } else if (event.type === 'TOGGLE_TV_QR') {
        setIsTvQrOpen((prev) => (event.payload?.isOpen !== undefined ? event.payload.isOpen : !prev));
      } else if (event.type === 'REQUEST_PLAYERS_SYNC') {
        roomSync.broadcast({ type: 'PLAYERS_UPDATE', payload: playersRef.current });
        if (powerCardsRef.current) {
          roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: powerCardsRef.current });
        }
      }
    });

    return () => {
      clearInterval(syncPulseInterval);
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

  // Acciones de Navegación del Show
  const handleStartPresentation = () => {
    const updatedRoom: Room = { ...room, status: 'presentation', presentation_slide: 0 };
    roomRef.current = updatedRoom;
    setRoom(updatedRoom);
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(updatedRoom));
    roomSync.broadcast({ type: 'PRESENTATION_SLIDE', payload: { slide: 0 } });
    roomSync.broadcast({ type: 'ROOM_UPDATE', payload: { status: 'presentation', presentation_slide: 0 } });
  };

  const handleSetPresentationSlide = (slide: number) => {
    const updatedRoom: Room = { ...room, status: 'presentation', presentation_slide: slide };
    roomRef.current = updatedRoom;
    setRoom(updatedRoom);
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(updatedRoom));
    roomSync.broadcast({ type: 'PRESENTATION_SLIDE', payload: { slide } });
    roomSync.broadcast({ type: 'ROOM_UPDATE', payload: { status: 'presentation', presentation_slide: slide } });
  };

  const handleFinishTest = (gameTitle?: unknown, winnerTeamName?: unknown) => {
    const activeTitle =
      typeof gameTitle === 'string' && gameTitle.trim() ? gameTitle : activeGame.title;
    const safeWinnerTeamName =
      typeof winnerTeamName === 'string' ? winnerTeamName : undefined;

    if (musicState.musicPlaying) {
      musicState.handleTogglePlayMusic();
    }
    resetBuzzer();

    roomSync.broadcast({
      type: 'TEST_FINISHED',
      payload: {
        gameTitle: activeTitle,
        winnerTeamName: safeWinnerTeamName,
      },
    });

    const currentIndex = GAMES_CATALOG.findIndex((g) => g.id === (room.active_game_id || activeGame.id));
    const nextGame =
      currentIndex >= 0 && currentIndex < GAMES_CATALOG.length - 1
        ? GAMES_CATALOG[currentIndex + 1]
        : undefined;

    setTestFinishedModal({
      gameTitle: activeTitle,
      gameId: room.active_game_id || activeGame.id,
      suggestedNextGame: nextGame,
    });
  };

  const handleReturnToLobby = async () => {
    powerCardsHook.handleClearAllActiveEffects();
    setShowCoinBurst(false);
    const updatedRoom: Room = { ...room, status: 'lobby' };
    roomRef.current = updatedRoom;
    setRoom(updatedRoom);

    if (musicState.musicPlaying) {
      musicState.handleTogglePlayMusic();
    }

    roomSync.broadcast({ type: 'RETURN_TO_LOBBY' });
    roomSync.broadcast({ type: 'JUKEBOX_COMMAND', payload: { action: 'play' } });

    if (isSupabaseConfigured) {
      await supabase.from('rooms').update({ status: 'lobby' }).eq('code', roomCode);
    }
  };

  const handleSelectGame = async (game: GameDefinition) => {
    setShowCoinBurst(false);
    setRoundHits({});
    setManualPodiumRanks({});
    const updatedRoom: Room = {
      ...room,
      status: 'playing',
      current_game: game.engine,
      active_game_id: game.id,
      game_phase: 'briefing',
    };
    roomRef.current = updatedRoom;
    setRoom(updatedRoom);
    resetBuzzer();
    setActiveTab('live');

    if (powerCards && powerCards.activeEffects.length > 0) {
      powerCardsHook.handleClearAllActiveEffects();
    }

    roomSync.broadcast({
      type: 'SWITCH_GAME',
      payload: {
        status: 'playing',
        current_game: game.engine,
        game_id: game.id,
        game_phase: 'briefing',
      },
    });

    if (game.id === 'movies') {
      moviesState.syncMovieState(moviesState.movieIndex, moviesState.movieFrameLevel, moviesState.movieRevealed);
    }
    if (game.id === 'fotos_proyector') {
      babyPhotosState.syncBabyPhotoState(babyPhotosState.babyPhotoIndex, babyPhotosState.babyPhotoRevealed);
    }
    if (game.id === 'trivial') {
      triviaState.syncTriviaState(triviaState.triviaIndex, triviaState.triviaRevealed, triviaState.triviaReboundActive, triviaState.currentTriviaQuestion);
    }
    if (game.id === 'mimica') {
      mimicaState.syncMimicaState(mimicaState.mimicaHitsCount, mimicaState.mimicaTimerSeconds, mimicaState.mimicaIsRunning);
    }
    if (game.id === 'un_dos_tres') {
      unDosTresState.syncUdtState(unDosTresState.udtPromptIndex, unDosTresState.currentUdtTeam?.id, unDosTresState.udtEliminatedTeamIds, unDosTresState.udtCountdown, unDosTresState.udtIsTimerRunning, unDosTresState.currentUdtChallenge);
    }
    if (game.id === 'bingo') {
      bingoState.syncBingoState();
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('rooms').update({
          status: 'playing',
          current_game: game.engine,
          active_game_id: game.id,
          game_phase: 'briefing',
        }).eq('code', roomCode);
      } catch (err) {
        console.warn('Error al persistir inicio de juego en Supabase:', err);
      }
    }
  };

  const handleStartActiveRound = () => {
    const updatedRoom: Room = {
      ...room,
      game_phase: 'active',
    };
    roomRef.current = updatedRoom;
    setRoom(updatedRoom);
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(updatedRoom));
    roomSync.broadcast({
      type: 'ROOM_UPDATE',
      payload: { game_phase: 'active' },
    });
    roomSync.broadcast({
      type: 'GAME_PHASE_UPDATE',
      payload: {
        phase: 'active',
        game_id: room.active_game_id || activeGame.id,
      },
    });
    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase.from('rooms').update({ game_phase: 'active' }).eq('code', roomCode)
      ).catch((err: any) => {
        console.warn('Aviso Supabase: asegúrate de haber ejecutado la migración de game_phase en rooms.', err);
      });
    }
    hostTvAudioProxy.playDecoBell();
  };

  const handleToggleBriefing = () => {
    const nextPhase = room.game_phase === 'briefing' ? 'active' : 'briefing';
    const updatedRoom: Room = {
      ...room,
      game_phase: nextPhase,
    };
    roomRef.current = updatedRoom;
    setRoom(updatedRoom);
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(updatedRoom));
    roomSync.broadcast({
      type: 'ROOM_UPDATE',
      payload: { game_phase: nextPhase },
    });
    roomSync.broadcast({
      type: 'GAME_PHASE_UPDATE',
      payload: {
        phase: nextPhase,
        game_id: room.active_game_id || activeGame.id,
      },
    });
    if (isSupabaseConfigured) {
      Promise.resolve(
        supabase.from('rooms').update({ game_phase: nextPhase }).eq('code', roomCode)
      ).catch((err: any) => {
        console.warn('Aviso Supabase: asegúrate de haber ejecutado la migración de game_phase en rooms.', err);
      });
    }
  };

  const handleFinishShowAndShowGazette = async () => {
    const updatedRoom: Room = { ...room, status: 'podium' };
    roomRef.current = updatedRoom;
    setRoom(updatedRoom);
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(updatedRoom));
    roomSync.broadcast({
      type: 'ROOM_UPDATE',
      payload: { status: 'podium' },
    });
    roomSync.broadcast({ type: 'JUKEBOX_COMMAND', payload: { action: 'play' } });
    hostTvAudioProxy.playVictory();

    if (isSupabaseConfigured) {
      await supabase.from('rooms').update({ status: 'podium' }).eq('code', roomCode);
    }
  };

  const handleApplyScoreAction = (option: ScoringOption) => {
    const targetTeamId =
      selectedTeamForPoints ||
      (winner ? teams.find((t) => t.team_index === winner.teamIndex)?.id : null) ||
      activeTeams[0]?.id;
    if (!targetTeamId) return;

    if (option.type === 'podium') {
      // Las opciones de tipo 'podium' determinan la posición final en la prueba para el veredicto oficial.
      // Setean los aciertos/posición para el podio sin sumar score en vivo para evitar doble suma al aplicar veredicto.
      const hitsForRank = option.delta;
      setRoundHits((prev) => ({
        ...prev,
        [targetTeamId]: hitsForRank,
      }));
      hostTvAudioProxy.playVictory();
      return;
    }

    handleScoreChange(targetTeamId, option.delta);
    const hitsToAdd = option.hitsDelta !== undefined ? option.hitsDelta : (option.delta > 0 ? 1 : 0);
    if (hitsToAdd !== 0) {
      setRoundHits((prev) => ({
        ...prev,
        [targetTeamId]: Math.max(0, (prev[targetTeamId] || 0) + hitsToAdd),
      }));
    }

    if (room.active_game_id === 'music') {
      if (option.delta > 0) {
        musicState.setMusicRevealed(true);
      }
      musicState.setMusicPlaying(true);
      if (isLocked) resetBuzzer();
      musicState.syncMusicState(option.delta > 0, true);
    } else if (room.active_game_id === 'movies') {
      if (option.delta > 0) {
        moviesState.setMovieRevealed(true);
        moviesState.syncMovieState(moviesState.movieIndex, moviesState.movieFrameLevel, true);
      }
      if (isLocked) resetBuzzer();
    } else if (room.active_game_id === 'trivial') {
      if (option.delta > 0) {
        triviaState.setTriviaRevealed(true);
        triviaState.setTriviaReboundActive(false);
        triviaState.syncTriviaState(triviaState.triviaIndex, true, false);
      }
      if (isLocked) resetBuzzer();
    } else if (room.active_game_id === 'fotos_proyector') {
      if (option.delta > 0) {
        babyPhotosState.setBabyPhotoRevealed(true);
        babyPhotosState.syncBabyPhotoState(babyPhotosState.babyPhotoIndex, true);
      }
      if (isLocked) resetBuzzer();
    } else {
      if (isLocked) resetBuzzer();
    }
  };

  const handleTeamCountChange = async (newCount: number) => {
    if (newCount < 2 || newCount > TEAMS_CATALOG.length) return;

    const updatedTeams = teams.map((t) => ({ ...t, is_active: t.team_index <= newCount }));
    const updatedRoom = { ...room, active_teams_count: newCount };

    roomRef.current = updatedRoom;
    teamsRef.current = updatedTeams;
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

  // Cálculo de veredicto automatizado
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
      gameId: testFinishedModal.gameId || '',
      gameTitle: testFinishedModal.gameTitle || '',
      teams: activeTeams || [],
      roundHits: roundHits || {},
      manualRanks: manualPodiumRanks || {},
      activeEffects: powerCards?.activeEffects || [],
    });
  }, [testFinishedModal, activeTeams, roundHits, manualPodiumRanks, powerCards?.activeEffects]);

  const handleApplyAutomatedVerdict = () => {
    if (!testFinishedModal || !currentVerdict?.results || currentVerdict.results.length === 0) return;

    const isBingo = testFinishedModal.gameId === 'bingo';
    const updatedTeams = teams.map((t) => {
      const res = currentVerdict.results.find((r) => r.teamId === t.id);
      if (!res) return t;

      let pointsToAdd = res.finalPoints || 0;
      // En Bingo, los puntos base (+2 Línea, +6 Bingo) ya fueron otorgados en vivo durante la partida mediante handleResolveClaim.
      // Al aplicar el veredicto, sólo se deben sumar los puntos adicionales por Cartas de Poder (totalCardDelta),
      // salvo que el MC haya reasignado puestos manuales a un equipo sin aciertos previos.
      if (isBingo) {
        const liveHits = roundHits[t.id] || 0;
        if (liveHits > 0) {
          pointsToAdd = res.totalCardDelta || 0;
        }
      }

      return {
        ...t,
        score: Math.max(0, (t.score || 0) + pointsToAdd),
      };
    });
    teamsRef.current = updatedTeams;
    setTeams(updatedTeams);
    localStorage.setItem(`party_teams_${roomCode}`, JSON.stringify(updatedTeams));
    roomSync.broadcast({ type: 'TEAMS_UPDATE', payload: updatedTeams });

    if (currentVerdict.consumedEffectIds && currentVerdict.consumedEffectIds.length > 0) {
      const nextEffects = (powerCards?.activeEffects || []).filter(
        (eff: any) => !currentVerdict.consumedEffectIds.includes(eff.id)
      );
      const consumedCardIds = (powerCards?.activeEffects || [])
        .filter((eff: any) => currentVerdict.consumedEffectIds.includes(eff.id))
        .map((eff: any) => eff.cardId);
      const nextDiscard = [...(powerCards?.discardPile || []), ...consumedCardIds];
      const nextPowerCards: PowerCardsState = {
        ...powerCards,
        activeEffects: nextEffects,
        discardPile: nextDiscard,
      };
      setPowerCards(nextPowerCards);
      localStorage.setItem(`party_power_cards_${roomCode}`, JSON.stringify(nextPowerCards));
      roomSync.broadcast({ type: 'POWER_CARDS_STATE_UPDATE', payload: nextPowerCards });
    }

    // Retransmitir veredicto aplicado: la TV activa su propia fanfarria y animación oficial
    roomSync.broadcast({
      type: 'TEST_VERDICT_APPLIED',
      payload: {
        gameTitle: testFinishedModal.gameTitle,
        results: currentVerdict.results,
      },
    });

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

    setRoundHits({});
    setManualPodiumRanks({});
    setTestFinishedModal(null);
  };

  return (
    <HellCasinoBackground intensity="medium">
      <main className="p-3 sm:p-5 max-w-3xl mx-auto space-y-3 select-none relative text-white font-sans pb-10">
        <CoinBurstCelebration active={showCoinBurst} onComplete={() => setShowCoinBurst(false)} />

        <HostHeaderControls
          room={room}
          roomCode={roomCode}
          playersCount={players.length}
          activeGame={activeGame}
          podiumPage={podiumPage}
          isTvQrOpen={isTvQrOpen}
          onToggleTvQr={handleToggleTvQr}
          onFinishTest={handleFinishTest}
          onFinishShowAndShowGazette={handleFinishShowAndShowGazette}
          onReturnToLobby={handleReturnToLobby}
          onSetPodiumPage={(page) => {
            setPodiumPage(page);
            roomSync.broadcast({ type: 'PODIUM_PAGE_CHANGE', payload: { page } });
          }}
          onSelectGame={handleSelectGame}
          onSetPresentationSlide={handleSetPresentationSlide}
        />

        {/* BARRA DE NAVEGACIÓN MÓVIL DE 4 PESTAÑAS */}
        <nav className="sticky top-2 z-50 grid grid-cols-4 gap-1.5 p-1 bg-[#0c0c14]/95 border-2 border-[#d4af37]/45 rounded-2xl shadow-deco-gold backdrop-blur-xl">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-broadway text-xs uppercase tracking-wider transition-all active:scale-95 ${
              activeTab === 'live'
                ? 'bg-gold-gradient text-slate-950 shadow-md font-black'
                : 'bg-[#14141e]/80 text-amber-200/70 border border-[#d4af37]/20'
            }`}
          >
            <span>🎮</span>
            <span className="truncate">Mando</span>
            {room.status === 'playing' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-broadway text-xs uppercase tracking-wider transition-all active:scale-95 ${
              activeTab === 'catalog'
                ? 'bg-gold-gradient text-slate-950 shadow-md font-black'
                : 'bg-[#14141e]/80 text-amber-200/70 border border-[#d4af37]/20'
            }`}
          >
            <span>🎲</span>
            <span className="truncate">Juegos</span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-broadway text-xs uppercase tracking-wider transition-all active:scale-95 ${
              activeTab === 'teams'
                ? 'bg-gold-gradient text-slate-950 shadow-md font-black'
                : 'bg-[#14141e]/80 text-amber-200/70 border border-[#d4af37]/20'
            }`}
          >
            <span>🏆</span>
            <span className="truncate">Equipos</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-broadway text-xs uppercase tracking-wider transition-all active:scale-95 relative ${
              activeTab === 'cards' || activeTab === 'soundboard'
                ? 'bg-gold-gradient text-slate-950 shadow-md font-black'
                : 'bg-[#14141e]/80 text-amber-200/70 border border-[#d4af37]/20'
            }`}
          >
            <span>🃏</span>
            <span className="truncate">Cartas/FX</span>
            {powerCards.activeEffects.length > 0 && (
              <span className="text-[10px] bg-slate-950 text-amber-300 border border-amber-400 px-1 rounded-full font-black">
                {powerCards.activeEffects.length}
              </span>
            )}
          </button>
        </nav>

        {/* PESTAÑA 1: MANDO EN DIRECTO */}
        {activeTab === 'live' && (
          <div className="space-y-3">
            {/* TIRA COMPACTA DE PUNTUACIONES EN UNA LÍNEA */}
            <div className="bg-[#0c0c14]/90 border border-[#d4af37]/35 rounded-2xl px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {activeTeams.map((t) => {
                  const cat = TEAMS_CATALOG.find((c) => c.index === t.team_index);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab('teams')}
                      className="px-2 py-1 rounded-xl bg-[#14141e] border border-[#d4af37]/30 flex items-center gap-1.5 text-xs whitespace-nowrap shrink-0 active:scale-95"
                      title="Toca para ajustar puntos en Equipos"
                    >
                      <span className={`w-2 h-2 rounded-full ${cat?.twBg}`} />
                      <span className="font-vintage text-amber-100/90">{t.name}:</span>
                      <span className="font-broadway text-gold-gradient font-black">{t.score}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-[#d4af37]/25">
                <button
                  onClick={() => handlePlaySoundEffect('fail')}
                  className="p-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-xs active:scale-95"
                  title="Sonido Fallo"
                >
                  ❌
                </button>
                <button
                  onClick={() => handlePlaySoundEffect('success')}
                  className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs active:scale-95"
                  title="Sonido Acierto"
                >
                  🎯
                </button>
                <button
                  onClick={() => handlePlaySoundEffect('drumroll')}
                  className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-xs active:scale-95"
                  title="Redoble"
                >
                  🥁
                </button>
              </div>
            </div>

            {/* EFECTOS DE CARTAS ACTIVOS EN ESTA PRUEBA (SI HAY ALGUNO) */}
            <HostActiveEffectsBanner
              powerCards={powerCards}
              activeTeams={activeTeams}
              teams={teams}
              onClearAllActiveEffects={powerCardsHook.handleClearAllActiveEffects}
              onScoreChange={handleScoreChange}
              onRemoveActiveEffect={powerCardsHook.handleRemoveActiveEffect}
              onReturnCardToTeam={powerCardsHook.handleReturnCardToTeam}
              onTeamsUpdate={(updated) => {
                setTeams(updated);
                roomSync.broadcast({ type: 'TEAMS_UPDATE', payload: updated });
              }}
            />

            {room.status === 'playing' ? (
              <HostLivePlayingConsole
                activeGame={activeGame}
                activeTeams={activeTeams}
                teams={teams}
                selectedTeamForPoints={selectedTeamForPoints}
                onSelectTeamForPoints={setSelectedTeamForPoints}
                selectedTeamCatalog={selectedTeamCatalog || undefined}
                isLocked={isLocked}
                winner={winner}
                onResetBuzzer={resetBuzzer}
                onApplyScoreAction={handleApplyScoreAction}
                onScoreChange={handleScoreChange}
                roundHits={roundHits}
                setRoundHits={setRoundHits}
                musicState={musicState}
                moviesState={moviesState}
                babyPhotosState={babyPhotosState}
                triviaState={triviaState}
                unDosTresState={unDosTresState}
                bingoState={bingoState}
                mimicaState={mimicaState}
                gamePhase={room.game_phase || 'briefing'}
                onStartActiveRound={handleStartActiveRound}
                onToggleBriefing={handleToggleBriefing}
                onFinishTest={() => handleFinishTest()}
                onLaunchTimer={(seconds) => roomSync.broadcast({ type: 'LAUNCH_TIMER', payload: { seconds } })}
              />
            ) : (
              <HostStandbySection
                room={room}
                podiumPage={podiumPage}
                onSetPodiumPage={(page) => {
                  setPodiumPage(page);
                  roomSync.broadcast({ type: 'PODIUM_PAGE_CHANGE', payload: { page } });
                }}
                onReturnToLobby={handleReturnToLobby}
                onStartPresentation={handleStartPresentation}
                onSelectFirstGame={() => handleSelectGame(GAMES_CATALOG[0])}
                onOpenCatalog={() => setActiveTab('catalog')}
              />
            )}
          </div>
        )}

        {/* PESTAÑA 2: CATÁLOGO DE JUEGOS */}
        {activeTab === 'catalog' && (
          <HostGameCatalogTab
            room={room}
            onSelectGame={handleSelectGame}
            onStartPresentation={handleStartPresentation}
            onFinishShowAndShowGazette={handleFinishShowAndShowGazette}
          />
        )}

        {/* PESTAÑA 3: EQUIPOS & JUGADORES */}
        {activeTab === 'teams' && (
          <HostTeamsScoreboard
            room={room}
            activeTeams={activeTeams}
            teams={teams}
            players={players}
            onTeamCountChange={handleTeamCountChange}
            onScoreChange={handleScoreChange}
            onClearPlayers={() => {
              playersRef.current = [];
              setPlayers([]);
              localStorage.removeItem(`party_players_${roomCode}`);
              roomSync.broadcast({ type: 'PLAYERS_CLEAR' });
              roomSync.broadcast({ type: 'PLAYERS_UPDATE', payload: [] });
            }}
            onRescanPlayers={() => roomSync.broadcast({ type: 'REQUEST_PLAYERS_SYNC' })}
          />
        )}

        {/* PESTAÑA 4: CARTAS DE PODER Y FONOTECA / SONIDOS */}
        {(activeTab === 'cards' || activeTab === 'soundboard') && (
          <div className="space-y-4">
            <HostPowerCardsTab
              powerCards={powerCards}
              activeTeams={activeTeams}
              selectedBonusTeam={powerCardsHook.selectedBonusTeam}
              onSetSelectedBonusTeam={powerCardsHook.setSelectedBonusTeam}
              onDealInitialCards={powerCardsHook.handleDealInitialCards}
              onDealBonusCard={powerCardsHook.handleDealBonusCard}
              onResetPowerCards={powerCardsHook.handleResetPowerCards}
              onOpenDiscardModal={() => powerCardsHook.setIsDiscardModalOpen(true)}
              onClearAllActiveEffects={powerCardsHook.handleClearAllActiveEffects}
              onRemoveActiveEffect={powerCardsHook.handleRemoveActiveEffect}
              onScoreChange={handleScoreChange}
              onInitiatePlayCard={powerCardsHook.handleInitiatePlayCard}
              onPlayCardDirectly={powerCardsHook.handlePlayCardDirectly}
              onRevokeCardFromTeam={powerCardsHook.handleRevokeCardFromTeam}
            />

            <ErrorBoundary
              fallbackTitle="Fonoteca no disponible temporalmente"
              fallbackMessage="Se ha aislado un error al cargar los mandos de sonido."
            >
              <HostSoundboardTab
                jukeboxState={jukeboxState}
                onJukeboxCommand={(cmd) => {
                  roomSync.broadcast({
                    type: 'JUKEBOX_COMMAND',
                    payload: cmd,
                  });
                }}
                onPlaySoundEffect={handlePlaySoundEffect}
              />
            </ErrorBoundary>
          </div>
        )}

      {/* MODALES DE CARTAS DE PODER */}
      <HostPowerCardModals
        activeCardOnScreen={powerCardsHook.activeCardOnScreen}
        onReturnCardToTeam={powerCardsHook.handleReturnCardToTeam}
        onDismissCardOnScreen={powerCardsHook.handleDismissCardOnScreen}
        bankChoiceState={powerCardsHook.bankChoiceState}
        onSelectBankChoice={powerCardsHook.handleSelectBankChoice}
        timeTravelModal={powerCardsHook.timeTravelModal}
        onCloseTimeTravelModal={() => powerCardsHook.setTimeTravelModal(null)}
        onPlayTimeTravelCard={(teamId, cardId, targetCardId) => {
          powerCardsHook.handlePlayCardDirectly(teamId, cardId, undefined, undefined, targetCardId);
        }}
        discardPile={powerCards.discardPile}
        isDiscardModalOpen={powerCardsHook.isDiscardModalOpen}
        onCloseDiscardModal={() => powerCardsHook.setIsDiscardModalOpen(false)}
        returnCardModal={powerCardsHook.returnCardModal}
        onSetReturnCardModal={powerCardsHook.setReturnCardModal}
        targetModalState={powerCardsHook.targetModalState}
        onCloseTargetModal={() => powerCardsHook.setTargetModalState(null)}
        onPlayTargetCard={(teamId, cardId, targetTeamId, targetPlayerName) => {
          powerCardsHook.handlePlayCardDirectly(teamId, cardId, targetTeamId, targetPlayerName);
        }}
        activeTeams={activeTeams}
        players={players}
        powerCards={powerCards}
      />

      {/* MODAL: VEREDICTO AUTOMÁTICO DE PRUEBA FINALIZADA */}
      {testFinishedModal && (
        <ErrorBoundary
          asModal
          fallbackTitle="Aviso de Veredicto de Prueba"
          fallbackMessage="Se ha presentado una incidencia al desplegar la ventana de veredicto. Puedes cerrar este aviso y continuar la partida normalmente."
          onReset={() => setTestFinishedModal(null)}
        >
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
            selectedBonusTeam={powerCardsHook.selectedBonusTeam}
            onSetSelectedBonusTeam={powerCardsHook.setSelectedBonusTeam}
            onDealBonusCard={powerCardsHook.handleDealBonusCard}
            powerCards={powerCards}
            onClearAllActiveEffects={powerCardsHook.handleClearAllActiveEffects}
            onTransferMaldicion={(sourceTeam, targetTeam) => {
              const fromH = [...(powerCards?.teamHands?.[sourceTeam.id] || [])];
              const cardIdx = fromH.indexOf('la_maldicion');
              if (cardIdx !== -1) fromH.splice(cardIdx, 1);
              const targetHand = powerCards?.teamHands?.[targetTeam.id] || [];
              const wasFull = targetHand.length >= 3;
              const toH = [...targetHand, 'la_maldicion'];
              const nextState = {
                ...powerCards,
                teamHands: {
                  ...(powerCards?.teamHands || {}),
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
        </ErrorBoundary>
      )}
      </main>
    </HellCasinoBackground>
  );
}

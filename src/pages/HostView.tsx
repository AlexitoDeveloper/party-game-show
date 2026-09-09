import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Trophy, Users } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { JukeboxState, JUKEBOX_PLAYLIST } from '../lib/audio';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { TEAMS_CATALOG } from '../lib/constants';
import { Room, Team, Player, CaptainDuelState } from '../lib/types';
import { useBuzzerRace } from '../lib/useBuzzerRace';
import { getRoomSync } from '../lib/roomSync';
import { GAMES_CATALOG, GameDefinition, ScoringOption } from '../lib/games';
import { PowerCardsState } from '../lib/powerCards';
import { CoinBurstCelebration } from '../components/particles/CoinBurstCelebration';
import { calculateTestVerdict, TestVerdictCalculation } from '../lib/testVerdict';
import { HellCasinoBackground } from '../components/deco/HellCasinoBackground';
import { HellCasinoSuitsDivider } from '../components/deco/HellCasinoSuitsDivider';

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
import { HostQuickSoundStrip } from '../components/host/HostQuickSoundStrip';
import { HostLivePlayingConsole } from '../components/host/HostLivePlayingConsole';
import { HostStandbySection } from '../components/host/HostStandbySection';
import { HostActiveEffectsBanner } from '../components/host/HostActiveEffectsBanner';
import { HostCompactScoreboard } from '../components/host/HostCompactScoreboard';
import { HostPowerCardsTab } from '../components/host/HostPowerCardsTab';
import { HostGameCatalogTab } from '../components/host/HostGameCatalogTab';
import { HostTeamsScoreboard } from '../components/host/HostTeamsScoreboard';
import { HostSoundboardTab } from '../components/host/HostSoundboardTab';
import { HostPowerCardModals } from '../components/host/HostPowerCardModals';
import { HostTestVerdictModal } from '../components/host/HostTestVerdictModal';
import { usePreventAccidentalNavigation } from '../hooks/usePreventAccidentalNavigation';

export default function HostView() {
  const { code } = useParams<{ code: string }>();
  const roomCode = (code || '').toUpperCase();

  // Bloquear salida accidental por botón "Atrás" físico o gestual en móviles
  usePreventAccidentalNavigation();

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
      try { return JSON.parse(saved); } catch {}
    }
    return TEAMS_CATALOG.map((item) => ({
      id: `team_${roomCode}_${item.index}`,
      room_id: 'room_' + roomCode,
      name: item.name,
      color_hex: item.colorHex,
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

  const [captainDuel, setCaptainDuel] = useState<CaptainDuelState | null>(null);
  const [captainGambles, setCaptainGambles] = useState<Record<string, { teamId: string; teamName: string; playerName: string }>>({});
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

  // Instancia de sincronización multi-pantalla como anfitrión
  const roomSync = useMemo(() => getRoomSync(roomCode, 'host'), [roomCode]);
  const { resetBuzzer, isLocked, winner } = useBuzzerRace({ roomCode, isHostOrTv: true, roomSync });

  // Proxy de audio silencioso para el Host:
  // El Host es 100% silencioso y retransmite todos los sonidos y fanfarrias exclusivamente a la TV
  const hostTvAudioProxy = useMemo(() => ({
    playSound: (sound: string) => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound } }),
    playVictory: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'victory' } }),
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
    playJoin: () => roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound: 'join' } }),
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
  const captainDuelRef = useRef(captainDuel);
  useEffect(() => { captainDuelRef.current = captainDuel; }, [captainDuel]);
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

    // EFECTO DOBLE (Carta de Poder): Si el equipo tiene el efecto Doble activo y gana puntos
    const hasDobleActive = powerCardsRef.current?.activeEffects.some(
      (e: any) => e.sourceTeamId === teamId && e.cardId === 'doble'
    );
    if (hasDobleActive && delta > 0) {
      effectiveDelta = effectiveDelta * 2;
    }

    if (captainGambles[teamId] && delta !== 0) {
      if (delta > 0) {
        effectiveDelta = effectiveDelta * 2;
      }
      handleClearCaptainGambles(teamId);
    }

    const updatedTeams = teams.map((t) =>
      t.id === teamId ? { ...t, score: Math.max(0, t.score + effectiveDelta) } : t
    );
    setTeams(updatedTeams);
    localStorage.setItem(`party_teams_${roomCode}`, JSON.stringify(updatedTeams));

    roomSync.broadcast({
      type: 'TEAMS_UPDATE',
      payload: updatedTeams,
    });

    if (!silent) {
      if (delta > 0) {
        hostTvAudioProxy.playVictory();
        setShowCoinBurst(true);
        setTimeout(() => setShowCoinBurst(false), 2000);
      } else {
        hostTvAudioProxy.playFail();
      }
    }

    if (isSupabaseConfigured) {
      await supabase.from('teams').update({
        score: Math.max(0, (teams.find((t) => t.id === teamId)?.score || 0) + effectiveDelta),
      }).eq('id', teamId);
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

  const bingoState = useHostBingoState({ roomSync });

  const mimicaState = useHostMimicaState({
    roomSync,
    teams,
    selectedTeamCatalog,
    activeTeams,
    setRoundHits,
    soundFX: hostTvAudioProxy,
  });

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

  // Acciones de Gestión de Capitanes
  const handleSetCaptain = (teamId: string, playerId: string) => {
    setPlayers((prev) => {
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
    // Modo anfitrión silencioso: se delega el sonido 100% a la pantalla de TV
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

  useEffect(() => {
    localStorage.setItem(`party_jukebox_${roomCode}`, JSON.stringify(jukeboxState));
  }, [jukeboxState, roomCode]);

  // Sincronizar automáticamente el equipo seleccionado para puntos con el ganador del buzzer
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
          localStorage.setItem(`party_players_${roomCode}`, JSON.stringify(updated));
          setTimeout(() => {
            roomSync.broadcast({ type: 'PLAYERS_UPDATE', payload: updated });
          }, 30);
          return updated;
        });

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
          musicState.syncMusicState(musicState.musicPlaying, musicState.musicRevealed);
        }
        roomSync.broadcast({
          type: 'ROUND_HITS_UPDATE',
          payload: {
            roundHits: roundHitsRef.current,
            gameId: roomRef.current.active_game_id || roomRef.current.current_game,
          },
        });
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
      } else if (event.type === 'POWER_CARD_PLAY_REQUEST') {
        const { sourceTeamId, cardId, targetTeamId, targetPlayerName, targetCardId } = event.payload;
        powerCardsHook.handlePlayCardDirectly(sourceTeamId, cardId, targetTeamId, targetPlayerName, targetCardId);
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

  // Acciones de Navegación del Show
  const handleStartPresentation = () => {
    const updatedRoom: Room = { ...room, status: 'presentation', presentation_slide: 0 };
    setRoom(updatedRoom);
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(updatedRoom));
    roomSync.broadcast({ type: 'PRESENTATION_SLIDE', payload: { slide: 0 } });
    roomSync.broadcast({ type: 'ROOM_UPDATE', payload: { status: 'presentation', presentation_slide: 0 } });
  };

  const handleSetPresentationSlide = (slide: number) => {
    const updatedRoom: Room = { ...room, status: 'presentation', presentation_slide: slide };
    setRoom(updatedRoom);
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(updatedRoom));
    roomSync.broadcast({ type: 'PRESENTATION_SLIDE', payload: { slide } });
    roomSync.broadcast({ type: 'ROOM_UPDATE', payload: { status: 'presentation', presentation_slide: slide } });
  };

  const handleFinishTest = (gameTitle?: string, winnerTeamName?: string) => {
    const activeTitle = gameTitle || activeGame.title;

    if (musicState.musicPlaying) {
      musicState.handleTogglePlayMusic();
    }
    resetBuzzer();

    setCaptainGambles({});
    localStorage.removeItem(`party_captain_gambles_${roomCode}`);
    roomSync.broadcast({ type: 'CLEAR_CAPTAIN_GAMBLES', payload: {} });

    roomSync.broadcast({
      type: 'TEST_FINISHED',
      payload: {
        gameTitle: activeTitle,
        winnerTeamName,
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
    const updatedRoom: Room = { ...room, status: 'lobby' };
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

    if (powerCards && powerCards.activeEffects.length > 0) {
      powerCardsHook.handleClearAllActiveEffects();
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
      moviesState.syncMovieState(moviesState.movieIndex, moviesState.movieFrameLevel, moviesState.movieRevealed);
    }
    if (game.id === 'fotos_proyector') {
      babyPhotosState.syncBabyPhotoState(babyPhotosState.babyPhotoIndex, babyPhotosState.babyPhotoRevealed);
    }

    if (isSupabaseConfigured) {
      await supabase.from('rooms').update({
        status: 'playing',
        current_game: game.engine,
      }).eq('code', roomCode);
    }
  };

  const handleFinishShowAndShowGazette = async () => {
    const updatedRoom: Room = { ...room, status: 'podium' };
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
        musicState.handleValidateMusicHit();
      } else {
        musicState.handleValidateMusicMiss();
      }
    } else if (room.active_game_id === 'movies') {
      if (option.delta > 0) {
        moviesState.handleValidateMovieHitAuto();
      } else {
        moviesState.handleValidateMovieMissAuto();
      }
    } else {
      if (isLocked) resetBuzzer();
    }
  };

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

    const updatedTeams = teams.map((t) => {
      const res = currentVerdict.results.find((r) => r.teamId === t.id);
      if (!res) return t;
      return {
        ...t,
        score: Math.max(0, (t.score || 0) + (res.finalPoints || 0)),
      };
    });
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
      <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 select-none relative text-white font-sans">
        <CoinBurstCelebration active={showCoinBurst} onComplete={() => setShowCoinBurst(false)} />

      <HostHeaderControls
        room={room}
        roomCode={roomCode}
        playersCount={players.length}
        activeGame={activeGame}
        podiumPage={podiumPage}
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

      {/* BARRA DE NAVEGACIÓN POR PESTAÑAS */}
      <nav className="sticky top-2 z-50 grid grid-cols-5 gap-1 p-1 bg-[#0c0c14]/95 border-2 border-[#d4af37]/45 rounded-2xl shadow-deco-gold backdrop-blur-xl">
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

      {/* PESTAÑA: EN DIRECTO */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          <HostQuickSoundStrip
            onPlaySoundEffect={handlePlaySoundEffect}
            onOpenSoundboardTab={() => setActiveTab('soundboard')}
          />

          {room.status === 'playing' ? (
            <HostLivePlayingConsole
              activeGame={activeGame}
              activeTeams={activeTeams}
              teams={teams}
              selectedTeamForPoints={selectedTeamForPoints}
              onSelectTeamForPoints={setSelectedTeamForPoints}
              selectedTeamCatalog={selectedTeamCatalog || undefined}
              captainDuel={captainDuel}
              onToggleCaptainDuel={handleToggleCaptainDuel}
              captainGambles={captainGambles}
              onClearCaptainGambles={() => handleClearCaptainGambles()}
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

          {/* FINALIZAR PRUEBA EN CURSO */}
          {room.status === 'playing' && (
            <div className="flex items-center justify-between hell-card-frame-crimson p-3 sm:p-4 rounded-2xl sm:rounded-3xl gap-2.5">
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

          {/* MARCADOR EN VIVO Y PUNTUACIÓN RÁPIDA */}
          <section className="hell-card-frame rounded-3xl p-3.5 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2.5 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <h3 className="text-xs font-black uppercase tracking-wider text-gold-emboss truncate">
                  Marcador <span className="hidden sm:inline">en Vivo (+5, +2, +1, -1)</span>
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('teams')}
                className="text-[11px] text-amber-300 hover:text-amber-200 font-bold transition-colors flex items-center gap-1 shrink-0"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Gestionar Equipos</span>
                <span>→</span>
              </button>
            </div>
            <HostCompactScoreboard
              activeTeams={activeTeams}
              players={players}
              onSetCaptain={handleSetCaptain}
              onScoreChange={handleScoreChange}
            />
          </section>
        </div>
      )}

      {/* PESTAÑA: CARTAS DE PODER */}
      {activeTab === 'cards' && (
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
      )}

      {/* PESTAÑA: CATÁLOGO DE JUEGOS */}
      {activeTab === 'catalog' && (
        <HostGameCatalogTab room={room} onSelectGame={handleSelectGame} />
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

      {/* PESTAÑA: MESA DE SONIDOS */}
      {activeTab === 'soundboard' && (
        <div className="space-y-6">
          <ErrorBoundary
            fallbackTitle="Fonoteca no disponible temporalmente"
            fallbackMessage="Se ha aislado un error al cargar los mandos de sonido. Puedes reintentar la carga de la mesa de efectos."
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

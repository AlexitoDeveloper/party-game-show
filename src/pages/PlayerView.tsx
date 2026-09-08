import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Flame, Zap, Star, Sparkles, Orbit, Sun, Moon, Eye, EyeOff, Radio, Swords, X, Crown, ShieldAlert, Award, UserCheck, Droplets, Lock, Skull, Target, Bomb } from 'lucide-react';
import { soundFX } from '../lib/audio';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TEAMS_CATALOG, TeamCatalogItem } from '../lib/constants';
import { Team, Player, Room, CaptainGamble, CaptainDuelState, TeamRepresentative } from '../lib/types';
import { useBuzzerRace } from '../lib/useBuzzerRace';
import { RoomSync, getRoomSync } from '../lib/roomSync';
import { GAMES_CATALOG, GameDefinition } from '../lib/games';
import { PowerCardsState, PowerCard, getPowerCardById } from '../lib/powerCards';
import PowerCardView from '../components/PowerCardView';
import { FannedHandDeck } from '../components/cards/FannedHandDeck';
import { ArcadeBuzzer } from '../components/ArcadeBuzzer';
import { getTeamTheme } from '../lib/teamThemes';
import { LobbyProfilePicker } from '../components/LobbyProfilePicker';
import { TwemojiText } from '../components/TwemojiText';
import { DiceBearStyle, generateAvatarDataUri, generateRandomSeed } from '../lib/dicebear';
import { getBingoBallTheme, BINGO_NICKNAMES } from '../lib/bingoUtils';

export default function PlayerView() {
  const { code } = useParams<{ code: string }>();
  const roomCode = (code || '').toUpperCase();

  const [room, setRoom] = useState<Room>(() => {
    const saved = localStorage.getItem(`party_room_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      id: 'local_' + roomCode,
      code: roomCode,
      host_token: 'demo',
      status: 'lobby',
      active_teams_count: 5,
      current_game: 'buzzer',
    };
  });

  const [nickname, setNickname] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(() => generateRandomSeed());
  const [avatarStyle, setAvatarStyle] = useState<DiceBearStyle>('avataaars');
  const [badgeEmoji, setBadgeEmoji] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamCatalogItem | null>(null);
  const [activeTeams, setActiveTeams] = useState<Team[]>(() =>
    TEAMS_CATALOG.slice(0, 5).map((c) => ({
      id: `team_${c.index}`,
      room_id: 'local_' + roomCode,
      team_index: c.index,
      name: c.name,
      theme: c.theme,
      color_hex: c.colorHex,
      color_tw: c.twBg,
      score: 0,
      is_active: true,
    }))
  );
  const [player, setPlayer] = useState<Player | null>(null);
  const [sessionToken, setSessionToken] = useState('');
  const [secretCardVisible, setSecretCardVisible] = useState(false);

  // Estados de Cartas de Poder
  const [powerCards, setPowerCards] = useState<PowerCardsState | null>(() => {
    const saved = localStorage.getItem(`party_power_cards_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCardToPlay, setSelectedCardToPlay] = useState<PowerCard | null>(null);
  const [targetTeamId, setTargetTeamId] = useState<string>('');
  const [targetPlayerName, setTargetPlayerName] = useState<string>('');
  const [targetCardId, setTargetCardId] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isManualPlayerEntry, setIsManualPlayerEntry] = useState(false);
  const [bannedShake, setBannedShake] = useState(false);

  const handleBannedClick = () => {
    soundFX.playFail();
    setBannedShake(true);
    setTimeout(() => setBannedShake(false), 500);
    setFeedbackToast('⛓️ ¡ESTÁS BANEADO! Tu timbre ha sido sellado con cadenas.');
    setTimeout(() => setFeedbackToast(null), 3000);
  };


  // Estados del Sistema de Capitanes
  const [allPlayers, setAllPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(`party_players_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [captainDuel, setCaptainDuel] = useState<CaptainDuelState | null>(null);
  const [captainGambles, setCaptainGambles] = useState<Record<string, CaptainGamble>>({});
  const [teamRepresentatives, setTeamRepresentatives] = useState<Record<string, TeamRepresentative>>({});
  const [isDoubleModalOpen, setIsDoubleModalOpen] = useState(false);
  const [isRepModalOpen, setIsRepModalOpen] = useState(false);

  // Estados de Bingo sincronizados en móvil
  const [bingoDrawnBalls, setBingoDrawnBalls] = useState<number[]>(() => {
    const saved = localStorage.getItem(`party_bingo_drawn_${roomCode}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [bingoCurrentBall, setBingoCurrentBall] = useState<number | null>(() => {
    const saved = localStorage.getItem(`party_bingo_current_${roomCode}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [bingoIsSpinning, setBingoIsSpinning] = useState(false);

  // Instancia de sincronización multi-pantalla como jugador móvil
  const roomSync = useMemo(() => getRoomSync(roomCode, 'player'), [roomCode]);

  // Hook del motor de carreras para enviar pulsaciones
  const { winner, isLocked, pressBuzzer } = useBuzzerRace({
    roomCode,
    isHostOrTv: false,
    roomSync,
  });

  // Juego activo según catálogo
  const activeGame: GameDefinition = useMemo(() => {
    const found = GAMES_CATALOG.find((g) => g.id === room.active_game_id);
    return found || GAMES_CATALOG[0];
  }, [room.active_game_id]);

  // Recuperar sesión persistente única por cada pestaña/ventana
  useEffect(() => {
    // 1. Solicitar inmediatamente el estado activo de la sala a TV/Host
    roomSync.broadcast({ type: 'REQUEST_ROOM_SYNC' });

    const urlParams = new URLSearchParams(window.location.search);
    const forceNew = urlParams.has('new') || urlParams.get('logout') === 'true';

    if (forceNew) {
      sessionStorage.removeItem(`party_session_${roomCode}`);
      sessionStorage.removeItem(`party_nick_${roomCode}`);
      sessionStorage.removeItem(`party_team_${roomCode}`);
      sessionStorage.removeItem(`party_avatar_seed_${roomCode}`);
      sessionStorage.removeItem(`party_avatar_style_${roomCode}`);
    }

    // Cada pestaña mantiene su sesión independiente para permitir múltiples jugadores en el mismo navegador o dispositivo
    let token = sessionStorage.getItem(`party_session_${roomCode}`);
    if (!token) {
      token = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem(`party_session_${roomCode}`, token);
    }
    setSessionToken(token);

    const savedNick = !forceNew ? sessionStorage.getItem(`party_nick_${roomCode}`) : null;
    const savedTeamIndex = !forceNew ? sessionStorage.getItem(`party_team_${roomCode}`) : null;
    const savedAvatarSeed = sessionStorage.getItem(`party_avatar_seed_${roomCode}`);
    const savedAvatarStyle = (sessionStorage.getItem(`party_avatar_style_${roomCode}`)) as DiceBearStyle | null;

    if (savedAvatarSeed) setAvatarSeed(savedAvatarSeed);
    if (savedAvatarStyle) setAvatarStyle(savedAvatarStyle);

    if (savedNick && !forceNew) {
      setNickname(savedNick);
      setIsJoined(true);

      const targetTeam = savedTeamIndex
        ? TEAMS_CATALOG.find((c) => c.index === parseInt(savedTeamIndex, 10))
        : null;

      if (targetTeam) setSelectedTeam(targetTeam);

      const existingPlayer: Player = {
        id: token,
        room_id: 'local_' + roomCode,
        team_id: targetTeam ? `team_${targetTeam.index}` : null,
        team_index: targetTeam ? targetTeam.index : null,
        nickname: savedNick,
        avatar_seed: savedAvatarSeed || avatarSeed,
        avatar_style: savedAvatarStyle || avatarStyle,
        session_token: token,
        is_connected: true,
        joined_at: new Date().toISOString(),
      };
      setPlayer(existingPlayer);

      // Notificar a la TV y Host
      roomSync.broadcast({ type: 'PLAYER_JOINED', payload: existingPlayer });
    }
  }, [roomCode, roomSync]);

  // Mantener referencia síncrona del jugador para responder a peticiones de sincronización sin reiniciar listeners
  const playerRef = useRef<Player | null>(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // Escuchar eventos de sincronización entrantes
  useEffect(() => {
    const unsubscribe = roomSync.onEvent((event) => {
      if (event.type === 'RETURN_TO_LOBBY') {
        setRoom((prev) => {
          const next = { ...prev, status: 'lobby' as const };
          localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(next));
          return next;
        });
        setCaptainGambles({});
      } else if (event.type === 'PRESENTATION_SLIDE') {
        setRoom((prev) => {
          const next = { ...prev, status: 'presentation' as const, presentation_slide: event.payload.slide };
          localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(next));
          return next;
        });
      } else if (event.type === 'TEST_FINISHED') {
        setCaptainGambles({});
      } else if (event.type === 'SWITCH_GAME') {
        setRoom((prev) => {
          const next = {
            ...prev,
            status: event.payload.status,
            current_game: event.payload.current_game,
            active_game_id: event.payload.game_id || prev.active_game_id,
          };
          localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(next));
          return next;
        });
        setCaptainGambles({});
      } else if (event.type === 'ROOM_UPDATE') {
        setRoom((prev) => {
          const next = { ...prev, ...event.payload };
          localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(next));
          return next;
        });
      } else if (event.type === 'TEAMS_UPDATE') {
        setActiveTeams(event.payload.filter((t) => t.is_active));
      } else if (event.type === 'POWER_CARDS_STATE_UPDATE') {
        setPowerCards(event.payload);
      } else if (event.type === 'PLAYERS_UPDATE') {
        setAllPlayers(event.payload);
        if (playerRef.current) {
          const me = event.payload.find((p) => p.id === playerRef.current!.id);
          if (me) {
            setPlayer((prev) => (prev ? { ...prev, ...me } : prev));
          }
        }
      } else if (event.type === 'SET_CAPTAIN') {
        const curPlayer = playerRef.current;
        const myTeamId = curPlayer?.team_id || (curPlayer?.team_index !== undefined && curPlayer?.team_index !== null ? `team_${curPlayer.team_index}` : null);
        if (curPlayer && (event.payload.teamId === myTeamId || event.payload.teamId === curPlayer.team_id)) {
          const isNowCap = curPlayer.id === event.payload.playerId;
          setPlayer((prev) => (prev ? { ...prev, is_captain: isNowCap } : prev));
        }
        setAllPlayers((prev) =>
          prev.map((p) => {
            const pTeamId = p.team_id || `team_${p.team_index}`;
            if (pTeamId === event.payload.teamId || p.team_id === event.payload.teamId) {
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
      } else if (event.type === 'CAPTAIN_REPRESENTATIVE') {
        setTeamRepresentatives((prev) => ({ ...prev, [event.payload.teamId]: event.payload }));
      } else if (event.type === 'REQUEST_PLAYERS_SYNC') {
        // La TV o el Host han pedido sincronizar la lista de jugadores
        if (playerRef.current) {
          roomSync.broadcast({ type: 'PLAYER_JOINED', payload: playerRef.current });
        }
      } else if (event.type === 'BINGO_STATE_UPDATE') {
        setBingoCurrentBall(event.payload.currentBall);
        setBingoDrawnBalls(event.payload.drawnBalls);
        setBingoIsSpinning(!!event.payload.isSpinning);
        try {
          localStorage.setItem(`party_bingo_current_${roomCode}`, JSON.stringify(event.payload.currentBall));
          localStorage.setItem(`party_bingo_drawn_${roomCode}`, JSON.stringify(event.payload.drawnBalls));
        } catch {}
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomSync]);

  // Persistir estado de sala localmente
  useEffect(() => {
    localStorage.setItem(`party_room_${roomCode}`, JSON.stringify(room));
  }, [room, roomCode]);

  // Cargar equipos reales si Supabase está conectado
  useEffect(() => {
    if (!isSupabaseConfigured || !roomCode) return;

    async function fetchTeams() {
      const { data: roomData } = await supabase.from('rooms').select('*').eq('code', roomCode).single();
      if (roomData) {
        setRoom(roomData);
        const { data: teamsData } = await supabase
          .from('teams')
          .select('*')
          .eq('room_id', roomData.id)
          .eq('is_active', true)
          .order('team_index');
        if (teamsData) setActiveTeams(teamsData);
      }
    }

    fetchTeams();
  }, [roomCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    sessionStorage.setItem(`party_nick_${roomCode}`, nickname.trim());
    localStorage.setItem(`party_nick_${roomCode}`, nickname.trim());
    sessionStorage.setItem(`party_avatar_seed_${roomCode}`, avatarSeed);
    localStorage.setItem(`party_avatar_seed_${roomCode}`, avatarSeed);
    sessionStorage.setItem(`party_avatar_style_${roomCode}`, avatarStyle);
    localStorage.setItem(`party_avatar_style_${roomCode}`, avatarStyle);

    let finalPlayerId = sessionToken;

    if (isSupabaseConfigured) {
      try {
        const { data: rData } = await supabase.from('rooms').select('id').eq('code', roomCode).single();
        if (rData) {
          const { data: pData } = await supabase
            .from('players')
            .insert([{ room_id: rData.id, nickname: nickname.trim(), session_token: sessionToken }])
            .select()
            .single();
          if (pData) finalPlayerId = pData.id;
        }
      } catch (err) {
        console.warn('Error registrando jugador en Supabase, usando local:', err);
      }
    }

    const newPlayer: Player = {
      id: finalPlayerId,
      room_id: 'local_' + roomCode,
      team_id: null,
      team_index: null,
      nickname: nickname.trim(),
      avatar_seed: avatarSeed,
      avatar_style: avatarStyle,
      badge_emoji: badgeEmoji,
      session_token: sessionToken,
      is_connected: true,
      joined_at: new Date().toISOString(),
    };

    setPlayer(newPlayer);
    setIsJoined(true);

    // EMISIÓN INMEDIATA: Detectado por Host y TV
    roomSync.broadcast({ type: 'PLAYER_JOINED', payload: newPlayer });
    roomSync.broadcast({ type: 'REQUEST_ROOM_SYNC' });
  };

  const handleLogout = () => {
    sessionStorage.removeItem(`party_session_${roomCode}`);
    sessionStorage.removeItem(`party_nick_${roomCode}`);
    sessionStorage.removeItem(`party_team_${roomCode}`);
    sessionStorage.removeItem(`party_avatar_seed_${roomCode}`);
    sessionStorage.removeItem(`party_avatar_style_${roomCode}`);
    setIsJoined(false);
    setSelectedTeam(null);
    setPlayer(null);
    setNickname('');
  };

  const handleSelectTeam = async (catalogItem: TeamCatalogItem) => {
    setSelectedTeam(catalogItem);
    sessionStorage.setItem(`party_team_${roomCode}`, catalogItem.index.toString());
    localStorage.setItem(`party_team_${roomCode}`, catalogItem.index.toString());

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(60);
    }

    const teamId = `team_${catalogItem.index}`;
    const teamAlreadyHasCaptain = allPlayers.some((p) => p.team_id === teamId && p.is_captain && p.id !== player?.id);
    const shouldBeCaptain = !teamAlreadyHasCaptain;

    const updatedPlayer: Player = {
      ...(player || {
        id: sessionToken,
        room_id: 'local_' + roomCode,
        nickname: nickname || 'Jugador',
        avatar_seed: avatarSeed,
        avatar_style: avatarStyle,
        badge_emoji: badgeEmoji,
        session_token: sessionToken,
        is_connected: true,
        joined_at: new Date().toISOString(),
      }),
      team_id: teamId,
      team_index: catalogItem.index,
      is_captain: shouldBeCaptain,
      avatar_seed: avatarSeed,
      avatar_style: avatarStyle,
      badge_emoji: badgeEmoji,
    };

    setPlayer(updatedPlayer);

    // EMISIÓN INMEDIATA: El jugador asignado a un equipo
    roomSync.broadcast({ type: 'PLAYER_UPDATED', payload: updatedPlayer });

    if (isSupabaseConfigured && player) {
      try {
        const { data: teamData } = await supabase
          .from('teams')
          .select('id')
          .eq('team_index', catalogItem.index)
          .single();
        if (teamData) {
          await supabase.from('players').update({ team_id: teamData.id }).eq('id', player.id);
        }
      } catch (err) {
        console.warn('Error actualizando equipo en Supabase:', err);
      }
    }
  };

  const myTeamId = useMemo(() => {
    if (!selectedTeam) return null;
    const matched = activeTeams.find((t) => t.team_index === selectedTeam.index);
    return matched ? matched.id : `team_${selectedTeam.index}`;
  }, [selectedTeam, activeTeams]);

  const isBanned = useMemo(() => {
    if (!powerCards?.activeEffects || !player?.nickname) return false;
    const cleanNick = player.nickname.toLowerCase().trim();
    return powerCards.activeEffects.some(
      (e) => e.cardId === 'baneo' && e.targetPlayerName && e.targetPlayerName.toLowerCase().trim() === cleanNick
    );
  }, [powerCards?.activeEffects, player?.nickname]);

  const isCursed = useMemo(() => {
    if (!powerCards?.activeEffects || !myTeamId) return false;
    return powerCards.activeEffects.some(
      (e) =>
        (e.cardId === 'mal_de_ojo' || e.cardId === 'maldicion_comun' || e.cardId === 'la_maldicion') &&
        (e.targetTeamId === myTeamId || (e.targetTeamName && selectedTeam && e.targetTeamName === selectedTeam.name))
    );
  }, [powerCards?.activeEffects, myTeamId, selectedTeam]);

  const isTargeted = useMemo(() => {
    if (!powerCards?.activeEffects) return false;
    const cleanNick = player?.nickname?.toLowerCase().trim();
    return powerCards.activeEffects.some(
      (e) =>
        e.cardId === 'objetivo' &&
        ((cleanNick && e.targetPlayerName && e.targetPlayerName.toLowerCase().trim() === cleanNick) ||
          (e.targetTeamId && e.targetTeamId === myTeamId))
    );
  }, [powerCards?.activeEffects, player?.nickname, myTeamId]);

  const isBombed = useMemo(() => {
    if (!powerCards?.activeEffects || !myTeamId) return false;
    return powerCards.activeEffects.some(
      (e) =>
        (e.cardId === 'bomba' || e.cardId === 'la_sentencia') &&
        (e.targetTeamId === myTeamId || (e.targetTeamName && selectedTeam && e.targetTeamName === selectedTeam.name))
    );
  }, [powerCards?.activeEffects, myTeamId, selectedTeam]);

  const myLimitation = useMemo(() => {
    if (!powerCards?.activeEffects) return null;
    const cleanNick = player?.nickname?.toLowerCase().trim();
    const effect = powerCards.activeEffects.find(
      (e) =>
        (e.cardId === 'el_cuarto_mono' || e.cardId === 'titiritero') &&
        ((cleanNick && e.targetPlayerName && e.targetPlayerName.toLowerCase().trim() === cleanNick) ||
          (e.targetTeamId && e.targetTeamId === myTeamId))
    );
    if (!effect) return null;
    return {
      cardId: effect.cardId,
      title: effect.cardId === 'titiritero' ? '🎭 El Titiritero Activo' : '🙈 El Cuarto Mono Activo',
      rule: effect.sensoryLimitation || 'Limitación especial activa para esta prueba',
    };
  }, [powerCards?.activeEffects, player?.nickname, myTeamId]);

  const myForcedChange = useMemo(() => {
    if (!powerCards?.activeEffects) return null;
    const cleanNick = player?.nickname?.toLowerCase().trim();
    const effect = powerCards.activeEffects.find(
      (e) =>
        e.cardId === 'cambio_forzoso' &&
        ((cleanNick && e.targetPlayerName && e.targetPlayerName.toLowerCase().trim() === cleanNick) ||
          (e.targetTeamId && e.targetTeamId === myTeamId))
    );
    return effect ? effect.targetPlayerName || 'Representante' : null;
  }, [powerCards?.activeEffects, player?.nickname, myTeamId]);

  const hasTeamShield = useMemo(() => {
    if (!powerCards?.activeEffects || !myTeamId) return false;
    return powerCards.activeEffects.some((e) => e.cardId === 'escudo' && e.sourceTeamId === myTeamId);
  }, [powerCards?.activeEffects, myTeamId]);


  const handleBuzzerClick = async () => {
    if (isLocked || !selectedTeam || isBanned) return;

    await pressBuzzer({
      playerId: player?.id || sessionToken,
      playerName: nickname || 'Jugador',
      teamId: `team_${selectedTeam.index}`,
      teamName: selectedTeam.name,
      teamColorHex: selectedTeam.colorHex,
      teamIndex: selectedTeam.index,
      clientTimestamp: Date.now(),
      avatarSeed: player?.avatar_seed || avatarSeed,
      avatarStyle: player?.avatar_style || avatarStyle,
      badgeEmoji: player?.badge_emoji || badgeEmoji,
    });
  };

  const myTeamCards: PowerCard[] = useMemo(() => {
    if (!powerCards || !myTeamId) return [];
    let handIds = powerCards.teamHands[myTeamId];
    if (!handIds && selectedTeam) {
      const altKey = Object.keys(powerCards.teamHands).find(
        (k) => k.endsWith(`_${selectedTeam.index}`) || k === `team_${selectedTeam.index}`
      );
      if (altKey) handIds = powerCards.teamHands[altKey];
    }
    if (!handIds) return [];
    return handIds.map((id) => getPowerCardById(id)).filter(Boolean) as PowerCard[];
  }, [powerCards, myTeamId, selectedTeam]);

  const rivalPlayers = useMemo(() => {
    return allPlayers.filter((p) => {
      if (myTeamId && p.team_id === myTeamId) return false;
      if (selectedTeam && p.team_index === selectedTeam.index) return false;
      if (player && p.id === player.id) return false;
      return true;
    });
  }, [allPlayers, myTeamId, selectedTeam, player]);

  const handlePlayCard = (card: PowerCard) => {
    if (!player?.is_captain) {
      setFeedbackToast('👑 Solo el Capitán de tu equipo puede jugar cartas.');
      setTimeout(() => setFeedbackToast(null), 3500);
      return;
    }

    if (card.id === 'ave_fenix') {
      const currentGameIndex = GAMES_CATALOG.findIndex((g) => g.id === (room.active_game_id || 'music'));
      const sortedTeams = [...activeTeams].sort((a, b) => b.score - a.score);
      const teamRank = sortedTeams.findIndex((t) => t.id === myTeamId) + 1;

      if (currentGameIndex >= 0 && currentGameIndex < 4) {
        soundFX.playSound('buzz');
        setFeedbackToast(`🔥 El Ave Fénix solo puede jugarse a partir de la 5.ª prueba (estáis en la ${currentGameIndex + 1}.ª).`);
        setTimeout(() => setFeedbackToast(null), 4500);
        return;
      }
      if (teamRank > 0 && teamRank < 4) {
        soundFX.playSound('buzz');
        setFeedbackToast(`🔥 El Ave Fénix solo se activa si vais 4.º o peor en el marcador (vais ${teamRank}.º).`);
        setTimeout(() => setFeedbackToast(null), 4500);
        return;
      }
    }

    if (card.requiresTarget !== 'none') {
      setSelectedCardToPlay(card);
      setTargetTeamId('');
      setTargetPlayerName('');
      setTargetCardId('');
      setIsManualPlayerEntry(false);
      return;
    }
    executeCardAction(card);
  };

  const handleTriggerDoubleOrNothing = () => {
    if (!myTeamId || !player?.is_captain || !selectedTeam) return;
    const gamble: CaptainGamble = {
      teamId: myTeamId,
      teamName: selectedTeam.name,
      playerName: player.nickname,
      gameId: room.active_game_id || 'general',
      timestamp: Date.now(),
    };
    setCaptainGambles((prev) => ({ ...prev, [myTeamId]: gamble }));
    roomSync.broadcast({
      type: 'CAPTAIN_DOUBLE_OR_NOTHING',
      payload: gamble,
    });
    setFeedbackToast('🔥 ¡Doble o Nada declarado por el Capitán!');
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleDesignateRepresentative = (tPlayerId: string, tPlayerName: string) => {
    if (!myTeamId || !player?.is_captain) return;
    const rep: TeamRepresentative = {
      teamId: myTeamId,
      representativePlayerId: tPlayerId,
      representativeName: tPlayerName,
    };
    setTeamRepresentatives((prev) => ({ ...prev, [myTeamId]: rep }));
    roomSync.broadcast({
      type: 'CAPTAIN_REPRESENTATIVE',
      payload: rep,
    });
    setIsRepModalOpen(false);
    setFeedbackToast(`👤 ${tPlayerName} designado representante.`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const executeCardAction = (card: PowerCard, tTeamId?: string, tPlayerName?: string, tCardId?: string) => {
    if (!myTeamId || !selectedTeam) return;

    roomSync.broadcast({
      type: 'POWER_CARD_PLAY_REQUEST',
      payload: {
        sourceTeamId: myTeamId,
        sourceTeamName: selectedTeam.name,
        cardId: card.id,
        targetTeamId: tTeamId,
        targetTeamName: activeTeams.find((t) => t.id === tTeamId)?.name,
        targetPlayerName: tPlayerName,
        targetCardId: tCardId,
      },
    });

    setSelectedCardToPlay(null);
    setTargetTeamId('');
    setTargetPlayerName('');
    setTargetCardId('');
    setIsCardModalOpen(false);
    setFeedbackToast(`¡Carta ${card.name} lanzada! Mira a la TV...`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const getTeamIcon = (index: number, isDarkContrast = false) => {
    switch (index) {
      case 1: return <Droplets className={`w-5 h-5 ${isDarkContrast ? 'text-slate-950' : 'text-cyan-400'}`} />;
      case 2: return <Flame className="w-5 h-5 text-red-400" />;
      case 3: return <Zap className={`w-5 h-5 ${isDarkContrast ? 'text-slate-950' : 'text-yellow-400'}`} />;
      case 4: return <Sparkles className={`w-5 h-5 ${isDarkContrast ? 'text-slate-950' : 'text-slate-100'}`} />;
      case 5: return <Moon className="w-5 h-5 text-zinc-300" />;
      case 6: return <Sparkles className="w-5 h-5 text-green-400" />;
      case 7: return <Orbit className="w-5 h-5 text-purple-400" />;
      case 8: return <Sun className="w-5 h-5 text-orange-400" />;
      default: return null;
    }
  };

  const isMeWinner = winner?.playerId === (player?.id || sessionToken);

  return (
    <main
      className={`min-h-[100dvh] w-full bg-[#08080c] text-white font-sans flex flex-col justify-between p-5 transition-all duration-500 relative overflow-hidden select-none ${
        isCursed ? 'cursed-screen-glow' : hasTeamShield ? 'shield-screen-glow' : ''
      }`}
      style={{
        backgroundColor: selectedTeam ? '#090910' : '#07070a',
      }}
    >
      {/* Resplandor cálido de latón / color de equipo adaptativo */}
      {selectedTeam ? (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${selectedTeam.colorHex} 0%, transparent 70%)`,
          }}
        />
      ) : (
        <div className="absolute inset-0 deco-sunburst-bg opacity-20 pointer-events-none" />
      )}

      {/* HEADER DEL MÓVIL (PLACA DE LATÓN VINTAGE) */}
      <header className="flex items-center justify-between border-b border-[#d4af37]/35 pb-3 z-10">
        <div>
          <span className="text-[10px] uppercase font-vintage tracking-widest text-amber-200/70 block">SALA</span>
          <span className="text-2xl font-broadway text-gold-gradient block leading-none">{roomCode}</span>
        </div>

        {isJoined && (
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#0c0c14] border-2 border-[#d4af37]/50 p-0.5 overflow-hidden flex items-center justify-center shadow-md">
                <img
                  src={generateAvatarDataUri(player?.avatar_seed || avatarSeed || nickname, (player?.avatar_style as any) || avatarStyle)}
                  alt="Avatar"
                  className="w-full h-full object-contain"
                />
              </div>
              {player?.badge_emoji && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0c0c14] border border-[#d4af37] flex items-center justify-center shadow">
                  <TwemojiText className="text-[10px]">{player.badge_emoji}</TwemojiText>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-vintage tracking-widest text-amber-200/70 block leading-tight">JUGADOR</span>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-sm font-broadway uppercase tracking-wide text-white">{nickname}</span>
                {selectedTeam && (
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedTeam.twBg}`} />
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* CONTENIDO PRINCIPAL */}
      {!isJoined ? (
        /* PASO 1: INTRODUCIR NOMBRE Y CREAR IDENTIDAD VISUAL (PASE VIP) */
        <div className="flex-1 flex flex-col justify-center my-auto z-10 max-w-sm mx-auto w-full py-2">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-broadway uppercase tracking-wider text-gold-gradient">Pase de Acceso</h2>
            <p className="text-xs font-vintage text-amber-100/70 mt-1">Regístrate para la velada clandestina</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              required
              maxLength={15}
              placeholder="Tu alias o apodo"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-[#0f0f18] border-2 border-[#d4af37]/50 rounded-2xl px-4 py-3.5 text-center text-xl font-broadway uppercase tracking-wider text-gold-gradient placeholder:text-amber-200/30 focus:outline-none focus:border-[#d4af37] shadow-inner"
            />

            {/* SELECTOR INTERACTIVO DE AVATAR */}
            <LobbyProfilePicker
              nickname={nickname}
              avatarSeed={avatarSeed}
              onAvatarSeedChange={setAvatarSeed}
              avatarStyle={avatarStyle}
              onAvatarStyleChange={setAvatarStyle}
            />

            <button
              type="submit"
              className="w-full bg-gold-gradient text-slate-950 font-broadway font-black text-base py-4 rounded-2xl uppercase tracking-wider shadow-deco-gold active:scale-95 transition-all border border-[#f5eedb]/40"
            >
              Entrar al Club
            </button>
          </form>
        </div>
      ) : !selectedTeam ? (
        /* PASO 2: ELEGIR EQUIPO */
        <div className="flex-1 flex flex-col justify-center my-4 z-10 max-w-md mx-auto w-full">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-broadway uppercase tracking-wider text-gold-gradient">Elige tu Bando</h2>
            <p className="text-xs font-vintage text-amber-100/70">Tu pulsador de latón se teñirá del color de tu mesa</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {activeTeams.map((team) => {
              const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
              return (
                <motion.button
                  key={cat.index}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleSelectTeam(cat)}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between bg-[#0e0e16]/90 ${cat.twBorder} shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    {getTeamIcon(cat.index)}
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.twBg}`} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-vintage font-bold text-amber-200/70 block">Mesa {cat.index}</span>
                    <span className={`text-base font-broadway uppercase tracking-wide ${cat.twText}`}>{cat.name}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ) : room.status === 'lobby' ? (
        /* PASO 3A: EN LOBBY */
        <div className="flex-1 flex flex-col justify-center items-center my-auto z-10 max-w-sm mx-auto text-center">
          <div className={`w-24 h-24 rounded-3xl ${selectedTeam.twBg} ${selectedTeam.index === 5 ? 'border-2 border-zinc-500' : ''} flex items-center justify-center shadow-2xl ${selectedTeam.twGlow} mb-4`}>
            {getTeamIcon(selectedTeam.index, selectedTeam.index === 4 || selectedTeam.index === 3)}
          </div>
          <span className="text-xs uppercase font-vintage tracking-widest text-amber-200/70 block">Tu Bando</span>
          <h2 className={`text-3xl font-broadway uppercase tracking-wider ${selectedTeam.twText} mb-2`}>
            {selectedTeam.name}
          </h2>
          <p className="text-amber-100/80 font-vintage text-sm">
            ¡Estás en la lista! Mira a la gran pantalla mientras da comienzo el espectáculo.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs font-vintage font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Esperando al Gran Anfitrión
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setSelectedTeam(null)}
              className="text-xs font-vintage text-amber-300/70 underline hover:text-white"
            >
              Cambiar de bando
            </button>
            <span className="text-amber-500/40">•</span>
            <button
              onClick={handleLogout}
              className="text-xs font-vintage text-amber-300/70 underline hover:text-red-400"
            >
              Cambiar de jugador
            </button>
          </div>
        </div>
      ) : room.status === 'presentation' ? (
        /* PASO 3B: EN PRESENTACIÓN */
        <div className="flex-1 flex flex-col justify-center items-center my-auto z-10 max-w-sm mx-auto text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-[#14141e] border-2 border-[#d4af37] flex items-center justify-center shadow-deco-gold animate-pulse">
            <Sparkles className="w-10 h-10 text-amber-300" />
          </div>
          <div>
            <span className="text-xs uppercase font-vintage tracking-widest text-amber-300 block">
              ¡ATENTOS A LA GRAN PANTALLA!
            </span>
            <h2 className="text-2xl font-broadway uppercase tracking-wider text-gold-gradient mt-1">
              Presentación Oficial
            </h2>
            <p className="text-amber-100/70 font-vintage text-xs mt-1">
              El maestro de ceremonias proyecta los 10 desafíos y las cartas de casino en la TV.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0c0c14]/90 border border-[#d4af37]/40 w-full text-center">
            <span className="text-[10px] text-amber-200/70 uppercase font-vintage font-bold block">Tu Bando</span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={`w-3 h-3 rounded-full ${selectedTeam.twBg}`} />
              <span className={`text-base font-broadway uppercase tracking-wide ${selectedTeam.twText}`}>
                {selectedTeam.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-vintage font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Presentación en directo en la TV</span>
          </div>
        </div>
      ) : (
        /* PASO 3C: MANDO EN JUEGO */
        <div className="flex-1 flex flex-col justify-between my-2 pb-20 z-10 max-w-sm mx-auto w-full items-center">
          {/* BANNER DE EQUIPO Y JUEGO ACTIVO */}
          <div className="w-full space-y-2">
            <div className="w-full flex items-center justify-between bg-[#0c0c14]/95 border-2 border-[#d4af37]/40 rounded-2xl px-4 py-2.5 shadow-md">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${selectedTeam.twBg}`} />
                <span className={`text-xs font-broadway uppercase tracking-wide ${selectedTeam.twText}`}>
                  {selectedTeam.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-[10px] text-amber-300/80 hover:text-white uppercase font-vintage font-bold"
              >
                Cambiar Bando
              </button>
            </div>

            {/* ROL DE CAPITÁN Y BOTÓN DE DOBLE O NADA */}
            <div className="w-full flex items-center justify-between gap-2 px-1">
              {player?.is_captain ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-gradient text-slate-950 text-[11px] font-broadway font-black uppercase shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                  <span>👑 Eres el Capitán</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14141e] border border-[#d4af37]/25 text-amber-200/70 text-[10px] font-vintage font-bold">
                  <UserCheck className="w-3 h-3 text-amber-400" />
                  <span>Miembro de Mesa</span>
                </div>
              )}

              {/* Botón de Doble o Nada exclusivo para el Capitán */}
              {player?.is_captain && (
                <button
                  onClick={() => setIsDoubleModalOpen(true)}
                  disabled={!!(myTeamId && captainGambles[myTeamId])}
                  className={`px-3 py-1 rounded-full text-[10px] font-broadway uppercase tracking-wider flex items-center gap-1 transition-all shadow-md active:scale-95 ${
                    myTeamId && captainGambles[myTeamId]
                      ? 'bg-amber-500/20 text-amber-300 border border-[#d4af37]/50 opacity-70'
                      : 'bg-gold-gradient hover:brightness-110 text-slate-950 shadow-deco-gold font-black'
                  }`}
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>{myTeamId && captainGambles[myTeamId] ? '🔥 Doble o Nada Activo' : '⭐ Doble o Nada'}</span>
                </button>
              )}
            </div>

            {/* Pastilla identificativa del juego actual */}
            <div className="w-full bg-[#0c0c14]/90 border border-[#d4af37]/35 rounded-2xl px-3 py-2 flex items-center justify-between backdrop-blur-sm shadow-sm gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">{activeGame.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] uppercase font-vintage font-bold text-amber-300 tracking-wider">
                      {activeGame.category}
                    </span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-200 border border-amber-400/40 px-1.5 py-0.2 rounded-full font-bold font-vintage">
                      {activeGame.participantsLabel}
                    </span>
                  </div>
                  <span className="text-xs font-broadway text-white block truncate">
                    {activeGame.title}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-vintage font-bold text-amber-200/90 px-2 py-0.5 rounded-lg bg-[#14141e] border border-[#d4af37]/30 shrink-0">
                {activeGame.engine === 'buzzer' ? '⚡ Pulsador' : activeGame.engine === 'challenges' ? '🎨 Reto' : '🎲 Mesa'}
              </span>
            </div>

            {/* ALERTAS Y LIMITACIONES ACTIVAS DE CARTAS DE PODER (ESTILO DESPACHO / TELEGRAMA) */}
            {hasTeamShield && (
              <div className="w-full bg-blue-950/80 border-2 border-blue-400 rounded-2xl px-3 py-2 text-center shadow-lg flex items-center justify-center gap-2 animate-pulse">
                <span className="text-base">🛡️</span>
                <span className="text-xs font-vintage font-black uppercase text-blue-200">
                  ¡Escudo Protector Activo! Tu mesa está blindada contra ataques rivales.
                </span>
              </div>
            )}

            {isCursed && (
              <div className="w-full bg-[#1e0a2e]/95 border-2 border-purple-500 rounded-2xl px-3.5 py-2 text-center shadow-lg flex items-center justify-center gap-2 animate-pulse">
                <Skull className="w-5 h-5 text-purple-400 animate-bounce" />
                <div className="text-left">
                  <span className="text-[10px] font-broadway uppercase tracking-wider text-purple-300 block">
                    ¡MESA BAJO LA MALDICIÓN!
                  </span>
                  <span className="text-[11px] font-vintage text-purple-200 font-bold block leading-tight">
                    Tu cuadrilla tiene penalización de puntos aplicada por un rival.
                  </span>
                </div>
              </div>
            )}

            {isTargeted && (
              <div className="w-full bg-[#2a1305]/95 border-2 border-amber-500 rounded-2xl px-3.5 py-2 text-center shadow-lg flex items-center justify-center gap-2">
                <Target className="w-5 h-5 text-amber-400 animate-spin" />
                <div className="text-left">
                  <span className="text-[10px] font-broadway uppercase tracking-wider text-amber-300 block">
                    ¡OBJETIVO EN EL PUNTO DE MIRA!
                  </span>
                  <span className="text-[11px] font-vintage text-amber-200 font-bold block leading-tight">
                    Si no ganas esta prueba, tu rival sumará puntos adicionales.
                  </span>
                </div>
              </div>
            )}

            {isBombed && (
              <div className="w-full bg-[#3a0808]/95 border-2 border-red-500 rounded-2xl px-3.5 py-2 text-center shadow-lg flex items-center justify-center gap-2 animate-pulse">
                <Bomb className="w-5 h-5 text-red-400 animate-bounce" />
                <div className="text-left">
                  <span className="text-[10px] font-broadway uppercase tracking-wider text-red-300 block">
                    ¡TRAMPA EXPLOSIVA ACTIVADA!
                  </span>
                  <span className="text-[11px] font-vintage text-red-200 font-bold block leading-tight">
                    Si quedas por debajo del rival, perderás puntos del marcador.
                  </span>
                </div>
              </div>
            )}

            {isBanned && (
              <div className="w-full bg-[#380b12]/90 border-2 border-red-500 rounded-2xl px-3 py-2 text-center shadow-lg flex items-center justify-center gap-2 animate-pulse">
                <span className="text-base">🚫</span>
                <span className="text-xs font-vintage font-black uppercase text-red-200">
                  ¡Baneado para esta prueba! No puedes participar en este minijuego.
                </span>
              </div>
            )}

            {myForcedChange && (
              <div className="w-full bg-[#2a1a05]/95 border-2 border-amber-400 rounded-2xl px-3 py-2 text-center shadow-lg space-y-0.5 animate-pulse">
                <span className="text-[10px] font-broadway uppercase tracking-wider text-amber-300 block">
                  🔄 Cambio Forzoso Activo
                </span>
                <span className="text-xs font-vintage font-bold text-white block">
                  El rival ha obligado a sustituir a <strong className="text-amber-300">{myForcedChange}</strong>.
                </span>
              </div>
            )}

            {myLimitation && (
              <div className="w-full bg-[#1e0a2e]/95 border-2 border-purple-400 rounded-2xl px-3 py-2 text-center shadow-lg space-y-0.5 animate-pulse">
                <span className="text-[10px] font-broadway uppercase tracking-wider text-purple-300 block">
                  {myLimitation.title}
                </span>
                <span className="text-xs font-vintage font-bold text-white block">
                  {myLimitation.rule}
                </span>
              </div>
            )}
          </div>

          {/* ESCENARIO DEL MÓVIL SEGÚN TIPO DE MINIJUEGO */}
          {activeGame.engine === 'buzzer' ? (
            /* PULSADOR 3D GIGANTE EXCLUSIVO PARA JUEGOS DE PULSADOR */
            <div className="my-auto flex flex-col items-center w-full">

              {isBanned ? (
                /* PULSADOR SELLADO CON CADENAS DE HIERRO Y CANDADO DE LATÓN */
                <motion.div
                  animate={bannedShake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onClick={handleBannedClick}
                  className="relative w-64 h-64 rounded-full bg-[#150808] border-8 border-red-900 flex flex-col items-center justify-center p-5 text-center shadow-2xl cursor-pointer select-none group active:scale-95 transition-transform overflow-hidden deco-card-frame"
                  title="¡Toca para intentar forcejear el candado!"
                >
                  {/* FONDO METÁLICO CON RAYAS DE PELIGRO */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(185,28,28,0.15)_0px,rgba(185,28,28,0.15)_15px,transparent_15px,transparent_30px)]" />

                  {/* CADENAS DE HIERRO CRUZADAS */}
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-7 bg-gradient-to-r from-stone-900 via-stone-700 to-stone-900 border-y-2 border-stone-950 rotate-45 shadow-2xl flex items-center justify-around px-2 z-10">
                    <span className="text-xs opacity-70">⛓️</span>
                    <span className="text-[9px] font-broadway uppercase tracking-widest text-stone-300 font-black">BLOQUEADO</span>
                    <span className="text-xs opacity-70">⛓️</span>
                  </div>
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-7 bg-gradient-to-r from-stone-900 via-stone-700 to-stone-900 border-y-2 border-stone-950 -rotate-45 shadow-2xl flex items-center justify-around px-2 z-10">
                    <span className="text-xs opacity-70">⛓️</span>
                    <span className="text-[9px] font-broadway uppercase tracking-widest text-stone-300 font-black">CLAUSURA</span>
                    <span className="text-xs opacity-70">⛓️</span>
                  </div>

                  {/* CANDADO DE LATÓN MACIZO EN RELIEVE */}
                  <div className="relative z-20 w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-[#b38f2a] to-amber-900 border-4 border-[#f5eedb] flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform">
                    <Lock className="w-10 h-10 text-slate-950 fill-slate-950" />
                    <span className="text-[9px] font-broadway uppercase tracking-widest text-slate-950 font-black mt-0.5">
                      SELLADO
                    </span>
                  </div>

                  <div className="relative z-20 mt-3 bg-black/90 px-3 py-1 rounded-full border border-red-500/60 shadow-md">
                    <span className="text-[10px] font-broadway uppercase text-red-300 tracking-wider">
                      ¡TOCA PARA FORCEJEAR!
                    </span>
                  </div>
                </motion.div>
              ) : captainDuel?.isActive && !player?.is_captain ? (
                <div className="w-64 h-64 rounded-full bg-[#0c0c14]/95 border-8 border-[#d4af37]/50 flex flex-col items-center justify-center p-6 text-center shadow-deco-gold opacity-85 deco-card-frame">
                  <ShieldAlert className="w-12 h-12 text-[#d4af37] mb-2" />
                  <span className="text-sm font-broadway uppercase text-gold-gradient">
                    DUELO DE CAPITANES
                  </span>
                  <span className="text-[11px] font-vintage text-amber-200/80 font-bold mt-1 max-w-[170px]">
                    Solo tu Capitán 👑 puede presionar en este reto
                  </span>
                </div>
              ) : (
                <ArcadeBuzzer
                  theme={getTeamTheme(selectedTeam.index)}
                  isLocked={isLocked}
                  isDuelActive={captainDuel?.isActive}
                  onPress={handleBuzzerClick}
                />
              )}

              {/* ESTADO EN TIEMPO REAL CON ALTURA FIJA PARA EVITAR DESPLAZAMIENTOS */}
              <div className="mt-4 h-14 flex items-center justify-center text-center px-2">
                {isLocked ? (
                  isMeWinner ? (
                    <span className="text-sm font-broadway text-gold-gradient uppercase tracking-wider block drop-shadow-md">
                      🎉 ¡HAS SIDO EL MÁS RÁPIDO! RESPONDE AHORA
                    </span>
                  ) : (
                    <span className="text-xs font-vintage font-bold text-amber-200/70 uppercase tracking-wider block">
                      Otro equipo ha pulsado primero ({winner?.teamName})
                    </span>
                  )
                ) : (
                  <span className="text-xs font-vintage font-bold text-amber-300/80 uppercase tracking-widest block">
                    Mantén el dedo listo sobre el timbre de bronce
                  </span>
                )}
              </div>
            </div>
          ) : activeGame.id === 'bingo' ? (
            /* 🎱 VISTA EN VIVO DE BINGO (SIN PULSADOR) */
            <div className="my-auto w-full max-w-sm space-y-3 text-center px-1">
              <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 shadow-deco-gold backdrop-blur-xl deco-card-frame">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-gradient text-slate-950 text-[11px] font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm mb-3">
                  <span>🎱</span> BINGO DE SALÓN EN VIVO
                </div>

                {/* BOLA EN PANTALLA */}
                <div className="flex flex-col items-center justify-center my-2 min-h-[140px]">
                  {bingoIsSpinning ? (
                    <div className="w-28 h-28 rounded-full bg-gold-gradient flex flex-col items-center justify-center shadow-deco-gold border-4 border-[#f5eedb] animate-spin">
                      <span className="text-3xl">🎱</span>
                    </div>
                  ) : bingoCurrentBall ? (
                    (() => {
                      const theme = getBingoBallTheme(bingoCurrentBall);
                      const nick = BINGO_NICKNAMES[bingoCurrentBall];
                      return (
                        <div className="flex flex-col items-center animate-bounce-short">
                          <div
                            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 shadow-deco-gold relative select-none ${theme.bgGradient} ${theme.border} ${theme.shadow}`}
                          >
                            <div className="absolute top-2 left-4 w-6 h-3 bg-white/40 rounded-full blur-[1px] -rotate-12 pointer-events-none" />
                            <span className={`text-5xl font-broadway tracking-tighter ${theme.ballTextClass}`}>
                              {bingoCurrentBall}
                            </span>
                          </div>
                          {nick && (
                            <span className="mt-2.5 text-xs font-broadway uppercase tracking-wider text-slate-950 bg-gold-gradient border border-[#f5eedb]/40 px-3 py-1 rounded-full shadow-sm">
                              "{nick}"
                            </span>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-[#07070a]/90 border-2 border-dashed border-[#d4af37]/40 flex flex-col items-center justify-center text-amber-300/60 p-2 text-center">
                      <span className="text-2xl mb-1">🎱</span>
                      <span className="text-[10px] font-vintage font-bold">Esperando extracción de bola</span>
                    </div>
                  )}
                </div>

                {/* CONTADOR DE BOLAS */}
                <div className="mt-3 pt-3 border-t border-[#d4af37]/30 flex items-center justify-between text-xs text-amber-200/80 font-vintage">
                  <span className="font-bold">Bolas extraídas:</span>
                  <span className="font-broadway text-gold-gradient text-sm">
                    {bingoDrawnBalls.length} <span className="text-[11px] text-amber-200/50">/ 90</span>
                  </span>
                </div>

                {/* BOLAS RECIENTES */}
                {bingoDrawnBalls.length > 0 && (
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-vintage font-bold text-amber-300/60 mr-1">Previas:</span>
                    {bingoDrawnBalls.slice(-5).reverse().map((num, idx) => {
                      const ballTheme = getBingoBallTheme(num);
                      return (
                        <span
                          key={`${num}-${idx}`}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-broadway font-black shadow-sm ${ballTheme.bgGradient} ${ballTheme.ballTextClass} ${idx === 0 ? 'ring-2 ring-amber-400' : 'opacity-70'}`}
                        >
                          {num}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* RECORDATORIO DE PREMIOS */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                  <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-xl p-2 shadow-inner">
                    <div className="text-[10px] font-broadway uppercase text-amber-300">📏 Línea</div>
                    <div className="text-xs font-vintage font-bold text-white">+2 puntos</div>
                  </div>
                  <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-xl p-2 shadow-inner">
                    <div className="text-[10px] font-broadway uppercase text-gold-gradient">🎱 BINGO</div>
                    <div className="text-xs font-vintage font-bold text-white">+6 puntos</div>
                  </div>
                </div>

                <p className="text-[11px] text-amber-200/70 mt-3 font-vintage font-semibold">
                  Juega con tu cartón físico. Si completas Línea o Bingo, ¡avisa al anfitrión en directo!
                </p>
              </div>
            </div>
          ) : activeGame.id === 'mimica' ? (
            /* 🎭 MÍMICA */
            <div className="my-auto w-full max-w-sm space-y-3 text-center px-1">
              <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 shadow-deco-gold backdrop-blur-xl deco-card-frame">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-gradient text-slate-950 text-[11px] font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm mb-3">
                  <span>🎭</span> TEATRO DE CINE MUDO
                </div>
                <h3 className="text-lg font-broadway uppercase text-gold-gradient mb-1">{activeGame.title}</h3>
                <p className="text-xs font-vintage text-amber-100/80 mb-3">
                  Atento a tus 2 compañeros que actúan en el centro de la sala. ¡No se puede hablar ni emitir sonidos!
                </p>

                <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-2xl p-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-vintage font-bold text-amber-200">¿Eres actor de tu equipo?</span>
                    <button
                      onClick={() => setSecretCardVisible(!secretCardVisible)}
                      className="text-xs text-slate-950 font-broadway font-black flex items-center gap-1 bg-gold-gradient px-2.5 py-1 rounded-lg border border-[#f5eedb]/50 shadow-sm active:scale-95"
                    >
                      {secretCardVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{secretCardVisible ? 'Ocultar' : 'Ver Despacho'}</span>
                    </button>
                  </div>

                  {secretCardVisible && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-[#d4af37]/30 text-xs font-vintage text-amber-100"
                    >
                      <div className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-[#d4af37] font-broadway text-[10px] uppercase mb-1">
                        TELEGRAMA SECRETO
                      </div>
                      <p className="font-bold text-amber-200 mb-1">Solicita al anfitrión tu palabra o tarjeta secreta.</p>
                      <p className="text-[11px] text-red-300 font-bold">🚫 ¡Totalmente prohibido hablar, susurrar o emitir ruidos!</p>
                    </motion.div>
                  )}
                </div>

                <div className="text-[11px] text-amber-300/70 font-vintage font-medium mt-2">
                  El anfitrión controlará el tiempo y asignará los puntos al terminar.
                </div>
              </div>
            </div>
          ) : activeGame.id === 'drawing' ? (
            /* 🎨 TELÉFONO DIBUJADO */
            <div className="my-auto w-full max-w-sm space-y-3 text-center px-1">
              <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 shadow-deco-gold backdrop-blur-xl deco-card-frame">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-gradient text-slate-950 text-[11px] font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm mb-3">
                  <span>🎨</span> TALLER DE CARICATURAS
                </div>
                <h3 className="text-lg font-broadway uppercase text-gold-gradient mb-1">Cadena en Papel Físico</h3>
                <p className="text-xs font-vintage text-amber-100/80 mb-3">
                  El <strong>Jugador 1</strong> decide libremente qué dibujar para iniciar la cadena. Dibuja y escribe en los folios siguiendo los turnos.
                </p>
                <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-xl p-3 text-left space-y-1.5 text-xs font-vintage text-amber-100/90">
                  <div className="font-broadway text-amber-300">Mecánica de la cadena:</div>
                  <div>💡 J1 piensa su idea y dibuja (sin frases impuestas)</div>
                  <div>✍️ J2 adivina por escrito y oculta el dibujo anterior</div>
                  <div>🎨 J3 dibuja lo escrito... ¡hasta la revelación final!</div>
                  <div className="text-[11px] text-amber-300/70 pt-1 font-vintage">
                    El anfitrión asignará los puntos al final según los resultados y el humor.
                  </div>
                </div>
              </div>
            </div>
          ) : activeGame.id === 'torneo_juegos' ? (
            /* 🎮 TORNEO DE JUEGOS */
            <div className="my-auto w-full max-w-sm space-y-3 text-center px-1">
              <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 shadow-deco-gold backdrop-blur-xl deco-card-frame">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-gradient text-slate-950 text-[11px] font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm mb-3">
                  <span>🎮</span> SALÓN DE JUEGOS CLANDESTINOS
                </div>
                <h3 className="text-lg font-broadway uppercase text-gold-gradient mb-1">UNO • Dominó • Parchís</h3>
                <p className="text-xs font-vintage text-amber-100/80 mb-3">
                  Partidas presenciales en la sala. ¡Concéntrate en tu partida física con los rivales!
                </p>
                <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-xl p-3 text-left space-y-1 text-xs font-vintage text-amber-100/90">
                  <div>🥇 1.º Campeón: +5 pts</div>
                  <div>🥈 2.º Subcampeón: +3 pts</div>
                  <div>🥉 3.º Puesto: +2 pts</div>
                  <div className="text-[11px] text-amber-300/70 pt-1">El anfitrión registrará la clasificación al acabar.</div>
                </div>
              </div>
            </div>
          ) : activeGame.id === 'un_dos_tres' ? (
            /* ⚡ 1, 2, 3 ¿YA? */
            <div className="my-auto w-full max-w-sm space-y-3 text-center px-1">
              <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 shadow-deco-gold backdrop-blur-xl deco-card-frame">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-gradient text-slate-950 text-[11px] font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm mb-3">
                  <span>⚡</span> 1, 2, 3 ¿YA? (5s)
                </div>
                <h3 className="text-lg font-broadway uppercase text-gold-gradient mb-1">¡5 Segundos para 3 Respuestas!</h3>
                <p className="text-xs font-vintage text-amber-100/80 mb-3">
                  Turnos por equipo. Cuando el anfitrión dé la señal, debéis decir 3 respuestas válidas en voz alta.
                </p>
                <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-xl p-3 text-left space-y-1 text-xs font-vintage text-amber-100/90">
                  <div>⏱️ 5 segundos exactos sin vacilar</div>
                  <div>💀 Si fallas o dudas quedas eliminado</div>
                  <div>🏆 Gana el último equipo superviviente</div>
                </div>
              </div>
            </div>
          ) : activeGame.id === 'beer_pong' ? (
            /* 🍺 BEER PONG */
            <div className="my-auto w-full max-w-sm space-y-3 text-center px-1">
              <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 shadow-deco-gold backdrop-blur-xl deco-card-frame">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-gradient text-slate-950 text-[11px] font-broadway font-black uppercase tracking-wider border border-[#f5eedb]/40 shadow-sm mb-3">
                  <span>🍺</span> TABERNA SPEAKEASY
                </div>
                <h3 className="text-lg font-broadway uppercase text-gold-gradient mb-1">Beer Pong en Mesa</h3>
                <p className="text-xs font-vintage text-amber-100/80 mb-3">
                  Encesta las bolas en los vasos rivales. ¡Buena puntería a todos los tiradores!
                </p>
                <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-xl p-2.5 text-xs font-vintage text-amber-100/90">
                  <span>🎯 +1 punto por vaso encestado | 🏆 +5 campeón</span>
                </div>
              </div>
            </div>
          ) : (
            /* OTRA PRUEBA PRESENCIAL O RETO */
            <div className="my-auto w-full max-w-sm space-y-3 text-center px-1">
              <div className="bg-[#0c0c14]/95 border-2 border-[#d4af37]/60 rounded-3xl p-5 shadow-deco-gold backdrop-blur-xl deco-card-frame">
                <div className="text-4xl mb-2">{activeGame.emoji}</div>
                <h3 className="text-xl font-broadway uppercase text-gold-gradient mb-1">{activeGame.title}</h3>
                <p className="text-xs font-vintage text-amber-100/80 mb-3">{activeGame.description}</p>
                <div className="bg-[#07070a]/90 border border-[#d4af37]/40 rounded-xl p-3 text-left space-y-1 text-xs font-vintage text-amber-100/90">
                  <span className="font-broadway text-gold-gradient block mb-1">Instrucciones:</span>
                  {activeGame.rules.slice(0, 3).map((r, i) => (
                    <div key={i}>{r}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOAST DE FEEDBACK AL JUGAR CARTA */}
      {feedbackToast && (
        <div className="fixed top-6 left-4 right-4 z-50 flex justify-center pointer-events-none">
          <div className="bg-emerald-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>{feedbackToast}</span>
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE: NAIPES DE PODER DEL EQUIPO */}
      {isJoined && selectedTeam && (
        <div className="fixed bottom-10 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCardModalOpen(true)}
            className={`pointer-events-auto px-5 py-2.5 rounded-full border-2 shadow-2xl flex items-center gap-2.5 backdrop-blur-xl transition-all ${
              myTeamCards.length > 0
                ? 'bg-gold-gradient border-[#f5eedb] text-slate-950 shadow-deco-gold font-broadway font-black animate-pulse'
                : 'bg-[#0c0c14]/95 border-[#d4af37]/30 text-amber-200/60 font-vintage font-bold'
            }`}
          >
            <span className="text-lg select-none">🃏</span>
            <span className="text-xs font-broadway uppercase tracking-wider">
              Naipes de Poder ({myTeamCards.length})
            </span>
          </motion.button>
        </div>
      )}

      {/* MODAL COLECCIONABLE DE NAIPES DE PODER (ESTILO SPEAKEASY) */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#07070a]/95 backdrop-blur-xl flex flex-col justify-end sm:justify-center items-center p-2 sm:p-4 select-none">
          <div className="bg-[#0c0c14] border-2 border-[#d4af37]/60 rounded-3xl w-full max-w-sm max-h-[92vh] overflow-y-auto p-3.5 sm:p-5 shadow-deco-gold space-y-3 deco-card-frame">
            <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🃏</span>
                <div>
                  <h3 className="text-sm font-broadway uppercase tracking-wider text-gold-gradient">Naipes de tu Bando</h3>
                  <span className="text-[10px] font-vintage text-amber-200/70">
                    {selectedTeam?.name} • Baraja de Casino
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCardModalOpen(false);
                  setSelectedCardToPlay(null);
                }}
                className="p-1.5 bg-[#14141e] border border-[#d4af37]/30 rounded-full text-amber-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SECCIÓN SI ESTÁ SELECCIONANDO OBJETIVO PARA LANZAR */}
            {selectedCardToPlay ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center my-2 space-y-2">
                  <PowerCardView card={selectedCardToPlay} size="sm" />
                  <p className="text-xs text-amber-300 font-medium italic text-center">
                    "{selectedCardToPlay.tagline}"
                  </p>
                </div>

                {selectedCardToPlay.requiresTarget === 'team' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-300 block">
                      Elige el Equipo Rival Objetivo:
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {activeTeams
                        .filter((t) => t.id !== myTeamId)
                        .map((team) => {
                          const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
                          const isSelected = targetTeamId === team.id;
                          return (
                            <button
                              key={team.id}
                              onClick={() => setTargetTeamId(team.id)}
                              className={`p-3 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                                isSelected
                                  ? `${cat?.twBg} text-slate-950 font-black shadow-md scale-102`
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>{team.name}</span>
                              {isSelected && <span>✓ Seleccionado</span>}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {selectedCardToPlay.requiresTarget === 'player' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase text-slate-300 block">
                        Elige el Jugador Rival Objetivo:
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsManualPlayerEntry(!isManualPlayerEntry)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 underline font-bold"
                      >
                        {isManualPlayerEntry ? 'Volver a lista' : 'Escribir a mano'}
                      </button>
                    </div>

                    {!isManualPlayerEntry ? (
                      rivalPlayers.length === 0 ? (
                        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center space-y-1">
                          <p className="text-xs text-slate-400">No hay otros jugadores detectados.</p>
                          <button
                            type="button"
                            onClick={() => setIsManualPlayerEntry(true)}
                            className="text-xs text-amber-400 font-bold underline"
                          >
                            Escribir nombre del rival manualmente
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto pr-1">
                          {rivalPlayers.map((p) => {
                            const pTeam = activeTeams.find((t) => t.id === p.team_id || t.team_index === p.team_index);
                            const pCat = pTeam ? TEAMS_CATALOG.find((c) => c.index === pTeam.team_index) : null;
                            const isSelected = targetPlayerName === p.nickname;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setTargetPlayerName(p.nickname);
                                  if (pTeam) setTargetTeamId(pTeam.id);
                                }}
                                className={`p-2.5 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                                  isSelected
                                    ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-102 border-amber-300'
                                    : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{p.badge_emoji || '👤'}</span>
                                  <div>
                                    <span className="block leading-tight text-xs font-black">{p.nickname}</span>
                                    <span className={`text-[9px] uppercase font-bold block ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                                      {pCat?.name || pTeam?.name || 'Equipo Rival'}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && <span className="text-[10px] font-black">✓ Elegido</span>}
                              </button>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Nombre del jugador rival..."
                          value={targetPlayerName}
                          onChange={(e) => setTargetPlayerName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-400"
                        />

                        <span className="text-[10px] text-slate-500 block uppercase font-bold">
                          Equipo del jugador:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeTeams
                            .filter((t) => t.id !== myTeamId)
                            .map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setTargetTeamId(t.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                  targetTeamId === t.id
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                                }`}
                              >
                                {t.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedCardToPlay.requiresTarget === 'card' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-300 block">
                      Elige la Carta a Recuperar del Descarte:
                    </label>
                    {!powerCards?.discardPile || powerCards.discardPile.length === 0 ? (
                      <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-center space-y-1">
                        <span className="text-xl">📭</span>
                        <p className="text-xs text-slate-400">
                          No hay cartas en la pila de descartes aún.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {powerCards.discardPile.map((dCardId, idx) => {
                          const dCard = getPowerCardById(dCardId);
                          if (!dCard) return null;
                          const isSelected = targetCardId === dCardId;
                          return (
                            <button
                              key={`${dCardId}_${idx}`}
                              onClick={() => setTargetCardId(dCardId)}
                              className={`w-full p-2.5 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-300 shadow-md font-black'
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{dCard.emoji}</span>
                                <div>
                                  <span className="block">{dCard.name}</span>
                                  <span className="text-[10px] opacity-75 font-normal">
                                    ★ {dCard.rarity}
                                  </span>
                                </div>
                              </div>
                              {isSelected && <span>✓ Elegida</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setSelectedCardToPlay(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase hover:bg-slate-700"
                  >
                    Atrás
                  </button>
                  <button
                    disabled={
                      (selectedCardToPlay.requiresTarget === 'team' && !targetTeamId) ||
                      (selectedCardToPlay.requiresTarget === 'player' && !targetPlayerName.trim()) ||
                      (selectedCardToPlay.requiresTarget === 'card' &&
                        (!targetCardId || !powerCards?.discardPile?.length))
                    }
                    onClick={() =>
                      executeCardAction(selectedCardToPlay, targetTeamId, targetPlayerName, targetCardId)
                    }
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
                  >
                    🚀 ¡Activar Poder!
                  </button>
                </div>
              </div>
            ) : (
              /* LISTA DE CARTAS EN MANO CON CARRUSEL 3D COVERFLOW */
              <div className="space-y-4">
                {myTeamCards.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <span className="text-4xl select-none opacity-40 block">📭</span>
                    <p className="text-xs text-amber-200/70 font-vintage">
                      Tu equipo no tiene cartas de poder en este momento.
                    </p>
                    <p className="text-[11px] text-amber-400/80 italic font-editorial">
                      ¡Atento a la TV cuando el anfitrión reparta cartas al inicio o tras una prueba!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    {/* Header bar indicando rol del jugador */}
                    <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-vintage mb-2">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>{player?.is_captain ? 'Eres el Capitán: Puedes Jugar Naipes' : 'Solo Capitán puede jugarlas'}</span>
                      </div>
                      <span className="text-[10px] text-amber-400/70">
                        {myTeamCards.length} en mano
                      </span>
                    </div>

                    {/* Carrusel 3D Coverflow de Naipes */}
                    <FannedHandDeck
                      cards={myTeamCards}
                      disabled={!player?.is_captain}
                      onPlayCard={(card) => {
                        if (player?.is_captain) {
                          handlePlayCard(card);
                        } else {
                          setFeedbackToast('👑 Solo el Capitán puede jugar las cartas.');
                          setTimeout(() => setFeedbackToast(null), 3500);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DEL CAPITÁN: DOBLE O NADA */}
      <AnimatePresence>
        {isDoubleModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 select-none"
          >
            <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/20">
                ⭐
              </div>
              <div>
                <h3 className="text-xl font-black uppercase text-white font-arcade">
                  ¡Doble o Nada del Capitán!
                </h3>
                <p className="text-xs text-amber-300/90 font-bold mt-1">
                  1 único uso por partida
                </p>
              </div>
              <p className="text-xs text-slate-300">
                Como Capitán, apuestas en esta prueba. Si tu equipo puntúa, ¡se <strong>duplican</strong> los puntos conseguidos! Pero si falláis, recibiréis penalización.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsDoubleModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleTriggerDoubleOrNothing();
                    setIsDoubleModalOpen(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
                >
                  🔥 ¡Apostar Doble!
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="text-center text-[10px] text-slate-600 uppercase tracking-widest z-10">
        Mando Táctil • Sincronía Instantánea • Web Haptics
      </footer>
    </main>
  );
}

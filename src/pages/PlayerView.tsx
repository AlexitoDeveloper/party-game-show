import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Flame, Zap, Star, Sparkles, Orbit, Sun, Moon, Eye, EyeOff, Radio, Swords, X, Crown, ShieldAlert, Award, UserCheck, Droplets } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TEAMS_CATALOG, TeamCatalogItem } from '../lib/constants';
import { Team, Player, Room, CaptainGamble, CaptainDuelState, TeamRepresentative } from '../lib/types';
import { useBuzzerRace } from '../lib/useBuzzerRace';
import { RoomSync, getRoomSync } from '../lib/roomSync';
import { GAMES_CATALOG, GameDefinition } from '../lib/games';
import { PowerCardsState, PowerCard, getPowerCardById } from '../lib/powerCards';
import UnoPowerCard, { PowerCardView } from '../components/UnoPowerCard';
import { ArcadeBuzzer } from '../components/ArcadeBuzzer';
import { getTeamTheme } from '../lib/teamThemes';
import { LobbyProfilePicker } from '../components/LobbyProfilePicker';
import { TwemojiText } from '../components/TwemojiText';
import { DiceBearStyle, generateAvatarDataUri, generateRandomSeed } from '../lib/dicebear';

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

    let token = sessionStorage.getItem(`party_session_${roomCode}`) || localStorage.getItem(`party_session_${roomCode}`);
    if (!token) {
      token = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem(`party_session_${roomCode}`, token);
      localStorage.setItem(`party_session_${roomCode}`, token);
    }
    setSessionToken(token);

    const savedNick = sessionStorage.getItem(`party_nick_${roomCode}`) || localStorage.getItem(`party_nick_${roomCode}`);
    const savedTeamIndex = sessionStorage.getItem(`party_team_${roomCode}`) || localStorage.getItem(`party_team_${roomCode}`);
    const savedAvatarSeed = sessionStorage.getItem(`party_avatar_seed_${roomCode}`) || localStorage.getItem(`party_avatar_seed_${roomCode}`);
    const savedAvatarStyle = (sessionStorage.getItem(`party_avatar_style_${roomCode}`) || localStorage.getItem(`party_avatar_style_${roomCode}`)) as DiceBearStyle | null;

    if (savedAvatarSeed) setAvatarSeed(savedAvatarSeed);
    if (savedAvatarStyle) setAvatarStyle(savedAvatarStyle);

    if (savedNick) {
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

  const handleBuzzerClick = async () => {
    if (isLocked || !selectedTeam) return;

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

  // Identificador de equipo y cartas en mano
  const myTeamId = useMemo(() => {
    if (!selectedTeam) return null;
    const matched = activeTeams.find((t) => t.team_index === selectedTeam.index);
    return matched ? matched.id : `team_${selectedTeam.index}`;
  }, [selectedTeam, activeTeams]);

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

  const handlePlayCard = (card: PowerCard) => {
    if (!player?.is_captain) {
      setFeedbackToast('👑 Solo el Capitán de tu equipo puede jugar cartas.');
      setTimeout(() => setFeedbackToast(null), 3500);
      return;
    }
    if (card.requiresTarget !== 'none') {
      setSelectedCardToPlay(card);
      setTargetTeamId('');
      setTargetPlayerName('');
      setTargetCardId('');
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
      className="min-h-[100dvh] w-full bg-slate-950 text-white font-sans flex flex-col justify-between p-5 transition-colors duration-500 relative overflow-hidden select-none"
      style={{
        backgroundColor: selectedTeam ? '#060a12' : '#020617',
      }}
    >
      {/* Resplandor neón adaptativo según el equipo seleccionado */}
      {selectedTeam && (
        <div
          className="absolute inset-0 opacity-25 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${selectedTeam.colorHex} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* HEADER DEL MÓVIL */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-3 z-10">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">SALA</span>
          <span className="text-2xl font-black font-mono text-amber-400 block leading-none">{roomCode}</span>
        </div>

        {isJoined && (
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 p-0.5 overflow-hidden flex items-center justify-center shadow-md">
                <img
                  src={generateAvatarDataUri(player?.avatar_seed || avatarSeed || nickname, (player?.avatar_style as any) || avatarStyle)}
                  alt="Avatar"
                  className="w-full h-full object-contain"
                />
              </div>
              {player?.badge_emoji && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow">
                  <TwemojiText className="text-[10px]">{player.badge_emoji}</TwemojiText>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block leading-tight">JUGADOR</span>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-sm font-black text-white">{nickname}</span>
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
        /* PASO 1: INTRODUCIR NOMBRE Y CREAR IDENTIDAD VISUAL */
        <div className="flex-1 flex flex-col justify-center my-auto z-10 max-w-sm mx-auto w-full py-2">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-black uppercase tracking-wider font-arcade text-white">¿Quién eres?</h2>
            <p className="text-xs text-slate-400 mt-1">Elige tu avatar para el show</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              required
              maxLength={15}
              placeholder="Tu alias o apodo"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-4 py-3.5 text-center text-xl font-black text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 shadow-inner"
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
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-base py-4 rounded-2xl uppercase tracking-wider shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              Conectar al Show
            </button>
          </form>
        </div>
      ) : !selectedTeam ? (
        /* PASO 2: ELEGIR EQUIPO */
        <div className="flex-1 flex flex-col justify-center my-4 z-10 max-w-md mx-auto w-full">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-black uppercase font-arcade tracking-wide">Elige tu Bando</h2>
            <p className="text-xs text-slate-400">Tu pulsador se teñirá del color de tu equipo</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {activeTeams.map((team) => {
              const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index) || TEAMS_CATALOG[0];
              return (
                <motion.button
                  key={cat.index}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleSelectTeam(cat)}
                  className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between bg-slate-900/80 ${cat.twBorder} shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    {getTeamIcon(cat.index)}
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.twBg}`} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Equipo {cat.index}</span>
                    <span className={`text-base font-black uppercase ${cat.twText}`}>{cat.name}</span>
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
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400 block">Tu Equipo</span>
          <h2 className={`text-3xl font-black font-arcade uppercase ${selectedTeam.twText} mb-2`}>
            {selectedTeam.name}
          </h2>
          <p className="text-slate-300 text-sm">
            ¡Estás dentro! Mira a la TV mientras el anfitrión arranca el show.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Conectado al Lobby
          </div>
          <button
            onClick={() => setSelectedTeam(null)}
            className="mt-4 text-xs text-slate-400 underline hover:text-white"
          >
            Cambiar de bando
          </button>
        </div>
      ) : (
        /* PASO 3B: MANDO EN JUEGO */
        <div className="flex-1 flex flex-col justify-between my-2 pb-20 z-10 max-w-sm mx-auto w-full items-center">
          {/* BANNER DE EQUIPO Y JUEGO ACTIVO */}
          <div className="w-full space-y-2">
            <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 shadow-md">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${selectedTeam.twBg}`} />
                <span className={`text-xs font-black uppercase ${selectedTeam.twText}`}>
                  {selectedTeam.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-[10px] text-slate-400 hover:text-white uppercase font-bold"
              >
                Cambiar Bando
              </button>
            </div>

            {/* ROL DE CAPITÁN Y BOTÓN DE DOBLE O NADA */}
            <div className="w-full flex items-center justify-between gap-2 px-1">
              {player?.is_captain ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>👑 Eres el Capitán</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                  <UserCheck className="w-3 h-3 text-slate-400" />
                  <span>Miembro de Equipo</span>
                </div>
              )}

              {/* Botón de Doble o Nada exclusivo para el Capitán */}
              {player?.is_captain && (
                <button
                  onClick={() => setIsDoubleModalOpen(true)}
                  disabled={!!(myTeamId && captainGambles[myTeamId])}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 transition-all shadow-md active:scale-95 ${
                    myTeamId && captainGambles[myTeamId]
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 opacity-70'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30'
                  }`}
                >
                  <Star className="w-3 h-3" />
                  <span>{myTeamId && captainGambles[myTeamId] ? '🔥 Doble o Nada Activo' : '⭐ Doble o Nada'}</span>
                </button>
              )}
            </div>

            {/* Pastilla identificativa del juego actual */}
            <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl px-3 py-2 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeGame.emoji}</span>
                <div>
                  <span className="text-[9px] uppercase font-bold text-amber-400 tracking-wider block">
                    {activeGame.category}
                  </span>
                  <span className="text-xs font-black text-white block truncate max-w-[190px]">
                    {activeGame.title}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700">
                {activeGame.engine === 'buzzer' ? '⚡ Pulsador' : activeGame.engine === 'challenges' ? '🎨 Reto' : '🎲 Mesa'}
              </span>
            </div>
          </div>

          {/* ESCENARIO DEL MÓVIL SEGÚN MINIJUEGO */}
          {room.current_game === 'duel' ? (
            <div className="my-auto text-center p-6 bg-slate-900/80 border border-slate-800 rounded-3xl">
              <Swords className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-bounce" />
              <h3 className="text-xl font-black uppercase text-white mb-2">Duelo en Marcha</h3>
              <p className="text-xs text-slate-400">
                Atento a la prueba física o reto en la TV. El anfitrión asignará los puntos.
              </p>
            </div>
          ) : (
            /* PULSADOR 3D GIGANTE */
            <div className="my-auto flex flex-col items-center w-full">
              {captainDuel?.isActive && !player?.is_captain ? (
                <div className="w-64 h-64 rounded-full bg-slate-900 border-8 border-slate-800 flex flex-col items-center justify-center p-6 text-center shadow-inner opacity-75">
                  <ShieldAlert className="w-12 h-12 text-amber-400 mb-2" />
                  <span className="text-sm font-black font-arcade uppercase text-amber-300">
                    DUELO DE CAPITANES
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold mt-1 max-w-[170px]">
                    Solo tu Capitán 👑 puede pulsar en esta prueba
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
                    <span className="text-sm font-black text-emerald-400 uppercase tracking-wider block">
                      🎉 ¡HAS SIDO EL MÁS RÁPIDO! RESPONDE AHORA
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Otro equipo ha pulsado primero ({winner?.teamName})
                    </span>
                  )
                ) : (
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
                    Mantén el dedo listo sobre el pulsador
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TARJETA PRIVADA SECRETA */}
          {room.current_game === 'challenges' && (
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Tarjeta Privada de Reto</span>
                <button
                  onClick={() => setSecretCardVisible(!secretCardVisible)}
                  className="text-xs text-amber-400 font-bold flex items-center gap-1"
                >
                  {secretCardVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{secretCardVisible ? 'Ocultar' : 'Ver Palabra'}</span>
                </button>
              </div>

              {secretCardVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 pt-2 border-t border-slate-800 text-xs text-slate-300"
                >
                  <p className="font-bold text-amber-300 mb-1">Palabra Clave: "Paella Valenciana"</p>
                  <p className="text-[11px] text-slate-400">Prohibidas: Arroz, Marisco, Sartén, Domingo</p>
                </motion.div>
              )}
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

      {/* BOTÓN FLOTANTE: CARTAS DE PODER DEL EQUIPO */}
      {isJoined && selectedTeam && (
        <div className="fixed bottom-10 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCardModalOpen(true)}
            className={`pointer-events-auto px-5 py-2.5 rounded-full border-2 shadow-2xl flex items-center gap-2.5 backdrop-blur-xl transition-all ${
              myTeamCards.length > 0
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 border-amber-400/80 text-white shadow-[0_0_25px_rgba(251,191,36,0.4)] animate-pulse'
                : 'bg-slate-900/90 border-slate-700 text-slate-400'
            }`}
          >
            <span className="text-lg select-none">🃏</span>
            <span className="text-xs font-black uppercase tracking-wider">
              Cartas de Poder ({myTeamCards.length})
            </span>
          </motion.button>
        </div>
      )}

      {/* MODAL COLECCIONABLE DE CARTAS DE PODER */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-end sm:justify-center items-center p-4 select-none">
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🃏</span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">Cartas de tu Equipo</h3>
                  <span className="text-[10px] text-slate-400">
                    {selectedTeam?.name} • Mazo Común
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCardModalOpen(false);
                  setSelectedCardToPlay(null);
                }}
                className="p-1.5 bg-slate-800 rounded-full text-slate-400 hover:text-white"
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
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-300 block">
                      Elige o escribe el Jugador Rival Objetivo:
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del jugador rival..."
                      value={targetPlayerName}
                      onChange={(e) => setTargetPlayerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-400"
                    />

                    <span className="text-[10px] text-slate-500 block uppercase font-bold mt-1">
                      Equipo del jugador:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTeams
                        .filter((t) => t.id !== myTeamId)
                        .map((t) => (
                          <button
                            key={t.id}
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
              /* LISTA DE CARTAS EN MANO */
              <div className="space-y-4">
                {myTeamCards.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <span className="text-4xl select-none opacity-40 block">📭</span>
                    <p className="text-xs text-slate-400">
                      Tu equipo no tiene cartas de poder en este momento.
                    </p>
                    <p className="text-[11px] text-amber-400/80 italic">
                      ¡Atento a la TV cuando el anfitrión reparta cartas al inicio o tras una prueba!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-5">
                    {myTeamCards.map((card) => {
                      const canPlay = !!player?.is_captain;
                      return (
                        <div
                          key={card.id}
                          className="flex flex-col items-center space-y-3 p-3.5 rounded-2xl bg-slate-900/80 border border-amber-400/30 w-full shadow-lg"
                        >
                          <PowerCardView
                            card={card}
                            size="md"
                            isClickable={canPlay}
                            onClick={() => {
                              if (canPlay) handlePlayCard(card);
                              else {
                                setFeedbackToast('👑 Solo el Capitán puede jugar las cartas.');
                                setTimeout(() => setFeedbackToast(null), 3500);
                              }
                            }}
                          />
                          {canPlay ? (
                            <button
                              onClick={() => handlePlayCard(card)}
                              className="w-full max-w-[220px] py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                              <span>👑 Jugar Carta</span>
                            </button>
                          ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-amber-400/20 text-[11px] text-amber-300 font-bold flex items-center gap-1.5 text-center">
                              <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                              <span>Solo el Capitán 👑 puede jugar esta carta</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
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

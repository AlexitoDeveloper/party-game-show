import React from 'react';
import { Award, Users, Crown, Swords, Star, RefreshCw, Play, BookOpen, Lock } from 'lucide-react';
import { TEAMS_CATALOG } from '../../lib/constants';
import { GameDefinition } from '../../lib/games';
import { Team, BuzzerPressPayload, GamePhase, Player, TeamRepresentative } from '../../lib/types';
import { HostMusicControls } from './minigames/HostMusicControls';
import { HostMoviesControls } from './minigames/HostMoviesControls';
import { HostBabyPhotosControls } from './minigames/HostBabyPhotosControls';
import { HostTriviaControls } from './minigames/HostTriviaControls';
import { HostUnDosTresControls } from './minigames/HostUnDosTresControls';
import { HostBingoControls } from './minigames/HostBingoControls';
import { HostMimicaControls } from './minigames/HostMimicaControls';
import { HostDrawingControls } from './minigames/HostDrawingControls';
import { HostBeerPongControls } from './minigames/HostBeerPongControls';

export interface HostLivePlayingConsoleProps {
  activeGame: GameDefinition;
  activeTeams: Team[];
  teams: Team[];
  selectedTeamForPoints: string;
  onSelectTeamForPoints: (teamId: string) => void;
  selectedTeamCatalog: (typeof TEAMS_CATALOG)[0] | undefined;
  captainDuel: { isActive: boolean } | null;
  onToggleCaptainDuel: () => void;
  captainGambles: Record<string, { teamId: string; teamName: string; playerName: string }>;
  onClearCaptainGambles: () => void;
  isLocked: boolean;
  winner: BuzzerPressPayload | null;
  onResetBuzzer: () => void;
  onApplyScoreAction: (opt: any) => void;
  onScoreChange: (teamId: string, delta: number) => void;
  roundHits?: Record<string, number>;
  setRoundHits?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  musicState: any;
  moviesState: any;
  babyPhotosState: any;
  triviaState: any;
  unDosTresState: any;
  bingoState: any;
  mimicaState: any;
  gamePhase?: GamePhase | null;
  onStartActiveRound?: () => void;
  onToggleBriefing?: () => void;
  teamRepresentatives?: Record<string, TeamRepresentative>;
  players?: Player[];
}

export const HostLivePlayingConsole: React.FC<HostLivePlayingConsoleProps> = ({
  activeGame,
  activeTeams,
  teams,
  selectedTeamForPoints,
  onSelectTeamForPoints,
  selectedTeamCatalog,
  captainDuel,
  onToggleCaptainDuel,
  captainGambles,
  onClearCaptainGambles,
  isLocked,
  winner,
  onResetBuzzer,
  onApplyScoreAction,
  onScoreChange,
  roundHits,
  setRoundHits,
  musicState,
  moviesState,
  babyPhotosState,
  triviaState,
  unDosTresState,
  bingoState,
  mimicaState,
  gamePhase,
  onStartActiveRound,
  onToggleBriefing,
  teamRepresentatives = {},
  players = [],
}) => {
  const isRepGame = ['solo', 'duo', 'delegates'].includes(activeGame.participantsMode);

  // Equipos activos con al menos un jugador conectado que aún no han designado representantes
  const teamsWithMembers = activeTeams.filter((t) =>
    (players || []).some((p) => p.team_id === t.id || p.team_index === t.team_index)
  );

  const missingRepTeams = isRepGame
    ? teamsWithMembers.filter((t) => {
        const rep = teamRepresentatives?.[t.id];
        const has =
          (rep?.representativePlayerIds && rep.representativePlayerIds.length > 0) ||
          !!rep?.representativePlayerId;
        return !has;
      })
    : [];

  const canStartRound = !isRepGame || missingRepTeams.length === 0;

  return (
    <section className="hell-card-frame rounded-3xl p-6 space-y-4">
      {/* BANNER DE SUBFASE BRIEFING */}
      {gamePhase === 'briefing' ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1f1508] via-[#2a1d0b] to-[#1a0f12] border-2 border-[#d4af37] shadow-deco-gold flex flex-col gap-3.5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8a6a1a] flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
                <span className="text-2xl">🎬</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-broadway font-black px-2.5 py-0.5 rounded-full bg-gold-gradient text-slate-950 shadow-sm">
                    FASE DE PRESENTACIÓN / BRIEFING
                  </span>
                  <span className="text-xs text-amber-300 font-vintage font-bold">
                    Portada proyectada en la TV
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-broadway text-white uppercase tracking-wide mt-1">
                  {activeGame.title}
                </h3>
                <p className="text-xs text-amber-100/70 font-vintage mt-0.5">
                  {isRepGame
                    ? 'Los capitanes deben designar a sus representantes en sus móviles antes de que puedas arrancar la prueba.'
                    : 'La sala está atendiendo a las normas. Pulsa Iniciar cuando desees arrancar el juego en la TV.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch md:items-end gap-1.5 w-full md:w-auto shrink-0">
              {canStartRound ? (
                <button
                  onClick={onStartActiveRound}
                  className="px-6 py-3 rounded-2xl bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-deco-gold border-2 border-[#f5eedb]/60 active:scale-95 transition-all animate-pulse"
                  title="Iniciar la fase activa del juego en la TV y móviles"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>▶️ Iniciar Prueba</span>
                </button>
              ) : (
                <div className="flex flex-col items-stretch md:items-end gap-1 w-full md:w-auto">
                  <button
                    disabled
                    className="px-5 py-3 rounded-2xl bg-[#14141e] border-2 border-amber-600/50 text-amber-200/50 font-broadway font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed shadow-inner"
                    title={`Faltan representantes de: ${missingRepTeams.map((t) => t.name).join(', ')}`}
                  >
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>Faltan Representantes ({missingRepTeams.length})</span>
                  </button>
                  <button
                    onClick={onStartActiveRound}
                    className="text-[10px] uppercase font-vintage text-amber-400/80 hover:text-amber-200 underline text-center md:text-right"
                    title="Forzar inicio de prueba sin esperar a los capitanes"
                  >
                    ⚡ Forzar inicio de todos modos
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Alerta de equipos pendientes de asignar representantes */}
          {isRepGame && !canStartRound && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs font-vintage gap-2">
              <span className="text-amber-200/90">
                ⏳ Esperando a que los capitanes elijan a sus combatientes. Faltan:{' '}
                <strong className="text-amber-300 font-broadway uppercase">
                  {missingRepTeams.map((t) => t.name).join(', ')}
                </strong>
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-2 rounded-xl bg-[#0c0c14]/80 border border-[#d4af37]/30 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-broadway uppercase text-emerald-300">Prueba en Directo</span>
            <span className="text-slate-400 hidden sm:inline font-vintage">({activeGame.title})</span>
          </div>
          <button
            onClick={onToggleBriefing}
            className="text-[11px] font-broadway uppercase text-amber-300 hover:text-white bg-[#14141e] border border-[#d4af37]/40 px-3 py-1 rounded-lg flex items-center gap-1 active:scale-95 transition-all"
            title="Volver a mostrar el cartel de reglas en la TV"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver Reglas / Briefing en TV</span>
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#d4af37]/30 pb-3 gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest flex items-center gap-1.5 flex-wrap">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">MESA DE PUNTUACIÓN</span>
            <span className="sm:hidden">PUNTOS</span>
            <span className="bg-amber-500/20 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full text-[10px] font-bold normal-case">
              {activeGame.participantsLabel}
            </span>
          </span>
          <h2 className="text-lg sm:text-xl font-black font-broadway text-gold-emboss">{activeGame.title}</h2>
          <p className="text-xs text-amber-200/60 mt-0.5 font-medium">{activeGame.participantsDescription}</p>
        </div>

        {/* Selector de equipo al que asignar puntos */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-amber-300/80 font-bold whitespace-nowrap flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Asignar a:</span>
          </span>
          {activeTeams.map((team) => {
            const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
            const isSelected = selectedTeamForPoints === team.id;
            return (
              <button
                key={team.id}
                onClick={() => onSelectTeamForPoints(team.id)}
                className={`px-2.5 py-1.5 sm:px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? `${cat?.twBg} ${cat?.twContrastText || 'text-slate-950'} shadow-md scale-105 ${cat?.index === 5 ? 'border border-zinc-400' : ''}`
                    : 'bg-black/80 text-amber-200/70 border border-[#d4af37]/30 hover:text-white hover:border-amber-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? (cat?.twContrastText === 'text-white' ? 'bg-white' : 'bg-slate-950') : cat?.twBg} ${cat?.index === 5 && !isSelected ? 'border border-zinc-500' : ''}`} />
                <span>{team.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PANEL DE REPRESENTANTES DESIGNADOS POR BANDO */}
      {['solo', 'duo', 'delegates'].includes(activeGame.participantsMode) && (
        <div className="p-3 sm:p-3.5 bg-[#0c0c14]/90 border border-[#d4af37]/40 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-broadway uppercase text-gold-gradient tracking-wide">
                Representantes en el Ruedo ({activeGame.participantsLabel})
              </span>
            </div>
            <span className="text-[10px] font-vintage text-amber-200/60">
              {activeGame.participantsMode === 'solo' ? '1 por bando' : activeGame.participantsMode === 'duo' ? '2 por bando' : 'Hasta 3 por bando'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
            {activeTeams.map((team) => {
              const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
              const rep = teamRepresentatives[team.id];
              const names = rep?.representativeNames?.length
                ? rep.representativeNames
                : rep?.representativeName
                ? [rep.representativeName]
                : [];

              return (
                <div
                  key={team.id}
                  className="bg-[#12121c] border border-[#d4af37]/30 rounded-xl p-2.5 flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[11px] font-broadway uppercase ${cat?.twText || 'text-amber-200'}`}>
                      {team.name}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${cat?.twBg}`} />
                  </div>
                  <div className="text-[11px] font-vintage">
                    {names.length > 0 ? (
                      <span className="text-amber-100 font-bold block truncate">
                        ⭐ {names.join(', ')}
                      </span>
                    ) : (
                      <span className="text-amber-200/40 italic block">Eligiendo...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTROL DEL SISTEMA DE CAPITANES: MINIDUELO Y APUESTAS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-3.5 hell-card-frame-crimson rounded-2xl">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-white uppercase tracking-wider font-broadway">
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
          onClick={onToggleCaptainDuel}
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
                    className="text-xs text-white font-bold bg-[#0c0c14] px-3 py-1 rounded-xl border border-[#d4af37]/40 flex items-center gap-1.5 shadow-sm"
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
            onClick={onClearCaptainGambles}
            className="text-xs text-amber-200/70 hover:text-white bg-[#14141e] px-3 py-1.5 rounded-xl border border-[#d4af37]/30 hover:border-amber-400 active:scale-95 transition-all font-vintage"
          >
            Limpiar Apuesta
          </button>
        </div>
      )}

      {/* ESTADO DEL BUZZER */}
      {activeGame.engine === 'buzzer' && (
        <div className="bg-[#0c0c14]/90 border border-[#d4af37]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <div>
              <span className="text-xs text-amber-200/60 block font-vintage font-bold uppercase tracking-wider">Estado del Pulsador</span>
              {isLocked && winner ? (
                <span className="text-base font-black text-amber-400 font-broadway">
                  ¡Ha pulsado <span className="text-white">{winner.playerName}</span> ({winner.teamName})!
                </span>
              ) : (
                <span className="text-sm font-bold text-emerald-400 font-vintage">
                  Esperando que algún equipo pulse el botón...
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onResetBuzzer}
            className="bg-[#14141e] hover:bg-[#1a1a28] border border-[#d4af37]/40 hover:border-amber-400 text-amber-200 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all font-broadway tracking-wide shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Desbloquear Pulsador</span>
            <span className="sm:hidden">Desbloquear</span>
          </button>
        </div>
      )}

      {/* BOTONES DE PUNTUACIÓN SEGÚN LAS REGLAS EXACTAS DEL JUEGO */}
      <div className="space-y-3">
        <span className="text-xs uppercase font-vintage font-bold text-amber-200/70 tracking-wider block">
          Selecciona el resultado obtenido por <strong className="text-amber-300">{selectedTeamCatalog ? selectedTeamCatalog.name : 'el equipo seleccionado'}</strong>:
        </span>

        {/* 1. PUNTUACIÓN DE LA PRUEBA (EN DIRECTO) */}
        {activeGame.scoringOptions.filter((o) => o.type !== 'podium').length > 0 && (
          <div>
            <span className="text-[11px] uppercase font-broadway text-amber-400 font-bold block mb-1.5 flex items-center gap-1">
              <span>🎯</span> Puntuación de la Prueba (Aciertos / Fallos):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {activeGame.scoringOptions
                .filter((o) => o.type !== 'podium')
                .map((opt) => {
                  const colorClasses =
                    opt.color === 'emerald'
                      ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40 text-emerald-300'
                      : opt.color === 'red'
                      ? 'bg-red-950/40 hover:bg-red-900/50 border-red-500/40 text-red-300'
                      : opt.color === 'blue'
                      ? 'bg-blue-950/40 hover:bg-blue-900/50 border-blue-500/40 text-blue-300'
                      : opt.color === 'amber'
                      ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/40 text-amber-300'
                      : opt.color === 'purple'
                      ? 'bg-purple-950/40 hover:bg-purple-900/50 border-purple-500/40 text-purple-300'
                      : 'bg-[#14141e] hover:bg-[#1c1c2b] border-[#d4af37]/30 text-amber-100/80';

                  return (
                    <button
                      key={opt.id}
                      onClick={() => onApplyScoreAction(opt)}
                      className={`p-2.5 rounded-2xl border flex flex-col justify-between text-left transition-all active:scale-95 shadow-md ${colorClasses}`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-black">{opt.label}</span>
                        <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-black/40 border border-white/10">
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
        )}

        {/* 2. PUNTUACIÓN POR CLASIFICACIÓN (PODIO) */}
        {activeGame.scoringOptions.filter((o) => o.type === 'podium').length > 0 && (
          <div>
            <span className="text-[11px] uppercase font-broadway text-amber-400 font-bold block mb-1.5 flex items-center gap-1">
              <span>🏆</span> Puntuación por Clasificación (Podio):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeGame.scoringOptions
                .filter((o) => o.type === 'podium')
                .map((opt) => {
                  const colorClasses =
                    opt.color === 'emerald'
                      ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40 text-emerald-300'
                      : opt.color === 'blue'
                      ? 'bg-blue-950/40 hover:bg-blue-900/50 border-blue-500/40 text-blue-300'
                      : opt.color === 'amber'
                      ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/40 text-amber-300'
                      : 'bg-[#14141e] hover:bg-[#1c1c2b] border-[#d4af37]/30 text-amber-100/80';

                  return (
                    <button
                      key={opt.id}
                      onClick={() => onApplyScoreAction(opt)}
                      className={`p-2.5 rounded-2xl border flex flex-col justify-between text-left transition-all active:scale-95 shadow-md ${colorClasses}`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-black">{opt.label}</span>
                        <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-black/40 border border-white/10">
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
        )}
      </div>

      {/* MINIJUEGO: ADIVINA LA CANCIÓN (SPOTIFY) */}
      {activeGame.id === 'music' && (
        <HostMusicControls
          currentSongTrack={musicState.currentSongTrack}
          musicPlaying={musicState.musicPlaying}
          musicRevealed={musicState.musicRevealed}
          musicBank={musicState.musicBank}
          musicSearchMode={musicState.musicSearchMode}
          onSetMusicSearchMode={musicState.setMusicSearchMode}
          musicSearchQuery={musicState.musicSearchQuery}
          onSetMusicSearchQuery={musicState.setMusicSearchQuery}
          musicSearchResults={musicState.musicSearchResults}
          isSearchingMusic={musicState.isSearchingMusic}
          spotifyPlaylistInput={musicState.spotifyPlaylistInput}
          onSetSpotifyPlaylistInput={musicState.setSpotifyPlaylistInput}
          isImportingPlaylist={musicState.isImportingPlaylist}
          onTogglePlayMusic={musicState.handleTogglePlayMusic}
          onToggleRevealMusic={musicState.handleToggleRevealMusic}
          onValidateMusicHit={musicState.handleValidateMusicHit}
          onValidateMusicMiss={musicState.handleValidateMusicMiss}
          onPickRandomSong={musicState.handlePickRandomSong}
          onSelectSong={musicState.handleSelectSong}
          onRemoveTrackFromBank={musicState.handleRemoveTrackFromBank}
          onClearMusicBank={musicState.handleClearMusicBank}
          onSearchMusicOnline={musicState.handleSearchMusicOnline}
          onImportPlaylistFromSpotify={musicState.handleImportPlaylistFromSpotify}
          onSelectSearchedTrack={musicState.handleSelectSearchedTrack}
        />
      )}

      {/* MINIJUEGO: ADIVINA LA PELÍCULA (EMOJIS) */}
      {activeGame.id === 'movies' && (
        <HostMoviesControls
          activePackName={moviesState.activePackName}
          onLoadOfficialPack={moviesState.handleLoadOfficialPack}
          onUploadJson={moviesState.handleUploadJson}
          onResetToDemo={moviesState.handleResetToDemo}
          movieIndex={moviesState.movieIndex}
          filteredMovies={moviesState.filteredMovies}
          movieCategoryFilter={moviesState.movieCategoryFilter}
          onCategoryFilterChange={moviesState.handleCategoryFilterChange}
          currentMovie={moviesState.currentMovie}
          movieRevealed={moviesState.movieRevealed}
          onToggleReveal={moviesState.handleToggleReveal}
          movieFrameLevel={moviesState.movieFrameLevel}
          onSetFrameLevel={moviesState.handleSetFrameLevel}
          autoMoviePoints={moviesState.autoMoviePoints}
          onValidateMovieHitAuto={moviesState.handleValidateMovieHitAuto}
          onValidateMovieMissAuto={moviesState.handleValidateMovieMissAuto}
          onPrevMovie={moviesState.handlePrevMovie}
          onNextMovie={moviesState.handleNextMovie}
        />
      )}

      {/* MINIJUEGO: FOTOS PROYECTOR (BEBÉS) */}
      {activeGame.id === 'fotos_proyector' && (
        <HostBabyPhotosControls
          babyPhotoIndex={babyPhotosState.babyPhotoIndex}
          babyPhotosList={babyPhotosState.babyPhotosList}
          currentBabyPhoto={babyPhotosState.currentBabyPhoto}
          babyPhotoRevealed={babyPhotosState.babyPhotoRevealed}
          onToggleBabyPhotoReveal={babyPhotosState.handleToggleBabyPhotoReveal}
          onValidateBabyPhotoHit={babyPhotosState.handleValidateBabyPhotoHit}
          onValidateBabyPhotoMiss={babyPhotosState.handleValidateBabyPhotoMiss}
          onSelectBabyPhotoDirect={babyPhotosState.handleSelectBabyPhotoDirect}
          onPrevBabyPhoto={babyPhotosState.handlePrevBabyPhoto}
          onNextBabyPhoto={babyPhotosState.handleNextBabyPhoto}
        />
      )}

      {/* MINIJUEGO: PREGUNTAS TRIVIAL */}
      {activeGame.id === 'trivial' && (
        <HostTriviaControls
          currentTriviaQuestion={triviaState.currentTriviaQuestion}
          triviaIndex={triviaState.triviaIndex}
          triviaBank={triviaState.triviaBank}
          triviaReboundActive={triviaState.triviaReboundActive}
          winner={winner}
          triviaRevealed={triviaState.triviaRevealed}
          onRandomTrivia={triviaState.handleRandomTrivia}
          onValidateTriviaHit={triviaState.handleValidateTriviaHit}
          onValidateTriviaFail={triviaState.handleValidateTriviaFail}
          onValidateTriviaReboundHit={triviaState.handleValidateTriviaReboundHit}
          onToggleTriviaReveal={triviaState.handleToggleTriviaReveal}
          onPrevTrivia={triviaState.handlePrevTrivia}
          onNextTrivia={triviaState.handleNextTrivia}
        />
      )}

      {/* MINIJUEGO: 1, 2, 3 ¿YA? */}
      {activeGame.id === 'un_dos_tres' && (
        <HostUnDosTresControls
          currentUdtChallenge={unDosTresState.currentUdtChallenge}
          aliveTeams={unDosTresState.aliveTeams}
          activeTeams={activeTeams}
          currentUdtTeam={unDosTresState.currentUdtTeam}
          onResetUdtRound={unDosTresState.handleResetUdtRound}
          onStartUdtTimer={unDosTresState.handleStartUdtTimer}
          onPassUdtRound={unDosTresState.handlePassUdtRound}
          onEliminateUdtTeam={unDosTresState.handleEliminateUdtTeam}
        />
      )}

      {/* MINIJUEGO: BINGO */}
      {activeGame.id === 'bingo' && (
        <HostBingoControls
          bingoDrawnBalls={bingoState.bingoDrawnBalls}
          bingoCurrentBall={bingoState.bingoCurrentBall}
          bingoIsSpinning={bingoState.bingoIsSpinning}
          lineAwarded={bingoState.lineAwarded}
          bingoAwarded={bingoState.bingoAwarded}
          lineWinner={bingoState.lineWinner}
          bingoWinner={bingoState.bingoWinner}
          onResetBingo={bingoState.handleResetBingo}
          onDrawBingoBall={bingoState.handleDrawBingoBall}
          teams={teams}
          selectedTeamCatalog={selectedTeamCatalog}
          onScoreChange={onScoreChange}
          pendingClaims={bingoState.pendingClaims}
          activeClaim={bingoState.activeClaim}
          onResolveClaim={(claim, accepted) =>
            bingoState.handleResolveClaim(claim, accepted, onScoreChange)
          }
          onDismissClaim={bingoState.handleDismissActiveClaim}
        />
      )}

      {/* MINIJUEGO: MÍMICA */}
      {activeGame.id === 'mimica' && (
        <HostMimicaControls
          currentMimicaCard={mimicaState.currentMimicaCard}
          mimicaCardIndex={mimicaState.mimicaCardIndex}
          mimicaCards={mimicaState.mimicaCards}
          onPickRandomMimicaCard={mimicaState.handlePickRandomMimicaCard}
          mimicaIsRunning={mimicaState.mimicaIsRunning}
          mimicaTimerSeconds={mimicaState.mimicaTimerSeconds}
          onToggleMimicaTimer={mimicaState.handleToggleMimicaTimer}
          mimicaHitsCount={mimicaState.mimicaHitsCount}
          onAddMimicaHit={mimicaState.handleAddMimicaHit}
          onSubtractMimicaHit={mimicaState.handleSubtractMimicaHit}
          onResetMimicaRound={mimicaState.handleResetMimicaRound}
          onNextMimicaCard={mimicaState.handleNextMimicaCard}
        />
      )}

      {/* MINIJUEGO: TELÉFONO DIBUJADO */}
      {activeGame.id === 'drawing' && (
        <HostDrawingControls
          activeTeams={activeTeams}
          selectedTeamForPoints={selectedTeamForPoints}
          onSelectTeamForPoints={onSelectTeamForPoints}
          roundHits={roundHits || {}}
          onApplyScoreAction={onApplyScoreAction}
        />
      )}

      {/* MINIJUEGO: BEER PONG */}
      {activeGame.id === 'beer_pong' && (
        <HostBeerPongControls
          activeTeams={activeTeams}
          roundHits={roundHits || {}}
          onScoreChange={onScoreChange}
          setRoundHits={setRoundHits || (() => {})}
        />
      )}
    </section>
  );
};

import React from 'react';
import { Users, RefreshCw, Play, BookOpen, CheckCircle2 } from 'lucide-react';
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
  captainDuel?: { isActive: boolean } | null;
  onToggleCaptainDuel?: () => void;
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
  onFinishTest?: () => void;
  onLaunchTimer?: (seconds: number) => void;
  teamRepresentatives?: Record<string, TeamRepresentative>;
  players?: Player[];
}

const GAMES_WITH_TEAM_SELECTOR = new Set([
  'music',
  'movies',
  'fotos_proyector',
  'trivial',
  'mimica',
  'torneo_juegos',
]);

export const HostLivePlayingConsole: React.FC<HostLivePlayingConsoleProps> = ({
  activeGame,
  activeTeams,
  teams,
  selectedTeamForPoints,
  onSelectTeamForPoints,
  selectedTeamCatalog,
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
  onFinishTest,
  onLaunchTimer,
}) => {
  // Auto-seleccionar el equipo del ganador del pulsador para asignación inmediata de puntos sin fricción
  React.useEffect(() => {
    if (winner && winner.teamId) {
      onSelectTeamForPoints(winner.teamId);
    }
  }, [winner, onSelectTeamForPoints]);

  const showTeamSelector = GAMES_WITH_TEAM_SELECTOR.has(activeGame.id);

  return (
    <section className="hell-card-frame rounded-3xl p-3.5 sm:p-5 space-y-3">
      {/* CABECERA COMPACTA DEL JUEGO ACTIVO CON BOTONES REGLAS Y FINALIZAR */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#d4af37]/30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl shrink-0">{activeGame.emoji}</span>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-broadway uppercase text-gold-gradient truncate">
              {activeGame.title}
            </h2>
            <span className="text-[11px] font-vintage text-amber-200/70 block truncate">
              {gamePhase === 'briefing' ? '📺 Portada de reglas en TV' : '🟢 Prueba en directo'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleBriefing}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-broadway uppercase flex items-center gap-1 active:scale-95 transition-all border ${
              gamePhase === 'briefing'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                : 'bg-[#14141e] text-amber-200/80 hover:text-white border-[#d4af37]/40'
            }`}
            title="Alternar cartel de reglas en la TV"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Reglas</span>
          </button>

          {onFinishTest && (
            <button
              onClick={onFinishTest}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-broadway font-black text-xs uppercase flex items-center gap-1 shadow-md active:scale-95 transition-all border border-red-400/40"
              title="Finalizar prueba y abrir veredicto de puntos"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finalizar</span>
            </button>
          )}
        </div>
      </div>

      {/* BANNER DE SUBFASE BRIEFING */}
      {gamePhase === 'briefing' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1f1508] via-[#2a1d0b] to-[#1a0f12] border-2 border-[#d4af37] shadow-deco-gold flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="text-[11px] uppercase font-broadway font-black px-2.5 py-0.5 rounded-full bg-gold-gradient text-slate-950">
              FASE DE BRIEFING EN TV
            </span>
            <p className="text-xs text-amber-100/80 font-vintage mt-1">
              Explica las reglas y pulsa iniciar para activar la prueba en TV y móviles.
            </p>
          </div>

          <button
            onClick={onStartActiveRound}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gold-gradient hover:brightness-110 text-slate-950 font-broadway font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-deco-gold border-2 border-[#f5eedb]/60 active:scale-95 transition-all shrink-0"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>▶️ Empezar Prueba</span>
          </button>
        </div>
      )}

      {/* ESTADO DEL PULSADOR (SOLO JUEGOS CON TIMBRE) */}
      {gamePhase !== 'briefing' && activeGame.engine === 'buzzer' && (
        <div
          className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 ${
            isLocked && winner
              ? 'bg-gradient-to-r from-amber-950/90 via-[#251806] to-amber-950/90 border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.3)]'
              : 'bg-[#0c0c14]/90 border-[#d4af37]/35'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${
                isLocked && winner ? 'bg-[#ffd700] animate-bounce' : 'bg-emerald-400 animate-ping'
              }`}
            />
            <div className="min-w-0">
              {isLocked && winner ? (
                <div className="text-xs sm:text-sm font-broadway text-amber-300 truncate">
                  ⚡ <span className="text-white underline">{winner.playerName}</span>{' '}
                  <span className="text-gold-gradient">({winner.teamName})</span>
                </div>
              ) : (
                <span className="text-xs font-bold text-emerald-400 font-vintage block truncate">
                  🟢 Pulsador abierto en móviles...
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onResetBuzzer}
            className="bg-[#14141e] hover:bg-[#1f1f2e] border border-[#d4af37]/50 text-amber-200 text-xs font-broadway px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95 transition-all shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Desbloquear</span>
          </button>
        </div>
      )}

      {/* SELECTOR RÁPIDO DE EQUIPO ACTIVO (UNA SOLA LÍNEA HORIZONTAL) */}
      {showTeamSelector && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <span className="text-[11px] text-amber-300/80 font-vintage font-bold whitespace-nowrap flex items-center gap-1 shrink-0">
            <Users className="w-3 h-3 text-amber-400" />
            <span>Turno/Puntos:</span>
          </span>
          {activeTeams.map((team) => {
            const cat = TEAMS_CATALOG.find((c) => c.index === team.team_index);
            const isSelected = selectedTeamForPoints === team.id;
            const hits = roundHits?.[team.id] || 0;
            return (
              <button
                key={team.id}
                onClick={() => onSelectTeamForPoints(team.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-broadway uppercase transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isSelected
                    ? `${cat?.twBg} ${cat?.twContrastText || 'text-slate-950'} font-black shadow-sm scale-105 ${
                        cat?.index === 5 ? 'border border-zinc-400' : ''
                      }`
                    : 'bg-[#07070a] text-amber-200/70 border border-[#d4af37]/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected
                      ? cat?.twContrastText === 'text-white'
                        ? 'bg-white'
                        : 'bg-slate-950'
                      : cat?.twBg
                  }`}
                />
                <span>{team.name}</span>
                {hits > 0 && (
                  <span className="text-[10px] px-1 rounded bg-black/30 font-mono">
                    {hits}✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* PUNTUACIÓN DIRECTA SOLO PARA TORNEO DE JUEGOS DE MESA (SIN CONTROLES PROPIOS) */}
      {activeGame.id === 'torneo_juegos' && (
        <div className="space-y-2 pt-2 border-t border-[#d4af37]/30">
          <span className="text-xs font-vintage text-amber-200/80 block">
            Asignar puntos a{' '}
            <strong className="text-amber-300">
              {selectedTeamCatalog ? selectedTeamCatalog.name : 'equipo seleccionado'}
            </strong>
            :
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {activeGame.scoringOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onApplyScoreAction(opt)}
                className="p-2.5 rounded-xl border border-[#d4af37]/40 bg-[#14141e] hover:bg-[#1c1c2b] text-amber-100 flex items-center justify-between text-xs font-broadway active:scale-95 transition-all"
              >
                <span className="truncate">{opt.label}</span>
                <span className="font-mono font-black text-amber-300 ml-1">{opt.badge}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
          onShuffleMovies={moviesState.handleShuffleMovies}
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
          activePackName={babyPhotosState.activePackName}
          onLoadOfficialPack={babyPhotosState.handleLoadOfficialPack}
          onUploadJson={babyPhotosState.handleUploadJson}
          onResetToDemo={babyPhotosState.handleResetToDemo}
          babyPhotoIndex={babyPhotosState.babyPhotoIndex}
          babyPhotosList={babyPhotosState.babyPhotosList}
          currentBabyPhoto={babyPhotosState.currentBabyPhoto}
          babyPhotoRevealed={babyPhotosState.babyPhotoRevealed}
          onToggleBabyPhotoReveal={babyPhotosState.handleToggleBabyPhotoReveal}
          onValidateBabyPhotoHit={babyPhotosState.handleValidateBabyPhotoHit}
          onValidateBabyPhotoMiss={babyPhotosState.handleValidateBabyPhotoMiss}
          onValidateBabyPhotoSelf={babyPhotosState.handleValidateBabyPhotoSelf}
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
          udtCountdown={unDosTresState.udtCountdown}
          udtIsTimerRunning={unDosTresState.udtIsTimerRunning}
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
          onLaunchTimer={onLaunchTimer}
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

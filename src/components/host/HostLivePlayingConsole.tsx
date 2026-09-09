import React from 'react';
import { Award, Users, Crown, Swords, Star, RefreshCw } from 'lucide-react';
import { TEAMS_CATALOG } from '../../lib/constants';
import { GameDefinition } from '../../lib/games';
import { Team, BuzzerPressPayload } from '../../lib/types';
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
}) => {
  return (
    <section className="hell-card-frame rounded-3xl p-6 space-y-4">
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
      <div>
        <span className="text-xs uppercase font-vintage font-bold text-amber-200/70 tracking-wider block mb-2">
          Selecciona el resultado obtenido por {selectedTeamCatalog ? selectedTeamCatalog.name : 'el equipo seleccionado'}:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {activeGame.scoringOptions.map((opt) => {
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
          onResetBingo={bingoState.handleResetBingo}
          onDrawBingoBall={bingoState.handleDrawBingoBall}
          teams={teams}
          selectedTeamCatalog={selectedTeamCatalog}
          onScoreChange={onScoreChange}
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

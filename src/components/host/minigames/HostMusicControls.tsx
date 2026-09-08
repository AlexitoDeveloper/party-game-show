import React from 'react';
import {
  Music,
  Disc,
  Play,
  Pause,
  Eye,
  EyeOff,
  Check,
  X,
  Search,
  ListMusic,
  Shuffle,
  Trash2,
  Loader2,
  Volume2,
} from 'lucide-react';
import { SongTrack } from '../../../lib/musicData';

export interface HostMusicControlsProps {
  currentSongTrack: SongTrack | null;
  musicPlaying: boolean;
  musicRevealed: boolean;
  musicBank: SongTrack[];
  musicSearchMode: 'search' | 'playlist' | 'bank';
  onSetMusicSearchMode: (mode: 'search' | 'playlist' | 'bank') => void;
  musicSearchQuery: string;
  onSetMusicSearchQuery: (query: string) => void;
  musicSearchResults: SongTrack[];
  isSearchingMusic: boolean;
  spotifyPlaylistInput: string;
  onSetSpotifyPlaylistInput: (input: string) => void;
  isImportingPlaylist: boolean;
  onTogglePlayMusic: () => void;
  onToggleRevealMusic: () => void;
  onValidateMusicHit: () => void;
  onValidateMusicMiss: () => void;
  onPickRandomSong: () => void;
  onSelectSong: (track: SongTrack, autoPlay?: boolean) => void;
  onRemoveTrackFromBank: (trackId: string, e?: React.MouseEvent) => void;
  onClearMusicBank: () => void;
  onSearchMusicOnline: (e?: React.FormEvent) => void;
  onImportPlaylistFromSpotify: (e?: React.FormEvent) => void;
  onSelectSearchedTrack: (track: SongTrack) => void;
}

export const HostMusicControls: React.FC<HostMusicControlsProps> = ({
  currentSongTrack,
  musicPlaying,
  musicRevealed,
  musicBank,
  musicSearchMode,
  onSetMusicSearchMode,
  musicSearchQuery,
  onSetMusicSearchQuery,
  musicSearchResults,
  isSearchingMusic,
  spotifyPlaylistInput,
  onSetSpotifyPlaylistInput,
  isImportingPlaylist,
  onTogglePlayMusic,
  onToggleRevealMusic,
  onValidateMusicHit,
  onValidateMusicMiss,
  onPickRandomSong,
  onSelectSong,
  onRemoveTrackFromBank,
  onClearMusicBank,
  onSearchMusicOnline,
  onImportPlaylistFromSpotify,
  onSelectSearchedTrack,
}) => {
  return (
    <div className="pt-4 border-t border-slate-800 space-y-4">
      {/* BARRA SUPERIOR SPOTIFY CON BOTÓN ALEATORIO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
            <Disc className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
            Adivina la Canción — Spotify
          </span>
        </div>

        {musicBank.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPickRandomSong}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              title="Elegir canción aleatoria de la lista"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Aleatorio</span>
            </button>
          </div>
        )}
      </div>

      {/* TARJETA DE CHIVATO SECRETO PARA EL ANFITRIÓN */}
      {currentSongTrack ? (
        <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-start md:items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black/60 border-2 border-emerald-500/50 flex-shrink-0 flex items-center justify-center relative shadow-md">
            {currentSongTrack.coverUrl || currentSongTrack.albumArt ? (
              <img
                src={currentSongTrack.coverUrl || currentSongTrack.albumArt}
                alt={currentSongTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-8 h-8 text-emerald-400" />
            )}
            {musicPlaying && (
              <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center backdrop-blur-[1px]">
                <Volume2 className="w-6 h-6 text-white animate-bounce" />
              </div>
            )}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Spotify {currentSongTrack.year ? `• ${currentSongTrack.year}` : ''}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-block">
                Preview 30s
              </span>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                SOLUCIÓN (TV):
              </span>
              <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-1.5 truncate">
                <span className="truncate">{currentSongTrack.title}</span>
                <span className="text-emerald-400 text-sm sm:text-base font-bold truncate shrink-0">
                  — {currentSongTrack.artist}
                </span>
              </h3>
            </div>

            <p className="text-xs text-slate-400 hidden sm:block">
              💡 Dale a Reproducir para que suene en la TV. Al pulsar cualquier buzzer, se pausará automáticamente.
            </p>
          </div>

          {/* Botones de acción principales */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            <button
              onClick={onTogglePlayMusic}
              className={`flex-1 md:flex-none px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                musicPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}
              title={musicPlaying ? 'Pausar audio en TV' : 'Reproducir preview en TV'}
            >
              {musicPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="hidden sm:inline">{musicPlaying ? 'Pausar Audio' : 'Reproducir'}</span>
            </button>

            <button
              onClick={onToggleRevealMusic}
              className={`flex-1 md:flex-none px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                musicRevealed
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title={musicRevealed ? 'Ocultar solución en TV' : 'Revelar solución en TV'}
            >
              {musicRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{musicRevealed ? 'Ocultar' : 'Revelar'}</span>
            </button>

            <button
              onClick={onValidateMusicHit}
              className="flex-1 md:flex-none px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 bg-emerald-400 hover:bg-emerald-300 text-slate-950"
              title="Validar acierto musical para el equipo activo"
            >
              <Check className="w-4 h-4 text-slate-950" />
              <span>Acierto</span>
            </button>

            <button
              onClick={onValidateMusicMiss}
              className="px-3 py-2.5 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 bg-red-600/80 hover:bg-red-600 text-white"
              title="Fallo tras pulsar: penaliza -1 y reanuda música"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Fallo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/80 border border-emerald-500/20 border-dashed rounded-2xl p-6 text-center space-y-2">
          <Music className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
          <h3 className="text-base font-black text-white">No hay ninguna canción de Spotify seleccionada</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Busca un tema abajo en el catálogo de Spotify o introduce el enlace de una playlist pública para empezar la partida musical.
          </p>
        </div>
      )}

      {/* INTEGRACIÓN OFICIAL SPOTIFY: BUSCADOR, PLAYLISTS Y BIBLIOTECA */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 truncate">
              Spotify
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => onSetMusicSearchMode('search')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                musicSearchMode === 'search'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Buscar temazo en Spotify"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
            <button
              type="button"
              onClick={() => onSetMusicSearchMode('playlist')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                musicSearchMode === 'playlist'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Importar playlist de Spotify"
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Playlist</span>
            </button>
            {musicBank.length > 0 && (
              <button
                type="button"
                onClick={() => onSetMusicSearchMode('bank')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  musicSearchMode === 'bank'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Canciones cargadas en biblioteca"
              >
                <Disc className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lista</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-black/40 text-emerald-300">
                  {musicBank.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {musicSearchMode === 'search' ? (
          <>
            <form onSubmit={onSearchMusicOnline} className="flex gap-2">
              <input
                type="text"
                value={musicSearchQuery}
                onChange={(e) => onSetMusicSearchQuery(e.target.value)}
                placeholder="Buscar en Spotify (ej: Despacito, Queen, Rosalía...)"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-w-0"
              />
              <button
                type="submit"
                disabled={isSearchingMusic || !musicSearchQuery.trim()}
                className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 shadow"
                title="Buscar canciones"
              >
                {isSearchingMusic ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </form>

            {musicSearchResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pt-2 border-t border-slate-800/80">
                {musicSearchResults.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => onSelectSearchedTrack(track)}
                    className="flex items-center gap-2.5 p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 rounded-xl cursor-pointer transition-all group"
                  >
                    {track.coverUrl || track.albumArt ? (
                      <img
                        src={track.coverUrl || track.albumArt}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                        {track.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {track.artist} {track.year ? `• ${track.year}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all flex items-center gap-1 text-[10px] font-bold"
                      title="Poner en TV"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">Poner</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : musicSearchMode === 'playlist' ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 hidden sm:block">
              Pega el enlace de cualquier playlist pública de Spotify para importar sus canciones automáticamente:
            </p>
            <form onSubmit={onImportPlaylistFromSpotify} className="flex gap-2">
              <input
                type="text"
                value={spotifyPlaylistInput}
                onChange={(e) => onSetSpotifyPlaylistInput(e.target.value)}
                placeholder="https://open.spotify.com/playlist/..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-w-0"
              />
              <button
                type="submit"
                disabled={isImportingPlaylist || !spotifyPlaylistInput.trim()}
                className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-md"
                title="Importar playlist de Spotify"
              >
                {isImportingPlaylist ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ListMusic className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isImportingPlaylist ? 'Importando...' : 'Importar'}</span>
              </button>
            </form>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">💡 Sugeridas:</span>
              <button
                type="button"
                onClick={() => onSetSpotifyPlaylistInput('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M')}
                className="text-emerald-400 hover:underline bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700"
              >
                Hits 2000s
              </button>
              <button
                type="button"
                onClick={() => onSetSpotifyPlaylistInput('https://open.spotify.com/playlist/37i9dQZF1DX10zKzsJ2jva')}
                className="text-emerald-400 hover:underline bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700"
              >
                Pop Español
              </button>
              <button
                type="button"
                onClick={() => onSetSpotifyPlaylistInput('https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd')}
                className="text-emerald-400 hover:underline bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700"
              >
                Rock Clásico
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-800 text-xs">
              <span className="text-slate-400 font-bold truncate">
                Disponibles ({musicBank.length}):
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onPickRandomSong}
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  title="Elegir aleatoria"
                >
                  <Shuffle className="w-3 h-3" />
                  <span className="hidden sm:inline">Aleatoria</span>
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={onClearMusicBank}
                  className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                  title="Vaciar lista"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Vaciar</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pt-1">
              {musicBank.map((track) => {
                const isCurrent = currentSongTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => onSelectSong(track, true)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all border ${
                      isCurrent
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                        : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                    }`}
                  >
                    {track.coverUrl || track.albumArt ? (
                      <img
                        src={track.coverUrl || track.albumArt}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isCurrent ? 'text-emerald-300' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {track.artist} {track.year ? `• ${track.year}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isCurrent ? (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950">
                          TV
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:bg-emerald-600 hover:text-white text-[10px] flex items-center gap-1"
                          title="Poner en TV"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span className="hidden sm:inline">Poner</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => onRemoveTrackFromBank(track.id, e)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded-md transition-colors"
                        title="Eliminar de la lista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

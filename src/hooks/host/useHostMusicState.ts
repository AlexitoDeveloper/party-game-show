import { useState, useEffect } from 'react';
import { SongTrack } from '../../lib/musicData';
import { searchSpotifyTracks, fetchSpotifyPlaylistTracks } from '../../lib/spotify';
import { RoomSync } from '../../lib/roomSync';
import { BuzzerPressPayload, Team } from '../../lib/types';
import { TEAMS_CATALOG } from '../../lib/constants';

export interface UseHostMusicStateParams {
  roomCode: string;
  roomSync: RoomSync;
  resetBuzzer: () => void;
  isLocked: boolean;
  winner: BuzzerPressPayload | null;
  teams: Team[];
  selectedTeamCatalog?: (typeof TEAMS_CATALOG)[0] | null;
  handleScoreChange: (teamId: string, delta: number) => void;
  setRoundHits: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  soundFX: {
    playVictory: () => void;
    playFail: () => void;
  };
}

export function useHostMusicState({
  roomCode,
  roomSync,
  resetBuzzer,
  isLocked,
  winner,
  teams,
  selectedTeamCatalog,
  handleScoreChange,
  setRoundHits,
  soundFX,
}: UseHostMusicStateParams) {
  const [musicBank, setMusicBank] = useState<SongTrack[]>(() => {
    const saved = localStorage.getItem(`party_music_bank_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [currentSongTrack, setCurrentSongTrack] = useState<SongTrack | null>(() => {
    const saved = localStorage.getItem(`party_current_song_${roomCode}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicRevealed, setMusicRevealed] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [musicSearchResults, setMusicSearchResults] = useState<SongTrack[]>([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);
  const [spotifyPlaylistInput, setSpotifyPlaylistInput] = useState('');
  const [isImportingPlaylist, setIsImportingPlaylist] = useState(false);
  const [musicSearchMode, setMusicSearchMode] = useState<'search' | 'playlist' | 'bank'>('search');

  const syncMusicState = (
    playing: boolean,
    revealed: boolean,
    trackData?: SongTrack | null
  ) => {
    const song = trackData !== undefined ? trackData : currentSongTrack;
    roomSync.broadcast({
      type: 'MUSIC_STATE_UPDATE',
      payload: {
        trackIndex: 0,
        isPlaying: playing,
        isRevealed: revealed,
        trackData: song || undefined,
      },
    });
  };

  // Auto-pausar la música en el Host si alguien pulsa el buzzer en el móvil (solo si aún no está revelada)
  useEffect(() => {
    if (isLocked && musicPlaying && !musicRevealed) {
      setMusicPlaying(false);
      syncMusicState(false, musicRevealed);
    }
  }, [isLocked, musicRevealed]);

  // Temporizador de seguridad: las previews de Spotify duran 30s. Si termina en TV o se pierde señal, auto-restablecer botón a "Reproducir"
  useEffect(() => {
    if (!musicPlaying) return;
    const timer = setTimeout(() => {
      setMusicPlaying(false);
      syncMusicState(false, musicRevealed);
    }, 31000);
    return () => clearTimeout(timer);
  }, [musicPlaying, musicRevealed]);

  const handleTogglePlayMusic = () => {
    const nextPlaying = !musicPlaying;
    setMusicPlaying(nextPlaying);
    syncMusicState(nextPlaying, musicRevealed);
  };

  const handleToggleRevealMusic = () => {
    const nextRevealed = !musicRevealed;
    setMusicRevealed(nextRevealed);
    syncMusicState(musicPlaying, nextRevealed);
  };

  const handleSelectSong = (track: SongTrack, autoPlay: boolean = true) => {
    setCurrentSongTrack(track);
    localStorage.setItem(`party_current_song_${roomCode}`, JSON.stringify(track));
    const exists = musicBank.some((s) => s.id === track.id);
    if (!exists) {
      const updatedBank = [track, ...musicBank];
      setMusicBank(updatedBank);
      localStorage.setItem(`party_music_bank_${roomCode}`, JSON.stringify(updatedBank));
    }
    setMusicPlaying(autoPlay);
    setMusicRevealed(false);
    resetBuzzer();
    syncMusicState(autoPlay, false, track);
  };

  const handlePickRandomSong = () => {
    if (musicBank.length === 0) return;
    const candidates =
      musicBank.length > 1 && currentSongTrack
        ? musicBank.filter((t) => t.id !== currentSongTrack.id)
        : musicBank;
    const randomTrack = candidates[Math.floor(Math.random() * candidates.length)];
    handleSelectSong(randomTrack, true);
  };

  const handleRemoveTrackFromBank = (trackId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = musicBank.filter((t) => t.id !== trackId);
    setMusicBank(updated);
    localStorage.setItem(`party_music_bank_${roomCode}`, JSON.stringify(updated));
    if (currentSongTrack?.id === trackId) {
      const nextSong = updated[0] || null;
      setCurrentSongTrack(nextSong);
      if (nextSong) {
        localStorage.setItem(`party_current_song_${roomCode}`, JSON.stringify(nextSong));
      } else {
        localStorage.removeItem(`party_current_song_${roomCode}`);
      }
      setMusicPlaying(false);
      setMusicRevealed(false);
      resetBuzzer();
      syncMusicState(false, false, nextSong);
    }
  };

  const handleClearMusicBank = () => {
    if (!confirm('¿Seguro que deseas vaciar las canciones cargadas?')) return;
    setMusicBank([]);
    setCurrentSongTrack(null);
    localStorage.removeItem(`party_music_bank_${roomCode}`);
    localStorage.removeItem(`party_current_song_${roomCode}`);
    setMusicPlaying(false);
    setMusicRevealed(false);
    resetBuzzer();
    syncMusicState(false, false, null);
  };

  const handleSearchMusicOnline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!musicSearchQuery.trim()) return;
    setIsSearchingMusic(true);
    try {
      const results = await searchSpotifyTracks(musicSearchQuery.trim());
      setMusicSearchResults(results);
    } catch (err) {
      console.error('Error al buscar temas en Spotify:', err);
    } finally {
      setIsSearchingMusic(false);
    }
  };

  const handleImportPlaylistFromSpotify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!spotifyPlaylistInput.trim()) return;
    setIsImportingPlaylist(true);
    try {
      const { tracks, playlistName } = await fetchSpotifyPlaylistTracks(
        spotifyPlaylistInput.trim(),
        'Spotify'
      );
      if (tracks.length === 0) {
        alert('No se encontraron canciones con preview disponible en esa playlist de Spotify.');
        return;
      }
      const existingIds = new Set(musicBank.map((s) => s.id));
      const newTracks = tracks.filter((t: SongTrack) => !existingIds.has(t.id));
      const updatedBank = [...newTracks, ...musicBank];
      setMusicBank(updatedBank);
      localStorage.setItem(`party_music_bank_${roomCode}`, JSON.stringify(updatedBank));

      if (!currentSongTrack && updatedBank.length > 0) {
        setCurrentSongTrack(updatedBank[0]);
        localStorage.setItem(`party_current_song_${roomCode}`, JSON.stringify(updatedBank[0]));
        syncMusicState(false, false, updatedBank[0]);
      }
      setSpotifyPlaylistInput('');
      setMusicSearchMode('bank');
      alert(
        `🎉 ¡Se han importado ${newTracks.length} canciones oficiales de Spotify de la playlist "${playlistName}"!`
      );
    } catch (err: any) {
      alert(`Error al importar playlist de Spotify: ${err.message || err}`);
    } finally {
      setIsImportingPlaylist(false);
    }
  };

  const handleSelectSearchedTrack = (track: SongTrack) => {
    handleSelectSong(track, true);
    setMusicSearchResults([]);
    setMusicSearchQuery('');
  };

  const handleValidateMusicHit = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, 2);
      setRoundHits((prev) => ({
        ...prev,
        [targetTeam.id]: (prev[targetTeam.id] || 0) + 1,
      }));
    }
    setMusicRevealed(true);
    setMusicPlaying(true);
    if (isLocked) resetBuzzer();
    syncMusicState(true, true);
    soundFX.playVictory();
  };

  const handleValidateMusicMiss = () => {
    const targetTeam = winner?.teamId
      ? teams.find((t) => t.team_index === winner.teamIndex || t.id === winner.teamId)
      : selectedTeamCatalog
      ? teams.find((t) => t.team_index === selectedTeamCatalog.index)
      : teams.find((t) => t.is_active);

    if (targetTeam) {
      handleScoreChange(targetTeam.id, -1);
    }
    setMusicPlaying(true);
    if (isLocked) resetBuzzer();
    syncMusicState(true, false);
    soundFX.playFail();
  };

  return {
    musicBank,
    currentSongTrack,
    musicPlaying,
    musicRevealed,
    musicSearchQuery,
    setMusicSearchQuery,
    musicSearchResults,
    isSearchingMusic,
    spotifyPlaylistInput,
    setSpotifyPlaylistInput,
    isImportingPlaylist,
    musicSearchMode,
    setMusicSearchMode,
    syncMusicState,
    handleTogglePlayMusic,
    handleToggleRevealMusic,
    handleSelectSong,
    handlePickRandomSong,
    handleRemoveTrackFromBank,
    handleClearMusicBank,
    handleSearchMusicOnline,
    handleImportPlaylistFromSpotify,
    handleSelectSearchedTrack,
    handleValidateMusicHit,
    handleValidateMusicMiss,
  };
}

export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  category?: string;
  previewUrl: string;
  coverUrl: string;
  albumArt?: string;
  year: number;
  extraClue?: string;
}

export type MusicCategory = string;

/**
 * Catálogo musical dinámico alimentado 100% por la API de Spotify (búsquedas y playlists importadas).
 * Sin canciones estáticas ni hardcodeadas.
 */
export const CURATED_SONGS: SongTrack[] = [];

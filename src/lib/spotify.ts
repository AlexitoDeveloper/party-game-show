import { SongTrack } from './musicData';

const DEFAULT_CLIENT_ID = 'd4fbf20281a04b74a9e5f82f063b5cb5';
const DEFAULT_CLIENT_SECRET = 'fea04de89fdb4c4bb747bd7ae26ec1ed';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || DEFAULT_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || DEFAULT_CLIENT_SECRET;

interface CachedToken {
  token: string;
  expiresAt: number;
}

let tokenCache: CachedToken | null = null;

/**
 * Obtiene o reutiliza un token de acceso a Spotify usando Client Credentials
 */
export async function getSpotifyAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60000) {
    return tokenCache.token;
  }

  try {
    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      console.error('Error al autenticar con Spotify API:', await res.text());
      return null;
    }

    const data = await res.json();
    tokenCache = {
      token: data.access_token,
      expiresAt: now + (data.expires_in || 3600) * 1000,
    };
    return tokenCache.token;
  } catch (error) {
    console.error('Error de red al conectar con Spotify:', error);
    return null;
  }
}

/**
 * Obtiene el audio preview oficial de 30 segundos directamente de los servidores de Spotify (CDN p.scdn.co).
 * Utiliza el proxy local para evitar bloqueos CORS del navegador y cuenta con resolución de respaldo.
 */
async function getSpotifyPreviewAudio(trackId: string, spotifyPreviewUrl?: string | null, title?: string, artist?: string): Promise<string> {
  if (spotifyPreviewUrl) return spotifyPreviewUrl;

  // 1. Intentar obtener el MP3 oficial de Spotify (p.scdn.co) mediante el endpoint local sin CORS
  try {
    const res = await fetch(`/api/spotify-preview/${trackId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.previewUrl) return data.previewUrl;
    }
  } catch {
    // Si falla el endpoint local, continuar al fallback
  }

  // 2. Fallback de audio 30s garantizado en caso de despliegue estático sin proxy
  if (title && artist) {
    try {
      const q = `${title} ${artist}`.replace(/[-_()]/g, ' ').trim();
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=1&country=ES`);
      if (res.ok) {
        const d = await res.json();
        return d.results?.[0]?.previewUrl || '';
      }
    } catch {}
  }

  return '';
}

/**
 * Busca canciones directamente en la API de Spotify
 */
export async function searchSpotifyTracks(query: string): Promise<SongTrack[]> {
  const token = await getSpotifyAccessToken();
  if (!token) return [];

  try {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10&market=ES`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.warn('Error en la llamada a Spotify Search:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    const items = data.tracks?.items || [];

    // Mapear temas oficiales de Spotify
    const results: SongTrack[] = await Promise.all(
      items.map(async (item: any): Promise<SongTrack> => {
        const title = item.name;
        const artist = item.artists?.map((a: any) => a.name).join(', ') || 'Varios';
        const previewUrl = await getSpotifyPreviewAudio(item.id, item.preview_url, title, artist);
        const coverUrl = item.album?.images?.[0]?.url || item.album?.images?.[1]?.url || '';
        const year = item.album?.release_date ? parseInt(item.album.release_date.substring(0, 4), 10) : 2020;

        return {
          id: `spotify_${item.id}`,
          title,
          artist,
          category: 'Pop Español',
          previewUrl,
          coverUrl,
          year: isNaN(year) ? 2020 : year,
          extraClue: `Spotify: ${item.album?.name || title}`,
        };
      })
    );

    return results;
  } catch (error) {
    console.error('Error buscando temas en Spotify:', error);
    return [];
  }
}

/**
 * Extrae el ID de una playlist de Spotify a partir de una URL o cadena
 */
export function extractSpotifyPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  const uriMatch = trimmed.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) return trimmed;
  return null;
}

/**
 * Importa canciones de cualquier playlist pública de Spotify utilizando la API de Spotify
 */
export async function fetchSpotifyPlaylistTracks(
  playlistUrlOrId: string,
  category: SongTrack['category'] = 'Pop Español'
): Promise<{ tracks: SongTrack[]; playlistName: string }> {
  const playlistId = extractSpotifyPlaylistId(playlistUrlOrId);
  if (!playlistId) {
    throw new Error('Enlace o ID de Playlist de Spotify no válido');
  }

  const token = await getSpotifyAccessToken();
  if (!token) {
    throw new Error('No se pudo conectar con la API de Spotify');
  }

  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?market=ES`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('No se pudo encontrar la playlist. Asegúrate de que sea pública.');
  }

  const data = await res.json();
  const playlistName = data.name || 'Playlist de Spotify';
  const rawItems = data.tracks?.items || [];

  const items = rawItems.slice(0, 25);

  const tracks: SongTrack[] = await Promise.all(
    items.map(async (entry: any): Promise<SongTrack | null> => {
      const item = entry.track;
      if (!item || !item.name) return null;

      const title = item.name;
      const artist = item.artists?.map((a: any) => a.name).join(', ') || 'Varios';
      const coverUrl = item.album?.images?.[0]?.url || item.album?.images?.[1]?.url || '';
      const year = item.album?.release_date ? parseInt(item.album.release_date.substring(0, 4), 10) : 2020;
      const previewUrl = await getSpotifyPreviewAudio(item.id, item.preview_url, title, artist);

      return {
        id: `spotify_${item.id}`,
        title,
        artist,
        category,
        previewUrl,
        coverUrl,
        year: isNaN(year) ? 2020 : year,
        extraClue: `De la playlist de Spotify "${playlistName}"`,
      };
    })
  );

  const validTracks = tracks.filter((t): t is SongTrack => t !== null);
  return { tracks: validTracks, playlistName };
}

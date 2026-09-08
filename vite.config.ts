import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin de relé WebSocket local para sincronizar teléfonos móviles y PC en la misma red Wi-Fi sin configuración
function partyRelayPlugin(): Plugin {
  return {
    name: 'party-relay-plugin',
    configureServer(server) {
      server.ws.on('party-event', (data: any) => {
        // Retransmitir el evento a todos los navegadores y móviles conectados
        try {
          server.ws.send({ type: 'custom', event: 'party-event', data });
        } catch {
          try { (server.ws as any).send('party-event', data); } catch {}
        }
      });

      // Endpoint para extraer el preview oficial de Spotify CDN (p.scdn.co) sin bloqueos CORS del navegador
      server.middlewares.use('/api/spotify-preview', async (req, res) => {
        const url = new URL(req.url || '', 'http://localhost');
        const trackId = url.pathname.replace(/^\//, '');
        if (!trackId) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Falta trackId' }));
          return;
        }
        try {
          const embedRes = await fetch(`https://open.spotify.com/embed/track/${trackId}`);
          const text = await embedRes.text();
          const jsonMatch = text.match(/"audioPreview":\{"url":"([^"]+)"\}/);
          const cdnMatch = text.match(/https:\/\/p\.scdn\.co\/mp3-preview\/[a-zA-Z0-9]+/);
          const previewUrl = jsonMatch && jsonMatch[1] ? jsonMatch[1].replace(/\\u0026/g, '&') : cdnMatch ? cdnMatch[0] : '';
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ previewUrl }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err) }));
        }
      });

      // Endpoint para importar playlists públicas de Spotify sin bloqueos CORS
      server.middlewares.use('/api/spotify-playlist', async (req, res) => {
        const url = new URL(req.url || '', 'http://localhost');
        const playlistId = url.pathname.replace(/^\//, '');
        if (!playlistId) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Falta playlistId' }));
          return;
        }
        try {
          const embedRes = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          });
          if (!embedRes.ok) {
            res.statusCode = embedRes.status;
            res.end(JSON.stringify({ error: 'No se pudo cargar la playlist' }));
            return;
          }
          const html = await embedRes.text();
          const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
          if (!nextDataMatch) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'No se encontraron datos en la playlist' }));
            return;
          }
          const parsed = JSON.parse(nextDataMatch[1]);
          const entity = parsed.props?.pageProps?.state?.data?.entity;
          if (!entity) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Playlist no encontrada o es privada' }));
            return;
          }
          const playlistName = entity.name || 'Playlist de Spotify';
          const playlistCover = entity.visualIdentity?.image?.[1]?.url || entity.visualIdentity?.image?.[0]?.url || '';
          const rawTracks = entity.trackList || [];
          const tracks = rawTracks.map((t: any) => {
            const trackId = t.uri ? t.uri.replace('spotify:track:', '') : t.uid || Math.random().toString(36).substring(2, 9);
            const title = t.title || 'Canción';
            const artist = t.subtitle || 'Varios';
            const previewUrl = t.audioPreview?.url || '';
            return {
              id: `spotify_${trackId}`,
              title,
              artist,
              previewUrl,
              coverUrl: playlistCover,
              duration: t.duration || 180000,
            };
          });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ playlistName, playlistCover, tracks }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), partyRelayPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});

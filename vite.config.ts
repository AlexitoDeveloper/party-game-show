import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin de relé WebSocket local para sincronizar teléfonos móviles y PC en la misma red Wi-Fi sin configuración
function partyRelayPlugin(env: Record<string, string>): Plugin {
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

      // Endpoint para obtener el token oficial de Spotify sin exponer el Client Secret al cliente
      server.middlewares.use('/api/spotify-token', async (req, res) => {
        const clientId = env.SPOTIFY_CLIENT_ID || env.VITE_SPOTIFY_CLIENT_ID;
        const clientSecret = env.SPOTIFY_CLIENT_SECRET || env.VITE_SPOTIFY_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Faltan credenciales SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET' }));
          return;
        }
        try {
          const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
          const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${credentials}`,
            },
            body: 'grant_type=client_credentials',
          });
          if (!tokenRes.ok) {
            res.statusCode = tokenRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Error autenticando con Spotify', details: await tokenRes.text() }));
            return;
          }
          const data = await tokenRes.json();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ access_token: data.access_token, expires_in: data.expires_in }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err) }));
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), partyRelayPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 5173,
    },
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three')) return 'vendor-three';
              if (id.includes('peerjs')) return 'vendor-peer';
              if (id.includes('@dicebear')) return 'vendor-dicebear';
              if (id.includes('framer-motion') || id.includes('gsap')) return 'vendor-animation';
              if (id.includes('lucide-react') || id.includes('@phosphor-icons')) return 'vendor-icons';
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react';
            }
          },
        },
      },
    },
  };
});

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
        server.ws.send('party-event', data);
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

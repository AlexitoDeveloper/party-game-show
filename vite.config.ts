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

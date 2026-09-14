# 📋 Auditoría Técnica: Incidencias y Mejoras Pendientes

**Proyecto:** Party Game Show Arena  
**Fecha:** 14 de Septiembre de 2026  
**Stack:** React 19, TypeScript 5.6, Vite 5.4, Supabase Realtime, PeerJS WebRTC, TailwindCSS, Three.js  

---

## 📌 Estado de la Arquitectura

- **Plataforma Multijugador:** Modelo cliente-servidor híbrido sincronizado mediante 4 canales de transporte (`BroadcastChannel`, `Vite Relay WebSocket`, `Supabase Realtime` y `WebRTC PeerJS`).
- **Puntos de Entrada:**
  - `/`: Portal de acceso y selector de perfiles.
  - `/room/[CODE]/tv`: Pantalla gigante/proyector (1080p/4K) con podio 3D y vitrola Speakeasy.
  - `/room/[CODE]/play`: Mando táctil móvil con timbres hápticos, bandejas de naipes y cartones de bingo apaisados.
  - `/room/[CODE]/host`: Consola de control del anfitrión con soundboard silencioso y veredictos automáticos.

---

## 🛠️ Tareas Pendientes, Optimizaciones y Riesgos a Resolver

### 🟡 1. Optimización de Peso de Imágenes de Cartas en Móvil (~64 MB)
- **Problema:** Los 19 archivos `.jpeg` de las cartas oficiales en `public/new_cards/` pesan entre 3.1 MB y 3.8 MB cada uno (~64 MB en total). En dispositivos móviles, los jugadores descargan imágenes de 1696×2528 px para renderizarlas en miniaturas de 80×120 px.
- **Acción requerida:**
  - Convertir las cartas maestras a formato WebP/AVIF comprimido (~200 KB por carta).
  - Generar miniaturas (`public/new_cards/thumbs/`) para la mano del jugador móvil y reservar la alta resolución para la proyección en TV (`CinematicCardPlayReveal`).

---

### 🟡 2. Blindaje de Políticas RLS en Supabase (`src/supabase/schema.sql`)
- **Problema:** Las políticas de actualización (`Public Update Rooms`, `Public Update Teams`, `Public Update Game States`) tienen actualmente la directiva `USING (true)`.
- **Riesgo:** Cualquier usuario técnico con la anon-key pública podría ejecutar llamadas directas para alterar marcadores o estados de sala sin autorización del Host.
- **Acción requerida:**
  - Restringir la política de actualización de salas y equipos en Supabase para validar que la petición incluya el `host_token` correspondiente.

---

### 🟡 3. Fragilidad del Scraper de Embeds de Spotify (`__NEXT_DATA__`)
- **Problema:** La importación de playlists públicas (`api/spotify-playlist/[id].ts` y middleware local de Vite) scrapea el HTML del embed de Spotify mediante expresiones regulares sobre `<script id="__NEXT_DATA__">`.
- **Riesgo:** Spotify cambia periódicamente la hidratación interna de sus reproductores embebidos. Si eliminan o renombran esta etiqueta, la importación de nuevas playlists fallará.
- **Acción requerida:**
  - Migrar la búsqueda e importación de playlists públicas hacia la API oficial de Spotify (utilizando el nuevo endpoint seguro `/api/spotify-token`).

---

### 🟢 4. Credenciales de Respaldo WebRTC TURN para Entornos Comerciales
- **Problema:** En `src/lib/roomSync.ts`, el canal P2P de respaldo utiliza el servidor TURN público gratuito de Metered (`openrelayproject`).
- **Riesgo:** Es suficiente para partidas locales y pruebas, pero en eventos masivos con alta concurrencia el proveedor público puede limitar el ancho de banda.
- **Acción requerida:**
  - Parametrizar las URLs y credenciales TURN mediante variables de entorno para permitir el uso de servidores TURN dedicados (ej. Cloudflare Calls o Metered de pago) si se requiere respaldo P2P independiente de Supabase.

---

### 🟢 5. Previews de Audio Local para Juegos Musicales Offline
- **Problema:** Si bien el catálogo inicial de canciones ya cuenta con 12 temas de referencia en `src/lib/musicData.ts`, los audios se resuelven contra la API de búsqueda de iTunes o Spotify.
- **Acción requerida:**
  - Descargar e incluir clips de audio MP3/Opus de 30 segundos en `public/sounds/music/` para estos 12 temas base, logrando que *Hits and RUN* sea 100% funcional incluso en recintos completamente aislados de internet.

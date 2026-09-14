# 📋 Backlog de Tareas Pendientes, Mejoras y Bugs

Documento de seguimiento de incidencias abiertas, tareas pendientes y próximas mejoras para la aplicación **Party Game Show (1930s Dark Rubber Hose / Casino Art Déco)**.

---

## 🛠️ Tareas Pendientes y Próximas Mejoras

### 1. 🖼️ Compresión WebP y Miniaturas de Cartas de Poder en Móvil
- **Prioridad:** Alta (Rendimiento Móvil / Conexión 4G/5G).
- **Descripción:**
  - Convertir las 19 imágenes maestras de `public/new_cards/` (actualmente ~64 MB en JPEGs de 3.5 MB cada uno) a WebP o AVIF comprimido (~200 KB por carta).
  - Crear miniaturas en `public/new_cards/thumbs/` para la mano del jugador móvil (`PlayerCardHandModal` y `PlayerFannedHandDrawer`), reservando la alta resolución para la proyección monumental en TV (`CinematicCardPlayReveal.tsx`).

---

### 2. 🔒 Blindaje de Políticas RLS en Supabase
- **Prioridad:** Media (Seguridad / Integridad de Datos).
- **Descripción:**
  - Actualizar `src/supabase/schema.sql` para que las políticas de `UPDATE` sobre las tablas `rooms`, `teams` y `game_states` no utilicen `USING (true)`.
  - Exigir validación del `host_token` para que únicamente el anfitrión legítimo de la sala pueda actualizar puntuaciones y estados desde el cliente de Supabase.

---

### 3. 🎵 Migración de Scraper de Spotify a la API Oficial
- **Prioridad:** Media (Fiabilidad de Servicios Externos).
- **Descripción:**
  - Sustituir el scraper regex de `<script id="__NEXT_DATA__">` en `api/spotify-playlist/[id].ts` por llamadas directas a los endpoints oficiales de Spotify API utilizando el token de servidor ya configurado en `/api/spotify-token`.
  - Mantener el scraper únicamente como mecanismo de fallback secundario.

---

### 4. 🎧 Clips de Audio Locales de 30s para Partidas Sin Internet
- **Prioridad:** Baja / Experiencia Offline.
- **Descripción:**
  - Almacenar clips locales de 30 segundos en `public/sounds/music/` para los 12 temas del Starter Pack de `src/lib/musicData.ts`.
  - Permitir que el minijuego musical *Hits and RUN* funcione sin depender de conexiones activas a Spotify ni a iTunes cuando se juegue en modo offline.

---

### 5. 🌐 Configuración de Credenciales TURN Privadas
- **Prioridad:** Baja / Operativa de Producción.
- **Descripción:**
  - Parametrizar en variables de entorno los servidores TURN de `roomSync.ts` para posibilitar el uso de infraestructura WebRTC privada (ej. Metered privado o Cloudflare Calls) en eventos comerciales masivos.

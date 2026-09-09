# 📋 Registro de Tareas Pendientes, Mejoras y Bugs Reportados

Documento de seguimiento de incidencias, peticiones de usuario y mejoras pendientes para la aplicación **Party Game Show (1930s Dark Rubber Hose / Casino Art Déco)**.

---

## 📌 Estado Actual del Roadmap General
- [x] **Fase 1**: Núcleo Visual Art Déco en `index.css` (paleta negro azabache, oro antiguo, carmesí, vidriera y marcos de naipes con palos ♠, ♥, ♣, ♦).
- [x] **Fase 2**: `TvView` (Pantalla de TV con marco de vidriera, minijuegos acotados, footer de puntuación de partida y eliminación de scroll).
- [ ] **Fase 3**: `PlayerView & Buzzer` (Móvil del jugador: ficha de casino clandestino / campana de latón pulido con retroalimentación háptica y mano de cartas desplegable).
- [x] **Fase 4**: `HostView` (Consola del anfitrión con paneles de ébano, tipografía Broadway y controles de minijuegos unificados).

---

## 🛠️ Incidencias y Mejoras Reportadas (Pendientes de Corrección)

### 1. 🎬 Pantalla de Introducción / Briefing previo al inicio de cada juego
- **Tipo**: Mejora de Experiencia de Usuario (UX) / Flujo de Partida.
- **Descripción**: Al seleccionar un nuevo minijuego desde la consola del anfitrión, debe mostrarse en la pantalla central de la TV (y en el Host) una **pantalla previa de introducción** con una ilustración/cartel representativo del juego y un texto explicativo claro de las reglas y puntuación, antes de arrancar los pulsadores o la cuenta atrás del juego.
- **Objetivo**: Dar tiempo al Maestro de Ceremonias para explicar la dinámica y ambientar a los equipos sin que el juego empiece a rodar de inmediato.
- **Solución Técnica Propuesta**:
  - Incorporar una subfase de minijuego (`room.game_phase: 'briefing' | 'active'` o estado local de preparación).
  - Diseñar el componente `<TvGameBriefingCard game={activeGame} />` con diseño de cartel teatral 1930s (`hell-card-frame`).
  - Añadir un botón en el Host: *"Iniciar Prueba"* que transmita el paso a la fase activa de pulsadores/música/fotografías.

---

### 2. 🔊 Bug en la Pestaña de Sonidos (Soundboard) y Emisión de Audio Exclusiva en /tv
- **Tipo**: Bug / Arquitectura de Audio.
- **Descripción**:
  1. En ciertas ocasiones no permite acceder a la pestaña *"Sonidos"* (`activeTab === 'soundboard'`) al pulsar sobre ella desde la barra de navegación del Host; sin embargo, al cambiar a otro minijuego en el catálogo, la pestaña vuelve a responder con normalidad.
  2. **Requerimiento Crítico de Audio**: **No debe emitirse ningún sonido desde el dispositivo del anfitrión (`/host`)**. El host actúa únicamente como mando a distancia o consola de control silenciosa. Todos los efectos sonoros (SFX), sintonías, timbres, campanas y pistas musicales deben sonar de manera exclusiva desde la pantalla receptora (`/tv`) a través de la sincronización en tiempo real (`roomSync.broadcast`).
- **Diagnóstico Preliminar**:
  - **Conflicto de capas (z-index / pointer-events)**: Algunos controles de minijuegos activos pueden mantener overlays o elementos flotantes invisibles que solapan la barra de pestañas `<nav>` del Host.
  - **Excepción en re-renderizado de audio**: Posible error no capturado al evaluar el estado `jukeboxState` o inicializar la instancia de Web Audio antes de que el motor del minijuego libere sus recursos de sonido.
- **Solución Técnica Propuesta**:
  - Asignar una capa superior fija a la navegación: `<nav className="sticky top-0 z-40 ...">`.
  - Envolver `<HostSoundboardTab />` en un `ErrorBoundary` defensivo para aislar posibles excepciones de audio.
  - Silenciar `soundFX` en `/host` o usar una implementación no-op en el anfitrión, delegando el disparo de audio al broadcast para que sea la TV quien ejecute `soundFX`.
  - Revisar los componentes específicos de minijuego para asegurar que limpien listeners y modales al desmontarse.

---

### 3. ✅ [RESUELTO] Eliminación del Botón "Atrás" en Header y Bloqueo del Botón "Atrás" del Móvil
- **Estado**: **RESUELTO e IMPLEMENTADO**.
- **Solución Aplicada**:
  - **Header (`HostHeaderControls.tsx`)**: Eliminado el enlace `<Link to="/"><ArrowLeft /></Link>` del encabezado que causaba salidas accidentales. Se ha sustituido por un botón explícito de salida (`LogOut`) con diálogo modal de confirmación (`window.confirm`) para garantizar que nadie abandone la sala por error.
  - **Móvil / Historial del Navegador (`usePreventAccidentalNavigation.ts`)**: Implementado hook que intercepta el evento `popstate` y re-empuja el estado en el historial, neutralizando gestos y botones físicos de retroceso en Android e iOS tanto en `HostView.tsx` como en `PlayerView.tsx`.
  - **Protección de Cierre (`beforeunload`)**: Alerta nativa antes de cerrar o recargar la pestaña en plena partida.

---
*Última actualización: 9 de septiembre de 2026*

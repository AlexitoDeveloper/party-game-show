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

### 2. ✅ [RESUELTO] Bug en la Pestaña de Sonidos (Soundboard) y Emisión de Audio Exclusiva en /tv
- **Estado**: **RESUELTO e IMPLEMENTADO**.
- **Solución Aplicada**:
  - **Causa Raíz del Bloqueo de la Pestaña**: En `HostView.tsx`, el estado inicial de `jukeboxState` utilizaba propiedades antiguas (`trackIndex`, `track`) en lugar de (`currentTrackIndex`, `currentTrack`). Al abrir por primera vez la pestaña *Sonidos*, `SpeakeasyJukeboxWidget.tsx` intentaba evaluar `state.currentTrack.title` sobre un valor `undefined`, provocando un `TypeError` fatal en el árbol de React que colgaba la vista. Al cambiar de juego en el catálogo, la TV enviaba un evento `JUKEBOX_STATE_SYNC` que reparaba el objeto y por ello volvía a funcionar.
  - **Blindaje de Renderizado (`SpeakeasyJukeboxWidget.tsx`)**: Se extrae ahora la pista actual con fallback exhaustivo resiliente (`state?.currentTrack || JUKEBOX_PLAYLIST[state?.currentTrackIndex || 0] || JUKEBOX_PLAYLIST[0]`) y saneamiento defensivo de volumen y reproducción booleana para garantizar que jamás lance una excepción.
  - **Capa de Navegación (`HostView.tsx`)**: Elevado el z-index de la barra de pestañas a `z-50` (`<nav className="sticky top-2 z-50 ...">`), blindándola frente a capas flotantes o banners de minijuegos.
  - **Aislamiento con Error Boundary (`ErrorBoundary.tsx`)**: Creado componente defensivo Art Déco que envuelve `<HostSoundboardTab />`, aislando cualquier fallo en la fonoteca y ofreciendo botón de reintento.
  - **Arquitectura de Host 100% Silencioso (`hostTvAudioProxy`)**: Se ha eliminado por completo la importación y llamada al motor de sonido local `soundFX` en `HostView.tsx`. Se implementó un proxy `hostTvAudioProxy` que canaliza el 100% de los disparos sonoros (aciertos, fallos, fanfarrias de victoria, caja de ruidos, pulsador, suspense, cartas de poder y sintonías) única y exclusivamente a la pantalla `/tv` vía `roomSync.broadcast({ type: 'PLAY_SOUND', payload: { sound } })`. El anfitrión actúa como un mando a distancia completamente insonoro.
  - **Persistencia y Actualización de Etiquetas**: Añadida persistencia reactiva en `localStorage` (`party_jukebox_${roomCode}`) y actualizado el indicador del Soundboard a *"Audio WebAPI • Suena exclusivamente en la TV"*.

---

### 3. ✅ [RESUELTO] Eliminación del Botón "Atrás" en Header y Bloqueo del Botón "Atrás" del Móvil
- **Estado**: **RESUELTO e IMPLEMENTADO**.
- **Solución Aplicada**:
  - **Header (`HostHeaderControls.tsx`)**: Eliminado el enlace `<Link to="/"><ArrowLeft /></Link>` del encabezado que causaba salidas accidentales. Se ha sustituido por un botón explícito de salida (`LogOut`) con diálogo modal de confirmación (`window.confirm`) para garantizar que nadie abandone la sala por error.
  - **Móvil / Historial del Navegador (`usePreventAccidentalNavigation.ts`)**: Implementado hook que intercepta el evento `popstate` y re-empuja el estado en el historial, neutralizando gestos y botones físicos de retroceso en Android e iOS tanto en `HostView.tsx` como en `PlayerView.tsx`.
  - **Protección de Cierre (`beforeunload`)**: Alerta nativa antes de cerrar o recargar la pestaña en plena partida.

---

### 4. ✅ [RESUELTO] Solapamiento de Sonidos entre Host y TV (Doble Disparo de Audio)
- **Estado**: **RESUELTO e IMPLEMENTADO**.
- **Causa Raíz**: Tras migrar el Host a arquitectura 100% silenciosa, algunos flujos de lógica (como las fanfarrias de victoria o las cartas de poder) seguían invocando `soundFX` localmente en el Host y a la vez emitiendo `PLAY_SOUND` a la TV, provocando que ciertos efectos sonaran dos veces o que el `triggerVictoryConfetti` duplicara el evento.
- **Solución Aplicada**:
  - **Deduplicación en `audio.ts`**: Se introdujo un mapa de timestamps `lastPlayedTimestamps` que rechaza disparos del mismo sonido si han pasado menos de 300 ms desde la última reproducción, eliminando duplicados sin alterar la lógica de negocio.
  - **Bandera opcional en `triggerVictoryConfetti`**: Se añadió el parámetro `{ silent?: boolean }` para que el Host pueda activar el confeti sin re-emitir el evento de sonido cuando ya lo ha enviado por `hostTvAudioProxy`.

---

### 5. ✅ [RESUELTO] Pantalla en Negro al Mostrar el Veredicto Final de Prueba (HostTestVerdictModal)
- **Estado**: **RESUELTO e IMPLEMENTADO**.
- **Causa Raíz**: React desmontaba el árbol de componentes completo cuando `HostTestVerdictModal` accedía al mapa `impactsMap[teamId]` sobre equipos que aún no tenían datos persistidos, lanzando un `TypeError: Cannot read properties of undefined` en el primer render.
- **Solución Aplicada**:
  - **Saneamiento de datos en `testVerdict.ts`**: Se añadieron guardas defensivas (`|| []`, `?? 0`) en todos los accesos a `impactsMap` y `scoreDeltas` antes de construir el objeto de veredicto, garantizando que nunca se pase `undefined` a los componentes hijos.
  - **Envoltorio `ErrorBoundary`**: `HostTestVerdictModal` queda ahora envuelto en el componente `ErrorBoundary` Art Déco ya existente. Si se produce cualquier error de renderizado imprevisto, el modal muestra un mensaje de reintento elegante en lugar de una pantalla en negro.

---

### 6. ✅ [IMPLEMENTADO] Nueva Carta de Poder: "El Trueque"
- **Estado**: **IMPLEMENTADO**.
- **Descripción**: Integración completa de la carta épica de intercambio de puntos entre equipos.
- **Implementación**:
  - **Catálogo (`powerCardsCatalog.ts`)**: Añadida la entrada `el_trueque` con rareza épica (🟣 Épica), descripción, coste y referencia de imagen `intercambio.jpeg`.
  - **Mapa de imágenes (`CARD_IMAGE_MAP`)**: Registrado `el_trueque → intercambio.jpeg`.
  - **Lógica de juego (`useHostPowerCards.ts`)**: Implementada la función `executeSwapCard` que intercambia los marcadores de puntos entre dos equipos seleccionados. Si solo hay un equipo disponible, se activa el modo de *robo de puntos* (resta al único rival y suma al equipo jugador).

---

### 7. ✅ [COMPLETADO] Estandarización de Prompts de Arte para Cartas de Poder
- **Estado**: **COMPLETADO**.
- **Descripción**: Los 19 prompts de generación de imagen de cartas de poder han sido homogeneizados para garantizar consistencia visual y corregir defectos de generaciones previas (imágenes oscuras, fondos incorrectos, color de líneas geométricas incoherente con la rareza).
- **Cambios Realizados (en `card_art_prompts.md`)**:
  - **Estructura unificada**: Todos los prompts siguen ahora el mismo esquema de secciones: ID, Destino de Archivo, Efecto de Carta, y Prompt Técnico.
  - **Fondo estandarizado**: Reemplazado cualquier fondo de vidriera o variante oscura por `Pitch black background` uniforme para todas las cartas.
  - **Color de líneas geométricas por rareza**: La frase clave `Filigree geometric borders laced with sharp [COLOR] linework` ahora usa el color exacto de cada rareza:
    - 🟢 **Común** → `emerald green linework`
    - 🔵 **Rara** → `sapphire blue linework`
    - 🟣 **Épica** → `vivid purple linework`
    - 🟡 **Legendaria** → `radiant amber linework`

---
*Última actualización: 9 de septiembre de 2026*

# 📋 Registro de Tareas Pendientes, Mejoras y Bugs Reportados

Documento de seguimiento de incidencias, peticiones de usuario y mejoras pendientes para la aplicación **Party Game Show (1930s Dark Rubber Hose / Casino Art Déco)**.

---

## 📌 Estado Actual del Roadmap General
- [x] **Fase 1**: Núcleo Visual Art Déco en `index.css` (paleta negro azabache, oro antiguo, carmesí, vidriera y marcos de naipes con palos ♠, ♥, ♣, ♦).
- [x] **Fase 2**: `TvView` (Pantalla de TV con marco de vidriera, minijuegos acotados, footer de puntuación de partida y eliminación de scroll).
- [x] **Fase 3**: `PlayerView & Buzzer` (Móvil del jugador: ficha de casino clandestino / campana de latón pulido con retroalimentación háptica y mano de cartas desplegable).
- [x] **Fase 4**: `HostView` (Consola del anfitrión con paneles de ébano, tipografía Broadway y controles de minijuegos unificados).

---

## 🛠️ Incidencias y Mejoras Reportadas (Pendientes)

### 1. 🎬 Pantalla de Introducción / Briefing previo al inicio de cada juego
- **Tipo**: Mejora de Experiencia de Usuario (UX) / Flujo de Partida.
- **Descripción**: Al seleccionar un nuevo minijuego desde la consola del anfitrión, debe mostrarse en la pantalla central de la TV (y en el Host) una **pantalla previa de introducción** con una ilustración/cartel representativo del juego y un texto explicativo claro de las reglas y puntuación, antes de arrancar los pulsadores o la cuenta atrás del juego.
- **Objetivo**: Dar tiempo al Maestro de Ceremonias para explicar la dinámica y ambientar a los equipos sin que el juego empiece a rodar de inmediato.
- **Solución Técnica Propuesta**:
  - Incorporar una subfase de minijuego (`room.game_phase: 'briefing' | 'active'` o estado local de preparación).
  - Diseñar el componente `<TvGameBriefingCard game={activeGame} />` con diseño de cartel teatral 1930s (`hell-card-frame`).
  - Añadir un botón en el Host: *"Iniciar Prueba"* que transmita el paso a la fase activa de pulsadores/música/fotografías.

---

### 2. 🎱 Cartones Virtuales Interactivos de Bingo en Móvil (PlayerView) - [x] COMPLETADO
- **Tipo**: Nueva Funcionalidad / Experiencia de Jugador.
- **Estado**: ✅ **Completado e Implementado**.
- **Solución Implementada**:
  - **Generador Matemático de Cartones (90 Bolas)**:
    - Módulo [`bingoTicketGenerator.ts`](file:///c:/Users/ald19/Desktop/Documentos/Proyectos/party-game-show/src/lib/bingoTicketGenerator.ts): matriz 3×9 (5 números y 4 huecos por fila, 15 números por cartón, columnas de decenas 1-9 a 80-90 ordenadas de forma ascendente).
    - **1 Único Cartón Inmutable por Jugador**: Asignación aleatoria única al conectar, sin opción de cambiar o regenerar números. Persistencia en `localStorage` vinculada al código de sala y jugador (`party_bingo_ticket_${roomCode}_${playerId}`).
  - **Diseño Horizontal Dividido (*Split Landscape*) y Pantalla Completa Obligatoria**:
    - **El cartón NUNCA sale en vertical**: en vertical solo se muestra la pantalla de instrucciones con la animación Art Déco invitando a girar el terminal (`🔄 Gira tu dispositivo a horizontal`).
    - **Retorno automático al salir de pantalla completa**: si el jugador sale de la pantalla completa (pulsando salir, tecla escape o gesto del sistema), vuelve inmediatamente a la pantalla inicial donde se le indica que debe poner pantalla completa y girar el móvil.
    - En horizontal y pantalla completa: layout dividido sin scroll (`100dvh`). Barra lateral izquierda con la última bola extraída, contador de bolas, botón para salir y botones de acción rápida. Cuadrícula principal en la derecha con fichas de casino hápticas y halo dorado inteligente.
  - **Cantar Línea y Cantar Bingo en Tiempo Real**:
    - Modal de confirmación con cotejo previo.
    - Emisión de `BINGO_CLAIM` vía `roomSync`.
    - **HostView**: Alerta prioritaria con cotejo visual de los números cantados (verde si ya salieron en el bombo, rojo si no) y botón de un click para validar y adjudicar los puntos (+2 pts Línea / +6 pts Bingo).
    - **TvView**: Celebración cinemática en pantalla completa con los datos del jugador, equipo, números cantados, confeti y fanfarria.

---

### 3. 🔒 Bloqueo de Canto de Línea y Bingo ya Validados - [x] COMPLETADO
- **Tipo**: Regla de Juego / Consistencia Multijugador.
- **Estado**: ✅ **Completado e Implementado**.
- **Solución Implementada**:
  - **Regla de Validación Única**:
    - Una vez que el Maestro de Ceremonias valida una Línea (+2 pts), ningún jugador puede volver a cantar Línea en esa partida.
    - Una vez que el Maestro de Ceremonias valida un Bingo (+6 pts), la partida queda resuelta y cerrada, impidiendo nuevos cantos.
  - **Bloqueo en el Móvil del Jugador (`PlayerBingoSection.tsx`)**:
    - Los botones pasan a estado bloqueado y tachado (`🔒 Línea Validada` / `🏆 Bingo Validado`) al validarse el premio.
    - Apertura de modal y emisión de reclamos bloqueados tanto a nivel visual como lógico.
    - Si un jugador tenía abierto el modal al momento en que otro jugador es premiado, se cierra automáticamente informando con un toast.
  - **Protección y Limpieza en la Consola del Anfitrión (`useHostBingoState.ts` / `HostBingoControls.tsx`)**:
    - Las reclamaciones entrantes extemporáneas de modalidades ya otorgadas se descartan de inmediato.
    - Al aceptar una Línea o Bingo, se descartan automáticamente de `pendingClaims` los demás cantos pendientes de esa misma modalidad.
    - Indicador de estado y desactivación del botón de aceptación si una reclamación ya fue otorgada.
    - Al reiniciar el bombo con *"Reiniciar Bombo"*, los estados de línea y bingo validados se restablecen a disponibles.
  - **Sincronización en Sala y Pantalla TV (`roomSync.ts` / `TvView.tsx` / `TvBingoGame.tsx`)**:
    - Los eventos `BINGO_STATE_UPDATE` y `BINGO_CLAIM_RESOLVE` sincronizan `lineAwarded`, `bingoAwarded`, `lineWinner` y `bingoWinner`.
    - La cabecera de la TV muestra insignias en tiempo real indicando a quién se le otorgó la Línea y quién ganó el Bingo.

---
*Última actualización: 14 de septiembre de 2026*



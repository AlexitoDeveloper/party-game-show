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

### 1. 🎬 Pantalla de Introducción / Briefing previo al inicio de cada juego - [x] COMPLETADO
- **Tipo**: Mejora de Experiencia de Usuario (UX) / Flujo de Partida.
- **Estado**: ✅ **Completado e Implementado**.
- **Solución Implementada**:
  - **Subfase de Minijuego (`room.game_phase: 'briefing' | 'active'`)**:
    - Al seleccionar cualquier juego desde el catálogo del Host o avanzar de ronda, la partida inicia automáticamente en subfase `'briefing'`.
    - En `'briefing'`, los pulsadores y temporizadores quedan en pausa de seguridad, dando control absoluto al Maestro de Ceremonias.
  - **Cartel Teatral Art Déco 1930s (`TvGameBriefingCard.tsx`) en TV**:
    - Marco de vidriera y naipes franceses (`hell-card-frame` con pips ♠, ♥, ♣, ♦).
    - Columna izquierda: Ilustración o cartel oficial del juego con marco dorado reflectante (`GameCoverImage.tsx`).
    - Columna derecha: Cabecera con número de juego oficial (1 al 10), categoría, título monumental en tipografía Broadway con degradado de oro, sinopsis narrativa, viñetas estéticas de reglas y tabla de puntuaciones destacadas.
    - Banner inferior de latón con latido luminoso indicando que la sala está atenta a las instrucciones.
  - **Cargador Inteligente de Portadas de Juegos (`GameCoverImage.tsx`)**:
    - Carpeta [`public/covers/`](file:///c:/Users/ald19/Desktop/Documentos/Proyectos/party-game-show/public/covers/) creada con guía [`README.txt`](file:///c:/Users/ald19/Desktop/Documentos/Proyectos/party-game-show/public/covers/README.txt).
    - Soporte multi-extensión (.png, .jpg, .jpeg, .webp) y resolución automática por número o nombre: `1_hits_and_run`, `2_trivial_del_rey`, `3_mensaje_al_rey`, `4_casino_del_diablo`, `5_cine_mudo`, `6_quien_demonios_es`, `7_el_precio_del_tiempo`, `8_el_enigma_del_rey`, `9_tiro_al_vaso`, `10_los_numeros_del_destino`.
    - Fallback visual de cartel Art Déco con rosetón geométrico, tipografía Broadway y emblema central en caso de que aún no se haya copiado el archivo.
  - **Control en la Consola del Anfitrión (`HostLivePlayingConsole.tsx`)**:
    - Banner destacado de Briefing con botón dorado: *"▶️ Iniciar Prueba"* para arrancar la ronda en directo en la TV y móviles al unísono.
    - Botón *"Ver Reglas / Briefing en TV"* disponible durante la fase activa para que el anfitrión pueda repasar las normas en cualquier momento.
  - **Pantalla de Espera en el Móvil del Concursante (`PlayerView.tsx`)**:
    - Tarjeta elegante con miniatura del cartel, instrucciones de quién debe salir a jugar por el equipo (`participantsLabel` y descripción) y aviso de preparación.

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



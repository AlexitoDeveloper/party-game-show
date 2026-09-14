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

### 2. 🎱 Cartones Virtuales Interactivos de Bingo en Móvil (PlayerView)
- **Tipo**: Nueva Funcionalidad / Experiencia de Jugador.
- **Descripción**: Permitir que cada jugador disponga en su dispositivo móvil de uno o dos **cartones de bingo virtuales interactivos** para jugar sin necesidad de cartones de papel impresos. Los jugadores podrán marcar/tachar números conforme salgan del bombo virtual de la TV y cantar Línea o Bingo directamente desde su interfaz.
- **Decisión de Diseño de Pantalla (Modo Horizontal / Landscape)**:
  - **Recomendación UX**: **Totalmente acertado poner el móvil en horizontal**. 
  - **Motivo técnico y ergonómico**: Un cartón estándar de bingo español (90 bolas) consta de una matriz de **3 filas × 9 columnas** (15 números repartidos con 5 números y 4 huecos por fila). En un móvil en vertical (~360–390 px de ancho), 9 columnas dejan casillas de apenas ~35 px de ancho, haciendo imposible leer los números con comodidad o tocarlos sin pulsar la casilla vecina por error.
  - Al girar a **horizontal** (~650–900 px de ancho útil), cada casilla dispone de espacio suficiente (~60–80 px) para un diseño táctil generoso, legible y estilizado en Casino Art Déco 1930s.
  - **Manejo de Orientación**:
    - Detector de orientación mediante CSS (`@media (orientation: portrait)`) y listener `screen.orientation`.
    - Si el jugador sostiene el móvil en vertical durante la prueba de Bingo, mostrar una pantalla/overlay elegante con una animación Art Déco invitando a girar el dispositivo: *"Gira tu dispositivo en horizontal para abrir tu cartón de juego 🔄"*.
    - Opción de visualización compacta o soporte de pantalla completa (`fullscreen`).
- **Especificaciones Técnicas y Funcionales**:
  - **Generación Algorítmica de Cartones**:
    - Generador matemático de cartones válidos de 90 bolas (columna 1: 1-9, columna 2: 10-19, ..., columna 9: 80-90; exactamente 5 números por fila y 15 en total; sin números duplicados).
    - Persistencia en `localStorage` vinculada al jugador y código de sala (`party_bingo_card_${roomCode}_${playerId}`) para que al recargar la página no cambie el cartón ni se borren las marcas.
  - **Interacción y Trazabilidad**:
    - Marcar/desmarcar casillas con toque háptico y sello estilo ficha de casino / tampón vintage.
    - Detección automática inteligente: resaltar en un tono sutil los números del cartón que ya han sido cantados en el bombo de la TV (`bingoDrawnBalls`).
  - **Botones de Acción "Cantar Línea" y "Cantar Bingo"**:
    - Botones dorados prominentes en la cabecera o lateral del cartón.
    - Al pulsar, emitir evento en tiempo real vía `roomSync` para alertar en directo al Host y a la TV con fanfarria sonora y animación en pantalla.

---
*Última actualización: 14 de septiembre de 2026*


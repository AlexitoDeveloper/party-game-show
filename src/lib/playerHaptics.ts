/**
 * playerHaptics.ts
 * Motor de vibración y retroalimentación háptica para dispositivos móviles.
 * Proporciona firmas de vibración táctil temáticas para el concurso.
 */

export const playerHaptics = {
  /**
   * Comprueba de forma segura si la API de vibración web está disponible
   */
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  },

  /**
   * Ejecuta un patrón de vibración si está soportado
   */
  vibrate(pattern: number | number[]): boolean {
    if (!this.isSupported()) return false;
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  },

  /**
   * Golpe táctil mecánico seco y nítido al pulsar el botón
   */
  press(): void {
    this.vibrate([35, 20, 45]);
  },

  /**
   * Fanfarria rítmica triunfal en las manos del jugador al ser el más rápido
   */
  winner(): void {
    this.vibrate([60, 30, 80, 40, 140]);
  },

  /**
   * Doble pulsación sorda cuando otro jugador pulsa primero
   */
  lockout(): void {
    this.vibrate([25, 70, 25]);
  },

  /**
   * Latido de tensión para el duelo de capitanes
   */
  duel(): void {
    this.vibrate([40, 100, 40]);
  },

  /**
   * Traqueteo áspero de cadenas de hierro cuando el botón está sellado/baneado
   */
  rattleChain(): void {
    this.vibrate([25, 25, 25, 25, 40]);
  },

  /**
   * Despliegue de naipe sobre el tapete
   */
  cardPlay(): void {
    this.vibrate([45, 30, 60]);
  },

  /**
   * Toque suave para navegación en la baraja
   */
  cardSlide(): void {
    this.vibrate(15);
  },

  /**
   * Golpe táctil firme de ficha de casino al tachar o desmarcar número en el cartón
   */
  stamp(): void {
    this.vibrate([28, 15, 35]);
  },

  /**
   * Fanfarria háptica de Línea completada
   */
  lineClaim(): void {
    this.vibrate([50, 40, 80, 50, 100]);
  },

  /**
   * Gran fanfarria triunfal continua para BINGO
   */
  bingoClaim(): void {
    this.vibrate([70, 30, 90, 30, 120, 40, 200]);
  },
};

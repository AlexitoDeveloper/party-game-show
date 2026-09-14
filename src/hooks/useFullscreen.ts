import { useState, useEffect, useCallback } from 'react';

export interface FullscreenState {
  isFullscreen: boolean;
  isSupported: boolean;
  isStandalone: boolean;
  toggleFullscreen: () => Promise<boolean>;
  enterFullscreen: () => Promise<boolean>;
  exitFullscreen: () => Promise<boolean>;
}

/**
 * Comprueba si la API estándar o con prefijos de pantalla completa está disponible en el navegador.
 */
export function isFullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as any;
  const docEl = document.documentElement as any;
  return Boolean(
    doc.fullscreenEnabled ||
    doc.webkitFullscreenEnabled ||
    doc.mozFullScreenEnabled ||
    doc.msFullscreenEnabled ||
    docEl.requestFullscreen ||
    docEl.webkitRequestFullscreen ||
    docEl.mozRequestFullScreen ||
    docEl.msRequestFullscreen
  );
}

/**
 * Comprueba si la app se está ejecutando en modo PWA / Pantalla de Inicio (iOS o Android standalone).
 */
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as any;
  return Boolean(
    nav.standalone ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  );
}

/**
 * Determina si el documento está actualmente en modo pantalla completa.
 */
export function getIsFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as any;
  return Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    isRunningStandalone()
  );
}

/**
 * Hook universal para gestionar el modo pantalla completa (Fullscreen API)
 * tanto en ordenadores como en dispositivos móviles (Android / iOS / Tablets).
 */
export function useFullscreen(): FullscreenState {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(getIsFullscreen);
  const [isSupported] = useState<boolean>(isFullscreenSupported);
  const [isStandalone] = useState<boolean>(isRunningStandalone);

  const checkState = useCallback(() => {
    setIsFullscreen(getIsFullscreen());
  }, []);

  useEffect(() => {
    // Eventos estándar y con prefijos de vendor para detectar cambios de pantalla completa
    document.addEventListener('fullscreenchange', checkState);
    document.addEventListener('webkitfullscreenchange', checkState);
    document.addEventListener('mozfullscreenchange', checkState);
    document.addEventListener('MSFullscreenChange', checkState);
    window.addEventListener('resize', checkState);
    window.addEventListener('orientationchange', checkState);

    return () => {
      document.removeEventListener('fullscreenchange', checkState);
      document.removeEventListener('webkitfullscreenchange', checkState);
      document.removeEventListener('mozfullscreenchange', checkState);
      document.removeEventListener('MSFullscreenChange', checkState);
      window.removeEventListener('resize', checkState);
      window.removeEventListener('orientationchange', checkState);
    };
  }, [checkState]);

  const enterFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      } else {
        return false;
      }
      setIsFullscreen(true);
      return true;
    } catch (err) {
      console.warn('No se pudo entrar a pantalla completa:', err);
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      const doc = document as any;
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      } else {
        return false;
      }
      setIsFullscreen(false);
      return true;
    } catch (err) {
      console.warn('No se pudo salir de pantalla completa:', err);
      return false;
    }
  }, []);

  const toggleFullscreen = useCallback(async (): Promise<boolean> => {
    if (getIsFullscreen()) {
      return await exitFullscreen();
    } else {
      return await enterFullscreen();
    }
  }, [enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    isSupported,
    isStandalone,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
  };
}

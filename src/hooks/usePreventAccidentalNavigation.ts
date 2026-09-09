import { useEffect } from 'react';

export interface UsePreventAccidentalNavigationOptions {
  enabled?: boolean;
  onAttemptBack?: () => void;
  confirmBeforeUnload?: boolean;
}

/**
 * Hook que previene la salida accidental de la sala de juego mediante:
 * 1. Neutralización del botón físico/gestual de "Atrás" de Android e iOS mediante interceptación de popstate.
 * 2. Advertencia nativa ante recarga o cierre accidental de pestaña (beforeunload).
 */
export function usePreventAccidentalNavigation(options: UsePreventAccidentalNavigationOptions = {}) {
  const { enabled = true, onAttemptBack, confirmBeforeUnload = true } = options;

  useEffect(() => {
    if (!enabled) return;

    // Insertar un estado centinela en el historial para capturar el primer retroceso
    window.history.pushState({ partyShield: true }, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // Re-empujar inmediatamente el estado para no abandonar la URL actual
      window.history.pushState({ partyShield: true }, '', window.location.href);

      if (onAttemptBack) {
        onAttemptBack();
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!confirmBeforeUnload) return;
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, onAttemptBack, confirmBeforeUnload]);
}

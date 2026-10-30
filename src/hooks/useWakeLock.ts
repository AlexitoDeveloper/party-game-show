import { useEffect, useRef } from 'react';

/**
 * Mantiene la pantalla encendida en dispositivos móviles (iOS 16.4+ Safari y Android Chrome)
 * para evitar que el teléfono se bloquee durante la partida y corte las conexiones WebSocket/WebRTC.
 */
export function useWakeLock() {
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      return;
    }

    let isMounted = true;

    const requestWakeLock = async () => {
      if (!isMounted || typeof document === 'undefined' || document.visibilityState !== 'visible') {
        return;
      }
      if (wakeLockRef.current && !wakeLockRef.current.released) {
        return;
      }
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch {
        // Silencioso si el navegador requiere interacción previa o batería baja
      }
    };

    requestWakeLock();

    const handleVisibilityOrInteraction = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrInteraction);
    window.addEventListener('focus', handleVisibilityOrInteraction);
    window.addEventListener('touchstart', handleVisibilityOrInteraction, { passive: true });
    window.addEventListener('click', handleVisibilityOrInteraction, { passive: true });

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityOrInteraction);
      window.removeEventListener('focus', handleVisibilityOrInteraction);
      window.removeEventListener('touchstart', handleVisibilityOrInteraction);
      window.removeEventListener('click', handleVisibilityOrInteraction);
      if (wakeLockRef.current) {
        try {
          wakeLockRef.current.release();
        } catch {}
        wakeLockRef.current = null;
      }
    };
  }, []);
}

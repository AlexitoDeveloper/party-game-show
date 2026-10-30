import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Envuelve React.lazy reintentando la descarga dinámica del chunk hasta `retries` veces
 * con un intervalo en milisegundos en caso de microcortes o inestabilidad Wi-Fi.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  retries = 2,
  delayMs = 1200
): LazyExoticComponent<T> {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (remaining: number) => {
        importer()
          .then(resolve)
          .catch((error) => {
            if (remaining <= 0) {
              reject(error);
              return;
            }
            setTimeout(() => {
              attempt(remaining - 1);
            }, delayMs);
          });
      };
      attempt(retries);
    })
  );
}

let hasPrefetched = false;

/**
 * Pre-carga en segundo plano los chunks de las pantallas clave de la fiesta
 * tras el arranque inicial (TvView, HostView, PlayerView, TvReceiverPage).
 * Asegura que una TV en /tv tenga el bundle de TvView listo incluso si cae el Wi-Fi.
 */
export function prefetchAppRoutes(): void {
  if (hasPrefetched || typeof window === 'undefined') return;
  hasPrefetched = true;

  const runPrefetch = () => {
    // Pre-cargar paquetes críticos silenciosamente
    import('../pages/TvView').catch(() => {});
    import('../pages/HostView').catch(() => {});
    import('../pages/PlayerView').catch(() => {});
    import('../pages/TvReceiverPage').catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runPrefetch, { timeout: 3000 });
  } else {
    setTimeout(runPrefetch, 1200);
  }
}

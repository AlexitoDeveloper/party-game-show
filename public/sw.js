// Service Worker: Resiliencia de red offline y microcortes para Party Game Show
const CACHE_NAME = 'party-game-cache-v1';
const SHELL_ASSETS = ['/', '/index.html', '/tv'];

// Instalación inmediata del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        console.warn('[SW] Error al pre-cachear shell básica:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activación y limpieza de versiones obsoletas de caché
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepción de peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Rutas de navegación HTML (/, /tv, /room/*): Network-First con fallback a /index.html
  const isNavigation =
    request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
              // Mantener actualizado el index de fallback
              cache.put('/index.html', networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const indexFallback = await caches.match('/index.html');
          if (indexFallback) return indexFallback;
          return new Response('Sin conexión de red.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // 2. Activos estáticos (JS, CSS, fuentes, sonidos, imágenes): Cache-First con relleno en red
  const isStatic =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/sounds/') ||
    url.pathname.startsWith('/cards/') ||
    url.pathname.startsWith('/covers/') ||
    url.pathname.startsWith('/chips/') ||
    url.pathname.startsWith('/photos/') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    /\.(?:js|css|woff2?|ttf|png|jpg|jpeg|svg|webp|mp3|wav|ogg|ico)$/i.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request)
          .then((networkResponse) => {
            // Permitir cachear respuestas 200 y opacas (cross-origin como Google Fonts)
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('', { status: 408, statusText: 'Recurso offline no disponible' });
          });
      })
    );
  }
});

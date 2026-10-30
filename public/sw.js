// Service Worker v2: Resiliencia de red offline y sincronización en tiempo real
const CACHE_NAME = 'party-game-cache-v2';
const SHELL_ASSETS = ['/', '/index.html', '/tv'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        console.warn('[SW] Error pre-cacheando shell básica:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Omitir explícitamente módulos de desarrollo Vite, APIs y WebSockets/relés en tiempo real
  if (
    url.pathname.includes('/src/') ||
    url.pathname.includes('/node_modules/') ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@react-refresh') ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('ntfy.sh') ||
    url.hostname.includes('supabase.co')
  ) {
    return;
  }

  // Rutas de navegación HTML (/, /tv, /room/*): Network-First con fallback a /index.html
  const isNav =
    request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isNav) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
              cache.put('/index.html', networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
          return new Response('Sin conexión de red.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // Activos estáticos: Cache-First con relleno en red
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
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => new Response('', { status: 408, statusText: 'Recurso offline no disponible' }));
      })
    );
  }
});

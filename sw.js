const CACHE = 'la-cave-v3';
const FILES = ['/la-cave/', '/la-cave/index.html', '/la-cave/manifest.json'];

// Installation : mise en cache des fichiers statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting(); // Prend le contrôle immédiatement
});

// Activation : supprime les vieux caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch : Network first pour HTML, Cache first pour le reste
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  if (!e.request.url.startsWith(self.location.origin)) {
    e.respondWith(fetch(e.request));
    return;
  }

  if (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

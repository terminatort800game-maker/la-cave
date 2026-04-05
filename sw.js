const CACHE = 'la-cave-v36'; // ← Incrémente à chaque mise à jour : v5, v6, v7... 

const FILES = [
  '/la-cave/',
  '/la-cave/index.html',
  '/la-cave/manifest.json'
];

// INSTALL — met en cache les fichiers essentiels
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting(); // prend le contrôle immédiatement
});

// ACTIVATE — supprime TOUS les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE)
          .map(k => {
            console.log('[SW] Suppression ancien cache :', k);
            return caches.delete(k);
          })
      )
    ).then(() => {
      console.log('[SW] Cache actif :', CACHE);
      return self.clients.claim(); // contrôle immédiat de tous les onglets
    })
  );
});

// FETCH — cache en priorité, réseau en fallback
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// MESSAGE — répond au SKIP_WAITING envoyé par index.html
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING reçu — activation forcée');
    self.skipWaiting();
  }
});

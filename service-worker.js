// RIFIM ERP Service Worker v4 - cache buster
const CACHE = 'rifim-v4-' + Date.now();

// Install - skip waiting langsung aktif
self.addEventListener('install', e => {
  self.skipWaiting();
});

// Activate - hapus semua cache lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch - network first, no cache (untuk development)
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  // Selalu ambil dari network (bypass cache)
  e.respondWith(
    fetch(e.request).catch(() => {
      return new Response('Offline', {status: 503});
    })
  );
});

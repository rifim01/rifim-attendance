// RIFIM ERP Service Worker v5 - force no cache
const VER = 'rifim-v5';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network only - no caching
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request.url + (e.request.url.includes('?') ? '&' : '?') + '_sw=' + VER)
      .catch(() => fetch(e.request))
      .catch(() => new Response('', {status: 204}))
  );
});

// RIFIM ERP Service Worker v6 - 2026-06-04
// Force clear ALL old caches
const VER = 'rifim-20260604-v6';

self.addEventListener('install', () => {
  self.skipWaiting();
  console.log('[SW] Install v6');
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      console.log('[SW] Clearing caches:', keys);
      return Promise.all(keys.map(k => caches.delete(k)));
    }).then(() => {
      console.log('[SW] All caches cleared');
      return self.clients.claim();
    })
  );
});

// Network only - no caching untuk dev
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  // Skip chrome-extension
  if(!e.request.url.startsWith('http')) return;
  // Network first, no cache
  e.respondWith(
    fetch(e.request).catch(() => new Response('', {status: 204}))
  );
});

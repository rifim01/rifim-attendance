// Lightweight Service Worker
const CACHE_NAME='rifim-lite-v1';

self.addEventListener('install',event=>{
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch',event=>{
  event.respondWith(
    fetch(event.request).catch(()=>caches.match(event.request))
  );
});

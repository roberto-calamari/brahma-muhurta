const CACHE = 'brahma-muhurta-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first for API calls, cache-first for app shell
  const url = new URL(e.request.url);
  if (url.hostname.includes('nominatim') || url.hostname.includes('sunrise-sunset')) {
    // Always try network for live data, fallback to cache
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first for app shell
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});

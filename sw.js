const CACHE = 'lelab-prompter-v1';
const ASSETS = [
  '/lelab-prompter/lelab-prompter.html',
  '/lelab-prompter/manifest.json',
  '/lelab-prompter/icon-192.png',
  '/lelab-prompter/icon-512.png',
];

// Install — cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first, then network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cache Google Fonts and other static assets
        if (e.request.url.includes('fonts.googleapis') ||
            e.request.url.includes('fonts.gstatic') ||
            e.request.url.includes('cdnjs.cloudflare')) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});

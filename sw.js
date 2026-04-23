const CACHE_NAME = 'quran-v6';

// لا نخزن أي شيء عند التثبيت لمنع المشاكل
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// استراتيجية Network First - الأفضل للـ PWA
self.addEventListener('fetch', event => {
  // للملفات الصوتية: شبكة فقط
  if (event.request.url.includes('.mp3')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // للملفات الأخرى: شبكة أولاً، ثم كاش
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

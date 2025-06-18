const CACHE_NAME = 'shaflo-cache-v3'; // Increment version for updates (mood logger added)
const ASSETS_TO_CACHE = [
  './', 
  './index.html',
  './index.tsx',
  './App.tsx',
  './components/Header.tsx',
  './components/CycleForm.tsx',
  './components/CycleInsights.tsx',
  './components/CalendarGrid.tsx',
  './components/LoadingSpinner.tsx',
  './components/WellnessAssistant.tsx',
  './components/MoodLogger.tsx', // New component
  './services/localStorageService.ts',
  './services/dateUtils.ts',
  './services/cycleCalculationService.ts',
  './services/geminiService.ts',
  './services/cyclePhaseService.ts',
  './hooks/useCycleTracker.ts',
  './constants.ts',
  './types.ts',
  './components/icons/CalendarIcon.tsx',
  './components/icons/ChatBubbleIcon.tsx',
  './components/icons/ChevronLeftIcon.tsx',
  './components/icons/ChevronRightIcon.tsx',
  './components/icons/PlusCircleIcon.tsx',
  './components/icons/TrashIcon.tsx',
  './components/icons/HeartIcon.tsx', // New icon
  './icons/app-icon-192.png',
  './icons/app-icon-512.png',
  './icons/favicon.png',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('ShaFlo Service Worker: Caching core assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('ShaFlo Service Worker: Failed to cache assets during install:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('ShaFlo Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const cacheResponse = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, cacheResponse));
          }
          return response;
        })
        .catch(() => {
          console.log('ShaFlo Service Worker: Network failed for navigation, serving from cache:', request.url);
          return caches.match(request); // Fallback to cache for index.html essentially
        })
    );
    return;
  }

  if (requestUrl.origin === self.location.origin ||
      ASSETS_TO_CACHE.includes(requestUrl.pathname.substring(1)) ||
      requestUrl.origin === 'https://esm.sh' ||
      requestUrl.origin === 'https://cdn.tailwindcss.com' ||
      requestUrl.origin === 'https://fonts.googleapis.com' ||
      requestUrl.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            return networkResponse;
          }).catch(error => {
            console.error('ShaFlo Service Worker: Fetch failed, no cache hit:', request.url, error);
          });
        })
    );
  } else {
    event.respondWith(fetch(request));
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification',
      icon: '/icons/app-icon-192.png',
      badge: '/icons/app-icon-192.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      requireInteraction: true,
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'ShaFlo', options)
    );
  } catch (error) {
    console.error('Error handling push notification:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
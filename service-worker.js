const CACHE_NAME = 'gohigher-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/주식포트폴리오.html',
  '/main.js',
  '/styles.css',
  '/logo.jpg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/배당주.html',
  '/큐레이션.html',
  '/about.html',
  '/버크셔해서웨이.html',
  '/중소형주식.html',
  '/privacy-policy.html',
  '/icons/shortcut-portfolio.png',
  '/icons/shortcut-diary.png'
];

// 1. 설치 단계
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn('★ 캐시 저장 중 오류:', err))
  );
  self.skipWaiting();
});

// 2. 활성화 단계: 이전 캐시 정리
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

// 3. fetch 요청 가로채기
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() =>
          caches.match('/offline.html')
            .then(response => {
              return response || new Response('<h1>오프라인입니다.</h1>', {
                headers: { 'Content-Type': 'text/html' }
              });
            })
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then(networkResponse => {
            if (
              event.request.method === 'GET' &&
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type !== 'opaque'
            ) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return networkResponse;
          });
      })
      .catch(() =>
        caches.match('/offline.html')
          .then(response => {
            return response || new Response('<h1>오프라인입니다.</h1>', {
              headers: { 'Content-Type': 'text/html' }
            });
          })
      )
  );
});

// 4. Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-gohigher-data') {
    event.waitUntil(syncData());
  }
});
async function syncData() {
  try {
    const response = await fetch('/sync-endpoint', { method: 'POST' });
    console.log('✅ Background sync 성공:', response.status);
  } catch (error) {
    console.error('❌ Background sync 실패:', error);
  }
}

// 5. Periodic Background Sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'periodic-gohigher-news') {
    event.waitUntil(fetchLatestData());
  }
});
async function fetchLatestData() {
  try {
    const response = await fetch('/sync-endpoint', { method: 'GET' });
    console.log('✅ Periodic Sync 성공:', response.status);
  } catch (error) {
    console.error('❌ Periodic Sync 실패:', error);
  }
}

// 6. Firebase Cloud Messaging
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCgFLtAo8LETpHq44hxlT7QigCbIltk-Zk",
  authDomain: "gohigher-55e51.firebaseapp.com",
  projectId: "gohigher-55e51",
  storageBucket: "gohigher-55e51.firebasestorage.app",
  messagingSenderId: "487435343721",
  appId: "1:487435343721:web:dc5708c3a263214fba4ff8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log("📥 백그라운드 메시지 수신:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon-192x192.png"
  });
});

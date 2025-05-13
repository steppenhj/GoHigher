// service-worker.js

// 0) Firebase 푸시 통합 (importScripts는 최상단에)
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
  const { title, body, image } = payload.notification || {};
  self.registration.showNotification(title, {
    body,
    icon: image || "/icon-192x192.png"
  });
});

// 1) 캐시 이름 분리
const STATIC_CACHE  = 'gohigher-static-v4';
const PAGES_CACHE   = 'gohigher-pages-v4';
const IMAGES_CACHE  = 'gohigher-images-v4';
const OFFLINE_PAGE  = '/offline.html';

// 2) install → static 리소스 precache + skipWaiting
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll([
        '/', '/index.html', OFFLINE_PAGE, '/manifest.json',
        // ... (기존 urlsToCache 모두 나열)
      ]))
  );
});

// 3) activate → 구버전 캐시 정리 + clients.claim
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => ![STATIC_CACHE, PAGES_CACHE, IMAGES_CACHE].includes(key))
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

// 4) fetch → 내비게이션은 Network-first + 오프라인 페이지
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // HTML 내비게이션 요청
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkRes = await fetch(event.request);
        const cache = await caches.open(PAGES_CACHE);
        cache.put(event.request, networkRes.clone());
        return networkRes;
      } catch (err) {
        return (await caches.match(event.request)) 
            || (await caches.match(OFFLINE_PAGE));
      }
    })());
    return;
  }

  // js/css/png/jpg 등 정적 자산
  if (/\.(?:js|css|png|jpe?g|svg|gif)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(async networkRes => {
          if (networkRes.ok) {
            const cache = await caches.open(IMAGES_CACHE);
            cache.put(event.request, networkRes.clone());
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // 나머지 요청은 기본 fetch
  event.respondWith(fetch(event.request).catch(() =>
    caches.match(OFFLINE_PAGE)
  ));
});

// 5) Background Sync 처리
self.addEventListener('sync', event => {
  if (event.tag === 'sync-gohigher-data') {
    event.waitUntil(syncData());
  }
});
async function syncData() {
  try {
    const resp = await fetch('/sync-endpoint', { method: 'POST' });
    console.log('✅ Background sync 성공:', resp.status);
  } catch (err) {
    console.error('❌ Background sync 실패:', err);
  }
}

// 6) Periodic Sync 처리 (뉴스 JSON 갱신 예시)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'periodic-gohigher-news') {
    event.waitUntil(fetchAndCacheNews());
  }
});
async function fetchAndCacheNews() {
  try {
    const resp = await fetch('/news.json');
    if (!resp.ok) throw new Error(resp.status);
    const cache = await caches.open(PAGES_CACHE);
    await cache.put('/news.json', resp.clone());
    console.log('📄 뉴스 캐시 갱신 완료');
  } catch (err) {
    console.warn('⚠️ 뉴스 캐시 갱신 실패:', err);
  }
}

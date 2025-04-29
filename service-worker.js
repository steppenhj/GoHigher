const CACHE_NAME = 'gohigher-v4';  // 버전 하나 올렸어
const urlsToCache = [
  '/',
  '/index.html',
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
  '/offline.html',                  // ✅ 추가: offline.html
  '/icons/shortcut-portfolio.png',
  '/icons/shortcut-diary.png'
];

// 1) 설치 단계: 핵심 리소스 미리 캐시
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn('★ 캐시 저장 중 오류', err))
  );
  self.skipWaiting();
});

// 2) 활성화 단계: 구버전 캐시 정리 후 즉시 활성화
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

// 3) fetch 단계: 네비게이션과 기타 리소스 분기 처리
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // 페이지 이동 요청
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedPage => {
              if (cachedPage) {
                return cachedPage;  // ✅ 캐시된 페이지 반환
              }
              return caches.match('/offline.html');  // ✅ offline.html 보여주기
            });
        })
    );
    return;
  }

  // CSS, JS, 이미지 등 기타 파일 요청
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return networkResponse;
          });
      })
      .catch(() => {
        // 네트워크, 캐시 모두 실패
        return Response.error();
      })
  );
});

// 4) Background Sync 이벤트 등록
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-gohigher-data') {
    event.waitUntil(syncData());
  }
});

// 실제로 서버나 IndexedDB랑 동기화하는 함수
async function syncData() {
  try {
    console.log('🔄 Background sync triggered!');
    const response = await fetch('/sync-endpoint', { method: 'POST' });
    console.log('✅ Sync completed:', response.status);
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// 5) Periodic Background Sync 이벤트 등록
self.addEventListener('periodicsync', event => {
  if (event.tag === 'periodic-gohigher-news') {
    event.waitUntil(fetchLatestData());
  }
});

// 주기적 데이터 동기화 함수
async function fetchLatestData() {
  try {
    console.log('🔄 Periodic background sync triggered!');
    const response = await fetch('/sync-endpoint', { method: 'GET' });
    console.log('✅ Periodic Sync completed:', response.status);
  } catch (error) {
    console.error('❌ Periodic Sync failed:', error);
  }
}

// 🔥 FCM 메시지 수신 (firebase-messaging-sw.js 내용 통합)
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCgFLtAo8LETpHq44hxlT7QigCbIltk-Zk",
  authDomain: "gohigher-55e51.firebaseapp.com",
  projectId: "gohigher-55e51",
  storageBucket: "gohigher-55e51.firebaseapp.com",
  messagingSenderId: "487435343721",
  appId: "1:487435343721:web:dc5708c3a263214fba4ff8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📥 백그라운드 메시지 수신:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon-192x192.png"
  });
});

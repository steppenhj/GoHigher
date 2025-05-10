// Firebase 푸시 통합 (importScripts는 최상단에)
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

// Firebase 초기화
firebase.initializeApp({
  apiKey: "AIzaSyCgFLtAo8LETpHq44hxlT7QigCbIltk-Zk",
  authDomain: "gohigher-55e51.firebaseapp.com",
  projectId: "gohigher-55e51",
  storageBucket: "gohigher-55e51.firebasestorage.app",
  messagingSenderId: "487435343721",
  appId: "1:487435343721:web:dc5708c3a263214fba4ff8"
});

const messaging = firebase.messaging();
// 백그라운드 메시지 핸들링
messaging.onBackgroundMessage(payload => {
  console.log("📥 백그라운드 메시지 수신:", payload);
  const { title, body, image } = payload.notification || {};
  self.registration.showNotification(
    title,
    {
      body,
      icon: image || "/icon-192x192.png"
    }
  );
});

// 캐싱 관련 설정
const CACHE_NAME = 'gohigher-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/주식포트폴리오.html',
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
  '/icons/shortcut-diary.png',
  '/목표자산시뮬레이터.html'
];

// 설치 단계: 핵심 리소스 캐싱 (cache.add → fetch+put 패턴)
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const url of urlsToCache) {
      try {
        // 1) 요청 생성: 내부 리소스는 cors, 외부 리소스는 no-cors 필요 시 변경
        const request = new Request(url, { mode: 'cors' });
        // 2) 네트워크 요청
        const response = await fetch(request);
        // 3) HTTP 상태 검사
        if (!response.ok) {
          console.warn(`⚠️ ${url} 캐싱 실패: HTTP ${response.status}`);
          continue;
        }
        // 4) 캐시에 저장
        await cache.put(request, response.clone());
      } catch (err) {
        console.warn(`⚠️ ${url} 캐싱 중 오류:`, err);
      }
    }
  })());
  self.skipWaiting();
});


// 활성화 단계: 이전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

// 네트워크 우선 + 캐시 폴백
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline.html')
          .then(res => res || new Response('<h1>오프라인입니다.</h1>', { headers: { 'Content-Type': 'text/html' } }))
        )
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request).then(networkRes => {
          if (
            event.request.method === 'GET' &&
            networkRes &&
            networkRes.status === 200 &&
            networkRes.type !== 'opaque'
          ) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkRes;
        }))
        .catch(() => caches.match('/offline.html')
          .then(res => res || new Response('<h1>오프라인입니다.</h1>', { headers: { 'Content-Type': 'text/html' } }))
        )
    );
  }
});

// 백그라운드 싱크
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

// 주기적 싱크
self.addEventListener('periodicsync', event => {
  if (event.tag === 'periodic-gohigher-news') {
    event.waitUntil(fetchLatestData());
  }
});
async function fetchLatestData() {
  try {
    const resp = await fetch('/sync-endpoint', { method: 'GET' });
    console.log('✅ Periodic Sync 성공:', resp.status);
  } catch (err) {
    console.error('❌ Periodic Sync 실패:', err);
  }
}

// service-worker.js

const CACHE_NAME = "gohigher-v2";
const urlsToCache = [
  "/", 
  "/index.html", 
  "/manifest.json", 
  "/주식포트폴리오.html",
  "/main.js", 
  "/styles.css", 
  "/logo.jpg",
  "/icon-192x192.png", 
  "/icon-512x512.png",
  "/배당주.html",
  "/큐레이션.html",
  "/about.html",
  "/버크셔해서웨이.html",
  "/중소형주식.html",
  "/privacy-policy.html",
  "/icons/shortcut-portfolio.png",
  "/icons/shortcut-diary.png",
];

// 설치 이벤트: 캐시에 주요 파일 저장
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn("캐시 저장 실패:", err))
  );
  self.skipWaiting();
});

// 활성화 이벤트: 오래된 캐시 정리 + 새 서비스워커 활성화
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

// fetch 이벤트: 캐시 우선, 네트워크 실패 시 오프라인 대체 페이지 제공
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type !== "opaque") {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
            }
            return networkResponse;
          });
      })
      .catch(() => {
        // 오프라인일 때 에러 대신 대체 응답 제공
        return new Response('<h1>오프라인 상태입니다</h1><p>인터넷 연결을 확인해주세요.</p>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      })
  );
});

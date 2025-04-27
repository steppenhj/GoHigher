// service-worker.js

const CACHE_NAME = "gohigher-v1";
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
  "/screenshots/screenshot1.png",
  "/screenshots/screenshot2.png",
  "/screenshots/screenshot3.png",
  "/screenshots/screenshot4.png"
];

// 설치: 캐시에 주요 파일 미리 저장
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn("addAll 캐시 중 일부 실패:", err))
  );
  self.skipWaiting();
});

// 활성화: 이전 캐시 삭제 + 바로 컨트롤
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    );
    await self.clients.claim();

    const allClients = await self.clients.matchAll({ includeUncontrolled: true });
    allClients.forEach(client => {
      client.postMessage({ type: "NEW_VERSION_AVAILABLE" });
    });
  })());
});

// fetch: **캐시 우선**, 없으면 네트워크, 최악에는 "/"로 fallback
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 바로 반환
        if (response) {
          return response;
        }
        // 캐시에 없으면 네트워크로 요청
        return fetch(event.request)
          .then(networkResponse => {
            // 성공한 경우 캐시에 저장
            if (networkResponse && networkResponse.status === 200 && networkResponse.type !== "opaque") {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // 네트워크도 실패하면 메인 페이지로 fallback
            return caches.match("/");
          });
      })
  );
});

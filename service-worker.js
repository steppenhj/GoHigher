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
  // 외부 리소스는 addAll이 실패할 수 있어 캐시에 직접 추가 X
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn("addAll 캐시 중 일부 실패:", err))
  );
  // 새 SW가 바로 활성화되도록
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    // 1) 이전 버전의 캐시 삭제
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );

    // 2) 활성화된 SW로 모든 클라이언트를 즉시 제어
    await self.clients.claim();

    // 3) 열린 모든 클라이언트에 업데이트 알림
    const allClients = await self.clients.matchAll({ includeUncontrolled: true });
    allClients.forEach(client => {
      client.postMessage({ type: "NEW_VERSION_AVAILABLE" });
    });
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  // Firebase 등 민감한 요청은 캐싱하지 않음
  if (url.origin.includes("firebase")) return;

  event.respondWith(
    Promise.race([
      fetch(event.request)
        .then(response => {
          // 성공적인 GET 응답만 캐시에 저장
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 응답
          return caches.match(event.request);
        }),

      // 2초 안에 fetch가 안 되면 무조건 캐시 fallback
      new Promise((_, reject) => setTimeout(reject, 2000))
    ]).catch(() => {
      return caches.match(event.request);
    })
  );
});

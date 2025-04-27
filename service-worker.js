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

// 설치 이벤트: 캐시에 주요 파일 미리 저장
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn("addAll 캐시 중 일부 실패:", err))
  );
  self.skipWaiting(); // 설치되자마자 활성화
});

// 활성화 이벤트: 오래된 캐시 삭제 및 클라이언트 제어
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();

    const allClients = await self.clients.matchAll({ includeUncontrolled: true });
    allClients.forEach(client => {
      client.postMessage({ type: "NEW_VERSION_AVAILABLE" });
    });
  })());
});

// fetch 이벤트: 네트워크 우선, 실패 시 캐시 fallback, 그리고 최종적으로는 "/" fallback
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin.includes("firebase")) return;

  event.respondWith(
    Promise.race([
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        }),
      new Promise((_, reject) => setTimeout(reject, 2000))
    ]).catch(() => {
      // 여기 추가됨: 실패하면 "/"를 fallback으로 반환
      return caches.match(event.request)
        .then(response => response || caches.match("/"));
    })
  );
});

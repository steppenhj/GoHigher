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
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0",
  "https://fonts.googleapis.com/css?family=Roboto:400,500,700|Open+Sans:400,600&display=swap"
];

// 설치 이벤트 - 초기 캐싱
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // 즉시 활성화
});

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim(); // 바로 제어권 획득
});

// fetch 이벤트 - 네트워크 우선 + 2초 내 응답 없으면 캐시 fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    Promise.race([
      fetch(event.request)
        .then((response) => {
          // 응답이 성공적이면 캐시에 저장
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        }),
      new Promise((_, reject) => setTimeout(reject, 2000)) // 2초 타임아웃
    ]).catch(() => {
      // 실패 시 캐시 fallback
      return caches.match(event.request);
    })
  );
});

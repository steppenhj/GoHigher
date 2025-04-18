// service-worker.js

const CACHE_NAME = "gohigher-v1";  // 캐시 버전은 변경하지 않고 유지
const urlsToCache = [
  "/", "/index.html", "/manifest.json", "/주식포트폴리오.html",
  "/main.js", "/styles.css", "/logo.jpg",
  "/icon-192x192.png", "/icon-512x512.png",
  // 외부 리소스는 install 단계에서 addAll에 포함하지 않도록 주석 처리
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => {
        console.warn("addAll 중 일부 자원 캐시 실패:", err);
      })
  );
  // 즉시 활성화 대기열로 넘어가도록
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  // 활성화되자마자 모든 클라이언트 제어권을 가져옴
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;

  // GET이 아니면 워커 패스
  if (req.method !== "GET") return;

  // 1) 내비게이션 요청(페이지 로드)만 네트워크 우선 전략
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req, { cache: "no-cache" })    // HTTP 캐시 무시
        .then(networkRes => {
          // 성공 시 캐시에 최신 HTML 저장 (옵션)
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return networkRes;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시된 HTML 사용
          return caches.match(req);
        })
    );
    return;
  }

  // 2) 그 외 리소스는 기존 Promise.race 네트워크 우선+타임아웃 전략 유지
  event.respondWith(
    Promise.race([
      fetch(req)
        .then(response => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }
          // 정상 응답이면 캐시에 저장
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시된 버전 사용
          return caches.match(req);
        }),
      // 2초 타임아웃
      new Promise((_, reject) => setTimeout(reject, 2000))
    ]).catch(() => {
      // timeout 또는 실패 시 캐시된 버전
      return caches.match(req);
    })
  );
});

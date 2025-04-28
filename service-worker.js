// service-worker.js

const CACHE_NAME = 'gohigher-v3';
const urlsToCache = [
  '/',                    // start_url
  '/index.html',
  '/manifest.json',
  '/주식포트폴리오.html',  // 반드시 실제 요청 경로와 일치
  '/큐레이션.html',
  '/main.js',
  '/styles.css',
  '/logo.jpg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/배당주.html',
  '/about.html',
  '/버크셔해서웨이.html',
  '/중소형주식.html',
  '/privacy-policy.html',
  '/icons/shortcut-portfolio.png',
  '/icons/shortcut-diary.png'
];

// 1) install: 핵심 리소스 미리 캐시
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn('캐시 저장 중 오류:', err))
  );
  self.skipWaiting();
});

// 2) activate: 이전 캐시 정리 후 활성화
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

// 3) fetch: 네비게이션 vs 기타 리소스 분기 처리
self.addEventListener('fetch', event => {
  // A) 페이지 내비게이션 요청
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // 온라인 상태: 네트워크로 페이지 요청
        return await fetch(event.request);
      } catch (err) {
        // 오프라인: 요청 경로대로 캐시 검색
        const url = new URL(event.request.url);
        const path = url.pathname;  // e.g. '/주식포트폴리오.html'
        
        // 1) 원본 경로 매칭
        let cached = await caches.match(path);
        // 2) 인코딩 차이 대응
        if (!cached) {
          const decoded = decodeURIComponent(path);
          if (decoded !== path) {
            cached = await caches.match(decoded);
          }
        }
        // 3) 캐시된 페이지 있으면 반환
        if (cached) {
          return cached;
        }
        // 4) 없으면 홈(`/`)으로 폴백
        const home = await caches.match('/');
        if (home) {
          return home;
        }
        // 5) 최후의 수단: 간단한 HTML 응답
        return new Response(
          '<h1>오프라인</h1><p>페이지를 불러올 수 없습니다.</p>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
    })());
    return;
  }

  // B) 기타 리소스 요청 (CSS, JS, 이미지 등)
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          return cached;
        }
        return fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
      .catch(() => {
        return Response.error();
      })
  );
});

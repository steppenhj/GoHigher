// service-worker.js

const CACHE_NAME = 'gohigher-v2';
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
  '/icons/shortcut-portfolio.png',
  '/icons/shortcut-diary.png'
];

// 1. 설치 단계: 주요 리소스 캐시에 미리 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn('캐시 저장 중 오류:', err))
  );
  self.skipWaiting();
});

// 2. 활성화 단계: 이전 버전 캐시 삭제 후 즉시 컨트롤 인수
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

// 3. fetch 단계
self.addEventListener('fetch', event => {
  // (A) 페이지 네비게이션 요청 처리: 오프라인 시 홈 화면으로 대체
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 온라인 요청 성공: 그대로 반환
          return response;
        })
        .catch(() => {
          // 네트워크 실패: 캐시된 홈('/') 반환
          return caches.match('/')
            .then(cachedHome => {
              if (cachedHome) return cachedHome;
              // 캐시에 '/'가 없으면 간단한 메시지
              return new Response(
                '<h1>오프라인 상태입니다</h1><p>홈 화면을 볼 수 없습니다.</p>',
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
              );
            });
        })
    );
    return;
  }

  // (B) 기타 리소스 요청 처리: 캐시 우선 → 네트워크 → 실패 시 에러
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then(networkResponse => {
            // 성공적인 네트워크 응답은 캐시에 저장
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type !== 'opaque'
            ) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return networkResponse;
          });
      })
      .catch(() => {
        // 캐시·네트워크 모두 실패 시: 에러 반환
        return Response.error();
      })
  );
});

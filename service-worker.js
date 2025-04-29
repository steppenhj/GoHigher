// service-worker.js

const CACHE_NAME = 'gohigher-v2';
// ⚠️ 이 배열에 들어 있는 URL은 “실제 브라우저가 요청하는 경로”와 1:1 매칭되어야 합니다!
const urlsToCache = [
  '/',                    // start_url
  '/index.html',          // 직접 호출할 때
  '/manifest.json',
  '/주식포트폴리오.html',  // 실제 파일명과 동일해야 캐시 매칭이 됩니다.
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
      keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

// 3) fetch 단계: 네비게이션과 기타 리소스 분기 처리
self.addEventListener('fetch', event => {
  // A) 페이지 네비게이션 요청 (mode === 'navigate')
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // 온라인이면 그대로 페이지 반환
          return networkResponse;
        })
        .catch(() => {
          // 오프라인이면 같은 URL의 캐시를 먼저 찾고,
          // 캐시가 없으면 홈('/')으로 폴백
          return caches.match(event.request)
            .then(cachedPage => {
              if (cachedPage) {
                return cachedPage;
              }
              return caches.match('/')
                .then(cachedHome => {
                  return cachedHome || new Response(
                    '<h1>오프라인</h1><p>홈 화면을 볼 수 없습니다.</p>',
                    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                  );
                });
            });
        })
    );
    return; // 여기서 분기 끝
  }

  // B) 기타 리소스 요청 (CSS, JS, 이미지 등)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then(networkResponse => {
            // 정상 응답은 캐시에 저장
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
        // 캐시·네트워크 모두 실패 시
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

// 실제로 서버나 IndexedDB랑 동기화하는 함수 (여기선 예시)
async function syncData() {
  try {
    console.log('🔄 Background sync triggered!');
    // 여기에 필요한 동기화 로직 작성 (예: 서버로 저장 요청 등)
    // 간단하게 fetch() 예시
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

// 주기적으로 데이터 동기화하는 함수
async function fetchLatestData() {
  try {
    console.log('🔄 Periodic background sync triggered!');
    // 예시: 최신 뉴스 가져오기
    const response = await fetch('/sync-endpoint', { method: 'GET' });
    console.log('✅ Periodic Sync completed:', response.status);
  } catch (error) {
    console.error('❌ Periodic Sync failed:', error);
  }
}

const CACHE_NAME = 'gohigher-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
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
  '/offline.html', // 오프라인 전용 페이지 추가
  '/icons/shortcut-portfolio.png',
  '/icons/shortcut-diary.png'
];

// 설치 단계
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn('캐시 저장 중 오류', err))
  );
  self.skipWaiting();
});

// 활성화 단계
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// fetch 핸들링
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // 페이지 네비게이션 요청
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 네트워크 정상응답이면 그냥 반환
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시된 해당 요청 있으면 반환
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // 없으면 offline.html 제공
              return caches.match('/offline.html');
            });
        })
    );
  } else {
    // 기타 요청 (정적 자원들)
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(networkResponse => {
              if (
                networkResponse &&
                networkResponse.status === 200 &&
                networkResponse.type === 'basic'
              ) {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, clone));
              }
              return networkResponse;
            });
        })
        .catch(() => {
          // 리소스 요청 실패 시 그냥 Response.error()
          return Response.error();
        })
    );
  }
});

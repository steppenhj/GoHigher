// Firebase FCM 백그라운드 푸시 수신용 서비스워커
// TWA, PWA 모두에서 알림 수신을 위해 반드시 필요

// 1. Firebase SDK 로딩 (compat 버전으로)
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

// 2. Firebase 초기화 (firebaseConfig는 동일하게 유지)
firebase.initializeApp({
  apiKey: "AIzaSyCgFLtAo8LETpHq44hxlT7QigCbIltk-Zk",
  authDomain: "gohigher-55e51.firebaseapp.com",
  projectId: "gohigher-55e51",
  storageBucket: "gohigher-55e51.appspot.com",
  messagingSenderId: "487435343721",
  appId: "1:487435343721:web:dc5708c3a263214fba4ff8"
});

// 3. 메시징 객체 생성
const messaging = firebase.messaging();

// 4. 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
  console.log("📥 [firebase-messaging-sw.js] 백그라운드 메시지 수신:", payload);

  const notification = payload.notification || {};
  const notificationTitle = notification.title || "새로운 알림";
  const notificationOptions = {
    body: notification.body || "내용 없음",
    icon: notification.icon || "/icon-192x192.png", // fallback 아이콘
    badge: "/icon-192x192.png",                     // Android에서 배지
    image: notification.image,                      // 푸시 이미지 (선택)
    data: payload.data || {}                        // 클릭 시 전달할 데이터
  };

  // 5. 알림 표시
  self.registration.showNotification(notificationTitle, notificationOptions);
});

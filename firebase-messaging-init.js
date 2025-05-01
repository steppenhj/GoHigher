import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyCgFLtAo8LETpHq44hxlT7QigCbIltk-Zk",
  authDomain: "gohigher-55e51.firebaseapp.com",
  projectId: "gohigher-55e51",
  storageBucket: "gohigher-55e51.firebasestorage.app",
  messagingSenderId: "487435343721",
  appId: "1:487435343721:web:dc5708c3a263214fba4ff8",
  measurementId: "G-KQ02L8DXG0"
};

// 앱 초기화
const app = initializeApp(firebaseConfig);

// 🟩 Analytics 초기화
const analytics = getAnalytics(app);
logEvent(analytics, 'page_view', { page_path: location.pathname });  // 사용자 추적

// FCM 설정
const messaging = getMessaging(app);

// 알림 권한 요청 + 토큰 관리
function requestPermissionAndGetToken() {
  if (Notification.permission === "default") { 
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("✅ 알림 권한 허용됨");
        retrieveToken();
      } else {
        console.warn("🚫 알림 권한 거부됨");
      }
    });
  } else if (Notification.permission === "granted") {
    retrieveToken();
  } else {
    console.warn("🚫 알림 권한 거부 상태");
  }
}

// 토큰 가져오기
function retrieveToken() {
  getToken(messaging, {
    vapidKey: "BMIz4RuAfnawKTvKZxexSrcjyZDz5SykvfDJJcYIKi7omKUtOzNoSfMQIb29kwjiNaIiQEJpdnOSR4oa3sYVOzM"
  }).then((token) => {
    if (token) {
      console.log("📬 FCM 토큰:", token);
    } else {
      console.warn("❗ 토큰이 생성되지 않았습니다.");
    }
  }).catch(err => {
    console.error("❌ 토큰 요청 실패", err);
  });
}

// 포그라운드 수신 처리
onMessage(messaging, (payload) => {
  console.log("📨 포그라운드 메시지 수신:", payload);
  if (payload.notification) {
    alert(`${payload.notification.title}\n${payload.notification.body}`);
  }
});

// 실행
requestPermissionAndGetToken();

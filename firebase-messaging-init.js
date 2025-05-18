import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyCgFLtAo8LETpHq44hxlT7QigCbIltk-Zk",
  authDomain: "gohigher-55e51.firebaseapp.com",
  projectId: "gohigher-55e51",
  storageBucket: "gohigher-55e51.appspot.com",
  messagingSenderId: "487435343721",
  appId: "1:487435343721:web:dc5708c3a263214fba4ff8",
  measurementId: "G-KQ02L8DXG0"
};

// 앱 초기화 (중복 방지)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 🟩 Analytics 초기화
const analytics = getAnalytics(app);
logEvent(analytics, 'page_view', { page_path: location.pathname });  // 사용자 추적

// FCM 설정
const messaging = getMessaging(app);

// FCM 초기화: 알림 권한 요청 + 토큰 발급 + 서비스워커 등록
async function initFCM() {
  try {
    // 1. 서비스워커 등록 (firebase-messaging-sw.js)
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("✅ firebase-messaging-sw.js 등록됨:", registration.scope);

    // 2. 알림 권한 요청
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("🚫 알림 권한이 거부되었거나 중단됨");
        return;
      }
    }

    // 3. 토큰 발급 (서비스워커 명시)
    if (Notification.permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BMIz4RuAfnawKTvKZxexSrcjyZDz5SykvfDJJcYIKi7omKUtOzNoSfMQIb29kwjiNaIiQEJpdnOSR4oa3sYVOzM",
        serviceWorkerRegistration: registration
      });
      if (token) {
        console.log("📬 FCM 토큰:", token);
      } else {
        console.warn("❗ 토큰이 생성되지 않았습니다.");
      }
    } else {
      console.warn("🚫 알림 권한 거부 상태");
    }

  } catch (err) {
    console.error("❌ FCM 초기화 실패", err);
  }
}

// 포그라운드 메시지 수신 처리
onMessage(messaging, (payload) => {
  console.log("📨 포그라운드 메시지 수신:", payload);
  if (payload.notification) {
    alert(`${payload.notification.title}\n${payload.notification.body}`);
  }
});

// 실행
initFCM();

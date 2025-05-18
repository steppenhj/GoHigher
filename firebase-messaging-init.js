import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";

// [공통] Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCgFLtAo8LETpHq44hxlT7QigCbIltk-Zk",
  authDomain: "gohigher-55e51.firebaseapp.com",
  projectId: "gohigher-55e51",
  storageBucket: "gohigher-55e51.appspot.com",
  messagingSenderId: "487435343721",
  appId: "1:487435343721:web:dc5708c3a263214fba4ff8",
  measurementId: "G-KQ02L8DXG0"
};

// [중복방지] 이미 초기화된 경우 getApp, 아니면 initializeApp
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// --- Firestore ---
const db = getFirestore(app);

async function fetchETF(symbol) {
  const docRef = doc(db, "indices", symbol);
  const docSnap = await getDoc(docRef);
  const out = document.getElementById(symbol);
  if (out) {
    if (docSnap.exists()) {
      const data = docSnap.data();
      out.innerHTML = `${data.name}(${data.symbol}): <strong>${data.close ? data.close + ' USD' : 'N/A'}</strong> <span style="color:#666; font-size:0.92em">(${data.date || '-'})</span>`;
    } else {
      out.innerHTML = "데이터 없음";
    }
  }
}

// ETF 심볼 순회
["SPY", "QQQ", "DIA"].forEach(fetchETF);

// --- Analytics ---
try {
  const analytics = getAnalytics(app);
  logEvent(analytics, 'page_view', { page_path: location.pathname });
} catch(e) {
  // analytics를 지원하지 않는 환경 무시
}

// --- FCM(푸시 알림) ---
const messaging = getMessaging(app);

async function initFCM() {
  try {
    // 1. 서비스워커 등록
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

    // 3. 토큰 발급
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

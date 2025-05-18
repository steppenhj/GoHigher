import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCgFLtAo8LETpHq44hxlT7QigCbIltk-Zk",
  authDomain: "gohigher-55e51.firebaseapp.com",
  projectId: "gohigher-55e51",
  storageBucket: "gohigher-55e51.appspot.com",
  messagingSenderId: "487435343721",
  appId: "1:487435343721:web:dc5708c3a263214fba4ff8",
  measurementId: "G-KQ02L8DXG0"
};

// 중복 방지
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore
const db = getFirestore(app);

async function fetchETF(symbol) {
  const docRef = doc(db, "indices", symbol);
  try {
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
  } catch (err) {
    console.error(`[${symbol}] Firestore fetch 에러`, err);
    const out = document.getElementById(symbol);
    if (out) out.innerHTML = "데이터 로딩 실패";
  }
}

// ETF 심볼 순회
["SPY", "QQQ", "DIA"].forEach(fetchETF);

// Analytics
try {
  const analytics = getAnalytics(app);
  logEvent(analytics, 'page_view', { page_path: location.pathname });
} catch (e) {}

// FCM
const messaging = getMessaging(app);

async function initFCM() {
  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("✅ firebase-messaging-sw.js 등록됨:", registration.scope);

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("🚫 알림 권한이 거부됨");
        return;
      }
    }

    if (Notification.permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BMIz4RuAfnawKTvKZxexSrcjyZDz5SykvfDJJcYIKi7omKUtOzNoSfMQIb29kwjiNaIiQEJpdnOSR4oa3sYVOzM",
        serviceWorkerRegistration: registration
      });
      if (token) {
        console.log("📬 FCM 토큰:", token);
      } else {
        console.warn("❗ 토큰 생성 실패");
      }
    }
  } catch (err) {
    console.error("❌ FCM 초기화 실패", err);
  }
}

onMessage(messaging, (payload) => {
  console.log("📨 포그라운드 메시지 수신:", payload);
  if (payload.notification) {
    alert(`${payload.notification.title}\n${payload.notification.body}`);
  }
});

initFCM();

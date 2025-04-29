// firebase-messaging-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgFLtAo8LETpHq44hxlT7QigCbIltk-Zk",
  authDomain: "gohigher-55e51.firebaseapp.com",
  projectId: "gohigher-55e51",
  storageBucket: "gohigher-55e51.firebasestorage.app",
  messagingSenderId: "487435343721",
  appId: "1:487435343721:web:dc5708c3a263214fba4ff8",
  measurementId: "G-KQ02L8DXG0"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 권한 요청 및 토큰 출력
Notification.requestPermission().then(permission => {
  if (permission === "granted") {
    console.log("✅ 알림 권한 허용됨");

    getToken(messaging, {
      vapidKey: "BMIz4RuAfnawKTvKZxexSrcjyZDz5SykvfDJJcYIKi7omKUtOzNoSfMQIb29kwjiNaIiQEJpdnOSR4oa3sYVOzM"
    }).then((token) => {
      console.log("📬 FCM 토큰:", token);
      // TODO: 서버 저장 가능
    }).catch(err => {
      console.error("❌ 토큰 요청 실패", err);
    });

    onMessage(messaging, (payload) => {
      console.log("📨 포그라운드 메시지:", payload);
      alert(`${payload.notification.title}\n${payload.notification.body}`);
    });

  } else {
    console.warn("🚫 알림 권한 거부됨");
  }
});

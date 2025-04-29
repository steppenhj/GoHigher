// firebase-messaging-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js";

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

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
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
    retrieveToken(); // 이미 권한이 있을 때는 바로 토큰 가져옴
  } else {
    console.warn("🚫 알림 권한 거부 상태");
  }
}

// FCM 토큰 가져오기
function retrieveToken() {
  getToken(messaging, {
    vapidKey: "BMIz4RuAfnawKTvKZxexSrcjyZDz5SykvfDJJcYIKi7omKUtOzNoSfMQIb29kwjiNaIiQEJpdnOSR4oa3sYVOzM"
  }).then((token) => {
    if (token) {
      console.log("📬 FCM 토큰:", token);
      // TODO: 서버 저장 필요시 이곳에 추가
    } else {
      console.warn("❗ 토큰이 생성되지 않았습니다. 알림 권한을 다시 요청하세요.");
    }
  }).catch(err => {
    console.error("❌ 토큰 요청 실패", err);
  });
}

// 포그라운드 메시지 수신 처리
onMessage(messaging, (payload) => {
  console.log("📨 포그라운드 메시지 수신:", payload);
  if (payload.notification) {
    alert(`${payload.notification.title}\n${payload.notification.body}`);
  }
});

// 실행
requestPermissionAndGetToken();

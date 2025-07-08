document.addEventListener('DOMContentLoaded', function() {
  // --- Firebase 객체만 사용 (중복 초기화 금지) ---
  // index.html에서 이미 initializeApp() 됨
  // const firebaseConfig ... (모두 제거!)
  // firebase.initializeApp(...) (제거!)
  const db = firebase.firestore();

  // --- FAQ
  const faq = [
    { q: "운영 시간",           a: "GoHigher는 연중무휴 24시간 온라인으로 이용하실 수 있습니다." },
    { q: "회원가입 방법",       a: "우측 상단의 [회원가입] 버튼을 눌러 정보를 입력하시면 바로 가입할 수 있습니다." },
    { q: "비밀번호를 잊었어요", a: "로그인 화면에서 [비밀번호 찾기]를 클릭해 이메일 인증 후 재설정하세요." },
    { q: "이용 요금",           a: "기본 서비스는 무료입니다. 프리미엄 상품은 서비스별 안내를 참고하세요." },
    { q: "데이터는 안전한가요", a: "고객님의 데이터는 암호화되어 안전하게 보관됩니다." }
  ];

  // --- DOM
  const chatbotFab      = document.getElementById('chatbot-toggle-btn');
  const chatbotPopup    = document.getElementById('chatbot-popup');
  const chatbotCloseBtn = document.getElementById('close-btn');
  const messages        = document.getElementById('messages');
  const userInput       = document.getElementById('user-input');
  const sendBtn         = document.getElementById('send-btn');

  // --- sessionId (유저 식별)
  function getSessionId() {
    let id = localStorage.getItem('gohigher_chat_session');
    if (!id) {
      id = 'guser_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
      localStorage.setItem('gohigher_chat_session', id);
    }
    return id;
  }
  const sessionId = getSessionId();

  // --- 채팅 메시지 Firestore 저장
  async function sendUserMsgToFirestore(text) {
    await db.collection('user_chat').add({
      sessionId,
      sender: 'user',
      message: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'new'
    });
  }

  // --- 내 모든 채팅 불러오기
  async function loadMyChats() {
    messages.innerHTML = '';
    // (최초 안내문은 항상 출력)
    addBotMsg("안녕하세요! 궁금하신 점을 남겨주시면 관리자가 순차적으로 답변 드립니다. (문의 전 FAQ 확인 가능)");

    // Firestore에서 내 메시지와 bot 답변 모두 불러오기
    const snap = await db.collection('user_chat')
      .where('sessionId', '==', sessionId)
      .orderBy('createdAt')
      .get();
    snap.forEach(doc => {
      const m = doc.data();
      addMsg(m.sender === 'user' ? 'user' : 'bot', m.message);
    });
  }

  // --- 답변 전 최대 3개 제한: 답변 오기 전 내가 보낸 메시지 개수
  async function canSendUserMsg() {
    // 관리자 답변이 있는지 체크
    const snap = await db.collection('user_chat')
      .where('sessionId', '==', sessionId)
      .orderBy('createdAt')
      .get();
    let userMsgCount = 0;
    let adminAnswered = false;
    snap.forEach(doc => {
      const m = doc.data();
      if (m.sender === 'bot') adminAnswered = true;
      if (!adminAnswered && m.sender === 'user') userMsgCount++;
    });
    return adminAnswered || userMsgCount < 3;
  }

  // --- 챗봇 열기
  chatbotFab.addEventListener('click', function() {
    chatbotPopup.style.display = 'block';
    loadMyChats();
    setTimeout(() => { if (userInput) userInput.focus(); }, 100);
  });
  // --- 챗봇 닫기
  chatbotCloseBtn.addEventListener('click', function() {
    chatbotPopup.style.display = 'none';
  });
  // --- 바깥 클릭시 닫기
  window.addEventListener('mousedown', function(e) {
    if (chatbotPopup.style.display === 'block') {
      if (!chatbotPopup.contains(e.target) && !chatbotFab.contains(e.target)) {
        chatbotPopup.style.display = 'none';
      }
    }
  });

  // --- 메시지 전송
  sendBtn.addEventListener('click', () => handleUserInput());
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserInput();
  });

  // --- 메시지 처리
  async function handleUserInput() {
    const text = userInput.value.trim();
    if (!text) return;

    // 제한: 답변 이전 유저 메시지 3개까지
    if (!(await canSendUserMsg())) {
      addBotMsg("관리자가 답변하기 전에는 3개까지 문의하실 수 있습니다. 답변을 기다려주세요!");
      userInput.value = '';
      return;
    }

    addUserMsg(text);
    userInput.value = '';
    await sendUserMsgToFirestore(text);

    // FAQ 자동응답 (실제 관리자 답변은 Firestore에서 확인 후 수동 입력)
    setTimeout(() => {
      const reply = findAnswer(text);
      if (reply) addBotMsg(reply);
    }, 400);
  }

  // --- FAQ 자동응답 (없으면 null 반환)
  function findAnswer(input) {
    input = input.toLowerCase();
    for (let pair of faq) {
      if (input.includes(pair.q.replace(/\s/g,"").toLowerCase()) ||
          pair.q.split(' ').some(word => input.includes(word.toLowerCase()))
      ) return pair.a;
    }
    return null;
  }

  // --- 메시지 UI
  function addUserMsg(text) { addMsg('user', text); }
  function addBotMsg(text)   { addMsg('bot', text); }
  function addMsg(sender, text) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = `<div class="message-content">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
});

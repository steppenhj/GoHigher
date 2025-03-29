        // 챗봇 열기/닫기 로직
        const chatbotToggleBtn = document.getElementById("chatbot-toggle");
        const chatbotContainer = document.getElementById("chatbot-container");
        const chatbotCloseBtn = document.getElementById("chatbot-close");
        const chatbotOverlay = document.getElementById("chatbot-overlay");
  
        chatbotToggleBtn.addEventListener("click", () => {
          chatbotContainer.classList.add("visible");
          chatbotToggleBtn.style.display = "none";
          document.body.classList.add("no-scroll");
          chatbotOverlay.style.display = "block";
        });
        function closeChatbot() {
          chatbotContainer.classList.remove("visible");
          chatbotToggleBtn.style.display = "block";
          document.body.classList.remove("no-scroll");
          chatbotOverlay.style.display = "none";
        }
        chatbotCloseBtn.addEventListener("click", closeChatbot);
        chatbotOverlay.addEventListener("click", closeChatbot);
  
        // ==================================
        // 챗봇 질문/답변 로직
        // ==================================
  
    // (1) 사전 정의 질문 (동일)
    const guidingQuestions = [
      "Go Higher의 뉴스 페이지는 얼마나 자주 업데이트되나요?",
      "다이어리 기능에서는 무엇을 기록할 수 있나요?",
      "대가들의 포트폴리오 정보는 어디서 볼 수 있나요?",
      "중소형주식 분석은 어떤 내용을 다루나요?",
      "다이어리 메뉴를 어떻게 활용하면 좋을까요?",
      "배당주 분석 페이지에는 어떤 정보가 있나요?",
      "Go Higher에 회원가입하면 어떤 이점이 있나요?"
    ];
  
    // (2) 질문→답변 매핑 (동일)
    const predefinedQA = {
      "Go Higher의 뉴스 페이지는 얼마나 자주 업데이트되나요?": "매일 아침 주요 뉴스를 업데이트합니다. 미국 증시 동향, 환율, 코인 뉴스도 수시로 반영하니 자주 방문해 보세요!",
      "다이어리 기능에서는 무엇을 기록할 수 있나요?": "투자 목표, 일정, 체크리스트, 가계부 등을 기록할 수 있어 체계적인 자산 관리에 도움이 됩니다.",
      "대가들의 포트폴리오 정보는 어디서 볼 수 있나요?": "상단 메뉴의 ‘인기포트폴리오/대가들’ 페이지에서 워렌 버핏, 조지 소로스, 손정의 등 유명 투자자들의 포트폴리오 분석을 확인할 수 있습니다.",
      "중소형주식 분석은 어떤 내용을 다루나요?": "유망한 중소형주 종목, 해당 기업의 재무 상황, 성장 가능성 등을 정리해 놓았습니다. 큰 수익을 얻기 위해서는 이러한 중소형 주식을 포트폴리오에 추가하는 것이 큰 도움이 됩니다. 저희가 제공하는 많은 데이터를 보고 공부하며 큰 수익을 얻어보세요!",
      "다이어리 메뉴를 어떻게 활용하면 좋을까요?": "자신의 보유 종목·매매 계획·목표 수익률 등을 기록하고, 포트폴리오 기능을 활용해서 자신의 포트폴리오 상태를 점검하세요. 자신의 상태를 잘 아는 것이 부자가 되는 지름길입니다!",
      "배당주 분석 페이지에는 어떤 정보가 있나요?": "배당주 추천 종목, 각 기업의 배당 이력, 전망 등 배당주 투자에 필요한 정보를 제공합니다. 또한! 배당금 계산기를 통해서 미래에 자신이 받을 수 있는 배당금을 계산해서 먼 미래까지 계획을 할 수 있는 기능이 있습니다!",
      "Go Higher에 회원가입하면 어떤 이점이 있나요?": "포트폴리오 저장, 가계부·체크리스트 등 개인화 기능을 이용할 수 있고, 알림 설정도 가능합니다. 다양한 기능들이 업데이트 될 예정입니다. 많은 관심 부탁드립니다!"
    };
  
    // (3) 채팅창에 메시지 추가
    function appendChatMessage(message, sender, extraClass = "") {
      const messagesDiv = document.getElementById("chatbot-messages");
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("chat-message", sender);
      if (extraClass) {
        messageDiv.classList.add(extraClass);
      }
      messageDiv.textContent = message;
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      return messageDiv;
    }
  
    // (4) "생각 중..." 문구를 만들어주는 함수 (모두 동일한 문구)
    function thinkingText(remainingSeconds) {
      return `AI가 생각 중입니다. 잠시만 기다려주세요. (${remainingSeconds}초 남음)`;
    }
  
    // (5) 메시지 전송 함수
    function sendChatMessage() {
      const userInput = document.getElementById("chatbot-user-input");
      const message = userInput.value.trim();
      if (!message) return;
  
      // 사용자가 입력한 메시지 표시
      appendChatMessage(message, "user");
      userInput.value = "";
  
      // 생각 중 메시지(이탤릭체)
      const thinkingDiv = appendChatMessage("", "bot", "thinking-message");
  
      // 3초 카운트다운
      let countdown = 3;
      thinkingDiv.innerHTML = `<em>${thinkingText(countdown)}</em>`;
  
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          thinkingDiv.innerHTML = `<em>${thinkingText(countdown)}</em>`;
        } else {
          clearInterval(countdownInterval);
        }
      }, 1000);
  
      //3~5초 생각하는 척
      const randomDelay = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
  setTimeout(() => {
    thinkingDiv.remove();
    const answer = predefinedQA[message];
    if (answer) {
      appendChatMessage(answer, "bot");
    } else {
      appendChatMessage("시스템을 준비 중입니다. 빠른 시일 내로 찾아뵙겠습니다.", "bot");
    }
  }, randomDelay);
    }
  
    // (6) 유도 질문 초기화 (동일)
    function updateGuidingQuestions() {
      const container = document.getElementById("predefined-questions");
      container.innerHTML = "";
      const firstSet = guidingQuestions.slice(0, 4);
      firstSet.forEach(q => {
        const btn = document.createElement("button");
        btn.className = "question-btn";
        btn.textContent = q;
        btn.addEventListener("click", () => {
          document.getElementById("chatbot-user-input").value = q;
          sendChatMessage();
        });
        container.appendChild(btn);
      });
  
      // '더보기' 버튼
      const moreBtn = document.createElement("button");
      moreBtn.className = "question-btn";
      moreBtn.textContent = "더보기";
      moreBtn.addEventListener("click", () => {
        const secondSet = guidingQuestions.slice(4);
        secondSet.forEach(q => {
          const btn = document.createElement("button");
          btn.className = "question-btn";
          btn.textContent = q;
          btn.addEventListener("click", () => {
            document.getElementById("chatbot-user-input").value = q;
            sendChatMessage();
          });
          container.appendChild(btn);
        });
        container.removeChild(moreBtn);
      });
      container.appendChild(moreBtn);
    }
    document.addEventListener("DOMContentLoaded", updateGuidingQuestions);
  
    // (7) 전송 버튼/엔터키 이벤트
    document.getElementById("chatbot-send-btn").addEventListener("click", () => {
      sendChatMessage();
    });
    document.getElementById("chatbot-user-input").addEventListener("keypress", function(e) {
      if (e.key === "Enter") {
        sendChatMessage();
      }
    });

    // 여기서부터 아래는 챗봇이 5초 뒤에 다시 말하도록 
    let isProcessing = false;

function sendChatMessage() {
  if (isProcessing) return; // 이미 진행 중이면 무시
  isProcessing = true;
  
  const userInput = document.getElementById("chatbot-user-input");
  const message = userInput.value.trim();
  if (!message) {
    isProcessing = false;
    return;
  }
  
  appendChatMessage(message, "user");
  userInput.value = "";
  
  const thinkingDiv = appendChatMessage("", "bot", "thinking-message");
  let countdown = 3;
  thinkingDiv.innerHTML = `<em>${thinkingText(countdown)}</em>`;
  
  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      thinkingDiv.innerHTML = `<em>${thinkingText(countdown)}</em>`;
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);
  
  const randomDelay = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
  setTimeout(() => {
    thinkingDiv.remove();
    const answer = predefinedQA[message];
    if (answer) {
      appendChatMessage(answer, "bot");
    } else {
      appendChatMessage("시스템을 준비 중입니다. 빠른 시일 내로 찾아뵙겠습니다.", "bot");
    }
    // 5초 후에 다시 클릭 가능하도록 설정 (또는 여기서 바로 해제)
    setTimeout(() => {
      isProcessing = false;
    }, 5000);
  }, randomDelay);
}

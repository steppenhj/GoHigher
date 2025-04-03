document.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // 챗봇 열기/닫기 관련 기능
  // -------------------------
  const chatbotToggleBtn = document.getElementById("chatbot-toggle");
  const chatbotContainer = document.getElementById("chatbot-container");
  const chatbotCloseBtn = document.getElementById("chatbot-close");
  const chatbotOverlay = document.getElementById("chatbot-overlay");
  const messagesDiv = document.getElementById("chatbot-messages");
  const userInput = document.getElementById("chatbot-user-input");
  const sendBtn = document.getElementById("chatbot-send-btn");

  function openChatbot() {
    chatbotContainer.classList.add("visible");
    chatbotToggleBtn.style.display = "none";
    document.body.classList.add("no-scroll");
    chatbotOverlay.style.display = "block";
  }

  function closeChatbot() {
    chatbotContainer.classList.remove("visible");
    chatbotToggleBtn.style.display = "block";
    document.body.classList.remove("no-scroll");
    chatbotOverlay.style.display = "none";
  }

  chatbotToggleBtn.addEventListener("click", openChatbot);
  chatbotCloseBtn.addEventListener("click", closeChatbot);
  chatbotOverlay.addEventListener("click", closeChatbot);

  // -------------------------
  // 질문 + 답변 통합 객체 배열
  // -------------------------
  const qaList = [
    {
      question: "Go Higher의 뉴스 페이지는 얼마나 자주 업데이트되나요?",
      answer: "매일 아침 주요 뉴스를 업데이트합니다. 미국 증시 동향, 환율, 코인 뉴스도 수시로 반영하니 자주 방문해 보세요!"
    },
    {
      question: "다이어리 기능에서는 무엇을 기록할 수 있나요?",
      answer: "투자 목표, 일정, 체크리스트, 가계부 등을 기록할 수 있어 체계적인 자산 관리에 도움이 됩니다. 회원가입을 통해 모바일과 PC 등 다양한 기기에서 다이어리 도구로 사용할 수 있습니다!"
    },
    {
      question: "대가들의 포트폴리오 정보는 어디서 볼 수 있나요?",
      answer: "상단 메뉴의 ‘인기포트폴리오/대가들’ 페이지에서 워렌 버핏, 조지 소로스, 손정의 등 유명 투자자들의 포트폴리오 분석을 확인할 수 있습니다."
    },
    {
      question: "중소형주식 분석은 어떤 내용을 다루나요?",
      answer: "유망한 중소형주 종목, 해당 기업의 재무 상황, 성장 가능성 등을 정리해 놓았습니다. 큰 수익을 얻기 위해서는 이러한 중소형 주식을 포트폴리오에 추가하는 것이 큰 도움이 됩니다. 저희가 제공하는 많은 데이터를 보고 공부하며 큰 수익을 얻어보세요!"
    },
    {
      question: "다이어리 메뉴를 어떻게 활용하면 좋을까요?",
      answer: "자신의 보유 종목·매매 계획·목표 수익률 등을 기록하고, 포트폴리오 기능을 활용해서 자신의 포트폴리오 상태를 점검하세요. 자신의 상태를 잘 아는 것이 부자가 되는 지름길입니다!"
    },
    {
      question: "배당주 분석 페이지에는 어떤 정보가 있나요?",
      answer: "배당주 추천 종목, 각 기업의 배당 이력, 전망 등 배당주 투자에 필요한 정보를 제공합니다. 또한! 배당금 계산기를 통해서 미래에 자신이 받을 수 있는 배당금을 계산해서 먼 미래까지 계획을 할 수 있는 기능이 있습니다!"
    },
    {
      question: "Go Higher에 회원가입하면 어떤 이점이 있나요?",
      answer: "포트폴리오 저장, 가계부·체크리스트 등 개인화 기능을 이용할 수 있고, 알림 설정도 가능합니다. 다양한 기능들이 업데이트 될 예정입니다. 많은 관심 부탁드립니다!"
    },
    {
      question: "Go Higher는 무료인가요?",
      answer: "네! 현재 모든 기능은 무료로 제공되고 있으며, 앞으로도 핵심 기능은 무료로 유지될 예정입니다. 프리미엄 기능은 추후 다양한 시스템과 함께 도입됩니다!"
    },
    {
      question: "자산 포트폴리오와 주식 포트폴리오는 무엇이 다른가요?",
      answer: "자산 포트폴리오는 현금, 예금, 주식 등 전체 자산 비중을 보여주고, 주식 포트폴리오는 투자 종목에 집중합니다. 큰 그림과 디테일을 함께 볼 수 있도록 구성했습니다!"
    },
    {
      question: "내 데이터를 다른 기기에서도 볼 수 있나요?",
      answer: "네! 회원가입 후 로그인하면 PC, 모바일 등 어디서든 동일한 데이터를 불러올 수 있어요. 기록은 안전하게 클라우드에 저장됩니다!"
    },
    {
      question: "Go Higher는 어떤 사람들이 사용하면 좋을까요?",
      answer: "투자를 처음 시작하는 사람부터, 나만의 투자철학을 기록하고 싶은 사람까지 모두에게 도움이 돼요. 기록하고 돌아보는 습관은 반드시 당신을 성장시켜줄 거예요."
    }
            
  ];

  // -------------------------
  // 메시지 추가 함수
  // -------------------------
  function appendChatMessage(message, sender, extraClass = "") {
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

  // -------------------------
  // '생각 중' 메시지 관련 함수
  // -------------------------
  function thinkingText(remainingSeconds) {
    return `고하가 생각 중입니다. 잠시만 기다려주세요. (${remainingSeconds}초 남음)`;
  }

  function startThinking(initialSeconds, callback) {
    const thinkingDiv = appendChatMessage("", "bot", "thinking-message");
    let countdown = initialSeconds;
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
      callback();
    }, randomDelay);
  }

  // -------------------------
  // 메시지 전송 함수 (중복 방지)
  // -------------------------
  let isProcessing = false;

  function sendChatMessage() {
    if (isProcessing) return;
    isProcessing = true;

    const message = userInput.value.trim();
    if (!message) {
      isProcessing = false;
      return;
    }

    appendChatMessage(message, "user");
    userInput.value = "";

    startThinking(3, () => {
      const matchedQA = qaList.find(item => item.question === message);
      if (matchedQA) {
        appendChatMessage(matchedQA.answer, "bot");
      } else {
        appendChatMessage("현재 답변을 하는 시스템은 준비 중입니다. 빠른 시일 내로 찾아뵙겠습니다!", "bot");
      }
      setTimeout(() => {
        isProcessing = false;
      }, 5000);
    });
  }

  sendBtn.addEventListener("click", sendChatMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatMessage();
    }
  });

  // -------------------------
  // 유도 질문 랜덤 + 새로고침 방식
  // -------------------------
  function updateGuidingQuestions() {
    const container = document.getElementById("predefined-questions");
    container.innerHTML = "";

    const shuffled = [...qaList].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);

    selected.forEach(item => {
      const btn = document.createElement("button");
      btn.className = "question-btn";
      btn.textContent = item.question;
      btn.addEventListener("click", () => {
        userInput.value = item.question;
        sendChatMessage();
      });
      container.appendChild(btn);
    });

    const refreshBtn = document.createElement("button");
    refreshBtn.className = "question-btn";
    refreshBtn.textContent = "새 질문 보기";
    refreshBtn.addEventListener("click", updateGuidingQuestions);
    container.appendChild(refreshBtn);
  }

  updateGuidingQuestions();
});

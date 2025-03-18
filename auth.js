document.addEventListener("DOMContentLoaded", function () {
  // 1. 회원가입 축하 메시지 표시 (있다면)
  const signupMessage = localStorage.getItem("signupMessage");
  if (signupMessage) {
    const signupDiv = document.createElement("div");
    signupDiv.textContent = signupMessage;
    signupDiv.style.fontSize = "1rem";
    signupDiv.style.margin = "10px 0";
    signupDiv.style.color = "#28a745"; // 초록색 계열
    signupDiv.style.textAlign = "center";
    signupDiv.style.position = "relative";
    signupDiv.style.zIndex = "1000";
    // 페이지 상단에 메시지 추가 (헤더 바로 아래 등 적절한 위치로 조정 가능)
    document.body.insertAdjacentElement("afterbegin", signupDiv);
    // 한 번 표시된 후 메시지 삭제
    localStorage.removeItem("signupMessage");
  }

  // 2. 로그인/로그아웃 처리
  const authButton = document.getElementById("authButton");
  if (!authButton) return; // authButton이 없으면 실행하지 않음

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userEmail = localStorage.getItem("userEmail");

  if (isLoggedIn === "true") {
    // 로그인 상태인 경우: 로그아웃 버튼 및 환영 메시지 표시
    authButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> 로그아웃';
    authButton.href = "#";

    authButton.addEventListener("click", function (event) {
      event.preventDefault();
      if (confirm("정말 로그아웃 하시겠습니까?")) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userPhoto");
        window.location.reload();
      }
    });

    // 사용자 환영 메시지 표시
    if (userEmail) {
      const welcomeDiv = document.createElement("div");
      welcomeDiv.textContent = userEmail + "님 환영합니다.";
      welcomeDiv.style.fontSize = "0.85rem";
      welcomeDiv.style.marginTop = "4px";
      authButton.insertAdjacentElement("afterend", welcomeDiv);
    }
  } else {
    // 로그인하지 않은 상태: 로그인 버튼 설정
    authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> 로그인';
    authButton.href = "login.html";
  }
});
document.addEventListener("DOMContentLoaded", function () {
  // 1. 회원가입 축하 메시지 표시 (있다면)
  const signupMessage = localStorage.getItem("signupMessage");
  if (signupMessage) {
    console.log("회원가입 축하 메시지를 표시합니다:", signupMessage);
    const signupDiv = document.createElement("div");
    signupDiv.textContent = signupMessage;
    signupDiv.style.fontSize = "1rem";
    signupDiv.style.margin = "10px 0";
    signupDiv.style.color = "#28a745";
    signupDiv.style.textAlign = "center";
    signupDiv.style.position = "relative";
    signupDiv.style.zIndex = "1000";
    document.body.insertAdjacentElement("afterbegin", signupDiv);
    localStorage.removeItem("signupMessage");
  }

  // 2. 로그인/로그아웃 처리
  const authButton = document.getElementById("authButton");
  if (!authButton) return;

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userEmail = localStorage.getItem("userEmail");

  if (isLoggedIn === "true") {
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

    if (userEmail) {
      const welcomeDiv = document.createElement("div");
      welcomeDiv.textContent = userEmail + "님 환영합니다.";
      welcomeDiv.style.fontSize = "0.85rem";
      welcomeDiv.style.marginTop = "4px";
      authButton.insertAdjacentElement("afterend", welcomeDiv);
    }
  } else {
    authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> 로그인';
    authButton.href = "login.html";
  }
});
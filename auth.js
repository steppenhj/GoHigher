document.addEventListener("DOMContentLoaded", function () {
  const authButton = document.getElementById("authButton");
  const welcomeTextElem = document.getElementById("welcomeText");
  const userPhoto = localStorage.getItem("userPhoto");
  const userName = localStorage.getItem("userName");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn === "true") {
    authButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> 로그아웃';
    authButton.href = "#";
    authButton.addEventListener("click", function (event) {
      event.preventDefault();
      if (confirm("정말 로그아웃 하시겠습니까?")) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userPhoto");
        localStorage.removeItem("userName");
        window.location.reload();
      }
    });

    // 실제 사용자의 이름을 환영 메시지에 적용
    if (userName && welcomeTextElem) {
      welcomeTextElem.textContent = userName + "님 환영합니다.";
    }
    if (userPhoto) {
      document.getElementById("profileAvatar").src = userPhoto;
    }
  } else {
    authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> 로그인';
    authButton.href = "login.html";
    if (welcomeTextElem) {
      welcomeTextElem.textContent = "환영합니다, 사용자님!";
    }
  }
});
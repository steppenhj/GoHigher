document.addEventListener("DOMContentLoaded", function () {
    const authButton = document.getElementById("authButton");
  
    if (!authButton) return; // authButton이 없으면 실행하지 않음
  
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userEmail = localStorage.getItem("userEmail");
  
    if (isLoggedIn === "true") {
      authButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> 로그아웃';
      authButton.href = "#";
  
      authButton.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userPhoto");
  
        // 로그아웃 후 모든 페이지에 즉시 반영되도록 새로고침
        window.location.reload();
      });
    } else {
      authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> 로그인';
      authButton.href = "login.html";
    }
  });
  
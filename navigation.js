document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------
  // 1) 사이드바 토글, 네비 active, 공유 버튼
  // ----------------------------------------
  const openSidebarBtn  = document.getElementById('openSidebarBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebar         = document.getElementById('sidebar');
  const sidebarOverlay  = document.getElementById('sidebarOverlay');
  openSidebarBtn.onclick  = () => { sidebar.classList.add('active'); sidebarOverlay.classList.add('active'); };
  closeSidebarBtn.onclick = () => { sidebar.classList.remove('active'); sidebarOverlay.classList.remove('active'); };
  sidebarOverlay.onclick  = closeSidebarBtn.onclick;

  document.querySelectorAll('.nav-link').forEach(link => {
    if (location.pathname === link.getAttribute('href')) {
      link.classList.add('active');
    }
  });

  document.getElementById('shareBtn').onclick = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: 'Go Higher - 미국 주식 투자 플랫폼',
        url: window.location.href
      });
    } else {
      alert('이 브라우저는 공유를 지원하지 않습니다.');
    }
  };

  // ----------------------------------------
  // 2) Firebase 초기화 & 인증 상태 표시
  // ----------------------------------------
  const firebaseConfig = {
    apiKey: "AIzaSyCgFLtAo8LETpHq44hxlT7QigCbIltk-Zk",
    authDomain: "gohigher-55e51.firebaseapp.com",
    projectId: "gohigher-55e51",
    storageBucket: "gohigher-55e51.appspot.com",
    messagingSenderId: "487435343721",
    appId: "1:487435343721:web:dc5708c3a263214fba4ff8",
    measurementId: "G-KQ02L8DXG0"
  };
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  auth.onAuthStateChanged(user => {
    const userInfo    = document.querySelector('.user-info');
    const loginBtn    = document.getElementById('loginBtn');
    const profilePhoto= document.getElementById('profilePhoto');

    if (userInfo) {
      const nameEl     = userInfo.querySelector('.user-name');
      const emailEl    = userInfo.querySelector('.user-email');
      const statusEl   = userInfo.querySelector('.user-status');
      const photoEl    = userInfo.querySelector('.user-photo');
      const logoutLink = document.querySelector('.side-link[href="/login.html"]');

      if (user) {
        nameEl.textContent  = user.displayName || user.email.split('@')[0];
        emailEl.textContent = user.email;
        statusEl.textContent= '로그인됨';
        photoEl.src         = user.photoURL || '/default-profile.png';
        photoEl.style.display = 'block';
        logoutLink.textContent = '로그아웃';
        logoutLink.onclick = e => { e.preventDefault(); auth.signOut().then(()=>location.reload()); };
      } else {
        nameEl.textContent  = '비로그인';
        emailEl.textContent = '';
        statusEl.textContent= '로그인 필요';
        photoEl.style.display = 'none';
        logoutLink.textContent = '로그인';
        logoutLink.onclick = null;
      }
    }

    if (user) {
      loginBtn.style.display     = 'none';
      profilePhoto.src           = user.photoURL || '/default-profile.png';
      profilePhoto.style.display = 'inline-block';
    } else {
      loginBtn.style.display     = 'inline-block';
      profilePhoto.style.display = 'none';
    }
  });

  // ----------------------------------------
  // 3) 모달 관련 엘리먼트 & open/close
  // ----------------------------------------
  const modalOverlay   = document.getElementById('searchModalOverlay');
  const modal          = document.getElementById('searchModal');
  const btnCloseModal  = document.getElementById('closeSearchModal');
  const modalResult    = document.getElementById('modalResult');

  function openModal() {
    modalOverlay.style.display = 'block';
    modal.style.display        = 'flex';
  }
  function closeModal() {
    modalOverlay.style.display = 'none';
    modal.style.display        = 'none';
  }
  btnCloseModal.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

  // ----------------------------------------
  // 4) 검색 버튼 클릭 → 모달 열고 결과만
  // ----------------------------------------
  const navSearchInput = document.getElementById('stockSearchInput');
  const navSearchBtn   = document.getElementById('stockSearchBtn');

  navSearchBtn.addEventListener('click', () => {
    const sym = navSearchInput.value.trim();
    if (!sym) {
      navSearchInput.focus();
      return;
    }
    openModal();
    searchStock(sym, modalResult);
  });

  // ----------------------------------------
  // 5) 모달 전용 searchStock & display
  // ----------------------------------------
  async function searchStock(symbol, container) {
    container.innerHTML = `<div class="loading-state">
      <div class="loading-spinner"></div>
      <div>주식 정보를 검색하는 중...</div>
    </div>`;
    try {
      const res  = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(symbol)}&apikey=demo`
      );
      const data = await res.json();
      const matches = data.bestMatches || [];
      renderResults(matches.slice(0,5), container);
    } catch {
      renderResults([], container);
    }
  }

  function renderResults(results, container) {
    if (!results.length) {
      container.innerHTML = `<div class="no-results">
        <div>잠시 기다려주세요.</div>
      </div>`;
      return;
    }
    container.innerHTML = '';
    results.forEach((stock, idx) => {
      const symbol = stock['1. symbol'];
      const name   = stock['2. name'];
      const item   = document.createElement('div');
      item.className = 'stock-item';
      item.style.animationDelay = `${idx * 0.05}s`;
      item.innerHTML = `
        <div>
          <div class="stock-symbol">${symbol}</div>
          <div class="stock-name">${name}</div>
        </div>
      `;
      item.onclick = () => {
        closeModal();
        // 필요시 상세 페이지로 이동: window.location.href = `/stock.html?symbol=${symbol}`;
      };
      container.appendChild(item);
    });
  }
});

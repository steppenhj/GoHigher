document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------
  // 1) 사이드바 토글, 네비 active, 공유 버튼
  // ----------------------------------------
  const openSidebarBtn  = document.getElementById('openSidebarBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const sidebar         = document.getElementById('sidebar');
  const sidebarOverlay  = document.getElementById('sidebarOverlay');
  openSidebarBtn.onclick  = () => { sidebar.classList.add('active'); sidebarOverlay.classList.add('active'); document.body.style.overflow = 'hidden';  };
  closeSidebarBtn.onclick = () => { sidebar.classList.remove('active'); sidebarOverlay.classList.remove('active');  document.body.style.overflow = '';   };
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
    // ----- 사이드바(user-info) 영역 -----
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
    if (nameEl)     nameEl.textContent  = user.displayName || user.email.split('@')[0];
    if (emailEl)    emailEl.textContent = user.email;
    if (statusEl)   statusEl.textContent= '로그인됨';
    if (photoEl) {
      photoEl.src = user.photoURL || '/logo.jpg';
      photoEl.onerror = function() { this.src = '/logo.jpg'; };
      photoEl.style.display = 'block';
    }
    if (logoutLink) {
      logoutLink.textContent = '로그아웃';
      logoutLink.onclick = e => { e.preventDefault(); auth.signOut().then(()=>location.reload()); };
    }
  } else {
    if (nameEl)     nameEl.textContent  = '비로그인';
    if (emailEl)    emailEl.textContent = '';
    if (statusEl)   statusEl.textContent= '로그인 필요';
    if (photoEl) {
      photoEl.src = '/logo.jpg';
      photoEl.style.display = 'none';
    }
    if (logoutLink) {
      logoutLink.textContent = '로그인';
      logoutLink.onclick = null;
    }
  }
}

    // ----- 상단바(오른쪽) profilePhoto -----
    if (loginBtn && profilePhoto) {
      if (user) {
        profilePhoto.src = user.photoURL || '/logo.jpg';
        profilePhoto.onerror = function() { this.src = '/logo.jpg'; };
        profilePhoto.style.display = 'inline-block';
        loginBtn.style.display = 'none';
      } else {
        profilePhoto.src = '/logo.jpg';
        profilePhoto.style.display = 'none';
        loginBtn.style.display = 'inline-block';
      }
    }
  });
  // ----------------------------------------
  // 3) 검색 모달 (Polygon API 기반만 남김)
  // ----------------------------------------

  // 1) 오버레이 엘리먼트 필요시 생성
  let searchModalOverlay = document.getElementById('searchModalOverlay');
  if (!searchModalOverlay) {
    searchModalOverlay = document.createElement('div');
    searchModalOverlay.id = 'searchModalOverlay';
    searchModalOverlay.style.display = 'none';
    searchModalOverlay.style.position = 'fixed';
    searchModalOverlay.style.top = 0;
    searchModalOverlay.style.left = 0;
    searchModalOverlay.style.width = '100vw';
    searchModalOverlay.style.height = '100vh';
    searchModalOverlay.style.zIndex = 299;
    searchModalOverlay.style.background = 'rgba(32,36,54,0.45)';
    document.body.appendChild(searchModalOverlay);
  }

  // 2) 검색 모달 열고 닫기
  function openSearchModal() {
    document.getElementById('searchModalOverlay').style.display = 'block';
    document.getElementById('searchModal').style.display = 'block';
    document.getElementById('modalResult').innerHTML = '<span style="color:#aaa">로딩 중...</span>';
  }
  function closeSearchModal() {
    document.getElementById('searchModalOverlay').style.display = 'none';
    document.getElementById('searchModal').style.display = 'none';
  }
  document.getElementById('closeSearchModal').onclick = closeSearchModal;
  document.getElementById('searchModalOverlay').onclick = closeSearchModal;
  document.getElementById('stockSearchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('stockSearchBtn').click();
  });

  // 3) 검색 버튼 (Polygon API만)
  document.getElementById('stockSearchBtn').addEventListener('click', function() {
    const ticker = document.getElementById('stockSearchInput').value.trim().toUpperCase();
    if (!ticker) {
      alert('심볼(티커)을 입력하세요!');
      return;
    }
    openSearchModal();
    fetchAllPolygonInfo(ticker);
  });

  // 4) Polygon API 기반 검색 결과 fetch
  const POLYGON_API_BASE = "https://us-central1-gohigher-55e51.cloudfunctions.net/polygonApi";
  async function fetchAllPolygonInfo(ticker) {
    try {
      const today = new Date();
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      const fromStr = from.toISOString().slice(0, 10);
      const toStr = today.toISOString().slice(0, 10);

      const [
        price, prevClose, info, detail, snapshot, dividends, chart, weeklyChart
      ] = await Promise.all([
        fetch(`${POLYGON_API_BASE}/stockPrice?ticker=${ticker}`).then(r=>r.json()),
        fetch(`${POLYGON_API_BASE}/previousClose?ticker=${ticker}`).then(r=>r.json()),
        fetch(`${POLYGON_API_BASE}/stockInfo?ticker=${ticker}`).then(r=>r.json()),
        fetch(`${POLYGON_API_BASE}/stockDetail?ticker=${ticker}`).then(r=>r.json()),
        fetch(`${POLYGON_API_BASE}/snapshot?ticker=${ticker}`).then(r=>r.json()),
        fetch(`${POLYGON_API_BASE}/dividends?ticker=${ticker}`).then(r=>r.json()),
        fetch(`${POLYGON_API_BASE}/dailyChart?ticker=${ticker}&from=${fromStr}&to=${toStr}`).then(r=>r.json()),
        fetch(`${POLYGON_API_BASE}/weeklyChart?ticker=${ticker}&from=${fromStr}&to=${toStr}`).then(r=>r.json()),
      ]);

      const curr = price.price ?? "-";
      const prev = prevClose.previousClose ?? "-";
      const change = (curr !== "-" && prev !== "-") ? (curr - prev).toFixed(2) : "-";
      const rate = (curr !== "-" && prev !== "-") ? (((curr - prev) / prev) * 100).toFixed(2) : "-";
      const chartData = chart.chartData || [];
      const weeklyData = weeklyChart.chartData || [];
      const chartLabels = chartData.map(c => c.date.slice(5));
      const weeklyLabels = weeklyData.map(c => c.date.slice(5));
      const chartCanvasId = "stockChartCanvas";
      const d = detail || {};

      const sectionInfo = `
        <div class="stock-summary-card">
          <div class="stock-section-title" style="font-size:1.18em; margin-bottom:15px;">
            🏢 <b>${d.name || info.name || ticker}</b>
            <span style="color:#90c2ff;font-size:0.98em;margin-left:5px;">(${ticker})</span>
          </div>
          <table>
            <tr><th>현재가</th><td><b style="font-size:1.07em;color:${change>0 ? '#52e3a0' : change<0 ? '#fa5662':'#e9f1ff'}">${curr}</b>
                ${change !== "-" ? `<span style="margin-left:7px;font-size:0.96em;color:${change>0 ? '#52e3a0' : '#fa5662'}">(${change > 0 ? '+' : ''}${change} / ${rate}%)</span>` : ""}</td></tr>
            <tr><th>전일 종가</th><td>${prev}</td></tr>
            <tr><th>시장</th><td>${d.market || info.sector || '-'}</td></tr>
            <tr><th>거래소</th><td>${d.primary_exchange || '-'}</td></tr>
            <tr><th>직원 수</th><td>${d.total_employees || '-'}</td></tr>
            <tr><th>홈페이지</th><td>${d.homepage_url ? `<a href="${d.homepage_url}" target="_blank" style="color:#ffe066;font-weight:600;text-decoration:underline dotted 1.5px;">${d.homepage_url}</a>` : '-'}</td></tr>
            <tr><th>전화번호</th><td>${d.phone_number || '-'}</td></tr>
            <tr><th>주소</th><td>${d.address || '-'}</td></tr>
            <tr><th>SIC 코드</th><td>${d.sic_code || '-'}</td></tr>
            <tr><th>산업분류</th><td>${d.sic_description || '-'}</td></tr>
            <tr><th>설명</th><td style="max-width:330px;white-space:pre-line;">${d.description || info.description || '-'}</td></tr>
          </table>
        </div>
      `;

      const sectionChart = `
        <div class="stock-section-card">
          <div class="stock-section-title" style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:900;font-size:1.11em;">📈 차트</span>
            <div class="chart-toggle-wrap">
              <button class="chart-toggle-btn active" data-type="daily">일봉</button>
              <button class="chart-toggle-btn" data-type="weekly">주봉</button>
            </div>
          </div>
          <div class="stock-chart-wrap">
            <canvas id="${chartCanvasId}" ></canvas>
          </div>
          <div id="chartTableWrap" style="margin-top:10px;"></div>
        </div>
      `;

      const sectionDividends = `
        <div class="stock-section-card">
          <div class="stock-section-title">💰 <span>배당 이력</span></div>
          <div style="overflow-x:auto;">
          <table>
            <tr><th>Ex-Date</th><th>금액</th></tr>
            ${(dividends.dividends && dividends.dividends.length)
              ? dividends.dividends.slice(0,7).map(d=>`<tr><td>${d.date}</td><td>${d.amount}</td></tr>`).join('')
              : `<tr><td colspan=2>배당 데이터 없음</td></tr>`
            }
          </table>
          </div>
        </div>
      `;

      const s = snapshot || {};
      const sectionSnapshot = `
        <div class="stock-section-card">
          <div class="stock-section-title">📈 <span>스냅샷</span></div>
          <table>
            <tr><th>시가</th><td>${s.open || '-'}</td></tr>
            <tr><th>고가</th><td>${s.high || '-'}</td></tr>
            <tr><th>저가</th><td>${s.low || '-'}</td></tr>
            <tr><th>체결량</th><td>${s.volume || '-'}</td></tr>
            <tr><th>52주 고가</th><td>${s.year_high || '-'}</td></tr>
            <tr><th>52주 저가</th><td>${s.year_low || '-'}</td></tr>
            <tr><th>시가총액</th><td>${s.market_cap || '-'}</td></tr>
          </table>
        </div>
      `;

      // 탭 버튼
      const tabHtml = `
        <button class="stock-tab-btn" data-tab="info">기본정보</button>
        <button class="stock-tab-btn" data-tab="chart">차트</button>
        <button class="stock-tab-btn" data-tab="dividends">배당</button>
        <button class="stock-tab-btn" data-tab="snapshot">스냅샷</button>
      `;
      document.getElementById('stockModalTabs').innerHTML = tabHtml;

      // 탭 렌더 함수
      function showTab(tab) {
        if (tab === "info") {
          document.getElementById('modalResult').innerHTML = sectionInfo;
        } else if (tab === "chart") {
          document.getElementById('modalResult').innerHTML = sectionChart;
          setTimeout(() => {
            let currentType = "daily";
            function renderChart(type = "daily") {
              const data = type === "weekly" ? weeklyData : chartData;
              const labels = type === "weekly" ? weeklyLabels : chartLabels;
              if (window.stockChartInstance) window.stockChartInstance.destroy();
              window.stockChartInstance = new Chart(document.getElementById(chartCanvasId).getContext('2d'), {
                type: 'line',
                data: {
                  labels: labels,
                  datasets: [{
                    label: '종가',
                    data: data.map(c=>c.close),
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    tension: 0.42,
                    borderColor: "#2563eb",
                    borderWidth: 2.2,
                    backgroundColor: "rgba(37,99,235,0.11)",
                    pointRadius: 2.8,
                    pointHoverRadius: 5,
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1.4,
                  }]
                },
                options: {
                  layout: {
                    padding: 20
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: {
                        color: "#98bfff",
                        font: { size: 11 }
                      }
                    },
                    y: {
                      grid: { color: "#24334a44" },
                      ticks: {
                        color: "#c7dbff",
                        font: { size: 11 }
                      }
                    }
                  }
                }
              });
              document.getElementById("chartTableWrap").innerHTML = `
                <div style="overflow-x:auto;">
                  <table style="margin-top:8px;"><tr><th>날짜</th><th>종가</th></tr>
                    ${data.slice(-7).map(d=>`<tr><td>${d.date}</td><td>${d.close}</td></tr>`).join('')}
                  </table>
                </div>
              `;
            }
            // 버튼 바인딩
            const btnDaily = document.querySelector('.chart-toggle-btn[data-type="daily"]');
            const btnWeekly = document.querySelector('.chart-toggle-btn[data-type="weekly"]');
            btnDaily.onclick = function() {
              renderChart("daily");
              btnDaily.classList.add('active');
              btnWeekly.classList.remove('active');
            };
            btnWeekly.onclick = function() {
              renderChart("weekly");
              btnWeekly.classList.add('active');
              btnDaily.classList.remove('active');
            };
            renderChart("daily");
          }, 120);
        } else if (tab === "dividends") {
          document.getElementById('modalResult').innerHTML = sectionDividends;
        } else if (tab === "snapshot") {
          document.getElementById('modalResult').innerHTML = sectionSnapshot;
        }
        document.querySelectorAll('.stock-tab-btn').forEach(btn => {
          btn.classList.remove('active');
          if (btn.dataset.tab === tab) btn.classList.add('active');
        });
      }

      document.querySelectorAll('.stock-tab-btn').forEach(btn => {
        btn.onclick = () => showTab(btn.dataset.tab);
      });
      showTab("info");
    } catch (e) {
      document.getElementById('modalResult').innerHTML = `<span style="color:#fa5662;">데이터를 가져오지 못했습니다.<br>${e.message}</span>`;
      document.getElementById('stockModalTabs').innerHTML = "";
    }
  }
});

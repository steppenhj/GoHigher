const express = require('express');
const axios = require('axios');
const session = require('express-session');
const qs = require('qs'); // URL 인코딩을 위한 qs 모듈 추가
const app = express();

const REST_API_KEY = '38ace66b21a1efae075caae0f778eb4c'; // 카카오 REST API 키
const REDIRECT_URI = 'https://gohigher.kr/auth/kakao/callback'; // 등록된 리다이렉트 URI

// 세션 미들웨어를 최상단에 등록
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// 카카오 로그인 후 리다이렉트될 엔드포인트
app.get('/auth/kakao/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('인가 코드가 없습니다.');
  }

  try {
    // 액세스 토큰 요청: qs.stringify를 이용해 폼 데이터 형식으로 변환하여 전송
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      qs.stringify({
        grant_type: 'authorization_code',
        client_id: REST_API_KEY,
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // 액세스 토큰을 사용하여 사용자 정보 요청
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 사용자 정보를 세션에 저장 (예시)
    req.session.user = userResponse.data;

    // 클라이언트에 JSON 응답 대신 리다이렉트 등 원하는 동작을 수행할 수 있음
    res.redirect('/index.html');
  } catch (error) {
    console.error('토큰 요청 에러:', error.response ? error.response.data : error.message);
    res.status(500).send('로그인 처리 중 문제가 발생했습니다.');
  }
});

// 로그인 상태 확인 API
app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// 로그아웃 API
app.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('로그아웃 실패');
    }
    res.redirect('/index.html');
  });
});

// 정적 파일 제공 (예: public 폴더에 index.html, login.html 등이 있다면)
const path = require('path');
app.use(express.static(__dirname));

app.listen(3000, () => {
  console.log('서버가 포트 3000에서 실행 중입니다.');
});

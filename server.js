const express = require('express');
const axios = require('axios');
const session = require('express-session'); // 세션 미들웨어 require
const app = express();

// 세션 미들웨어 설정 (라우트 정의 전에 적용)
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

const REST_API_KEY = '38ace66b21a1efae075caae0f778eb4c'; // 실제 REST API 키
const REDIRECT_URI = 'https://gohigher.kr/auth/kakao/callback';

// 카카오 로그인 후 리다이렉트 엔드포인트
app.get('/auth/kakao/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('인가 코드가 없습니다.');
  }

  try {
    // 액세스 토큰 요청
    const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: REST_API_KEY,
        redirect_uri: REDIRECT_URI,
        code: code,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // 액세스 토큰을 사용하여 사용자 정보 요청
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 예시로 세션에 사용자 정보를 저장
    req.session.user = userResponse.data;

    // 클라이언트에 사용자 정보 JSON 응답 (혹은 리다이렉트)
    res.json(userResponse.data);
    // 또는 res.redirect('/index.html'); 처럼 클라이언트 페이지로 이동시킬 수 있음
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

app.listen(3000, () => {
  console.log('서버가 포트 3000에서 실행 중입니다.');
});

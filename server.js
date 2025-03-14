const express = require('express');
const axios = require('axios');
const app = express();

const REST_API_KEY = '38ace66b21a1efae075caae0f778eb4c'; // 카카오 개발자 콘솔에서 발급받은 REST API 키
const REDIRECT_URI = 'https://gohigher.kr/auth/kakao/callback'; // 카카오 개발자 콘솔에 등록한 리다이렉트 URI

// 카카오 로그인 후 리다이렉트될 엔드포인트
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

    const session = require('express-session');
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));


    // 필요한 경우 사용자 정보를 세션이나 DB에 저장 후 처리
    res.json(userResponse.data);
  } catch (error) {
    console.error('토큰 요청 에러:', error.response ? error.response.data : error.message);
    res.status(500).send('로그인 처리 중 문제가 발생했습니다.');
  }
});

app.listen(3000, () => {
  console.log('서버가 포트 3000에서 실행 중입니다.');
});

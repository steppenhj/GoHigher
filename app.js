const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080; // ✅ Railway 포트 설정 최적화
const LUXIA_API_KEY = process.env.LUXIA_API_KEY;

app.use(express.static(path.join(__dirname)));
app.use(cors({
  origin: "https://gohigher.kr", // ✅ Netlify에서만 요청 허용
  methods: "GET,POST",
  allowedHeaders: "Content-Type"
}));
app.use(express.json());

// ✅ 서버 정상 작동 확인용 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: "✅ 서버 정상 작동 중!" });
});

// ✅ 챗봇 API 엔드포인트
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      'https://bridge.luxiacloud.com/llm/saltlux/hanson/v1/chat',
      {
        model: 'luxia2-32b-instruct',
        messages: [{ role: 'user', content: userMessage }],
        stream: false,
        temperature: 0.7,
        max_token: 2048,
        top_p: 1,
        frequency_penalty: 0.1,
        stop: [],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          apikey: LUXIA_API_KEY,
        },
      }
    );

    console.log("✅ LUXIA 응답:", response.data);
    const botResponse = response.data?.result?.output || "응답을 가져올 수 없습니다.";
    res.json({ message: botResponse });

  } catch (error) {
    console.error('❌ LUXIA API 요청 오류:', error.response?.data || error.message);
    res.status(500).json({ message: '죄송합니다. 오류가 발생했습니다.' });
  }
});

// 기본 페이지 라우팅
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});

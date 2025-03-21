const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5512;

const LUXIA_API_KEY = process.env.LUXIA_API_KEY;

app.use(express.static(path.join(__dirname)));
app.use(cors());
app.use(express.json());

// 챗 API 엔드포인트
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      'https://bridge.luxiacloud.com/llm/saltlux/hanson/v1/chat', // ✅ 올바른 Luxia API 엔드포인트
      {
        model: 'luxia2.5-8b-instruct-preview', // ✅ 모델 변경
        messages: [{ role: 'user', content: userMessage }],
        stream: false, // ✅ 추가 옵션
        temperature: 0.7,
        max_token: 2048,
        top_p: 1,
        frequency_penalty: 0.1,
        stop: [],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          api_key: LUXIA_API_KEY, // ✅ `apikey` → `api_key`로 변경
        },
      }
    );

    console.log("✅ LUXIA 응답:", response.data);
    res.json({ message: response.data.result.output });

  } catch (error) {
    console.error('❌ LUXIA API 요청 오류:', error.response?.data || error.message);
    res.status(500).json({ message: '죄송합니다. 오류가 발생했습니다.' });
  }
});

// index.html 기본 라우팅
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ http://localhost:${PORT} 에서 웹사이트가 실행 중입니다.`);
});

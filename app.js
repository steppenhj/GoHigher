const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5512; // ← 여기만 바꿔주면 됨!

const LUXIA_API_KEY = process.env.LUXIA_API_KEY;

// ✅ 정적 파일 서빙 경로를 __dirname(최상위 폴더)로 지정
app.use(express.static(path.join(__dirname)));

app.use(cors());
app.use(express.json());

// 챗 API 엔드포인트
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      'https://bridge.luxiacloud.com/llm/saltlux/hanson/v1/chat', // ✅ Luxia 공식 API 엔드포인트
      {
        model: 'luxia2-32b-instruct', // ✅ 모델명 수정
        messages: [{ role: 'user', content: userMessage }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          apikey: LUXIA_API_KEY, // ✅ apikey 헤더 사용
        },
      }
    );
    console.log("✅ LUXIA 응답:", response.data); // 응답 구조 확인
    
    // 응답 구조에 맞게 수정 (Luxia의 실제 응답을 확인 필요)
    res.json({ message: response.data.result.output });
  } catch (error) {
    console.error('❌ LUXIA API 요청 오류:', error.response?.data || error.message);
    res.status(500).json({ message: '죄송합니다. 오류가 발생했습니다.' });
  }
});

// ✅ index.html 기본 라우팅
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ http://localhost:${PORT} 에서 웹사이트가 실행 중입니다.`);
});
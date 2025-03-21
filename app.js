const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5502; // ← 여기만 바꿔주면 됨!

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});


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
      'https://platform.luxiacloud.com/api/chat',
      {
        messages: [{ role: 'user', content: userMessage }],
        model: 'chat',
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${LUXIA_API_KEY}`,
        },
      }
    );
    console.log("✅ LUXIA 응답:", response.data); // 이거도 중요
    res.json({ message: response.data.choices[0].message.content });
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

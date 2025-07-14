import os
import sys
import json
import requests
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\GoHigher\gohigher-firebase-adminsdk-fbsvc.json"
sys.stdout.reconfigure(encoding='utf-8')

# 키를 환경변수로만! (코드에 노출 금지)
polygon_api_key = os.environ.get("POLYGON_API_KEY")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 배포시 실제 도메인으로
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_polygon_info(ticker_list):
    results = {}
    for ticker in ticker_list:
        url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/prev?adjusted=true&apiKey={polygon_api_key}"
        r = requests.get(url)
        if r.status_code == 200 and r.json().get('results'):
            close = r.json()['results'][0]['c']
            results[ticker] = close
        else:
            results[ticker] = None
    return results

# Gemini는 프록시만 호출
def ask_gemini_for_portfolio_analysis(portfolio_text, polygon_data=None):
    prompt = (
        "아래는 사용자의 실제 투자 포트폴리오와 각 종목의 최신 가격입니다.\n\n"
        f"포트폴리오: {portfolio_text}\n"
        f"최신 주가 데이터: {json.dumps(polygon_data, ensure_ascii=False)}\n\n"
        "다음 기준에 따라, 리스크(집중도), 성장성, 업종/섹터 편중, ETF 활용, 전략 추천을 꼭 포함해 AI 분석 결과를 한국어로 요약해 주세요.\n"
        "- 데이터 기반으로, 실제 투자자에게 실질적 도움이 되는 현실적 조언을 강조해 주세요.\n"
        "- 현재 시장 상황을 반영하고, 보수적/공격적 투자자 모두 활용할 수 있게 밸런스를 맞춰주세요.\n"
        "- 각 분석 포인트마다 줄바꿈을 해주세요.\n"
    )
    # Functions 프록시 endpoint만 호출 (키 필요X)
    proxy_url = "https://us-central1-gohigher-55e51.cloudfunctions.net/polygonApi/geminiProxy"
    try:
        r = requests.post(proxy_url, json={"prompt": prompt}, timeout=60)
        if r.status_code == 200:
            return r.json().get("result", "AI 분석에 실패했습니다.")
        else:
            print("Gemini 프록시 에러:", r.status_code, r.text)
            return "AI 분석에 실패했습니다."
    except Exception as e:
        print("Gemini 프록시 예외:", e)
        return "AI 분석에 실패했습니다."

@app.post("/ai/portfolio")
async def ai_portfolio(request: Request):
    body = await request.json()
    portfolio_text = body.get("portfolio", "")
    ticker_list = []  # (추후 자동추출 구현 가능)
    polygon_data = get_polygon_info(ticker_list) if ticker_list else {}
    ai_result = ask_gemini_for_portfolio_analysis(portfolio_text, polygon_data)
    return JSONResponse({"result": ai_result})

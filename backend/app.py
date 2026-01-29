from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import re
import nltk
import requests
import json
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKENS = [
    os.getenv("GITHUB_TOKEN"),
    os.getenv("GITHUB_TOKEN2"),
    os.getenv("GITHUB_TOKEN3"),
    os.getenv("GITHUB_TOKEN4")
]
GITHUB_TOKENS = [t for t in GITHUB_TOKENS if t]
SERPER_API_KEY = os.getenv("SERPER_API_KEY")

request_stats = {
    "total_ai_requests": 0,
    "token_usage": {i: 0 for i in range(len(GITHUB_TOKENS))},
    "serper_credits": 2455,
    "ai_limits": {i: 150 for i in range(len(GITHUB_TOKENS))}
}

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def setup_nltk():
    download_dir = "/tmp/nltk_data"
    if not os.path.exists(download_dir): os.makedirs(download_dir)
    nltk.data.path.append(download_dir)
    try:
        nltk.data.find('corpora/stopwords')
    except:
        nltk.download('stopwords', download_dir=download_dir)

setup_nltk()
port_stem = PorterStemmer()
stop_words = set(stopwords.words('english'))

def stemming(content):
    if not content: return ""
    stemmed_content = re.sub('[^a-zA-Z]', ' ', content)
    stemmed_content = stemmed_content.lower().split()
    stemmed_content = [port_stem.stem(word) for word in stemmed_content if not word in stop_words]
    return ' '.join(stemmed_content)

def is_url(text):
    try:
        result = urlparse(text)
        return all([result.scheme, result.netloc])
    except: return False

def scrape_url(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')
        title = (soup.find('h1') or soup.find('title')).get_text().strip()
        text = " ".join([p.get_text().strip() for p in soup.find_all('p') if len(p.get_text().strip()) > 30])
        return title[:200], text[:1000]
    except: return None, None

def google_search(query):
    if not SERPER_API_KEY: return []
    request_stats["serper_credits"] -= 1
    
    url = "https://google.serper.dev/search"
    headers = {'X-API-KEY': SERPER_API_KEY}
    try:
        response = requests.post(url, headers=headers, json={"q": query, "num": 3}, timeout=4)
        return response.json().get('organic', [])
    except: return []

def ai_analyze(news_title, news_text, search_results):
    if not GITHUB_TOKENS: return "ERROR: AI Keys missing in server environment."
    url = "https://models.inference.ai.azure.com/chat/completions"
    
    context = ""
    for res in search_results:
        context += f"- {res.get('link')}: {res.get('snippet')}\n"

    prompt = f"Analyze: {news_title}. Context: {context}. Respond in JSON: {{\"verdict\": \"REAL\"|\"FAKE\", \"confidence\": int, \"explanation\": \"str\", \"sources\": []}}"
    
    for i, token in enumerate(GITHUB_TOKENS):
        try:
            response = requests.post(url, headers={"Authorization": f"Bearer {token}"}, 
                                     json={
                                         "messages": [
                                             {"role": "system", "content": "You are a fast JSON fact-checker. Respond with ONLY valid JSON."},
                                             {"role": "user", "content": prompt}
                                         ],
                                         "model": "gpt-4o",
                                         "temperature": 0.1,
                                         "max_tokens": 200
                                     }, timeout=6)
            
            print(f"\n--- GITHUB HEADERS (Token #{i+1}) ---")
            print(f"X-RateLimit-Limit: {response.headers.get('x-ratelimit-limit', 'N/A')}")
            print(f"X-RateLimit-Remaining: {response.headers.get('x-ratelimit-remaining', 'N/A')}")
            print(f"X-RateLimit-Reset: {response.headers.get('x-ratelimit-reset', 'N/A')}")
            print("----------------------------------\n")

            request_stats["total_ai_requests"] += 1
            request_stats["token_usage"][i] += 1
            request_stats["ai_limits"][i] -= 1

            if response.status_code == 200:
                content = response.json()['choices'][0]['message']['content']
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    res_json = json.loads(match.group())
                    remaining = response.headers.get("x-ratelimit-remaining") or \
                                response.headers.get("ratelimit-remaining") or \
                                "150+"
                    res_json["api_remaining"] = remaining
                    return res_json
                return "ERROR: AI returned an invalid data format."
            
            elif response.status_code in [401, 403, 429]:
                print(f"Token {i+1} failed with status {response.status_code}. Trying next...")
                continue
            else:
                return f"ERROR: AI analysis failed (Status {response.status_code})."

        except requests.exceptions.Timeout:
            if i == len(GITHUB_TOKENS) - 1:
                return "ERROR: AI processing took too long (Timeout)."
            continue
        except Exception as e:
            if i == len(GITHUB_TOKENS) - 1:
                return f"ERROR: AI analysis failed ({str(e)})."
            continue
            
    return "ERROR: All configured AI tokens failed or are rate-limited."

base_dir = os.path.dirname(os.path.abspath(__file__))
try:
    with open(os.path.join(base_dir, "vectorizer.pkl"), "rb") as f: vector = pickle.load(f)
    with open(os.path.join(base_dir, "finalized_model.pkl"), "rb") as f: model = pickle.load(f)
except: vector = model = None

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "healthy", 
        "ai": "READY" if GITHUB_TOKENS else "OFFLINE",
        "tokens_active": len(GITHUB_TOKENS),
        "requests_processed": request_stats["total_ai_requests"]
    }), 200

@app.route("/prediction", methods=["POST"])
def prediction():
    data = request.get_json()
    title = data.get("title", "")
    text = data.get("text", "")
    
    if is_url(title):
        title, text = scrape_url(title)
        if not title: return jsonify({"error": "Scrape failed"}), 400

    style_result = "REAL"
    if vector and model:
        processed = stemming(title + " " + (text or ""))
        vec = vector.transform([processed])
        style_result = "REAL" if model.predict(vec)[0] == 0 else "FAKE"

    search_data = google_search(title)
    fact_check = ai_analyze(title, text, search_data)

    if isinstance(fact_check, dict):
        return jsonify({
            **fact_check,
            "style_analysis": style_result,
            "method": "AI_FACT_CHECK"
        })
    else:
        return jsonify({
            "verdict": style_result,
            "confidence": 50,
            "explanation": f"Audit Fallback: {fact_check}",
            "sources": [],
            "style_analysis": style_result,
            "method": "ML_FALLBACK"
        })

@app.route("/limit", methods=["GET"])
def check_limits():
    results = {
        "github_tokens": [],
        "serper_api": {"remaining_credits": "unknown", "status": "OFFLINE"}
    }

    print("\n--- REAL AI LIMIT CHECK (The 150 Limit) ---")
    
    import time
    for i, token in enumerate(GITHUB_TOKENS):
        try:
             status_res = requests.get("https://api.github.com/rate_limit", 
                                      headers={"Authorization": f"Bearer {token}"}, timeout=2)
             is_active = status_res.status_code == 200
             
             data = status_res.json()
             core = data.get("resources", {}).get("core", {})
             raw_limit = core.get("limit", 5000)
             raw_rem = core.get("remaining", 0)
             raw_reset = core.get("reset", 0)
             
             seconds_left = max(0, int(raw_reset - time.time()))
             minutes_left = f"{seconds_left // 60}m"
             
             remaining = request_stats["ai_limits"][i]
             
             results["github_tokens"].append({
                 "token_index": i + 1,
                 "token_snippet": f"...{token[-8:]}",
                 "remaining": remaining,
                 "rest_limit": raw_limit,
                 "rest_remaining": raw_rem,
                 "rest_reset": minutes_left,
                 "status": "ACTIVE" if is_active else "EXPIRED/ERROR"
             })
        except Exception as e:
            print(f"Token #{i+1}: FAILED {str(e)}")
            results["github_tokens"].append({ "token_index": i + 1, "status": "FAILED" })

    credits = request_stats["serper_credits"]
    print(f"Serper Credits: {credits}")
    results["serper_api"] = {"remaining_credits": credits, "status": "ACTIVE"}

    print("-----------------------\n")
    return jsonify(results), 200

if __name__ == "__main__":
    print(f"[SYSTEM] Tokens Loaded: {len(GITHUB_TOKENS)}")
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)))

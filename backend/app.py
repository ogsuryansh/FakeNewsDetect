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
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
SERPER_API_KEY = os.getenv("SERPER_API_KEY")

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
    url = "https://google.serper.dev/search"
    headers = {'X-API-KEY': SERPER_API_KEY}
    try: # Limited to 3 for speed
        response = requests.post(url, headers=headers, json={"q": query, "num": 3}, timeout=4)
        return response.json().get('organic', [])
    except: return []

def ai_analyze(news_title, news_text, search_results):
    if not GITHUB_TOKEN: return None
    url = "https://models.inference.ai.azure.com/chat/completions"
    
    context = ""
    for res in search_results:
        context += f"- {res.get('link')}: {res.get('snippet')}\n"

    prompt = f"Analyze: {news_title}. Context: {context}. Respond in JSON: {{\"verdict\": \"REAL\"|\"FAKE\", \"confidence\": int, \"explanation\": \"str\", \"sources\": []}}"
    
    try:
        response = requests.post(url, headers={"Authorization": f"Bearer {GITHUB_TOKEN}"}, 
                                 json={
                                     "messages": [
                                         {"role": "system", "content": "You are a fast JSON fact-checker."},
                                         {"role": "user", "content": prompt}
                                     ],
                                     "model": "gpt-4o",
                                     "temperature": 0.1,
                                     "max_tokens": 150
                                 }, timeout=6)
        content = response.json()['choices'][0]['message']['content']
        match = re.search(r'\{.*\}', content, re.DOTALL)
        return json.loads(match.group())
    except: return None

base_dir = os.path.dirname(os.path.abspath(__file__))
try:
    with open(os.path.join(base_dir, "vectorizer.pkl"), "rb") as f: vector = pickle.load(f)
    with open(os.path.join(base_dir, "finalized_model.pkl"), "rb") as f: model = pickle.load(f)
except: vector = model = None

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "healthy", "ai": "READY" if GITHUB_TOKEN else "OFFLINE"}), 200

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

    if fact_check:
        return jsonify({
            **fact_check,
            "style_analysis": style_result,
            "method": "AI_FACT_CHECK"
        })
    else:
        return jsonify({
            "verdict": style_result,
            "confidence": 65,
            "explanation": "Result based on stylistic pattern analysis (AI layer timed out).",
            "sources": [],
            "style_analysis": style_result,
            "method": "ML_FALLBACK"
        })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)))

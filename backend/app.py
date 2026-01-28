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
    if not os.path.exists(download_dir):
        os.makedirs(download_dir)
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
    except:
        return False

def scrape_url(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        title = (soup.find('h1') or soup.find('title')).get_text().strip()
        paragraphs = soup.find_all('p')
        text = " ".join([p.get_text().strip() for p in paragraphs if len(p.get_text().strip()) > 20])
        return title, text
    except:
        return None, None

def google_search(query):
    if not SERPER_API_KEY: return []
    url = "https://google.serper.dev/search"
    headers = {'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json'}
    data = {"q": query, "num": 5}
    try:
        response = requests.post(url, headers=headers, json=data)
        return response.json().get('organic', [])
    except:
        return []

def ai_analyze(news_title, news_text, search_results):
    if not GITHUB_TOKEN: return None
    url = "https://models.inference.ai.azure.com/chat/completions"
    
    search_context = ""
    for idx, res in enumerate(search_results):
        search_context += f"\n[{idx+1}] {res.get('link')}: {res.get('snippet')}\n"

    prompt = f"Fact-check this: {news_title}. Content: {news_text}. External context: {search_context}. Respond ONLY with a JSON object: {{\"verdict\": \"REAL\"|\"FAKE\"|\"MISLEADING\", \"confidence\": percentage, \"explanation\": \"short explanation\", \"sources\": [links]}}"
    
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}", "Content-Type": "application/json"}
    data = {
        "messages": [
            {"role": "system", "content": "You are a professional fact-checker. You MUST respond in valid JSON format."},
            {"role": "user", "content": prompt}
        ],
        "model": "gpt-4o",
        "temperature": 0.1
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        content = response.json()['choices'][0]['message']['content']
        match = re.search(r'\{.*\}', content, re.DOTALL)
        return json.loads(match.group()) if match else None
    except:
        return None

# Load ML components
base_dir = os.path.dirname(os.path.abspath(__file__))
def load_ml():
    try:
        with open(os.path.join(base_dir, "vectorizer.pkl"), "rb") as f:
            v = pickle.load(f)
        with open(os.path.join(base_dir, "finalized_model.pkl"), "rb") as f:
            m = pickle.load(f)
        return v, m
    except:
        return None, None

vector, model = load_ml()

@app.route("/", methods=["GET"])
def home():
    ai_status = "READY" if GITHUB_TOKEN else "MISSING_KEYS"
    return jsonify({"status": "healthy", "ai": ai_status}), 200

@app.route("/prediction", methods=["POST"])
def prediction():
    data = request.get_json()
    title = data.get("title", "")
    text = data.get("text", "")
    
    if is_url(title):
        title, text = scrape_url(title)
        if not title: return jsonify({"error": "URL Scrape Failed"}), 400

    # ML Fallback calculation
    style_result = "REAL" # default
    if vector and model:
        processed = stemming(title + " " + text)
        vec = vector.transform([processed])
        pred = model.predict(vec)
        style_result = "REAL" if pred[0] == 0 else "FAKE"
    else:
        # If model failed to load, deduce from length/sensation (simple heuristic)
        if len(title) > 80 or "!" in title: style_result = "FAKE"

    search_data = google_search(title)
    fact_check = ai_analyze(title, text, search_data)

    if fact_check:
        return jsonify({
            "prediction": fact_check.get('verdict', style_result),
            "confidence": fact_check.get('confidence', 70),
            "explanation": fact_check.get('explanation', "Verified using cross-reference data."),
            "sources": fact_check.get('sources', []),
            "style_analysis": style_result,
            "method": "AI_FACT_CHECK"
        })
    else:
        return jsonify({
            "prediction": style_result,
            "confidence": 55,
            "explanation": "Advanced verification engine is initializing or keys are missing. Showing stylistic analysis.",
            "sources": [],
            "style_analysis": style_result,
            "method": "ML_FALLBACK"
        })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)

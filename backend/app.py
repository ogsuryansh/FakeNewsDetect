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
    try:
        nltk.data.find('corpora/stopwords')
    except:
        nltk.download('stopwords')

setup_nltk()

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "engine": "GPT-4o Fact Checker"}), 200

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
    except Exception as e:
        print(f"Scraping error: {e}")
        return None, None

def google_search(query):
    url = "https://google.serper.dev/search"
    headers = {'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json'}
    data = {"q": query, "num": 5}
    try:
        response = requests.post(url, headers=headers, json=data)
        return response.json().get('organic', [])
    except Exception as e:
        return []

def ai_analyze(news_title, news_text, search_results):
    url = "https://models.inference.ai.azure.com/chat/completions"
    search_context = ""
    for idx, res in enumerate(search_results):
        search_context += f"\n[{idx+1}] Source: {res.get('link')}\nTitle: {res.get('title')}\nSnippet: {res.get('snippet')}\n"

    prompt = f"Analyze the news below using Google Search results. NEWS TITLE: {news_title}. NEWS TEXT: {news_text}. SEARCH RESULTS: {search_context}. Output strictly valid JSON: {{\"verdict\": \"REAL\"|\"FAKE\", \"confidence\": number, \"explanation\": \"string\", \"sources\": []}}"
    
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}", "Content-Type": "application/json"}
    data = {
        "messages": [
            {"role": "system", "content": "You are a fact-checking assistant responding in JSON."},
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
    except Exception as e:
        return None

base_dir = os.path.dirname(os.path.abspath(__file__))
try:
    with open(os.path.join(base_dir, "vectorizer.pkl"), "rb") as f:
        vector = pickle.load(f)
    with open(os.path.join(base_dir, "finalized_model.pkl"), "rb") as f:
        model = pickle.load(f)
except:
    vector = model = None

@app.route("/prediction", methods=["POST"])
def prediction():
    data = request.get_json()
    title = data.get("title", "")
    text = data.get("text", "")
    if is_url(title):
        title, text = scrape_url(title)
        if not title: return jsonify({"error": "Failed to scrape URL"}), 400

    style_result = "UNKNOWN"
    if vector and model:
        processed = stemming(title + " " + text)
        vec = vector.transform([processed])
        pred = model.predict(vec)
        style_result = "REAL" if pred[0] == 0 else "FAKE"

    search_data = google_search(title)
    fact_check = ai_analyze(title, text, search_data) or {"verdict": style_result, "confidence": 50, "explanation": "Audit based on stylistic patterns."}

    return jsonify({
        "prediction": fact_check.get('verdict', style_result),
        "confidence": fact_check.get('confidence', 50),
        "explanation": fact_check.get('explanation', ""),
        "sources": fact_check.get('sources', []),
        "style_analysis": style_result,
        "method": "AI_FACT_CHECK"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)

from flask import Blueprint, request, jsonify
import pandas as pd
import requests
import os
import pickle
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from concurrent.futures import ThreadPoolExecutor

recommend_bp = Blueprint('recommend', __name__)

DATA_PATH = 'data/itinerary.csv'
MOOD_LOG = 'data/user_moods.csv'
MODEL_DIR = 'models'

df = pd.read_csv(DATA_PATH)
df['combined_moods'] = df['mood_tags'].fillna('').astype(str)
vectorizer = pickle.load(open(f"{MODEL_DIR}/tfidf_vectorizer.pkl", "rb"))
knn_model = pickle.load(open(f"{MODEL_DIR}/recommender_knn.pkl", "rb"))

image_cache = {}

# === Wikipedia Primary Image Source ===
def strict_wiki_place_title(query):
    try:
        res = requests.get("https://en.wikipedia.org/w/api.php", params={
            "action": "query", "list": "search", "srsearch": query, "format": "json"
        }, timeout=5)
        results = res.json().get("query", {}).get("search", [])
        for r in results:
            title = r.get("title", "").lower()
            snippet = r.get("snippet", "").lower()
            if "disambiguation" not in title and any(k in snippet for k in ["village", "city", "town", "located", "state"]):
                return r["title"]
        return results[0]["title"] if results else query
    except:
        return query

def fetch_image_from_wikipedia(title):
    try:
        res = requests.get("https://en.wikipedia.org/w/api.php", params={
            "action": "query", "format": "json", "prop": "pageimages",
            "titles": title, "piprop": "original"
        }, timeout=5)
        pages = res.json().get("query", {}).get("pages", {})
        for p in pages.values():
            if "original" in p:
                return [p["original"]["source"]]
        return []
    except:
        return []

# === SearxNG Fallback ===
def fetch_images_from_searx(query):
    try:
        url = "https://baresearch.org/search"
        params = {
            "q": query,
            "categories": "images",
            "format": "json"
        }
        headers = {
            "User-Agent": "Mozilla/5.0"
        }
        print(f"SearxNG image search: {query}")
        res = requests.get(url, headers=headers, params=params, timeout=5)
        if res.status_code != 200:
            print(f"SearxNG status: {res.status_code}")
            return []
        data = res.json()
        return [{"url": item["img_src"], "source": "searx"} for item in data if "img_src" in item][:4]
    except Exception as e:
        print("SearxNG failed:", e)
        return []

# === Image Fetch Controller ===
def fetch_images(base_destination, validated_state):
    key = f"{base_destination}-{validated_state}".lower()
    if key in image_cache:
        return image_cache[key]

    query = f"{base_destination} {validated_state}"
    title = strict_wiki_place_title(query)

    # Try Wiki
    images = fetch_image_from_wikipedia(title)

    # Fallback to Searx
    if not images:
        images = fetch_images_from_searx(query)

    image_cache[key] = images
    return images

# === Main Recommend Route ===
@recommend_bp.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    user_mood = data.get("mood", "").strip().lower()
    budget = int(data.get("budget", 99999))
    group = data.get("group", "").strip().lower()
    travel_type = data.get("type", "").strip().lower()

    try:
        # Mood logging
        if not os.path.exists(MOOD_LOG):
            pd.DataFrame(columns=["mood"]).to_csv(MOOD_LOG, index=False)
        mood_df = pd.read_csv(MOOD_LOG)
        if user_mood not in mood_df['mood'].str.lower().values:
            mood_df = pd.concat([mood_df, pd.DataFrame([{"mood": user_mood}])], ignore_index=True)
            mood_df.to_csv(MOOD_LOG, index=False)

        user_vec = vectorizer.transform([user_mood])
        _, indices = knn_model.kneighbors(user_vec, n_neighbors=30)
        matched = df.iloc[indices[0]]

        recommendations = []
        added_titles = set()

        def is_valid(row):
            return (
                group in str(row['ideal_group']).lower() and
                travel_type in str(row['type']).lower() and
                int(row['avg_budget_per_day_inr']) <= budget
            )

        valid_rows = [row for _, row in matched.iterrows() if is_valid(row)]

        def build_recommendation(row):
            destination = row['destination']
            base_dest = row.get('base_destination', destination)
            state = row.get('validated_state', row.get('state', ''))
            return {
                "title": destination,
                "state": state,
                "type": row['type'].capitalize(),
                "groups": [g.strip() for g in str(row['ideal_group']).split(',')],
                "mood_tags": [m.strip() for m in str(row['mood_tags']).split(',')],
                "avg_budget_per_day_inr": int(row['avg_budget_per_day_inr']),
                "best_months": row.get('best_months', 'Any'),
                "sample_itinerary": [i.strip() for i in str(row['sample_itinerary']).split(',') if i.strip()],
                "images": fetch_images(base_dest, state)
            }

        with ThreadPoolExecutor(max_workers=5) as executor:
            recs = list(executor.map(build_recommendation, valid_rows[:15]))

        recommendations.extend(recs)
        added_titles.update(r['title'] for r in recs)

        # Fallback: relax group if still <15
        if len(recommendations) < 15:
            for _, row in matched.iterrows():
                if row['destination'] in added_titles: continue
                if travel_type not in str(row['type']).lower(): continue
                if int(row['avg_budget_per_day_inr']) > budget: continue
                try:
                    rec = build_recommendation(row)
                    recommendations.append(rec)
                    added_titles.add(row['destination'])
                except: continue
                if len(recommendations) >= 15:
                    break

        return jsonify(sorted(recommendations, key=lambda x: x['avg_budget_per_day_inr']))

    except Exception as e:
        print("Failed to recommend:", e)
        return jsonify({"error": str(e)}), 500
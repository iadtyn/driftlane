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

# Load dataset
df = pd.read_csv(DATA_PATH)
df['combined_moods'] = df['mood_tags'].fillna('').astype(str)

# Load vectorizer and KNN model
vectorizer = pickle.load(open(f"{MODEL_DIR}/tfidf_vectorizer.pkl", "rb"))
knn_model = pickle.load(open(f"{MODEL_DIR}/recommender_knn.pkl", "rb"))

# === Image Cache ===
image_cache = {}

def strict_wiki_place_title(query):
    try:
        res = requests.get("https://en.wikipedia.org/w/api.php", params={
            "action": "query", "list": "search", "srsearch": query, "format": "json"
        }, timeout=5)
        results = res.json().get("query", {}).get("search", [])
        for r in results:
            title = r.get("title", "").lower()
            snippet = r.get("snippet", "").lower()
            if "disambiguation" not in title and any(k in snippet for k in ["village", "city", "town", "located in", "state of"]):
                return r["title"]
        return results[0]["title"] if results else query
    except:
        return query

def fetch_image_from_wikipedia(destination):
    try:
        res = requests.get("https://en.wikipedia.org/w/api.php", params={
            "action": "query", "format": "json", "prop": "pageimages",
            "titles": destination, "piprop": "original"
        }, timeout=5)
        pages = res.json().get("query", {}).get("pages", {})
        for p in pages.values():
            if "original" in p:
                return [p["original"]["source"]]
        return []
    except:
        return []

def fetch_images(base_destination, validated_state):
    key = f"{base_destination}-{validated_state}".lower()
    if key in image_cache:
        return image_cache[key]
    
    title = strict_wiki_place_title(f"{base_destination} {validated_state}")
    images = fetch_image_from_wikipedia(title)
    image_cache[key] = images
    return images

# === Recommendation Route ===
@recommend_bp.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    user_mood = data.get("mood", "").strip().lower()
    budget = int(data.get("budget", 99999))
    group = data.get("group", "").strip().lower()
    travel_type = data.get("type", "").strip().lower()

    try:
        # Log mood once
        if not os.path.exists(MOOD_LOG):
            pd.DataFrame(columns=["mood"]).to_csv(MOOD_LOG, index=False)
        mood_df = pd.read_csv(MOOD_LOG)
        if user_mood not in mood_df['mood'].str.lower().values:
            mood_df = pd.concat([mood_df, pd.DataFrame([{"mood": user_mood}])], ignore_index=True)
            mood_df.to_csv(MOOD_LOG, index=False)

        # Recommend
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
            destination_name = row['destination']
            base_dest = row.get('base_destination', destination_name)
            validated_state = row.get('validated_state', row.get('state', ''))
            images = fetch_images(base_dest, validated_state)

            return {
                "title": destination_name,
                "state": row['state'],
                "type": row['type'].capitalize(),
                "groups": [g.strip() for g in str(row['ideal_group']).split(',')],
                "mood_tags": [m.strip() for m in str(row['mood_tags']).split(',')],
                "avg_budget_per_day_inr": int(row['avg_budget_per_day_inr']),
                "best_months": row.get('best_months', 'Any'),
                "sample_itinerary": [i.strip() for i in str(row['sample_itinerary']).split(',') if i.strip()],
                "images": images
            }

        # Parallel image fetch for first 15 valid destinations
        with ThreadPoolExecutor(max_workers=5) as executor:
            recs = list(executor.map(build_recommendation, valid_rows[:15]))

        recommendations.extend(recs)
        for r in recommendations:
            added_titles.add(r['title'])

        # Fallback if <15: relax only group, keep type strict
        if len(recommendations) < 15:
            for _, row in matched.iterrows():
                try:
                    if row['destination'] in added_titles:
                        continue
                    if travel_type not in str(row['type']).lower():
                        continue
                    if int(row['avg_budget_per_day_inr']) <= budget:
                        rec = build_recommendation(row)
                        recommendations.append(rec)
                        added_titles.add(row['destination'])
                    if len(recommendations) >= 15:
                        break
                except:
                    continue

        return jsonify(sorted(recommendations, key=lambda x: x['avg_budget_per_day_inr']))

    except Exception as e:
        print(f" Failed to recommend: {e}")
        return jsonify({"error": str(e)}), 500

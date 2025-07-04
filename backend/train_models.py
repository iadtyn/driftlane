import pandas as pd
import os
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
from sklearn.cluster import KMeans

# ========== Paths ==========
DATA_PATH = "data/itinerary.csv"
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# ========== Load & Preprocess ==========
df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=["avg_budget_per_day_inr", "state", "type", "ideal_group", "mood_tags", "destination"])

# Normalize mood_tags for TF-IDF (convert comma-separated to space-separated, lowercase)
df["mood_tags_cleaned"] = df["mood_tags"].astype(str).str.lower().str.replace(",", " ")

# ========== TF-IDF + KNN ==========
tfidf = TfidfVectorizer()
X_tfidf = tfidf.fit_transform(df["mood_tags_cleaned"])

knn = NearestNeighbors(n_neighbors=5, metric='cosine')
knn.fit(X_tfidf)

# Save TF-IDF and KNN
pickle.dump(tfidf, open(f"{MODEL_DIR}/tfidf_vectorizer.pkl", "wb"))
pickle.dump(knn, open(f"{MODEL_DIR}/recommender_knn.pkl", "wb"))

# ========== KMeans Clustering ==========
kmeans = KMeans(n_clusters=5, n_init=10, random_state=42)
kmeans.fit(X_tfidf)
pickle.dump(kmeans, open(f"{MODEL_DIR}/kmeans_cluster.pkl", "wb"))

# ========== Label Encoding for Classifier ==========
le_state = LabelEncoder()
le_type = LabelEncoder()
le_group = LabelEncoder()
le_mood = LabelEncoder()
le_dest = LabelEncoder()

X_cls = pd.DataFrame({
    "budget": df["avg_budget_per_day_inr"].astype(int),
    "state": le_state.fit_transform(df["state"].astype(str)),
    "type": le_type.fit_transform(df["type"].astype(str)),
    "group": le_group.fit_transform(df["ideal_group"].astype(str)),
    "mood": le_mood.fit_transform(df["mood_tags_cleaned"].astype(str))
})
y_cls = le_dest.fit_transform(df["destination"].astype(str))

# ========== Train Random Forest Classifier ==========
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_cls, y_cls)

# Save Classifier and Encoders
pickle.dump(clf, open(f"{MODEL_DIR}/classifier_rf.pkl", "wb"))
pickle.dump({
    "state": le_state,
    "type": le_type,
    "group": le_group,
    "mood": le_mood,
    "destination": le_dest
}, open(f"{MODEL_DIR}/label_encoders.pkl", "wb"))

print("Models trained and saved successfully.")

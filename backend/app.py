from flask import Flask
from flask_cors import CORS
import os

from routes.recommend import recommend_bp
from routes.itinerary_llm import llm_bp

app = Flask(__name__)

# ─── CORS Setup ─────────────────────────────────────
CORS(
    app,
    resources={r"/api/*": {
        "origins": [
            "http://localhost:3000",                 # for local dev
            "https://driftlane.vercel.app"      # for Vercel prod
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
    }},
)

# ─── Register API Blueprints ────────────────────────
app.register_blueprint(recommend_bp, url_prefix="/api")
app.register_blueprint(llm_bp,      url_prefix="/api")

# ─── Optional Health Check ──────────────────────────
@app.route("/", methods=["GET"])
def index():
    return "Flask backend is running."

# ─── Run ─────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Flask server running at http://localhost:{port}")
    app.run(debug=True, port=port)

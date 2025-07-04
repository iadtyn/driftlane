from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
import hashlib

# Load .env
load_dotenv()

# Configure Gemini
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
else:
    raise EnvironmentError("Missing GEMINI_API_KEY in .env")

# Blueprint
llm_bp = Blueprint('llm_bp', __name__)

# Simple in-memory cache
itinerary_cache = {}

def generate_prompt(places, mood, group, duration):
    place_str = ", ".join(places)
    day_label = "day" if duration == 1 else "days"
    return f"""
You are a professional travel planner.

Create a {duration}-{day_label} itinerary for a {mood}-themed trip to {place_str}.
The travelers are {group}.

Break it down day-wise (e.g., Day 1, Day 2...).
Each day should include:
- Local attractions to visit
- Activity suggestions
- Cultural or local travel tips
- Approximate timing (morning, afternoon, evening)

Keep the tone friendly, helpful, and structured.
"""

def generate_cache_key(places, mood, group, duration):
    raw = f"{','.join(places)}|{mood}|{group}|{duration}"
    return hashlib.md5(raw.encode()).hexdigest()

@llm_bp.route('/generate-itinerary', methods=['POST'])
def generate_itinerary():
    data = request.json
    places = data.get("places", [])
    mood = data.get("mood", "adventure")
    group = data.get("group", "friends")
    duration = int(data.get("duration", 3))

    if not places:
        return jsonify({"error": "No destinations provided"}), 400

    # Check cache
    key = generate_cache_key(places, mood, group, duration)
    if key in itinerary_cache:
        return jsonify({"itinerary": itinerary_cache[key]})

    try:
        prompt = generate_prompt(places, mood, group, duration)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Cache response
        itinerary_cache[key] = text
        return jsonify({"itinerary": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Load both
itinerary_df = pd.read_csv("data/itinerary.csv")
user_moods = pd.read_csv("data/user_moods.csv")

existing_moods = set(itinerary_df["mood_tags"].str.lower())
new_moods = [m for m in user_moods["mood"].str.lower() if m not in existing_moods]

for mood in new_moods:
    # Generate one or more rows for this mood
    new_row = {
        "destination": f"GeneratedPlace_{mood.title()}",
        "state": "unknown",
        "mood_tags": mood,
        "ideal_group": "solo",
        "avg_budget_per_day_inr": 1500,
        "best_months": "Any",
        "sample_itinerary": "Arrival, Explore Nature, Chill, Depart",
        "type": "trek"
    }
    itinerary_df = pd.concat([itinerary_df, pd.DataFrame([new_row])], ignore_index=True)

itinerary_df.to_csv("data/itinerary.csv", index=False)
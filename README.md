# Driftline 🏕️🗺️

**AI-Powered Adventure Recommender & Itinerary Generator**

Driftline is a full-stack web application that recommends personalized camping and trekking experiences across India based on your mood, budget, group type, and preferences. It uses machine learning and LLMs to suggest destinations and dynamically generate travel itineraries.

## 🔥 Live Demo

🌐 [Frontend on Vercel](https://driftline-puce.vercel.app/)  
🔗 [Backend on Render](https://driftline.onrender.com/)

---

## 📁 Project Structure

```
driftline/
├── backend/
│   ├── app.py
│   ├── train_models.py
│   ├── requirements.txt
│   ├── data/
│   │   ├── itinerary.csv
│   │   └── user_moods.csv
│   ├── models/
│   │   ├── classifier_rf.pkl
│   │   ├── kmeans_cluster.pkl
│   │   ├── knn_mood_model.pkl
│   │   ├── label_encoders.pkl
│   │   ├── recommender_knn.pkl
│   │   └── tfidf_vectorizer.pkl
│   └── routes/
│       ├── recommend.py
│       └── itinerary_llm.py
├── frontend/
│   ├── app/
│   │   └── explore/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── public/
│   ├── styles/
│   │   ├── globals.css
│   │   └── explore.module.css
│   ├── tailwind.config.js
│   └── package.json
├── .gitignore
├── vercel.json
└── README.md
```

---

## 🚀 Features

- 🎯 **ML-Based Recommendations**
- 🤖 **LLM-Powered Itinerary Generator**
- 🗺️ **Filter & Visual UI**
- 📸 **Image Fetching**

---

## ⚙️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/omkarr10/driftline
cd driftline
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 Tech Stack

- **Frontend**: Next.js 13+, Tailwind CSS
- **Backend**: Flask, scikit-learn, pandas
- **ML Models**: TF-IDF + KNN, Random Forest, KMeans
- **Deployment**: Vercel, Render

---

## 🧑‍💻 Author

Made with ❤️ by [@omkarr10](https://github.com/omkarr10) & [@4aditya](https://github.com/4aditya)


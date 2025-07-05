'use client';

import '@/styles/globals.css';
import { useState } from 'react';
import Image from 'next/image';

interface Adventure {
  title: string;
  state: string;
  type: string;
  groups: string[];
  mood_tags: string[];
  avg_budget_per_day_inr: number;
  itinerary: string[];
  best_months: string;
  images?: string[];
}

export default function Explore() {
  const [formData, setFormData] = useState({
    mood: '',
    budget: '',
    group: '',
    type: '',
    duration: '3',
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Adventure[]>([]);
  const [error, setError] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [visibleItinerary, setVisibleItinerary] = useState<{ [key: string]: { show: boolean; content: string } }>({});
  const [loadingItinerary, setLoadingItinerary] = useState<{ [key: string]: boolean }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await fetch('http://localhost:5000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, state: 'all' }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.error) {
        setError(data.error);
        return;
      }

      setResults(data);
      const states: string[] = Array.from(new Set(data.map((item: Adventure) => item.state)));
      setAvailableStates(states);
    } catch {
      setLoading(false);
      setError('Server error. Try again later.');
    }
  };

  const filteredResults = results.filter(
    (r) =>
      (filterState === 'all' || r.state.toLowerCase() === filterState.toLowerCase()) &&
      (formData.type === '' || r.type.toLowerCase() === formData.type.toLowerCase())
  );

  const formatItinerary = (text: string) => {
    const lines = text.trim().split('\n');
    let html = '';
    let inList = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      let trimmed = line
        .replace(/^#+\s*/, '')
        .replace(/^[*-]+/, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      if (/^day\s*\d+[:\s]/i.test(trimmed)) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<h4 class="font-semibold text-blue-400 mt-4 mb-1">${trimmed}</h4>`;
      } else if (/^[-*]\s+/.test(trimmed)) {
        if (!inList) {
          html += '<ul class="list-disc ml-5 text-sm">';
          inList = true;
        }
        html += `<li>${trimmed.replace(/^[-*]\s+/, '')}</li>`;
      } else {
        html += `<p class="text-sm text-white/80">${trimmed}</p>`;
      }
    }

    if (inList) html += '</ul>';
    return html;
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="relative h-screen font-['Prompt'] flex flex-col text-white">
      <div className="fixed inset-0 bg-[url('/BG4.JPG')] bg-cover bg-center brightness-75 -z-30" />
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] -z-20" />

      <div className="relative z-10 flex-1 overflow-y-auto">
        <header className="px-4 pt-10 pb-6 text-center">
          <div className="flex justify-center items-center gap-3 mb-2">
            <Image
              src="/logo.png"
              alt="Driftline Logo"
              width={60}
              height={60}
              className="object-contain"
            />
            <h1 className="text-5xl bg-gradient-to-b from-[#FFD475] via-[#D98C3C] to-[#7A858A] text-transparent bg-clip-text drop-shadow font-bold">
              Driftline
            </h1>
          </div>
          <p className="text-white/80 text-lg mt-2 font-light max-w-2xl mx-auto">
            Discover your next adventure – curated camps & treks based on your vibe.
          </p>
        </header>

       
          <form onSubmit={handleSubmit} className="bg-white/10 p-6 rounded-xl shadow-md space-y-6 mb-12 backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {/* Mood Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Describe your mood*</label>
                <input
                  type="text"
                  name="mood"
                  required
                  value={formData.mood}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
                  placeholder="e.g. wildlife, hiking, spiritual"
                />
              </div>

              {/* Budget Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Budget per person (INR)*</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">₹</span>
                  <input
                    type="number"
                    name="budget"
                    required
                    min={1300}
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
                    placeholder="e.g. 1500"
                  />
                </div>
              </div>

              {/* Group Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Traveling with*</label>
                <select
                  name="group"
                  required
                  value={formData.group}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-400"
                >
                  <option value="">Select your group</option>
                  <option value="solo">Solo</option>
                  <option value="couples">Couple</option>
                  <option value="friends">Friends</option>
                  <option value="family">Family</option>
                </select>
              </div>

              {/* Type Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Destination type*</label>
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-400"
                >
                  <option value="">Select type</option>
                  <option value="camp">Camping</option>
                  <option value="trek">Trekking</option>
                </select>
              </div>

              {/* Duration Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Trip Duration (1–7 days)*</label>
                <select
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-400"
                >
                  {Array.from({ length: 7 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} day{i === 0 ? '' : 's'}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="styled-button text-focus-in px-5 py-3 text-base font-semibold">
              <i className="fas fa-map-marked-alt mr-2" /> Get Recommendations
            </button>
          </form>
      </div>

      <footer className="text-center py-3 bg-gradient-to-b from-[#FFD475] via-[#D98C3C] to-[#7A858A] text-transparent bg-clip-text mb-2 text-focus-in">
        © {currentYear} DriftLine . All Rights Reserved.
      </footer>
    </div>
  );
}

'use client';
import '@/styles/globals.css';
import { useState } from 'react';

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
      const res = await fetch('https://driftline.onrender.com/api/recommend', {
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

  const filteredResults = results.filter(r =>
    (filterState === 'all' || r.state.toLowerCase() === filterState.toLowerCase()) &&
    (formData.type === '' || r.type.toLowerCase() === formData.type.toLowerCase())
  );

  const formatItinerary = (text: string) => {
    const lines = text.trim().split('\n');
    let html = '';
    let inList = false;
    let lineCount = 0;

    for (const line of lines) {
      let trimmed = line.trim();
      if (!trimmed) continue;

      trimmed = trimmed.replace(/^#+\s*/, '');
      trimmed = trimmed.replace(/^\*+/, '');
      trimmed = trimmed.replace(/^\-+/, '');
      trimmed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      trimmed = trimmed.replace(/\*(.*?)\*/g, '<em>$1</em>');

      if (/^day\s*\d+[:\s]/i.test(trimmed)) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<h4 class="font-semibold text-blue-400 mt-4 mb-1">${trimmed}</h4>`;
        lineCount = 0;
      } else if (/^[-*]\s+/.test(trimmed)) {
        if (lineCount >= 2) continue;
        if (!inList) {
          html += '<ul class="list-disc ml-5 text-sm">';
          inList = true;
        }
        html += `<li>${trimmed.replace(/^[-*]\s+/, '')}</li>`;
        lineCount++;
      } else {
        if (lineCount >= 2) continue;
        html += `<p class="text-sm text-white/80">${trimmed}</p>`;
        lineCount++;
      }
    }

    if (inList) html += '</ul>';
    return html;
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="relative h-screen font-['Prompt'] flex flex-col text-white">
      <div className="fixed inset-0 bg-[url('/BG4.jpg')] bg-cover bg-center brightness-75 -z-30" />
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] -z-20" />

      <div className="relative z-10 flex-1 overflow-y-auto">
        <header className="px-4 pt-10 pb-6 text-center">
          <div className="flex justify-center items-center gap-3 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="logo.png"
              alt="Driftline Logo"
              className="w-15 h-15 object-contain text-focus-in"
            />
            <h1 className="text-5xl bg-gradient-to-b from-[#FFD475] via-[#D98C3C] to-[#7A858A] text-transparent bg-clip-text drop-shadow font-bold text-focus-in">
              Driftline
            </h1>
          </div>
          <p className="text-white/80 text-lg mt-2 font-light max-w-2xl mx-auto text-focus-in">
            Discover your next adventure – curated camps & treks based on your vibe.
          </p>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="bg-white/10 p-6 rounded-xl shadow-md space-y-6 mb-12 backdrop-blur-sm text-focus-in">
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

          {results.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Filter by State:</label>
              <select value={filterState} onChange={e => setFilterState(e.target.value)} className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-gray-400">
                <option value="all">All States</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-400 mb-4"></div>
              <p className="text-white/80">Finding the perfect adventures for you...</p>
            </div>
          )}

          {error && <div className="text-red-300 text-center mb-4">{error}</div>}
          {filteredResults.length > 0 && (
            <div className="space-y-10">
              {filteredResults.map((card, idx) => {
                const id = card.title.toLowerCase().replace(/\s+/g, '-');
                const stored = visibleItinerary[id];

                return (
                  <div key={idx} className="bg-white/10 rounded-xl shadow-md backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-6">
                      <div className="order-1 md:order-2 md:ml-4 w-full md:w-auto">
                        <div className="grid grid-cols-1 gap-2">
                          {(card.images || []).slice(0, 4).map((img, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={i}
                              src={img}
                              className="h-60 w-full object-cover rounded-md shadow"
                              alt={`Image ${i + 1}`}
                              onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 order-2 md:order-1">
                        <h3 className="text-xl font-semibold text-white mb-1">{card.title}</h3>
                        <div className="flex justify-between text-sm text-white/70 mb-1">
                          <span>Type: <span className="text-red-300">{card.type}</span></span>
                          <span>{card.state}</span>
                        </div>

                        <div className="mb-2">
                          Ideal For:{' '}
                          {card.groups.map((g, i) => (
                            <span key={i} className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs mr-2 mb-1">{g}</span>
                          ))}
                        </div>

                        <p className="text-sm text-white/80 mb-2"><strong>Budget:</strong> ₹{card.avg_budget_per_day_inr}</p>
                        <p className="text-sm text-white/80 mb-2"><strong>Best Months:</strong> {card.best_months}</p>

                        <button
                          onClick={async () => {
                            if (stored?.content) {
                              setVisibleItinerary(prev => ({
                                ...prev,
                                [id]: { ...prev[id], show: !prev[id].show }
                              }));
                            } else {
                              setLoadingItinerary(prev => ({ ...prev, [id]: true }));
                              const res = await fetch('https://driftline.onrender.com/api/generate-itinerary', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  places: [card.title],
                                  duration: parseInt(formData.duration),
                                  mood: formData.mood,
                                  group: formData.group,
                                }),
                              });
                              const data = await res.json();
                              setLoadingItinerary(prev => ({ ...prev, [id]: false }));
                              if (data.itinerary) {
                                setVisibleItinerary(prev => ({
                                  ...prev,
                                  [id]: { show: true, content: data.itinerary }
                                }));
                              }
                            }
                          }}
                          className="styled-button px-4 py-3 text-xs font-semibold mt-4"
                        >
                          {loadingItinerary[id] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            stored?.show ? 'Hide Itinerary' : 'Show Itinerary'
                          )}
                        </button>
                      </div>
                    </div>

                    {stored?.show && (
                      <div className="mt-0 px-6 pb-6">
                        <div
                          className="p-4 rounded-lg bg-blue-950/50 border border-blue-400 text-sm"
                          dangerouslySetInnerHTML={{ __html: formatItinerary(stored.content) }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <footer className="text-center py-3 bg-gradient-to-b from-[#FFD475] via-[#D98C3C] to-[#7A858A] text-transparent bg-clip-text mb-2 text-focus-in">
        © {currentYear} DriftLine . All Rights Reserved.
      </footer>
    </div>
  );
}

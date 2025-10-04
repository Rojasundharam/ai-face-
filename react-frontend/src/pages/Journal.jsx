import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    moodRating: 5,
    journalText: '',
    tags: '',
  });
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const response = await api.get('/api/journal/entries?limit=30');
      setEntries(response.data.entries);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('date', formData.date);
      formDataToSend.append('moodRating', formData.moodRating);
      formDataToSend.append('journalText', formData.journalText);
      formDataToSend.append(
        'tags',
        JSON.stringify(formData.tags.split(',').map((t) => t.trim()).filter(Boolean))
      );

      const response = await api.post('/api/journal/entry', formDataToSend);

      if (response.data.aiAnalysis) {
        setAiAnalysis(response.data.aiAnalysis);
      }

      toast.success('Journal entry created!');

      // Reset form
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        moodRating: 5,
        journalText: '',
        tags: '',
      });

      // Reload entries
      await loadEntries();
      setShowForm(false);
    } catch (error) {
      toast.error('Failed to create entry');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (rating) => {
    if (rating <= 3) return 'text-red-500';
    if (rating <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getMoodEmoji = (rating) => {
    if (rating <= 2) return '😢';
    if (rating <= 4) return '😕';
    if (rating <= 6) return '😐';
    if (rating <= 8) return '🙂';
    return '😄';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Mood Journal</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your daily mood and reflect on your emotions
          </p>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Entry'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Calendar</h3>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="rounded-xl border-0"
            tileClassName={({ date }) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const entry = entries.find((e) => e.date === dateStr);
              if (entry) {
                return 'has-entry';
              }
              return '';
            }}
          />
          <style>{`
            .react-calendar {
              background: transparent;
              border: none;
              font-family: inherit;
            }
            .react-calendar__tile {
              border-radius: 0.5rem;
              transition: all 0.2s;
            }
            .react-calendar__tile:hover {
              background: rgba(99, 102, 241, 0.1);
            }
            .react-calendar__tile--active {
              background: linear-gradient(135deg, #6366f1, #8b5cf6);
              color: white;
            }
            .has-entry {
              background: rgba(34, 197, 94, 0.1);
              color: rgb(34, 197, 94);
              font-weight: bold;
            }
          `}</style>
        </div>

        {/* Form or Entries List */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card"
              >
                <h3 className="text-xl font-bold mb-6">Create Journal Entry</h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mood Rating: {getMoodEmoji(formData.moodRating)} {formData.moodRating}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      className="w-full accent-primary-500"
                      value={formData.moodRating}
                      onChange={(e) =>
                        setFormData({ ...formData, moodRating: parseInt(e.target.value) })
                      }
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Very Bad</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Journal Entry</label>
                    <textarea
                      className="input min-h-[150px]"
                      value={formData.journalText}
                      onChange={(e) =>
                        setFormData({ ...formData, journalText: e.target.value })
                      }
                      placeholder="How are you feeling today? What happened?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="work, stress, happy, exercise"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Entry'}
                  </button>
                </form>

                {aiAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 glass rounded-xl"
                  >
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span>🤖</span> AI Analysis
                    </h4>
                    <p className="text-sm">{aiAnalysis}</p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {entries.length === 0 ? (
                  <div className="card text-center text-gray-500">
                    <div className="text-6xl mb-4">📝</div>
                    <p>No journal entries yet</p>
                    <p className="text-sm mt-2">Create your first entry!</p>
                  </div>
                ) : (
                  entries.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="card-hover"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold">
                            {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-2xl ${getMoodColor(entry.mood_rating)}`}>
                              {getMoodEmoji(entry.mood_rating)}
                            </span>
                            <span className={`font-semibold ${getMoodColor(entry.mood_rating)}`}>
                              {entry.mood_rating}/10
                            </span>
                          </div>
                        </div>

                        {entry.tags && (
                          <div className="flex flex-wrap gap-2">
                            {JSON.parse(entry.tags).map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 glass rounded-full text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {entry.journal_text && (
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {entry.journal_text}
                        </p>
                      )}

                      {entry.ai_analysis && (
                        <div className="glass p-3 rounded-xl">
                          <div className="text-sm font-semibold mb-1 flex items-center gap-2">
                            <span>🤖</span> AI Analysis:
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.ai_analysis}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Journal;

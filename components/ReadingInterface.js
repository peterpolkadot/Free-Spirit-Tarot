import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';

/**
 * Displays tarot cards and generates AI readings for each reader page.
 */
export default function ReadingInterface({ readerAlias, readerName, readerEmoji }) {
  const [cards, setCards] = useState([]);
  const [reading, setReading] = useState('');
  const [loading, setLoading] = useState(false);

  // 🎴 Draw random cards
  const drawCards = async (count = 3) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('random()')
      .limit(count);
    if (error) console.error('Card fetch error:', error);
    setCards(data || []);
  };

  // 🔮 Generate AI reading (via /api/reading)
  const generateReading = async () => {
    if (!cards.length) await drawCards();
    setLoading(true);

    const prompt = `
You are ${readerName} ${readerEmoji}, an intuitive tarot reader.
Interpret these cards drawn for a seeker:
${cards.map(c => `${c.name}: ${c.meaning}`).join('\n')}
Give a poetic, empathetic 3-paragraph reading.
`;

    try {
      const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const json = await res.json();
      setReading(json.text || '✨ The universe is quiet for now.');
    } catch (e) {
      console.error('AI reading error:', e);
      setReading('Something went wrong connecting to the oracle.');
    }

    setLoading(false);
  };

  return (
    <div className="bg-purple-900 bg-opacity-40 border border-purple-600 rounded-xl p-6 text-center mt-8">
      <h3 className="text-2xl font-bold text-white mb-4">Draw Your Cards</h3>

      <button
        onClick={generateReading}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition"
      >
        {loading ? 'Drawing the cards...' : '🔮 Draw & Reveal'}
      </button>

      {cards.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {cards.map((c, i) => (
            <motion.div
              key={c.id}
              className="bg-purple-800 bg-opacity-60 rounded-lg p-3 border border-purple-500"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <img
                src={c.image_url}
                alt={c.name}
                className="w-full rounded-lg mb-2 shadow-lg"
              />
              <h4 className="text-white font-semibold text-lg">{c.name}</h4>
              <p className="text-purple-200 text-sm italic">{c.positive}</p>
            </motion.div>
          ))}
        </div>
      )}

      {reading && (
        <div className="mt-8 bg-purple-800 bg-opacity-40 border-t border-purple-500 pt-4 text-left">
          <h4 className="text-xl text-white font-bold mb-2">Your Reading</h4>
          <p className="text-purple-100 whitespace-pre-line">{reading}</p>
        </div>
      )}
    </div>
  );
}
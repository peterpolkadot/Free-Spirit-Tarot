
import { supabase } from '@/lib/supabaseClient';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';



export async function getServerSideProps({ params }) {
  const { data: reader } = await supabase
    .from('readers')
    .select('*')
    .eq('alias', params.alias)
    .single();

  if (!reader) return { notFound: true };

  // Reader's top drawn cards
  const { data: cardStats } = await supabase
    .from('card_stats')
    .select('card_name, category, draw_count, last_drawn, image_url')
    .eq('reader', reader.alias)
    .order('draw_count', { ascending: false })
    .limit(3);

  // Reader summary (total readings, unique users, etc.)
  const { data: summary } = await supabase
    .from('reader_summary')
    .select('*')
    .eq('reader_alias', reader.alias)
    .single();

  return {
    props: { reader, initialCardStats: cardStats || [], initialSummary: summary || null },
   
  };
}

export default function ReaderPage({ reader, initialCardStats, initialSummary }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [cards, setCards] = useState([]);
  const [cardStats, setCardStats] = useState(initialCardStats);
  const [summary, setSummary] = useState(initialSummary);

  // 🔴 Real-time stats listener
  // 🔴 Real-time listeners for card stats + reader summary
useEffect(() => {
  // 📌 Live updates for card_stats (top drawn cards)
  const cardStatsChannel = supabase
    .channel('card_stats_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'card_stats' },
      (payload) => {
        // Refresh top 3 cards for this reader
        supabase
          .from('card_stats')
          .select('card_name, category, draw_count, last_drawn, image_url')
          .eq('reader', reader.alias)
          .order('draw_count', { ascending: false })
          .limit(3)
          .then(({ data }) => setCardStats(data || []));
      }
    )
    .subscribe();

  // 📌 Live updates for reader_summary (total_readings, unique_users)
  const summaryChannel = supabase
    .channel('reader_summary_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reader_summary' },
      (payload) => {
        if (payload.new?.reader_alias === reader.alias) {
          setSummary(payload.new);
        }
      }
    )
    .subscribe();

  // 🧹 Cleanup on unmount
  return () => {
    supabase.removeChannel(cardStatsChannel);
    supabase.removeChannel(summaryChannel);
  };
}, [reader.alias]);






  // 🔮 Handle chat submit
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setReply('');
    setCards([]);

    try {
      const res = await fetch('/api/askReader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reader_alias: reader.alias, question: message }),
      });
      const data = await res.json();
      setReply(data.reply || '✨ The spirits are quiet...');
      setCards(data.cards || []);
    } catch (err) {
      console.error('Reading error:', err);
      setReply('⚠️ Something went wrong during your reading.');
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": reader.name,
    "url": `https://fstarot.com/reader/${reader.alias}`,
    "description": reader.description,
    "jobTitle": "Tarot Reader",
    "knowsAbout": reader.specialty,
    "image": reader.image_url,
  };

  return (
    <>
      <Head>
        <title>{reader.meta_title || `${reader.name} – Tarot Reader | Free Spirit Tarot`}</title>
        <meta name="description" content={reader.meta_description || reader.description} />
        <link rel="canonical" href={`https://fstarot.com/reader/${reader.alias}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <article className="max-w-5xl mx-auto py-12 space-y-16">
        {/* 🔮 Reader Header */}
        <header className="text-center space-y-4">
          <img
            src={reader.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
            alt={reader.name}
            className="w-32 h-32 mx-auto rounded-full border-4 border-purple-700 shadow-lg"
          />
          <h1 className="text-4xl font-bold text-yellow-300">
            {reader.emoji || '🔮'} {reader.name}
          </h1>
          <p className="text-purple-200 italic">{reader.tagline}</p>
          <p className="text-purple-300 max-w-2xl mx-auto">{reader.description}</p>
        </header>

        {/* 💬 Chat Section */}
        <section className="bg-purple-900/40 border border-purple-700 rounded-xl p-6 space-y-4 max-w-3xl mx-auto">
          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask your question..."
              className="flex-1 bg-purple-800/60 border border-purple-600 rounded-lg px-4 py-2 text-yellow-200 focus:outline-none focus:border-yellow-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-yellow-400 text-purple-900 font-semibold rounded-lg hover:bg-yellow-300 transition disabled:opacity-50"
            >
              Ask
            </button>
          </form>

          {loading && (
            <div className="flex justify-center items-center py-6 text-yellow-300">
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="text-lg"
              >
                🔮 Shuffling the cards...
              </motion.span>
            </div>
          )}

          {!loading && reply && (
            <div className="bg-purple-800/60 border border-purple-700 p-4 rounded-lg text-purple-100 whitespace-pre-line">
              {reply}
            </div>
          )}

          {/* 🎴 Drawn Cards */}
          {cards.length > 0 && (
            <div className="flex justify-center flex-wrap gap-4 mt-6">
              {cards.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <img
                    src={c.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
                    alt={c.name}
                    className="w-32 h-48 object-contain mx-auto border-2 border-purple-700 rounded-md shadow-md"
                  />
                  <p className="text-yellow-300 mt-2 text-sm">{c.name}</p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* 📊 Reader Stats (Live) */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl text-yellow-300 font-semibold">📈 Reader Stats</h2>
          <div className="flex justify-center gap-6 text-purple-200">
            <div>
              <span className="text-3xl text-yellow-300 font-bold">
                {summary?.total_readings || 0}
              </span>
              <p className="text-sm">Total Readings</p>
            </div>
            <div>
              <span className="text-3xl text-yellow-300 font-bold">
                {summary?.unique_users || 0}
              </span>
              <p className="text-sm">Unique Seekers</p>
            </div>
          </div>

          {cardStats?.length > 0 && (
            <div>
              <h3 className="text-xl text-yellow-300 font-semibold mt-6 mb-4">
                🃏 Most Drawn Cards
              </h3>
              <div className="flex justify-center gap-6 flex-wrap">
                {cardStats.map((c) => (
                  <Link
                    key={c.card_name}
                    href={'/card/' + c.card_name.toLowerCase().replace(/\s+/g, '-')}
                    className="p-3 bg-purple-900/40 border border-purple-700 rounded-lg hover:border-yellow-300 hover:scale-[1.03] transition block text-center w-32"
                  >
                    <img
                      src={c.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
                      alt={c.card_name}
                      className="w-full h-48 object-contain rounded-md mb-2 border border-purple-700"
                    />
                    <p className="text-yellow-300 text-sm font-semibold">{c.card_name}</p>
                    <p className="text-xs text-purple-400">{c.draw_count}× drawn</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 🔗 Footer */}
        <footer className="text-center mt-12">
          <Link
            href="/cards"
            className="inline-block px-6 py-3 rounded-lg bg-purple-800/60 border border-purple-600 text-yellow-300 hover:border-yellow-400 hover:scale-[1.05] transition"
          >
            🃏 Explore All Cards
          </Link>
        </footer>
      </article>
    </>
  );
}

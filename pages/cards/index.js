
import { supabase } from '@/lib/supabaseClient';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export async function getStaticProps() {
  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .order('id');

  // Join with stats if available
  const { data: stats } = await supabase
    .from('card_stats')
    .select('card_id, draw_count, last_drawn');

  const statsMap = {};
  stats?.forEach((s) => (statsMap[s.card_id] = s));

  const enrichedCards = cards?.map((c) => ({
    ...c,
    draw_count: statsMap[c.id]?.draw_count || 0,
    last_drawn: statsMap[c.id]?.last_drawn || null,
  }));

  return {
    props: { cards: enrichedCards || [] },
    revalidate: 3600,
  };
}

export default function CardsIndex({ cards }) {
  const [search, setSearch] = useState('');
  const filtered = cards.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Tarot Cards | Free Spirit Tarot",
    "description": "Browse the complete tarot deck with meanings, symbols, and draw statistics.",
    "url": "https://fstarot.com/cards"
  };

  return (
    <>
      <Head>
        <title>Tarot Cards | Free Spirit Tarot</title>
        <meta
          name="description"
          content="Explore every tarot card with its meaning, symbolism, and live reading stats."
        />
        <link rel="canonical" href="https://fstarot.com/cards" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="max-w-6xl mx-auto py-12 space-y-12">
        {/* 🪶 Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-yellow-300 mb-3">🃏 The Tarot Deck</h1>
          <p className="text-purple-300">
            Explore the entire deck and discover meanings, themes, and live draw stats.
          </p>

          <div className="mt-6 flex justify-center">
            <input
              type="text"
              placeholder="Search cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-purple-800/40 border border-purple-600 text-yellow-200 px-4 py-2 rounded-lg w-64 focus:outline-none focus:border-yellow-400"
            />
          </div>
        </header>

        {/* 🧙‍♀️ Cards Grid */}
        <section className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((card) => (
            <Link
              key={card.id}
              href={'/card/' + card.name.toLowerCase().replace(/\s+/g, '-')}
              className="group block p-4 bg-purple-900/40 rounded-lg border border-purple-700 hover:border-yellow-300 hover:scale-[1.03] transition"
            >
              <img
                src={card.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
                alt={card.name}
                className="w-full h-48 object-cover rounded-md mb-3 border-2 border-purple-700 group-hover:border-yellow-300"
              />
              <h3 className="text-yellow-300 font-semibold text-lg mb-1">
                {card.name}
              </h3>
              <p className="text-sm text-purple-300 mb-2">{card.category}</p>
              <p className="text-xs text-purple-400 italic line-clamp-2">
                {card.meaning}
              </p>
              <div className="text-xs text-purple-400 mt-2">
                <span>Drawn {card.draw_count}×</span>
                {card.last_drawn && (
                  <span className="block text-[11px] text-purple-500">
                    Last drawn: {new Date(card.last_drawn).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </section>

        {/* 📊 Summary */}
        <footer className="text-center mt-12">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg bg-purple-800/60 border border-purple-600 text-yellow-300 hover:border-yellow-400 hover:scale-[1.05] transition"
          >
            🪶 Back to Home
          </Link>
        </footer>
      </div>
    </>
  );
}

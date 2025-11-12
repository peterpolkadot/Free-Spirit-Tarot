
import { supabase } from '@/lib/supabaseClient';
import Head from 'next/head';
import Link from 'next/link';

export async function getStaticProps() {
  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .order('id', { ascending: true });
  return { props: { cards }, revalidate: 86400 };
}

export default function CardsPage({ cards }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Tarot Card Meanings – Free Spirit Tarot",
    "description": "Explore all 78 tarot cards with meanings, symbolism, and imagery.",
    "url": "https://fstarot.com/cards",
  };

  return (
    <>
      <Head>
        <title>Tarot Cards – Full Deck Meanings & Symbolism | Free Spirit Tarot</title>
        <meta name="description" content="Discover all 78 tarot cards with meanings, symbolism, and imagery. Explore each Major and Minor Arcana card in depth." />
        <link rel="canonical" href="https://fstarot.com/cards" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <article className="max-w-7xl mx-auto py-12 px-6">
        <header className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-yellow-300">🃏 All Tarot Cards</h1>
          <p className="text-purple-200 max-w-3xl mx-auto">
            Explore the complete deck — Major and Minor Arcana, cups, swords, wands, and pentacles. Each card tells a story.
          </p>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={'/card/' + card.name.toLowerCase().replace(/\s+/g, '-')}
              className="group relative bg-purple-900/40 border border-purple-700 rounded-lg p-3 hover:border-yellow-300 transition"
            >
              <img
                src={card.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
                alt={card.name}
                className="w-full h-48 object-contain rounded-md mb-2 transition-transform group-hover:scale-105"
              />
              <div className="text-center">
                <h2 className="text-yellow-300 font-semibold text-sm">{card.name}</h2>
                <p className="text-xs text-purple-400">{card.category}</p>
              </div>
            </Link>
          ))}
        </section>

        <footer className="text-center mt-16">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-purple-800/60 border border-purple-600 rounded-lg text-yellow-300 hover:border-yellow-400 hover:scale-[1.05] transition"
          >
            🔮 Return to Readers
          </Link>
        </footer>
      </article>
    </>
  );
}

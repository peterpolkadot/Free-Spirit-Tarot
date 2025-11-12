
import { supabase } from '@/lib/supabaseClient';
import Head from 'next/head';
import Link from 'next/link';

export async function getServerSideProps({ params }) {
  const cardName = params.slug.replace(/-/g, ' ');

  // 🔍 Fetch card safely
  const { data: card, error: cardError } = await supabase
    .from('cards')
    .select('*')
    .ilike('name', cardName)
    .maybeSingle(); // SAFE

  if (!card || cardError) return { notFound: true };

  // 📊 Fetch stats
  const { data: stats } = await supabase
    .from('card_stats')
    .select('reader, card_name, draw_count, last_drawn')
    .eq('card_name', card.name)
    .order('draw_count', { ascending: false })
    .limit(10);

  // 👤 Load readers
  let readers = [];
  if (stats?.length) {
    const aliases = stats.map((s) => s.reader);
    const { data: readerData } = await supabase
      .from('readers')
      .select('name, alias, emoji, image_url')
      .in('alias', aliases);
    readers = readerData || [];
  }

  return {
    props: {
      card,
      stats: stats || [],
      readers,
    },
  };
}

export default function CardPage({ card, stats, readers }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": card.name,
    "description": card.meaning,
    "image": card.image_url,
    "about": [
      { "@type": "Thing", "name": card.category },
      { "@type": "Thing", "name": card.theme },
    ],
    "url": `https://fstarot.com/card/${card.name.toLowerCase().replace(/\s+/g, '-')}`,
  };

  const readerMap = {};
  stats.forEach((s) => {
    const r = readers.find((x) => x.alias === s.reader);
    if (r) readerMap[s.reader] = r;
  });

  return (
    <>
      <Head>
        <title>{card.name} – Tarot Card Meaning | Free Spirit Tarot</title>
        <meta name="description" content={card.meaning} />
        <link
          rel="canonical"
          href={`https://fstarot.com/card/${card.name.toLowerCase().replace(/\s+/g, '-')}`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>

      <article className="max-w-5xl mx-auto py-12 space-y-16">

        {/* Header */}
        <header className="text-center space-y-4">
          <img
            src={card.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
            alt={card.name}
            className="w-52 h-80 mx-auto rounded-md border-4 border-purple-700 shadow-xl"
          />
          <h1 className="text-4xl font-bold text-yellow-300">{card.name}</h1>
          <p className="text-purple-300 italic">{card.category}</p>
        </header>

        {/* Meaning */}
        <section className="space-y-6 text-purple-200 leading-relaxed">
          <h2 className="text-2xl font-semibold text-yellow-300">Meaning</h2>
          <p>{card.meaning}</p>

          {card.positive && (
            <>
              <h3 className="text-xl font-semibold text-green-300">Positive Aspects</h3>
              <p>{card.positive}</p>
            </>
          )}

          {card.negative && (
            <>
              <h3 className="text-xl font-semibold text-red-300">Challenges</h3>
              <p>{card.negative}</p>
            </>
          )}

          {card.symbolism && (
            <>
              <h3 className="text-xl font-semibold text-yellow-300">Symbolism</h3>
              <p>{card.symbolism}</p>
            </>
          )}
        </section>

        {/* Stats */}
        {stats?.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-yellow-300 text-center mb-6">
              📈 Card Draw Stats
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-purple-300 border border-purple-700 rounded-lg overflow-hidden">
                <thead className="bg-purple-800/60 text-yellow-300">
                  <tr>
                    <th className="py-2 px-3 text-left">Reader</th>
                    <th className="py-2 px-3 text-left">Draw Count</th>
                    <th className="py-2 px-3 text-left">Last Drawn</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => {
                    const r = readerMap[s.reader];
                    return (
                      <tr key={s.reader} className="border-t border-purple-700">
                        <td className="py-2 px-3">
                          {r ? (
                            <Link
                              href={'/reader/' + r.alias}
                              className="flex items-center gap-2 hover:text-yellow-300"
                            >
                              <img
                                src={r.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
                                alt={r.name}
                                className="w-8 h-8 rounded-full border border-purple-600"
                              />
                              <span>{r.emoji || '🔮'} {r.name}</span>
                            </Link>
                          ) : (
                            s.reader
                          )}
                        </td>
                        <td className="py-2 px-3">{s.draw_count}</td>
                        <td className="py-2 px-3">
                          {s.last_drawn ? new Date(s.last_drawn).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center mt-12">
          <Link
            href="/cards"
            className="inline-block px-6 py-3 rounded-lg bg-purple-800/60 border border-purple-600 text-yellow-300 hover:border-yellow-400 hover:scale-[1.05] transition"
          >
            🃏 Back to All Cards
          </Link>
        </footer>

      </article>
    </>
  );
}

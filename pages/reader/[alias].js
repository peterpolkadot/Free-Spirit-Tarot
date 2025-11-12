
import { supabase } from '@/lib/supabaseClient';
import Head from 'next/head';
import Link from 'next/link';
import AskReader from '@/components/AskReader';

export async function getStaticPaths() {
  const { data } = await supabase.from('readers').select('alias');
  return {
    paths: data?.map((r) => ({ params: { alias: r.alias } })) || [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
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

  // Reader summary
  const { data: summary } = await supabase
    .from('reader_summary')
    .select('*')
    .eq('reader_alias', reader.alias)
    .single();

  return {
    props: { reader, cardStats: cardStats || [], summary: summary || null },
    revalidate: 3600,
  };
}

export default function ReaderPage({ reader, cardStats, summary }) {
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

        {/* 🧮 Stats Overview */}
        {summary && (
          <section className="text-center space-y-4">
            <h2 className="text-2xl text-yellow-300 font-semibold">📊 Reader Stats</h2>
            <div className="flex justify-center gap-6 text-purple-200">
              <div>
                <span className="text-3xl text-yellow-300 font-bold">
                  {summary.total_readings || 0}
                </span>
                <p className="text-sm">Total Readings</p>
              </div>
              <div>
                <span className="text-3xl text-yellow-300 font-bold">
                  {summary.unique_users || 0}
                </span>
                <p className="text-sm">Unique Seekers</p>
              </div>
              <div>
                <span className="text-3xl text-yellow-300 font-bold">
                  {summary.avg_cards_per_reading || 0}
                </span>
                <p className="text-sm">Avg Cards / Reading</p>
              </div>
            </div>
          </section>
        )}

        {/* 🃏 Top Cards */}
        {cardStats?.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-yellow-300 mb-6 text-center">
              🃏 Most Drawn Cards
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {cardStats.map((c) => (
                <Link
                  key={c.card_name}
                  href={'/card/' + c.card_name.toLowerCase().replace(/\s+/g, '-')}
                  className="p-5 bg-purple-900/40 border border-purple-700 rounded-lg hover:border-yellow-300 hover:scale-[1.03] transition block text-center"
                >
                  <img
                    src={c.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
                    alt={c.card_name}
                    className="w-24 h-36 object-cover mx-auto rounded-md mb-3 border-2 border-purple-700"
                  />
                  <h3 className="text-yellow-300 font-semibold">{c.card_name}</h3>
                  <p className="text-xs text-purple-400 mt-1 italic">
                    {c.category}
                  </p>
                  <p className="text-xs text-purple-400">
                    Drawn {c.draw_count}×
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 💬 Ask Reader */}
        <AskReader reader={reader} />

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

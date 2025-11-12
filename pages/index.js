
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Head from 'next/head';

export async function getStaticProps() {
  // Fetch categories
  const { data: categories } = await supabase.from('categories').select('*');

  // Fetch top readers leaderboard (limit 3)
  const { data: topReaders } = await supabase
    .from('top_readers')
    .select('*')
    .order('total_readings', { ascending: false })
    .limit(3);

  // Fetch newest readers
  const { data: newReaders } = await supabase
    .from('readers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  return {
    props: { categories, topReaders, newReaders },
    revalidate: 86400,
  };
}

export default function Home({ categories, topReaders, newReaders }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Free Spirit Tarot",
    "url": "https://fstarot.com",
    "description": "AI-powered tarot readers offering personalized spiritual guidance and tarot card readings.",
    "sameAs": []
  };

  return (
    <>
      <Head>
        <title>Free Spirit Tarot - AI Tarot Readers for Spiritual Guidance</title>
        <meta name="description" content="Discover AI-powered tarot readers offering personalized spiritual guidance. Choose from mystical, traditional, and modern reading styles." />
        <meta name="keywords" content="tarot reading, AI tarot, spiritual guidance, tarot readers, online tarot, free tarot" />
        <meta property="og:title" content="Free Spirit Tarot - AI Tarot Readers" />
        <meta property="og:description" content="Discover unique AI-powered tarot readers offering personalized spiritual guidance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fstarot.com" />
        <meta property="og:site_name" content="Free Spirit Tarot" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Spirit Tarot - AI Tarot Readers" />
        <meta name="twitter:description" content="Discover AI-powered tarot readers offering personalized spiritual guidance." />
        <link rel="canonical" href="https://fstarot.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="space-y-16">
        {/* 🪶 Categories Section */}
        <section>
          <h1 className="text-4xl mb-8 text-center font-bold text-yellow-300">
            🪶 Discover Your Path
          </h1>
          <div className="grid md:grid-cols-3 gap-6">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={'/' + cat.slug}
                className="block p-6 bg-purple-900/40 rounded-lg border border-purple-700 hover:scale-[1.03] transition"
              >
                <h3 className="text-xl text-yellow-300">
                  {cat.emoji || '🃏'} {cat.category_name}
                </h3>
                <p className="text-sm text-purple-200">{cat.vibe}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 🌟 Top Readers Leaderboard */}
        <section>
          <h2 className="text-3xl mb-8 text-center font-bold text-yellow-300">
            🌟 Top Readers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {topReaders?.map((r) => (
              <Link
                key={r.reader_id}
                href={'/reader/' + r.reader_alias}
                className="block p-6 bg-purple-900/40 rounded-lg border border-purple-700 hover:scale-[1.03] transition text-center"
              >
                <img
                  src={r.reader_image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
                  alt={r.reader_name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-purple-700 object-cover shadow-md"
                />
                <h3 className="text-xl text-yellow-300 mb-2">
                  {r.reader_emoji || '🔮'} {r.reader_name}
                </h3>
                <p className="text-sm text-purple-200">{r.reader_category}</p>
                <p className="text-xs text-purple-400 mt-1">
                  {r.total_readings} readings
                </p>
              </Link>
            ))}
          </div>

          {/* 🌙 New Readers */}
          <h3 className="text-2xl mt-14 mb-6 text-center font-semibold text-yellow-300">
            🌙 New Readers
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {newReaders?.map((r) => (
              <Link
                key={r.id}
                href={'/reader/' + r.alias}
                className="p-6 bg-purple-900/40 rounded-lg border border-purple-700 hover:scale-[1.03] transition block text-center"
              >
                <img
                  src={r.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
                  alt={r.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-purple-700 object-cover shadow-md"
                />
                <h3 className="text-xl text-yellow-300">
                  {r.emoji || '🔮'} {r.name}
                </h3>
                <p className="text-sm text-purple-200">{r.category}</p>
                <p className="text-xs text-purple-400 mt-1 italic">{r.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

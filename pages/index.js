
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export async function getStaticProps() {
  // Fetch categories
  const { data: categories } = await supabase.from('categories').select('*');

  // Fetch top readers leaderboard
  const { data: topReaders } = await supabase.from('top_readers').select('*');

  return { props: { categories, topReaders } };
}

export default function Home({ categories, topReaders }) {
  return (
    <div className="space-y-12">
      {/* 🌟 Top Readers Leaderboard */}
      <section>
        <h1 className="text-4xl mb-8 text-center font-bold text-yellow-300">
          🌟 Top Readers
        </h1>
        <div className="grid md:grid-cols-3 gap-6">
          {topReaders?.map((r) => (
            <Link
              key={r.reader_id}
              href={'/reader/' + r.reader_alias}
              className="block p-6 bg-purple-900/40 rounded-lg border border-purple-700 hover:scale-[1.03] transition"
            >
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
      </section>

      {/* 🃏 Categories */}
      <section>
        <h2 className="text-3xl mb-6 text-center font-bold text-yellow-300">
          Choose a Category
        </h2>
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
    </div>
  );
}

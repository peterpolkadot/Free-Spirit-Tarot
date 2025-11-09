
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export async function getStaticProps() {
  // 🪶 Fetch both categories and top readers
  const { data: categories } = await supabase.from('categories').select('*');
  const { data: topReaders } = await supabase.from('top_readers').select('*');
  return { props: { categories, topReaders } };
}

export default function Home({ categories, topReaders }) {
  return (
    <div>
      {/* 🌟 Category header */}
      <h1 className="text-4xl mb-8 text-center font-bold text-yellow-300">
        Choose a Category
      </h1>

      {/* 🃏 Category grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {categories?.map(cat => (
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

      {/* ✨ Most Popular Readers */}
      {topReaders?.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-yellow-300 text-center mb-6">
            ✨ Most Popular Readers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {topReaders.map(r => (
              <Link
                key={r.reader_id}
                href={'/reader/' + r.reader_alias}
                className="block p-6 bg-purple-900/40 rounded-lg border border-purple-700 text-center hover:scale-[1.03] transition"
              >
                <p className="text-4xl mb-2">
                  {r.reader_emoji || '🔮'}
                </p>
                <p className="text-xl text-yellow-300 font-semibold mb-1">
                  {r.reader_name}
                </p>
                <p className="text-purple-300 text-sm mb-1">
                  {r.total_readings} readings
                </p>
                <p className="text-xs text-purple-400">
                  {r.last_reading
                    ? `Last reading: ${new Date(r.last_reading).toLocaleDateString()}`
                    : 'No readings yet'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

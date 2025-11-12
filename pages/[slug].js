
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Head from 'next/head';

export async function getStaticPaths() {
  const { data } = await supabase.from('categories').select('slug');
  return {
    paths: data?.map((c) => ({ params: { slug: c.slug } })) || [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!category) return { notFound: true };

  const { data: readers } = await supabase
    .from('readers')
    .select('*')
    .eq('category', category.category_name)
    .order('name');

  return { props: { category, readers }, revalidate: 86400 };
}

export default function CategoryPage({ category, readers }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.category_name} Tarot Readers | Free Spirit Tarot`,
    "description": category.description,
    "url": `https://fstarot.com/${category.slug}`,
  };

  return (
    <>
      <Head>
        <title>{category.category_name} Tarot Readers | Free Spirit Tarot</title>
        <meta name="description" content={category.description} />
        <link rel="canonical" href={`https://fstarot.com/${category.slug}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="space-y-16">
        {/* 🪶 Category Header */}
        <section className="text-center">
          <h1 className="text-4xl font-bold text-yellow-300 mb-4">
            {category.emoji || '🔮'} {category.category_name}
          </h1>
          {category.vibe && (
            <p className="text-lg text-purple-200 mb-4">{category.vibe}</p>
          )}
          {category.description && (
            <p className="text-purple-300 max-w-3xl mx-auto">
              {category.description}
            </p>
          )}
        </section>

        {/* 🧙‍♀️ Readers Grid */}
        <section>
          <h2 className="text-3xl font-bold text-yellow-300 text-center mb-10">
            Meet Your {category.category_name} Readers
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {readers?.map((reader) => (
              <Link
                key={reader.id}
                href={'/reader/' + reader.alias}
                className="group relative p-6 bg-purple-900/40 rounded-2xl border border-purple-700 hover:border-yellow-300 hover:shadow-lg hover:scale-[1.03] transition"
              >
                <img
                  src={reader.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
                  alt={reader.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-purple-700 object-cover shadow-md group-hover:border-yellow-300"
                />
                <h3 className="text-xl text-yellow-300 text-center mb-1">
                  {reader.emoji || '🔮'} {reader.name}
                </h3>
                <p className="text-sm text-purple-200 text-center mb-2 italic">
                  {reader.tagline}
                </p>
                <p className="text-xs text-purple-400 text-center">
                  {reader.specialty || 'Tarot Reader'}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* 🃏 Footer Navigation */}
        <footer className="text-center mt-20">
          <Link
            href="/cards"
            className="inline-block px-6 py-3 rounded-lg bg-purple-800/60 border border-purple-600 text-yellow-300 hover:border-yellow-400 hover:scale-[1.05] transition"
          >
            🃏 View All Tarot Cards
          </Link>
        </footer>
      </div>
    </>
  );
}

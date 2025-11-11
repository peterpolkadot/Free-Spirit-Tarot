
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Head from 'next/head';

export async function getStaticPaths() {
  const { data } = await supabase.from('categories').select('slug');
  return { 
    paths: data?.map(c => ({ params: { slug: c.slug } })) || [], 
    fallback: 'blocking' 
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

  return {
    props: { category, readers },
    revalidate: 86400,
  };
}

export default function CategoryPage({ category, readers }) {
  const pageTitle = `${category.category_name} Tarot Readers | Free Spirit Tarot`;
  const pageDescription = category.description || `Discover ${category.category_name} tarot readers. ${category.vibe}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${category.category_name}, tarot readers, tarot reading, spiritual guidance`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://fstarot.com/${category.slug}`} />
        <meta property="og:site_name" content="Free Spirit Tarot" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href={`https://fstarot.com/${category.slug}`} />
      </Head>

      <div className="space-y-16">
        {/* 🪶 Category Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-300 mb-4">
            {category.emoji || '🔮'} {category.category_name}
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            {category.vibe}
          </p>
          {category.description && (
            <p className="text-purple-300 mt-4 max-w-3xl mx-auto">
              {category.description}
            </p>
          )}
        </div>

        {/* ✨ Reader Cards */}
        <div>
          <h2 className="text-3xl font-bold text-yellow-300 text-center mb-10">
            Meet Your {category.category_name} Readers
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {readers?.map(reader => (
              <Link
                key={reader.id}
                href={'/reader/' + reader.alias}
                className="group relative p-6 bg-purple-900/40 rounded-2xl border border-purple-700 hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-400/10 transition-all duration-300 text-center overflow-hidden"
              >
                {/* Reader Image */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <img
                    src={reader.image_url || 'https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png'}
                    alt={reader.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-purple-700 group-hover:scale-105 group-hover:border-yellow-300 transition-transform duration-300 shadow-md"
                  />
                  <div className="absolute inset-0 rounded-full bg-yellow-300/0 group-hover:bg-yellow-300/10 transition-all duration-300"></div>
                </div>

                {/* Reader Info */}
                <h3 className="text-xl font-semibold text-yellow-300 mb-1 group-hover:text-yellow-200">
                  {reader.emoji || '🔮'} {reader.name}
                </h3>
                <p className="text-sm text-purple-200 mb-2">{reader.tagline}</p>

                {reader.specialty && (
                  <p className="text-xs text-purple-400 italic">
                    ✨ {reader.specialty}
                  </p>
                )}
                {reader.best_for && (
                  <p className="text-xs text-purple-400 mt-1">
                    🎯 {reader.best_for}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* 💤 No Readers Fallback */}
        {(!readers || readers.length === 0) && (
          <div className="text-center text-purple-300 py-12">
            <p className="text-lg mb-4">
              🌙 New readers are being summoned to this realm...
            </p>
            <Link 
              href="/" 
              className="text-yellow-300 hover:text-yellow-200 underline mt-4 inline-block"
            >
              ← Return Home
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

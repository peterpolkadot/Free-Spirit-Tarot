
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Head from 'next/head';

// ⭐ Helper to generate category schema
function getCategorySchemaMarkup(category, readers) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.category_name} Tarot Readers`,
    description: category.description || category.vibe,
    url: `https://fstarot.com/${category.slug}`,
    about: {
      '@type': 'Thing',
      name: 'Tarot Reading',
      description: category.vibe,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: readers?.map((reader, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Person',
          name: reader.name,
          url: `https://fstarot.com/reader/${reader.alias}`,
          description: reader.tagline,
        },
      })) || [],
    },
  };
}

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
  // ⭐ SEO: Generate schema and metadata
  const schemaMarkup = getCategorySchemaMarkup(category, readers);
  const pageTitle = `${category.category_name} Tarot Readers | Free Spirit Tarot`;
  const pageDescription = category.description || `Discover ${category.category_name} tarot readers. ${category.vibe}`;
  
  return (
    <>
      {/* ⭐ SEO: Meta tags and schema */}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      </Head>
      
      <div className="space-y-12">
        {/* Category Header */}
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

        {/* Category Details Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Ideal For */}
          {category.ideal_for && (
            <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                ✨ Perfect For
              </h3>
              <p className="text-purple-200 text-sm">
                {category.ideal_for}
              </p>
            </div>
          )}

          {/* Reading Approach */}
          {category.reading_approach && (
            <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                🎯 Reading Style
              </h3>
              <p className="text-purple-200 text-sm">
                {category.reading_approach}
              </p>
            </div>
          )}

          {/* Popular Spreads */}
          {category.typical_spreads && (
            <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                🃏 Popular Spreads
              </h3>
              <p className="text-purple-200 text-sm">
                {category.typical_spreads}
              </p>
            </div>
          )}
        </div>

        {/* Personality Range & Visual Aesthetic */}
        {(category.personality_range || category.visual_aesthetic) && (
          <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-700/50 rounded-xl p-8 max-w-4xl mx-auto">
            {category.personality_range && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                  🎭 Reader Personalities
                </h3>
                <p className="text-purple-200">
                  {category.personality_range}
                </p>
              </div>
            )}
            {category.visual_aesthetic && (
              <div>
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                  🎨 Visual Aesthetic
                </h3>
                <p className="text-purple-200">
                  {category.visual_aesthetic}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Readers Grid */}
        <div>
          <h2 className="text-3xl font-bold text-yellow-300 text-center mb-8">
            Meet Your {category.category_name} Readers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {readers?.map(reader => (
              <Link
                key={reader.id}
                href={'/reader/' + reader.alias}
                className="block p-6 bg-purple-900/40 rounded-lg border border-purple-700 hover:scale-[1.03] transition group"
              >
                <h3 className="text-xl font-semibold text-yellow-300 mb-2 group-hover:text-yellow-200">
                  {reader.emoji || '🔮'} {reader.name}
                </h3>
                <p className="text-sm text-purple-200 mb-3">{reader.tagline}</p>
                {reader.specialty && (
                  <p className="text-xs text-purple-400">
                    ✨ Specialty: {reader.specialty}
                  </p>
                )}
                {reader.best_for && (
                  <p className="text-xs text-purple-400 mt-1">
                    🎯 Best For: {reader.best_for}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* No Readers Message */}
        {(!readers || readers.length === 0) && (
          <div className="text-center text-purple-300 py-12">
            <p className="text-lg">
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

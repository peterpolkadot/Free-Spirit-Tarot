
import { supabase } from '@/lib/supabaseClient';
import Head from 'next/head';
import Link from 'next/link';

export async function getStaticPaths() {
  const { data: categories } = await supabase.from('categories').select('slug');
  const paths = (categories || []).map(cat => ({ params: { slug: cat.slug } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { data: category } = await supabase.from('categories').select('*').eq('slug', params.slug).single();
  const { data: readers } = await supabase.from('readers').select('*').eq('category', category.category_name);
  return { props: { category, readers: readers || [] }, revalidate: 60 };
}

export default function CategoryPage({ category, readers }) {
  return (
    <>
      <Head>
        <title>{category.category_name} | Free Spirit Tarot 🔮</title>
        <meta name="description" content={category.vibe || 'Discover tarot readers by category.'} />
      </Head>
      <div className="text-center mt-12">
        <h1 className="text-4xl font-bold text-yellow-300 mb-6">{category.category_name}</h1>
        <p className="text-purple-200 mb-8">{category.vibe}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readers.map(r => (
            <Link key={r.id} href={`/reader/${r.alias}`} className="block bg-purple-900/40 p-6 rounded-lg border border-purple-700 hover:scale-[1.03] transition">
              <h3 className="text-xl font-semibold text-yellow-300 mb-1">{r.name}</h3>
              <p className="text-purple-300 text-sm">{r.tagline}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
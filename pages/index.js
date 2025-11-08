
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export async function getStaticProps() {
  const { data: categories } = await supabase.from('categories').select('*').order('id');
  return { props: { categories: categories || [] }, revalidate: 60 };
}

export default function Home({ categories }) {
  return (
    <>
      <Head>
        <title>Free Spirit Tarot 🔮</title>
        <meta name="description" content="Connect with AI tarot readers for guidance and spiritual insight." />
      </Head>
      <section className="text-center mt-16">
        <h1 className="text-5xl font-bold text-white mb-4">🔮 Free Spirit Tarot</h1>
        <p className="text-xl text-purple-200 mb-10">Connect with AI tarot readers for insight and wisdom.</p>
      </section>
      <section id="categories" className="mt-20">
        <h2 className="text-3xl font-bold text-yellow-300 mb-8 text-center">Browse by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(cat => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="block p-6 rounded-lg bg-purple-900/40 border border-purple-700 hover:scale-[1.03] transition">
              <h3 className="text-xl font-semibold text-yellow-300 mb-2">{cat.category_name}</h3>
              <p className="text-purple-300 text-sm">{cat.vibe}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
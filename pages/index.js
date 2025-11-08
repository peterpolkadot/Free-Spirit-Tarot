
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export async function getStaticProps() {
  const { data: categories } = await supabase.from('categories').select('*');
  return { props: { categories } };
}
export default function Home({ categories }) {
  return (
    <div>
      <h1 className="text-4xl mb-8 text-center font-bold text-yellow-300">Choose a Category</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {categories?.map(cat => (
          <Link key={cat.id} href={`/category/${cat.slug}`} className="block p-6 bg-purple-900/40 rounded-lg border border-purple-700 hover:scale-[1.03] transition">
            <h3 className="text-xl text-yellow-300">{cat.category_name}</h3>
            <p className="text-sm text-purple-200">{cat.vibe}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
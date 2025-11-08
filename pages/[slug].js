
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export async function getStaticPaths() {
  const { data } = await supabase.from('categories').select('slug');
  return { paths: data?.map(c => ({ params: { slug: c.slug } })) || [], fallback: 'blocking' };
}
export async function getStaticProps({ params }) {
  const { data: category } = await supabase.from('categories').select('*').eq('slug', params.slug).single();
  if (!category) return { notFound: true };
  const { data: readers } = await supabase.from('readers').select('*').eq('category', category.category_name);
  return { props: { category, readers } };
}

export default function CategoryPage({ category, readers }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-yellow-300 mb-6">
        {category.emoji || '🔮'} {category.category_name}
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        {readers?.map(r => (
          <Link key={r.id} href={`/reader/${r.alias}`} className="block bg-purple-900/40 p-6 rounded-lg border border-purple-700 hover:scale-[1.03] transition">
            <h3 className="text-xl text-yellow-300 mb-2">{r.emoji || category.emoji || '🔮'} {r.name}</h3>
            <p className="text-sm text-purple-200">{r.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
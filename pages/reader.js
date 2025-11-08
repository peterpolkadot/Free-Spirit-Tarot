
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export async function getStaticProps() {
  const { data: readers } = await supabase.from('readers').select('*').order('name', { ascending: true });
  return { props: { readers } };
}
export default function ReadersPage({ readers }) {
  return (
    <div>
      <h1 className="text-4xl font-bold text-yellow-300 text-center mb-8">Our Readers</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {readers?.map(r => (
          <Link key={r.id} href={'/reader/' + r.alias} className="block p-6 bg-purple-900/40 rounded-lg border border-purple-700 hover:scale-[1.03] transition">
            <h3 className="text-xl text-yellow-300 mb-2">{r.emoji || '🔮'} {r.name}</h3>
            <p className="text-sm text-purple-200 mb-1">{r.tagline}</p>
            <p className="text-xs text-purple-400">{r.category}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
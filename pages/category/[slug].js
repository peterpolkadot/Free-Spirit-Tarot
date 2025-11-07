import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import HeadMeta from '../../components/HeadMeta';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function CategoryPage() {
  const { slug } = useRouter().query;
  const [category, setCategory] = useState(null);
  const [readers, setReaders] = useState([]);

  useEffect(() => {
    if (!slug) return;
    const supabase = getSupabase();
    async function fetchData() {
      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single();
      setCategory(cat);
      const { data: readerList } = await supabase.from('readers').select('*').eq('category', cat.category_name);
      setReaders(readerList || []);
    }
    fetchData();
  }, [slug]);

  if (!category) return <Layout><p className="text-white">Loading...</p></Layout>;

  const seoTitle = `${category.emoji} ${category.category_name}`;
  const seoDesc = category.description || 'Discover unique tarot readers in this category.';

  return (
    <Layout>
      <HeadMeta title={seoTitle} description={seoDesc} />
      <Breadcrumbs category={category} />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">{category.emoji} {category.category_name}</h1>
          <p className="text-lg text-purple-200">{category.description}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readers.map(reader => (
            <a key={reader.id} href={`/reader/${reader.alias}`} className="block bg-gradient-to-br from-purple-800 to-indigo-800 border-2 border-purple-500 rounded-xl p-6 hover:shadow-2xl hover:scale-105 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{reader.emoji}</span>
                <h2 className="text-xl font-bold text-white">{reader.name}</h2>
              </div>
              <p className="text-sm text-purple-200 italic mb-2">{reader.tagline}</p>
              <p className="text-xs text-purple-300 mb-2">{reader.specialty}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {reader.tags && reader.tags.split(',').slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-xs bg-purple-600 text-purple-100 px-2 py-1 rounded-full">{tag.trim()}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}
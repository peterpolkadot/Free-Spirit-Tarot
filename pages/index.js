
import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import HeadMeta from '../components/HeadMeta';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const supabase = getSupabase();

    async function fetchData() {
      const { data: cats } = await supabase.from('categories').select('*').order('id');
      setCategories(cats || []);

      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        setTrending(json.trending || []);
      } catch {}
    }

    fetchData();
  }, []);

  return (
    <Layout>
      <HeadMeta />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🔮 Free Spirit Tarot
          </h1>
          <p className="text-xl text-purple-200">
            Connect with AI tarot readers for guidance and insight
          </p>
        </div>

        {trending.length > 0 && (
          <div className="bg-purple-800 bg-opacity-50 rounded-xl p-6 mb-8 border border-purple-600">
            <h2 className="text-2xl font-bold text-white mb-4">🔥 Trending Readers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.slice(0, 6).map(t => (
                
                  key={t.reader_alias}
                  href={`/reader/${t.reader_alias}`}
                  className="bg-purple-900 bg-opacity-50 border border-purple-500 rounded-lg p-4 hover:bg-purple-700 transition"
                >
                  <p className="text-white font-semibold mb-1">{t.reader_alias}</p>
                  <p className="text-xs text-purple-300">{t.readings_24h} readings • {t.users_24h} users</p>
                </a>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-3xl font-bold text-white mb-6">Browse by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="block bg-gradient-to-br from-purple-800 to-indigo-800 border-2 border-purple-500 rounded-xl p-6 hover:shadow-2xl hover:scale-105 transition-all"
            >
              <div className="text-4xl mb-3">{cat.emoji}</div>
              <h3 className="text-xl font-bold text-white mb-2">{cat.category_name}</h3>
              <p className="text-sm text-purple-200">{cat.description}</p>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}

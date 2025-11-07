import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import ReadingInterface from '../../components/ReadingInterface';
import HeadMeta from '../../components/HeadMeta';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function ReaderPage() {
  const { slug } = useRouter().query;
  const [reader, setReader] = useState(null);
  const [category, setCategory] = useState(null);
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const supabase = getSupabase();
    async function fetchReaderData() {
      const { data: readerData } = await supabase.from('readers').select('*').eq('alias', slug).single();
      if (!readerData) return;
      setReader(readerData);
      const { data: cat } = await supabase.from('categories').select('*').eq('category_name', readerData.category).single();
      setCategory(cat);
      try {
        const res = await fetch('/api/analytics?readerAlias=' + slug);
        const json = await res.json();
        setActivity(json.stats || null);
      } catch {}
    }
    fetchReaderData();
  }, [slug]);

  if (!reader) return <Layout><p className="text-white">Loading...</p></Layout>;

  const seoTitle = `${reader.emoji || '🔮'} ${reader.name} — AI Tarot Reader`;
  const seoDesc = reader.tagline || reader.description || 'Get a tarot reading from this intuitive AI reader.';
  const seoImage = reader.image_url || '/default-og.png';
  const seoUrl = `https://fstarot.com.au/reader/${reader.alias}`;

  return (
    <Layout>
      <HeadMeta title={seoTitle} description={seoDesc} image={seoImage} url={seoUrl} />
      <Breadcrumbs category={category} />
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{reader.emoji}</span>
          <div>
            <h1 className="text-4xl font-bold text-white">{reader.name}</h1>
            <p className="text-purple-200">{reader.persona}</p>
          </div>
        </div>
        <p className="text-lg text-purple-100 italic mb-4">{reader.tagline}</p>
        {activity && (
          <div className="flex items-center gap-4 mb-6 text-sm">
            <div className="bg-purple-600 text-white px-3 py-1 rounded-full font-medium">🔮 {activity.readings_24h} readings today</div>
            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full font-medium">👥 {activity.users_24h} seekers</div>
          </div>
        )}
        <div className="mb-6">
          <ReadingInterface readerAlias={reader.alias} readerName={reader.name} readerEmoji={reader.emoji} popularSpreads={reader.popular_spreads} />
        </div>
        <div className="bg-purple-800 bg-opacity-50 border-l-4 border-purple-400 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-2">About {reader.name}</h2>
          <p className="text-purple-100 mb-4">{reader.description}</p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-purple-200 mb-1">Specialty</h3>
              <p className="text-purple-100">{reader.specialty}</p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-200 mb-1">Reading Style</h3>
              <p className="text-purple-100">{reader.reading_style}</p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-200 mb-1">Best For</h3>
              <p className="text-purple-100">{reader.best_for}</p>
            </div>
            <div>
              <h3 className="font-semibold text-purple-200 mb-1">Popular Spreads</h3>
              <p className="text-purple-100">{reader.popular_spreads}</p>
            </div>
          </div>
        </div>
        <div className="bg-indigo-900 bg-opacity-30 border border-indigo-600 p-4 rounded-lg text-center">
          <p className="text-xs text-purple-300">⚠️ Readings are for entertainment and spiritual guidance purposes only. Free Spirit Tarot does not provide medical, legal, or financial advice.</p>
        </div>
      </div>
    </Layout>
  );
}

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import HeadMeta from '../../components/HeadMeta';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function SubcategoryPage() {
  const { slug } = useRouter().query;
  const [subcategory, setSubcategory] = useState(null);
  const [category, setCategory] = useState(null);
  const [bots, setBots] = useState([]);

  useEffect(() => {
    if (!slug) return;
    const supabase = getSupabase();

    async function fetchData() {
      const { data: sub } = await supabase.from('subcategories').select('*').eq('slug', slug).single();
      setSubcategory(sub);

      const { data: cat } = await supabase.from('categories').select('*').eq('id', sub.category_id).single();
      setCategory(cat);

      const { data: botList } = await supabase.from('bots').select('*').eq('subcategory_id', sub.id);
      setBots(botList || []);
    }

    fetchData();
  }, [slug]);

  if (!subcategory) return <Layout><p>Loading...</p></Layout>;

  const seoTitle = `${subcategory.emoji || '🤖'} ${subcategory.subcategory_name}`;
  const seoDesc = subcategory.description || 'Explore AI chatbots in this category.';

  return (
    <Layout>
      <HeadMeta title={seoTitle} description={seoDesc} />
      <Breadcrumbs category={category} subcategory={subcategory} />

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">{seoTitle}</h1>
        <p className="text-gray-600 mb-6">{subcategory.description}</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map(bot => (
            <a
              key={bot.id}
              href={`/bot/${bot.alias}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-1">{bot.emoji} {bot.name}</h2>
              <p className="text-gray-500 text-sm mb-2">{bot.tagline}</p>
              <p className="text-xs text-gray-400">{bot.voice_tone}</p>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}

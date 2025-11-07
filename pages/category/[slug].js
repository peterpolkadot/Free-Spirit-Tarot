
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import HeadMeta from '../../components/HeadMeta';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function CategoryPage() {
  const { slug } = useRouter().query;
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    if (!slug) return;
    const supabase = getSupabase();

    async function fetchData() {
      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single();
      setCategory(cat);

      const { data: subs } = await supabase.from('subcategories').select('*').eq('category_id', cat.id);
      setSubcategories(subs || []);
    }

    fetchData();
  }, [slug]);

  if (!category) return <Layout><p>Loading...</p></Layout>;

  const seoTitle = `${category.emoji} ${category.category_name}`;
  const seoDesc = category.description || 'Discover unique AI chatbot categories.';

  return (
    <Layout>
      <HeadMeta title={seoTitle} description={seoDesc} />
      <Breadcrumbs category={category} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">{seoTitle}</h1>
        <p className="text-gray-600 mb-6">{category.description}</p>

        <div className="grid md:grid-cols-2 gap-6">
          {subcategories.map(sub => (
            <a
              key={sub.id}
              href={`/subcategory/${sub.slug}`}
              className="block border border-gray-200 rounded-lg p-5 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-1">{sub.subcategory_name}</h2>
              <p className="text-gray-500 text-sm">{sub.description}</p>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}

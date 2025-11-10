import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function sitemap() {
  const baseUrl = 'https://fstarot.com';
  
  const { data: readers } = await supabase
    .from('readers')
    .select('alias, updated_at');
  
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at');
  
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];
  
  if (categories) {
    categories.forEach(cat => {
      routes.push({
        url: `${baseUrl}/${cat.slug}`,
        lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  }
  
  if (readers) {
    readers.forEach(reader => {
      routes.push({
        url: `${baseUrl}/reader/${reader.alias}`,
        lastModified: reader.updated_at ? new Date(reader.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  }
  
  return routes;
}

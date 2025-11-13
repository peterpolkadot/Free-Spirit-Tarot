
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const baseUrl = "https://fstarot.com";

  const { data: readers } = await supabase
    .from("readers")
    .select("alias, updated_at");

  const { data: categories } = await supabase
    .from("categories")
    .select("slug, updated_at");

  let urls = [];

  urls.push({
    url: baseUrl,
    lastmod: new Date().toISOString(),
  });

  if (categories) {
    categories.forEach(cat => {
      urls.push({
        url: `${baseUrl}/${cat.slug}`,
        lastmod: (cat.updated_at || new Date()).toISOString(),
      });
    });
  }

  if (readers) {
    readers.forEach(reader => {
      urls.push({
        url: `${baseUrl}/reader/${reader.alias}`,
        lastmod: (reader.updated_at || new Date()).toISOString(),
      });
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(xml);
}

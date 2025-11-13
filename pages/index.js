
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export async function getStaticProps() {
  const { data: categories } = await supabase.from("categories").select("*");

  const { data: topReaders } = await supabase
    .from("top_readers")
    .select("reader_alias, reader_name, reader_emoji, total_readings, readers(image_url)")
    .order("total_readings", { ascending: false })
    .limit(3);

  const { data: newReaders } = await supabase
    .from("readers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  return { props: { categories, topReaders, newReaders }, revalidate: 86400 };
}

export default function Home({ categories, topReaders, newReaders }) {
  return (
    <Layout title="Free Spirit Tarot" description="AI Tarot Readers">
      <div className="space-y-16">

        <section>
          <h1 className="text-4xl mb-8 text-center font-bold text-yellow-300">
            🔮 Discover Your Path
          </h1>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={"/categories/" + cat.slug}
                className="block p-6 bg-purple-900/40 rounded-lg border border-purple-700 hover:scale-[1.03] transition"
              >
                <h3 className="text-xl text-yellow-300">
                  {cat.emoji} {cat.category_name}
                </h3>
                <p className="text-sm text-purple-200">{cat.vibe}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl mb-8 text-center font-bold text-yellow-300">🌟 Top Readers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {topReaders?.map((r) => (
              <Link
                key={r.reader_alias}
                href={"/reader/" + r.reader_alias}
                className="block p-6 bg-purple-900/40 rounded-lg border border-purple-700 text-center hover:scale-[1.03] transition"
              >
                <img
                  src={r.readers?.image_url || ""}
                  className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-purple-700 object-cover"
                />
                <h3 className="text-xl text-yellow-300">
                  {r.reader_emoji} {r.reader_name}
                </h3>
                <p className="text-xs text-purple-400">{r.total_readings} readings</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-2xl mt-14 mb-6 text-center font-semibold text-yellow-300">
            🌙 New Readers
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {newReaders?.map((r) => (
              <Link
                key={r.id}
                href={"/reader/" + r.alias}
                className="p-6 bg-purple-900/40 rounded-lg border border-purple-700 text-center hover:scale-[1.03] transition"
              >
                <img
                  src={r.image_url}
                  className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-purple-700 object-cover"
                />
                <h3 className="text-xl text-yellow-300">{r.emoji} {r.name}</h3>
                <p className="text-xs text-purple-400 italic">{r.tagline}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
}


import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export async function getStaticProps() {
  const { data } = await supabase.from("readers").select("*").order("name");
  return { props: { readers: data || [] }, revalidate: 86400 };
}

export default function ReadersIndex({ readers }) {
  return (
    <Layout title="Tarot Readers">
      <h1 className="text-4xl text-yellow-300 text-center mb-10">🔮 All Readers</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {readers.map((r) => (
          <Link
            href={"/reader/" + r.alias}
            key={r.id}
            className="p-6 bg-purple-900/40 border border-purple-700 rounded-xl text-center hover:border-yellow-300 transition"
          >
            <img
              src={r.image_url}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-purple-700 object-cover"
            />
            <h3 className="text-xl text-yellow-300">{r.emoji} {r.name}</h3>
            <p className="text-sm text-purple-300 italic">{r.tagline}</p>
          </Link>
        ))}
      </div>
    </Layout>
  );
}

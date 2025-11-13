
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export async function getStaticPaths() {
  const { data } = await supabase.from("categories").select("slug");
  return {
    paths: data?.map((c) => ({ params: { slug: c.slug } })) || [],
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!category) return { notFound: true };

  const { data: readers } = await supabase
    .from("readers")
    .select("*")
    .eq("category", category.category_name);

  return { props: { category, readers: readers || [] }, revalidate: 86400 };
}

export default function CategoryPage({ category, readers }) {
  return (
    <Layout title={category.category_name}>
      <div className="space-y-16">

        <section className="text-center">
          <h1 className="text-4xl text-yellow-300">
            {category.emoji} {category.category_name}
          </h1>
          <p className="text-purple-300">{category.vibe}</p>
        </section>

        <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {readers.map((r) => (
            <Link
              key={r.id}
              href={"/reader/" + r.alias}
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
        </section>

      </div>
    </Layout>
  );
}

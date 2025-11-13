
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export async function getStaticProps() {
  const { data: cards } = await supabase.from("cards").select("*").order("id");
  return { props: { cards }, revalidate: 86400 };
}

export default function CardsPage({ cards }) {
  return (
    <Layout title="Tarot Cards">
      <article className="max-w-7xl mx-auto py-12 px-6">
        <h1 className="text-4xl text-yellow-300 text-center mb-10">🃏 All Tarot Cards</h1>

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={"/card/" + card.name.toLowerCase().replace(/\s+/g, "-")}
              className="group bg-purple-900/40 border border-purple-700 rounded-lg p-3 hover:border-yellow-300 transition"
            >
              <img
                src={card.image_url}
                className="w-full h-48 object-contain mb-2 rounded-md"
              />
              <h2 className="text-yellow-300 font-semibold text-sm text-center">{card.name}</h2>
              <p className="text-xs text-purple-400 text-center">{card.category}</p>
            </Link>
          ))}
        </section>
      </article>
    </Layout>
  );
}

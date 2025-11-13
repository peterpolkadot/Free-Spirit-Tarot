
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabaseClient";

export async function getServerSideProps({ params }) {
  const name = params.slug.replace(/-/g, " ");

  const { data: card } = await supabase
    .from("cards")
    .select("*")
    .ilike("name", name)
    .maybeSingle();

  if (!card) return { notFound: true };

  const { data: stats } = await supabase
    .from("card_stats")
    .select("*")
    .eq("card_name", card.name)
    .order("draw_count", { ascending: false });

  return { props: { card, stats: stats || [] } };
}

export default function CardPage({ card, stats }) {
  return (
    <Layout title={card.name}>
      <article className="max-w-5xl mx-auto py-12 space-y-12">

        <header className="text-center">
          <img
            src={card.image_url}
            className="w-52 h-80 mx-auto rounded-md border-4 border-purple-700"
          />
          <h1 className="text-4xl text-yellow-300">{card.name}</h1>
          <p className="text-purple-300 italic">{card.category}</p>
        </header>

        <section className="text-purple-200 space-y-4">
          <p>{card.meaning}</p>
          {card.positive && (
            <p>
              <strong className="text-green-300">Positive:</strong> {card.positive}
            </p>
          )}
          {card.negative && (
            <p>
              <strong className="text-red-300">Negative:</strong> {card.negative}
            </p>
          )}
        </section>

        {stats?.length > 0 && (
          <section>
            <h2 className="text-2xl text-yellow-300 text-center mb-4">
              📈 Draw Stats
            </h2>

            <table className="w-full text-sm text-purple-200 border border-purple-700 rounded-lg">
              <tbody>
                {stats.map((s) => (
                  <tr key={s.id} className="border-t border-purple-700">
                    <td className="px-4 py-2">{s.reader}</td>
                    <td className="px-4 py-2">{s.draw_count}×</td>
                    <td className="px-4 py-2">
                      {new Date(s.last_drawn).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </article>
    </Layout>
  );
}

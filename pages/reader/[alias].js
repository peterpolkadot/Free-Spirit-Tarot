
import Layout from "@/components/Layout";
import ChatMessage from "@/components/ChatMessage";
import { supabase } from "@/lib/supabaseClient";
import { useState, useRef, useEffect } from "react";

export async function getServerSideProps({ params }) {
  const { data: reader } = await supabase
    .from("readers")
    .select("*")
    .eq("alias", params.alias)
    .single();

  if (!reader) return { notFound: true };

  const { data: stats } = await supabase
    .from("card_stats")
    .select("card_name, image_url, draw_count")
    .eq("reader", reader.alias)
    .order("draw_count", { ascending: false })
    .limit(3);

  return { props: { reader, stats: stats || [] } };
}

export default function ReaderPage({ reader, stats }) {
  const [messages, setMessages] = useState([
    {
      role: "reader",
      content: `✨ I am ${reader.name}. ${reader.tagline}`,
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [drawnCards, setDrawnCards] = useState([]);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      // ONLY askReader — no more UI card drawing
      const res = await fetch("/api/askReader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reader_alias: reader.alias,
          question: userMsg.content,
        }),
      });

      const data = await res.json();

      // Cards returned from askReader
      if (data.cards) {
        setDrawnCards(data.cards);
      }

      const botMsg = {
        role: "reader",
        content: data.message || "✨ The spirits are quiet...",
      };

      setMessages((m) => [...m, botMsg]);

    } finally {
      setTyping(false);
    }
  }

  return (
    <Layout title={reader.name}>

      <div className="max-w-2xl mx-auto py-16 space-y-14">

        {/* Reader Header */}
        <header className="text-center space-y-3">
          <img
            src={reader.image_url}
            className="w-32 h-32 rounded-full mx-auto border-4 border-purple-700"
          />
          <h1 className="text-4xl text-yellow-300">
            {reader.emoji} {reader.name}
          </h1>
          <p className="text-purple-300 italic">{reader.tagline}</p>
        </header>

        {/* Drawn Cards — Only from askReader */}
        {drawnCards.length === 3 && (
          <section className="text-center space-y-5 animate-fadeIn">
            <h2 className="text-2xl text-yellow-300 mb-2">🔮 Your Spread</h2>

            <div className="flex justify-center gap-8 flex-wrap mt-4">
              {drawnCards.map((c, i) => (
                <div
                  key={i}
                  className="w-32 bg-purple-900/40 border border-purple-700 p-3 rounded-xl shadow-lg"
                >
                  <p className="text-yellow-300 text-sm mb-2 font-semibold">
                    {["Past", "Present", "Future"][i]}
                  </p>

                  <img
                    src={c.image_url}
                    className="w-full h-40 rounded-md mb-2 object-cover"
                  />

                  <p className="text-purple-200 text-xs">{c.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Chat Box */}
        <div className="bg-purple-950/40 border border-purple-700 rounded-2xl p-4 h-[470px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">

            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                from={msg.role === "reader" ? "reader" : "user"}
                text={msg.content}
              />
            ))}

            {typing && (
              <ChatMessage from="reader" text="✨ typing..." />
            )}

            <div ref={endRef} />
          </div>

          <form onSubmit={sendMessage} className="flex">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your question..."
              className="flex-1 bg-purple-800/40 border border-purple-700 rounded-l-lg px-3 py-2 text-purple-100"
            />
            <button className="px-4 bg-yellow-400 rounded-r-lg text-purple-900 font-semibold">
              Send
            </button>
          </form>
        </div>

        {/* Stats Section */}
        {stats.length > 0 && (
          <section className="text-center">
            <h2 className="text-2xl text-yellow-300 mb-3">✨ Most Drawn Cards</h2>
            <div className="flex justify-center gap-6 flex-wrap">
              {stats.map((c, i) => (
                <div
                  key={i}
                  className="w-28 bg-purple-900/40 border border-purple-700 p-3 rounded-xl"
                >
                  <img
                    src={c.image_url}
                    className="w-full h-36 rounded-md mb-1 object-cover"
                  />
                  <p className="text-yellow-300 text-sm">{c.card_name}</p>
                  <p className="text-purple-400 text-xs">
                    {c.draw_count}× drawn
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </Layout>
  );
}

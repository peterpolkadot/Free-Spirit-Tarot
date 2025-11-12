
import { useState } from "react";

export default function AskReader({ reader }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const ask = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/askReader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reader_alias: reader.alias,
          question,
          spread_type: "three_card",
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Reading failed.");
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-purple-900/30 border border-purple-700 rounded-xl p-6 space-y-4 mt-10">
      <h2 className="text-2xl font-semibold text-yellow-300 text-center">🔮 Ask {reader.name}</h2>
      <p className="text-sm text-purple-300 text-center">
        Type your question below and receive a {reader.category} tarot reading.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="What's on your mind?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 bg-purple-800/50 border border-purple-600 text-yellow-200 px-4 py-2 rounded-lg focus:outline-none focus:border-yellow-400"
        />
        <button
          onClick={ask}
          disabled={loading || !question.trim()}
          className="px-6 py-2 rounded-lg bg-yellow-400 text-purple-900 font-semibold hover:bg-yellow-300 disabled:opacity-50"
        >
          {loading ? "Reading..." : "Ask"}
        </button>
      </div>

      {error && <p className="text-red-400 text-center text-sm mt-2">{error}</p>}

      {response && (
        <div className="mt-6 space-y-6">
          {/* 🃏 Drawn Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {response.cards.map((card) => (
              <div
                key={card.id}
                className="bg-purple-800/40 border border-purple-700 rounded-lg p-3 text-center hover:border-yellow-400 transition"
              >
                <img
                  src={card.image_url || "https://pirces.com.au/wp-content/uploads/2024/11/no-photo.png"}
                  alt={card.name}
                  className="w-full h-48 object-cover rounded-md mb-2 border-2 border-purple-700"
                />
                <h4 className="text-yellow-300 font-semibold">{card.name}</h4>
                <p className="text-xs text-purple-400 italic">{card.category}</p>
              </div>
            ))}
          </div>

          {/* ✨ AI Reading */}
          <div className="bg-purple-800/40 border border-purple-700 rounded-lg p-5">
            <h3 className="text-xl text-yellow-300 font-semibold mb-3 text-center">
              ✨ {reader.name}'s Reading
            </h3>
            <p className="whitespace-pre-line text-purple-200 leading-relaxed">
              {response.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

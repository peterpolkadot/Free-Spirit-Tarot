
import { supabase } from "@/lib/supabaseClient";
import { askOpenAI } from "@/lib/openaiClient";
import { buildReaderPrompt } from "@/lib/readerPrompt";

export default async function handler(req, res) {
  try {
    const { reader_alias, question } = req.body;

    if (!reader_alias) {
      return res.status(400).json({ error: "Missing reader_alias" });
    }

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "Please ask a question." });
    }

    // 🔍 Decide whether the user is asking for a tarot reading
    const wantsReading = /card|read|future|past|present|spread|tarot|insight|pull/i.test(
      question
    );

    let selected = [];

    // 🎴 Only draw cards IF the user actually wants a reading
    if (wantsReading) {
      const { data: cards } = await supabase
        .from("cards")
        .select("*")
        .order("id");

      if (!cards || cards.length < 3) {
        return res.status(500).json({ error: "Card deck missing" });
      }

      while (selected.length < 3) {
        const pick = cards[Math.floor(Math.random() * cards.length)];
        if (!selected.find(c => c.id === pick.id)) selected.push(pick);
      }

      // 🔢 Update stats
      for (const card of selected) {
        await supabase.rpc("increment_card_stat", {
          p_reader: reader_alias,
          p_card_name: card.name,
        });
      }
    }

    // 🧠 Build final prompt
    const messages = buildReaderPrompt(reader, selected, question)
);

    // 🔮 Ask AI
    const answer = await askOpenAI(messages);

    // 📝 Log the session
    await supabase.from("reader_logs").insert({
      reader_alias,
      question,
      cards: selected.length ? selected : null,
      response: answer,
    });

    // 🚀 Return response
    return res.status(200).json({
      message: answer,
      cards: selected.length
        ? selected.map(c => ({
            name: c.name,
            image_url: c.image_url
          }))
        : []
    });

  } catch (err) {
    console.error("❌ askReader error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

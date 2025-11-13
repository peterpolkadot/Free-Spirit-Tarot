
import { supabase } from "@/lib/supabaseClient";
import { askOpenAI } from "@/lib/openaiClient";
import { buildReaderPrompt } from "@/lib/readerPrompt";

export default async function handler(req, res) {
  try {
    const { reader_alias, message } = req.body;

    if (!reader_alias || !message) {
      return res.status(400).json({ error: "Missing reader_alias or message" });
    }

    // 1️⃣ Fetch reader
    const { data: reader } = await supabase
      .from("readers")
      .select("*")
      .eq("alias", reader_alias)
      .single();

    if (!reader) {
      return res.status(404).json({ error: "Reader not found" });
    }

    // 2️⃣ Determine if tarot cards should be drawn
    const readingIntent = /read|future|card|guide|meaning|insight|love|career|money|what.*cards/i.test(
      message
    );

    let selected = [];

    // Draw cards only when needed
    if (readingIntent) {
      const { data: cards } = await supabase
        .from("cards")
        .select("*")
        .order("id");

      if (!cards || cards.length < 3) {
        return res.status(500).json({ error: "Card deck missing" });
      }

      while (selected.length < 3) {
        const pick = cards[Math.floor(Math.random() * cards.length)];
        if (!selected.includes(pick)) selected.push(pick);
      }

      // Update stats
      for (const card of selected) {
        await supabase.rpc("increment_card_stat", {
          p_reader: reader_alias,
          p_card_name: card.name,
        });
      }
    }

    // 3️⃣ Build AI prompt
    const messages = buildReaderPrompt(reader, selected, message);

    // 4️⃣ Ask OpenAI
    const answer = await askOpenAI(messages);

    // 5️⃣ Log reading
    await supabase.from("reader_logs").insert({
      reader_alias,
      question: message,
      cards: selected.length ? selected : null,
      response: answer,
    });

    // 6️⃣ Return for frontend
    return res.status(200).json({
      reply: answer,
      cards: selected.map(c => ({
        name: c.name,
        image_url: c.image_url,
      })),
    });

  } catch (err) {
    console.error("❌ askReader error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

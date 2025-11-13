
import { supabase } from "@/lib/supabaseClient";
import { askOpenAI } from "@/lib/openaiClient";
import { buildReaderPrompt } from "@/lib/readerPrompt";

export default async function handler(req, res) {
  try {
    const { reader_alias, question } = req.body;

    if (!reader_alias || !question) {
      return res.status(400).json({ error: "Missing reader_alias or question" });
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

    // 2️⃣ Always draw 3 cards
    const { data: cards } = await supabase
      .from("cards")
      .select("*")
      .order("id");

    if (!cards || cards.length < 3) {
      return res.status(500).json({ error: "Card deck missing" });
    }

    const selected = [];
    while (selected.length < 3) {
      const pick = cards[Math.floor(Math.random() * cards.length)];
      if (!selected.includes(pick)) selected.push(pick);
    }

    // update stats
    for (const card of selected) {
      await supabase.rpc("increment_card_stat", {
        p_reader: reader_alias,
        p_card_name: card.name,
      });
    }

    // 3️⃣ Build prompt + ask OpenAI
    const messages = buildReaderPrompt(reader, selected, question);
    const answer = await askOpenAI(messages);

    // 4️⃣ Log reading
    await supabase.from("reader_logs").insert({
      reader_alias,
      question,
      cards: selected,
      response: answer,
    });

    // 5️⃣ Response for frontend
    return res.status(200).json({
      message: answer,
      cards: selected.map((c) => ({
        name: c.name,
        image_url: c.image_url,
      })),
    });

  } catch (err) {
    console.error("❌ askReader error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

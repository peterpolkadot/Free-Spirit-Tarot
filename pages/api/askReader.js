
import { supabase } from "@/lib/supabaseClient";
import { askOpenAI } from "@/lib/openaiClient";
import { buildReaderPrompt } from "@/lib/readerPrompt";

export default async function handler(req, res) {
  try {
    const { reader_alias, question } = req.body;

    if (!reader_alias || !question) {
      return res.status(400).json({ message: "Missing fields." });
    }

    const { data: reader } = await supabase
      .from("readers")
      .select("*")
      .eq("alias", reader_alias)
      .single();

    if (!reader) {
      return res.status(404).json({ message: "Reader not found." });
    }

    const { data: cards } = await supabase
      .from("cards")
      .select("*")
      .order("id");

    if (!cards || cards.length < 3) {
      return res.status(500).json({ message: "Card deck missing." });
    }

    const selected = [];
    while (selected.length < 3) {
      const pick = cards[Math.floor(Math.random() * cards.length)];
      if (!selected.includes(pick)) selected.push(pick);
    }

    for (const card of selected) {
      await supabase.rpc("increment_card_stat", {
        p_reader: reader_alias,
        p_card_name: card.name,
      });
    }

    const messages = buildReaderPrompt(reader, selected, question);
    const answer = await askOpenAI(messages);

    await supabase.from("reader_logs").insert({
      reader_alias,
      question,
      cards: selected,
      response: answer,
    });

    return res.status(200).json({
      message: answer,
      cards: selected,
    });

  } catch (err) {
    console.error("❌ askReader error:", err);
    return res.status(500).json({ message: "Failed to get reading." });
  }
}

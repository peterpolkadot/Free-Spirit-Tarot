
import { supabase } from "@/lib/supabaseClient";
import { askOpenAI } from "@/lib/openaiClient";
import { buildReaderPrompt } from "@/lib/readerPrompt";

export default async function handler(req, res) {
  try {
    const { reader_alias, question } = req.body;

    if (!reader_alias || !question) {
      return res.status(400).json({ error: "Missing reader_alias or question" });
    }

    // 🧙 Fetch reader profile
    const { data: reader } = await supabase
      .from("readers")
      .select("*")
      .eq("alias", reader_alias)
      .single();

    if (!reader) {
      return res.status(404).json({ error: "Reader not found" });
    }

    // 🔮 Build the prompt
    const messages = buildReaderPrompt(reader, question);

    // ✨ Get the AI response
    const reply = await askOpenAI(messages);

    // 🎴 Draw 3 cards for the reading
    const { data: cards } = await supabase
      .from("cards")
      .select("*")
      .order("RANDOM()")
      .limit(3);

    // 📈 Update card_stats
    if (cards) {
      for (const card of cards) {
        await supabase.rpc("increment_card_stat", {
          p_reader: reader.alias,
          p_card_name: card.name,
        });
      }

      // Update reader summary
      await supabase.rpc("increment_reader_summary", {
        p_reader_alias: reader.alias,
      });
    }

    return res.status(200).json({
      reply,
      cards: cards || [],
    });

  } catch (error) {
    console.error("🔥 askReader error:", error);
    return res.status(500).json({
      error: "Server failed to interpret the reading",
    });
  }
}

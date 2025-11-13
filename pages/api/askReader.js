
import { supabase } from "@/lib/supabaseClient";
import { askOpenAI } from "@/lib/openaiClient";
import { buildReaderPrompt } from "@/lib/readerPrompt";

export default async function handler(req, res) {
  try {
    const { reader_alias, question, conversation_history } = req.body;

    if (!reader_alias) {
      return res.status(400).json({ error: "Missing reader_alias" });
    }

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: "Please ask a question." });
    }

    // Load reader
    const { data: reader } = await supabase
      .from("readers")
      .select("*")
      .eq("alias", reader_alias)
      .single();

    if (!reader) {
      return res.status(404).json({ error: "Reader not found" });
    }

    // Detect reading intent - but only after first exchange to allow rapport building
    const isFirstMessage = !conversation_history || conversation_history.length <= 1;
    const wantsReading = /card|read|future|past|present|spread|tarot|insight|pull|draw/i.test(
      question
    );

    let selected = [];

    // Draw cards only if: (1) not first message OR (2) explicit card request
    const shouldDrawCards = wantsReading && (!isFirstMessage || /draw|pull|show.*card/i.test(question));

    if (shouldDrawCards) {
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

      // Update stats
      for (const card of selected) {
        await supabase.rpc("increment_card_stat", {
          p_reader: reader_alias,
          p_card_name: card.name,
        });
      }
    }

    // Build final prompt with conversation history
    const messages = buildReaderPrompt(reader, selected, question, conversation_history);

    // Ask AI
    const answer = await askOpenAI(messages);

    // Log reading
    await supabase.from("reader_logs").insert({
      reader_alias,
      question,
      cards: selected.length ? selected : null,
      response: answer,
    });

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

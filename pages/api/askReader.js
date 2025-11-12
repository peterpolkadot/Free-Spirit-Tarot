
import OpenAI from "openai";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { reader_alias, question, spread_type = "three_card", user_id = "anon" } = req.body;
    if (!reader_alias || !question)
      return res.status(400).json({ error: "Missing reader_alias or question" });

    // 🧙‍♀️ Fetch reader info
    const { data: reader } = await supabase
      .from("readers")
      .select("*")
      .eq("alias", reader_alias)
      .single();

    if (!reader) return res.status(404).json({ error: "Reader not found" });

    // 🃏 Draw random cards
    const { data: allCards } = await supabase.from("cards").select("*");
    const drawCount = spread_type === "single" ? 1 : 3;
    const drawnCards = allCards
      .sort(() => 0.5 - Math.random())
      .slice(0, drawCount)
      .map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        meaning: c.meaning,
        image_url: c.image_url,
      }));

    // ✨ Compose AI prompt
    const cardSummary = drawnCards.map((c) => `${c.name} (${c.category})`).join(", ");
    const systemPrompt = `
You are ${reader.name}, an intuitive tarot reader.
Provide a ${spread_type.replace("_", " ")} reading for this seeker.
Cards drawn: ${cardSummary}.
Use spiritual and insightful language but stay concise.
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.8,
    });

    const aiResponse = completion.choices?.[0]?.message?.content || "✨ The cards are silent...";

    // 🪶 Log reading
    await supabase.from("readings").insert([
      { reader_alias, user_id, question, spread_type },
    ]);

    // 📊 Update card_stats
    for (const card of drawnCards) {
      const { data: existing } = await supabase
        .from("card_stats")
        .select("draw_count")
        .eq("reader", reader_alias)
        .eq("card_id", card.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("card_stats")
          .update({
            draw_count: existing.draw_count + 1,
            last_drawn: new Date().toISOString(),
          })
          .eq("reader", reader_alias)
          .eq("card_id", card.id);
      } else {
        await supabase.from("card_stats").insert([
          {
            reader: reader_alias,
            card_id: card.id,
            card_name: card.name,
            category: card.category,
            draw_count: 1,
            last_drawn: new Date().toISOString(),
            image_url: card.image_url,
          },
        ]);
      }
    }

    // 🧮 Update reader_summary
    const { data: summary } = await supabase
      .from("reader_summary")
      .select("*")
      .eq("reader_alias", reader_alias)
      .maybeSingle();

    const total_readings = (summary?.total_readings || 0) + 1;
    const unique_users = summary?.unique_users || 0;
    const avg_cards_per_reading =
      ((summary?.avg_cards_per_reading || 0) * (total_readings - 1) + drawCount) /
      total_readings;

    if (summary) {
      await supabase
        .from("reader_summary")
        .update({
          total_readings,
          avg_cards_per_reading,
          last_active: new Date().toISOString(),
        })
        .eq("reader_alias", reader_alias);
    } else {
      await supabase.from("reader_summary").insert([
        {
          reader_alias,
          total_readings,
          avg_cards_per_reading,
          unique_users,
          last_active: new Date().toISOString(),
        },
      ]);
    }

    // 🌙 Return the reading
    return res.status(200).json({
      success: true,
      reader: reader.name,
      spread_type,
      cards: drawnCards,
      message: aiResponse,
    });
  } catch (err) {
    console.error("askReader error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}

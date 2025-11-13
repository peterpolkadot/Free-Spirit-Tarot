
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  try {
    const { reader_alias, spread_type } = req.body;

    const count = spread_type === "three_card" ? 3 :
                  spread_type === "two_card" ? 2 : 1;

    const { data: cards } = await supabase
      .from("cards")
      .select("*")
      .order("id");

    const selected = [];
    while (selected.length < count) {
      const pick = cards[Math.floor(Math.random() * cards.length)];
      if (!selected.includes(pick)) selected.push(pick);
    }

    for (const card of selected) {
      await supabase.rpc("increment_card_stat", {
        p_reader: reader_alias,
        p_card_name: card.name,
      });
    }

    return res.status(200).json({ cards: selected });
  } catch (err) {
    console.error("❌ drawCards error:", err);
    return res.status(500).json({ error: "Failed to draw cards" });
  }
}

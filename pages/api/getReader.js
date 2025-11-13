
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  try {
    const { alias } = req.query;

    const { data: reader } = await supabase
      .from("readers")
      .select("*")
      .eq("alias", alias)
      .single();

    if (!reader) return res.status(404).json({ error: "Reader not found" });

    const { data: stats } = await supabase
      .from("card_stats")
      .select("*")
      .eq("reader", alias)
      .order("draw_count", { ascending: false })
      .limit(3);

    return res.status(200).json({ reader, stats });
  } catch (err) {
    console.error("❌ getReader error:", err);
    return res.status(500).json({ error: "Failed to fetch reader" });
  }
}

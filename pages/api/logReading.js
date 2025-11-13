
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  try {
    const { reader_alias, cards, interpretation } = req.body;

    await supabase.from("readings").insert({
      reader_alias,
      cards,
      interpretation,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ logReading error:", err);
    return res.status(500).json({ error: "Failed to write log" });
  }
}

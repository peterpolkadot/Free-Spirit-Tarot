
import { supabase } from "@/lib/supabaseClient";
import { askOpenAI } from "@/lib/openaiClient";
import { buildReaderPrompt } from "@/lib/readerPrompt";

export default async function handler(req, res) {
  try {
    const { reader_alias, question } = req.body;

    if (!reader_alias || !question) {
      return res.status(400).json({ message: "Missing fields." });
    }

    // Fetch reader profile
    const { data: reader } = await supabase
      .from("readers")
      .select("*")
      .eq("alias", reader_alias)
      .single();

    if (!reader) {
      return res.status(404).json({ message: "Reader not found." });
    }

    // Build messages for OpenAI
    const messages = buildReaderPrompt(reader, question);

    // Query OpenAI
    const answer = await askOpenAI(messages);

    // OPTIONAL: Log reading to Supabase
    await supabase.from("reader_logs").insert({
      reader_alias,
      question,
      response: answer,
    });

    return res.status(200).json({ message: answer });
  } catch (err) {
    console.error("❌ askReader error:", err);
    return res.status(500).json({ message: "Failed to get reading." });
  }
}

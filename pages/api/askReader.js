
import { supabase } from "@/lib/supabaseClient";
import { getThreeCardReading } from "@/lib/getThreeCardReading";
import { buildReaderPrompt } from "@/lib/readerPrompt";

export default async function handler(req, res) {
  try {
    const { reader, question } = req.body;

    if (!reader) {
      return res.status(400).json({ error: "Missing reader." });
    }

    // 🔮 Draw the 3 cards from Supabase
    const cards = await getThreeCardReading(supabase);

    // 🧠 Build the OpenAI prompt for this reader + cards + question
    const messages = buildReaderPrompt(reader, cards, question || "");

    // 🔥 Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const msg = await response.text();
      console.error("❌ OpenAI Error:", msg);
      return res.status(500).json({ message: "✨ The spirits are quiet." });
    }

    const json = await response.json();
    const message =
      json.choices?.[0]?.message?.content ??
      "✨ The spirits retreat into silence.";

    // 🌟 Return BOTH the message AND the cards to frontend
    return res.status(200).json({
      message,
      cards,
    });

  } catch (err) {
    console.error("❌ askReader API error:", err);
    return res.status(500).json({ message: "✨ The spirits fade away..." });
  }
}

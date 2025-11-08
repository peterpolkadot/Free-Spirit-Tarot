
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 800,
    });

    const reply = completion.choices[0].message.content.trim();

    // If model sends tarot JSON, extract it
    let cards = null;
    try {
      const match = reply.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed[0]?.image_url) cards = parsed;
      }
    } catch (e) {
      // ignore parse errors
    }

    res.json({ reply, cards });
  } catch (err) {
    console.error('Chat error', err);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
}

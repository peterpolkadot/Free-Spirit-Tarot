
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
      max_tokens: 600,
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error('Chat error', err);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
}
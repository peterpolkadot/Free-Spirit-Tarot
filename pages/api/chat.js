
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🎴 Fetch 3 random cards from Supabase
async function getThreeCardReading() {
  const { data: cards, error } = await supabase.from('cards').select('*');
  if (error) throw error;
  if (!cards || cards.length < 3) throw new Error('No cards found.');

  const selected = [];
  while (selected.length < 3) {
    const c = cards[Math.floor(Math.random() * cards.length)];
    if (!selected.some(x => x.id === c.id)) selected.push(c);
  }
  return selected.map(c => ({
    id: c.id,
    name: c.name,
    image_url: c.image_url,
    meaning: c.meaning
  }));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages } = req.body;

  try {
    // 🔮 Ask the model; allow it to call getThreeCardReading
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      max_tokens: 900,
      messages,
      tools: [
        {
          type: 'function',
          function: {
            name: 'getThreeCardReading',
            description: 'Draws three random tarot cards from the Supabase cards table and returns their images and meanings.',
            parameters: { type: 'object', properties: {} }
          }
        }
      ]
    });

    const msg = completion.choices[0].message;

    // 🧙 If AI calls our function
    if (msg.tool_calls) {
      const cardsDrawn = await getThreeCardReading();
      const reply = `Your three cards are:\n\n${cardsDrawn
        .map(c => `**${c.name}** – ${c.meaning}`)
        .join('\n\n')}\n\n${cardsDrawn
        .map((c, i) => `![Card ${i + 1}](${c.image_url})`)
        .join(' ')}`;
      return res.json({ reply, cards: cardsDrawn });
    }

    // Otherwise, normal text reply
    const reply = msg.content?.trim() || '...';
    res.json({ reply });
  } catch (err) {
    console.error('Chat error', err);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
}

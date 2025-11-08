
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getThreeCardReading() {
  const { data: cards } = await supabase.from('cards').select('*');
  if (!cards?.length) throw new Error('No cards found.');
  const chosen = [];
  while (chosen.length < 3) {
    const c = cards[Math.floor(Math.random() * cards.length)];
    if (!chosen.some((x) => x.id === c.id)) chosen.push(c);
  }
  return chosen.map(c => ({
    id: c.id,
    name: c.name,
    image_url: c.image_url,
    meaning: c.meaning,
  }));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, readerAlias } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages,
      tools: [
        {
          type: 'function',
          function: {
            name: 'getThreeCardReading',
            description: 'Draws three random tarot cards from the Supabase cards table and returns their images and meanings.',
            parameters: { type: 'object', properties: {} },
          },
        },
      ],
    });

    const msg = completion.choices[0].message;

    if (msg.tool_calls) {
      const cards = await getThreeCardReading();
      const reply =
        `Your three cards are:\n\n` +
        cards.map(c => `**${c.name}** – ${c.meaning}`).join('\n\n') +
        `\n\n` +
        cards.map((c, i) => `![Card ${i + 1}](${c.image_url})`).join(' ');

      // 🪶 Server-side logging (no CORS issues)
      try {
        await fetch('https://script.google.com/macros/s/AKfycbzrYe_I1RTtujb6Jo6Ne4TAgQB--4LiGo8aENtRLOAqNK-LPQT5pYe_2OVxxYESUiPj/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reader_alias: readerAlias,
            reader_name: readerAlias,
            cards,
            timestamp: new Date().toISOString(),
            question: messages[messages.length - 1].content,
            response_length: reply.length,
            session_id: crypto.randomUUID(),
          }),
        });
      } catch (err) {
        console.error('Logging failed:', err);
      }

      return res.json({ reply, cards });
    }

    res.json({ reply: msg.content?.trim() || '...' });
  } catch (err) {
    console.error('Chat error', err);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
}

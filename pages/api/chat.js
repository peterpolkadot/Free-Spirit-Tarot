
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// ✅ Clients
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🧙 Draw 3 random tarot cards
async function getThreeCardReading() {
  const { data: cards } = await supabase.from('cards').select('*');
  if (!cards?.length) throw new Error('No cards found in Supabase.');

  const chosen = [];
  while (chosen.length < 3) {
    const c = cards[Math.floor(Math.random() * cards.length)];
    if (!chosen.some((x) => x.id === c.id)) chosen.push(c);
  }
  return chosen.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    image_url: c.image_url,
    meaning: c.meaning,
  }));
}

// 🪶 Update or insert stats for each card
async function logCardStats(cards, readerAlias) {
  for (const card of cards) {
    // Ensure the record exists or create it
    const { error: upsertError } = await supabase
      .from('card_stats')
      .upsert({
        card_id: card.id,
        card_name: card.name,
        category: card.category,
        reader: readerAlias,
        last_drawn: new Date().toISOString(),
      }, { onConflict: 'card_id' });

    if (upsertError) console.error('Upsert error:', upsertError);

    // Increment draw_count via Postgres function
    const { error: rpcError } = await supabase.rpc('increment_card_draw', { cid: card.id });
    if (rpcError) console.error('RPC increment error:', rpcError);
  }
}

// 💬 Chat handler
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, readerAlias } = req.body;

  try {
    // Generate completion (tarot reading)
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages,
      tools: [
        {
          type: 'function',
          function: {
            name: 'getThreeCardReading',
            description: 'Draws three random tarot cards and returns their meanings.',
            parameters: { type: 'object', properties: {} },
          },
        },
      ],
    });

    const msg = completion.choices[0].message;

    // If tool call triggered → draw cards + log stats
    if (msg.tool_calls) {
      const cards = await getThreeCardReading();
      await logCardStats(cards, readerAlias);

      const reply =
        `Your three cards are:\n\n` +
        cards.map((c) => `**${c.name}** – ${c.meaning}`).join('\n\n') +
        `\n\n` +
        cards.map((c, i) => `![Card ${i + 1}](${c.image_url})`).join(' ');

      return res.json({ reply, cards });
    }

    // Otherwise return text response
    res.json({ reply: msg.content?.trim() || '...' });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
}

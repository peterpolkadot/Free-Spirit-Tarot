
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
  const { data: cards, error } = await supabase.from('cards').select('*');
  if (error) throw error;
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
  console.log('🪶 Logging stats for reader:', readerAlias);
  for (const card of cards) {
    console.log('⏳ Logging card:', card.id, card.name);
    const { data: existing, error: fetchError } = await supabase
      .from('card_stats')
      .select('draw_count')
      .eq('card_id', card.id)
      .maybeSingle();

    if (fetchError) console.error('❌ Fetch error:', fetchError);

    const drawCount = existing?.draw_count ? existing.draw_count + 1 : 1;
    const { error: upsertError } = await supabase
      .from('card_stats')
      .upsert({
        card_id: card.id,
        card_name: card.name,
        category: card.category,
        reader: readerAlias,
        draw_count: drawCount,
        last_drawn: new Date().toISOString(),
      }, { onConflict: 'card_id' });

    if (upsertError) console.error('❌ Upsert error:', upsertError);
    else console.log('✅ Updated draw count for', card.name, '→', drawCount);
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

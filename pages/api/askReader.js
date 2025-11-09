
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
      .upsert(
        {
          card_id: card.id,
          card_name: card.name,
          category: card.category,
          reader: readerAlias,
          draw_count: drawCount,
          last_drawn: new Date().toISOString(),
        },
        { onConflict: 'card_id' }
      );

    if (upsertError) console.error('❌ Upsert error:', upsertError);
    else console.log('✅ Updated draw count for', card.name, '→', drawCount);
  }
}

// 💬 Chat handler
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { reader_alias, message } = req.body;
  if (!reader_alias || !message)
    return res.status(400).json({ reply: 'Missing reader_alias or message.' });

  try {
    // Prepare the OpenAI conversation
    const messages = [
      { role: 'system', content: 'You are a wise and intuitive tarot reader.' },
      { role: 'user', content: message },
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages,
    });

    const reply = completion.choices[0].message?.content?.trim() || '✨ The spirits are quiet today.';

    // Simulate card drawing and stat logging
    const cards = await getThreeCardReading();
    await logCardStats(cards, reader_alias);

    res.json({ reply, cards });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
}

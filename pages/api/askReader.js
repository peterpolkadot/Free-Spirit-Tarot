
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getThreeCardReading() {
  const { data: cards, error } = await supabase.from('cards').select('*');
  if (error) throw error;
  if (!cards?.length) throw new Error('No cards found.');
  const chosen = [];
  while (chosen.length < 3) {
    const c = cards[Math.floor(Math.random() * cards.length)];
    if (!chosen.some(x => x.id === c.id)) chosen.push(c);
  }
  return chosen.map(c => ({
    id: c.id,
    name: c.name,
    category: c.category,
    image_url: c.image_url,
    meaning: c.meaning,
  }));
}

async function logCardStats(cards, readerAlias) {
  for (const card of cards) {
    const { data: existing, error } = await supabase
      .from('card_stats')
      .select('draw_count')
      .eq('card_id', card.id)
      .maybeSingle();
    const drawCount = existing?.draw_count ? existing.draw_count + 1 : 1;
    await supabase.from('card_stats').upsert({
      card_id: card.id,
      card_name: card.name,
      category: card.category,
      reader: readerAlias,
      draw_count: drawCount,
      last_drawn: new Date().toISOString(),
    }, { onConflict: 'card_id' });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { reader_alias, message } = req.body;
  if (!reader_alias || !message) {
    return res.status(400).json({ reply: 'Missing reader_alias or message.' });
  }
  try {
    const messages = [
      { role: 'system', content: 'You are a wise tarot reader.' },
      { role: 'user', content: message },
    ];
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
    if (msg.tool_calls) {
      const cards = await getThreeCardReading();
      await logCardStats(cards, reader_alias);
      const cardDescriptions = cards.map(c => '**' + c.name + '** – ' + c.meaning).join('\n\n');
      const cardImages = cards.map((c,i) => '![Card ' + (i+1) + '](' + c.image_url + ')').join(' ');
      const reply = 'Your three cards are:\n\n' + cardDescriptions + '\n\n' + cardImages;
      return res.json({ reply, cards });
    }
    const reply = msg.content?.trim() || '✨ The spirits are quiet today.';
    return res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
}

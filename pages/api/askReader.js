
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// === 🔮 Different Reading Styles ===
async function getThreeCardReading() {
  const { data: cards } = await supabase.from('cards').select('*');
  const chosen = [];
  while (chosen.length < 3) {
    const c = cards[Math.floor(Math.random() * cards.length)];
    if (!chosen.some(x => x.id === c.id)) chosen.push(c);
  }
  return chosen;
}

async function getLoveReading() {
  const { data: cards } = await supabase.from('cards').select('*');
  return cards.sort(() => 0.5 - Math.random()).slice(0, 2);
}

async function getCelticCrossReading() {
  const { data: cards } = await supabase.from('cards').select('*');
  return cards.sort(() => 0.5 - Math.random()).slice(0, 10);
}

async function logCardStats(cards, readerAlias) {
  for (const card of cards) {
    await supabase.from('card_stats').upsert({
      card_id: card.id,
      card_name: card.name,
      category: card.category,
      reader: readerAlias,
      draw_count: 1,
      last_drawn: new Date().toISOString(),
    }, { onConflict: 'card_id' });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { reader_alias, message, history = [] } = req.body;
  if (!reader_alias || !message) return res.status(400).json({ reply: 'Missing reader_alias or message.' });

  try {
    const chatHistory = [
      { role: 'system', content: 'You are an intuitive tarot reader. Always begin by asking the user for their name, star sign, and what kind of reading they’d like — three-card, love, or Celtic Cross. Then perform that reading using symbolic interpretation and empathy. You can request clarification if details are missing.' },
      ...history,
      { role: 'user', content: message },
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: chatHistory,
    });

    const msg = completion.choices[0].message.content?.toLowerCase() || '';

    let cards = [];
    if (msg.includes('three-card')) cards = await getThreeCardReading();
    else if (msg.includes('love')) cards = await getLoveReading();
    else if (msg.includes('celtic')) cards = await getCelticCrossReading();

    if (cards.length) await logCardStats(cards, reader_alias);

    const formattedCards = cards.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      image_url: c.image_url,
      meaning: c.meaning,
    }));

    let reply = completion.choices[0].message.content?.trim() || '✨ The spirits are quiet.';
    if (cards.length) {
      reply += '\n\nYour cards:\n' + formattedCards.map(c => `• ${c.name} – ${c.meaning}`).join('\n');
    }

    return res.json({ reply, cards: formattedCards });
  } catch (err) {
    console.error('Tarot error:', err);
    return res.status(500).json({ reply: 'Sorry, something went wrong with the reading.' });
  }
}

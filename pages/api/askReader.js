
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
    // 🧙‍♀️ Fetch reader profile from Supabase
    const { data: reader } = await supabase
      .from('readers')
      .select('*')
      .eq('alias', reader_alias)
      .single();

    if (!reader) return res.status(404).json({ reply: 'Reader not found.' });

    // 🪶 Build personalized system prompt
    const systemPrompt = `
You are ${reader.Name}, also known as ${reader.Persona || reader.Name}.
${reader.SystemInstructions || 'You are a compassionate tarot reader who offers intuitive readings.'}

Your tone: ${reader.VoiceTone || 'warm and insightful'}.
Your specialty: ${reader.Specialty || 'general tarot guidance'}.
You are best for: ${reader.BestFor || 'those seeking understanding and clarity'}.
Your reading style: ${reader.ReadingStyle || 'symbolic interpretation with empathy'}.
Your popular spreads: ${reader.PopularSpreads || 'Three Card, Celtic Cross'}.

Speak with the spirit of your tagline: "${reader.Tagline || 'Let the cards reveal your truth.'}".
Remember to stay true to your persona: ${reader.Persona || 'an intuitive guide with mystical insight'}.
`;

    const chatHistory = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    const completion = await client.chat.completions.create({
      model: reader.Model || 'gpt-4o-mini',
      temperature: reader.Temperature || 0.8,
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

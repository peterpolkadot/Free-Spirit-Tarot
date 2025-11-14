import { supabase } from '@/lib/supabaseClient';
import { buildReaderPrompt } from '@/lib/readerPrompt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reader, question } = req.body;

    // 1️⃣ Fetch all cards
    const { data: allCards, error: cardErr } = await supabase.from('cards').select('*');
    if (cardErr || !allCards) {
      console.error('Card fetch error:', cardErr);
      return res.status(500).json({ message: 'Card fetch failed' });
    }

    // 2️⃣ Draw 3 unique cards
    const selected = [];
    while (selected.length < 3) {
      const c = allCards[Math.floor(Math.random() * allCards.length)];
      if (!selected.some(x => x.id === c.id)) selected.push(c);
    }

    const cards = selected.map(c => ({
      id: c.id,
      name: c.name,
      image_url: c.image_url,
      meaning: c.meaning,
      positive: c.positive,
      negative: c.negative
    }));

    // 3️⃣ Build prompt
    const prompt = buildReaderPrompt(reader, cards, question);

    // 4️⃣ Call OpenAI
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: prompt,
        temperature: 0.8
      })
    });

    const json = await aiRes.json();

    const message = json?.choices?.[0]?.message?.content || '✨ The spirits are quiet...';

    // 5️⃣ Return message + actual cards
    return res.status(200).json({
      message,
      cards
    });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ message: 'Internal error' });
  }
}
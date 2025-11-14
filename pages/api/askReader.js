import { supabase } from '@/lib/supabaseClient';
import { buildReaderPrompt } from '@/lib/readerPrompt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reader, question, conversationHistory } = req.body;

    // Check if user is asking for a reading
    const wantsReading = /reading|cards|draw|future|past|present|fortune|tell me|show me/i.test(question);

    if (!wantsReading) {
      // Just have a conversation - no cards yet
      const chatPrompt = [
        {
          role: 'system',
          content: 'You are ' + reader.name + ', ' + reader.tagline + '. Have a warm conversation with the seeker. Ask for their name and star sign if they haven\'t shared it. Be mystical but personable. When they\'re ready for a reading, they\'ll ask for it.'
        },
        ...(conversationHistory || []),
        { role: 'user', content: question }
      ];

      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: chatPrompt,
          temperature: 0.9
        })
      });

      const json = await aiRes.json();
      const message = json?.choices?.[0]?.message?.content || '✨ The spirits are quiet...';

      return res.status(200).json({ message });
    }

    // User wants a reading - draw cards
    const { data: allCards, error: cardErr } = await supabase.from('cards').select('*');
    if (cardErr || !allCards) {
      console.error('Card fetch error:', cardErr);
      return res.status(500).json({ message: 'Card fetch failed' });
    }

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

    const prompt = buildReaderPrompt(reader, cards, question);

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

    const message = (json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || '✨ The spirits are quiet...';

    return res.status(200).json({ message, cards });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ message: 'Internal error' });
  }
}
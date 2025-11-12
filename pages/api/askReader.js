
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
  const chosen = [];
  while (chosen.length < 2) {
    const c = cards[Math.floor(Math.random() * cards.length)];
    if (!chosen.some(x => x.id === c.id)) chosen.push(c);
  }
  return chosen;
}

async function getCelticCrossReading() {
  const { data: cards } = await supabase.from('cards').select('*');
  const chosen = [];
  while (chosen.length < 10) {
    const c = cards[Math.floor(Math.random() * cards.length)];
    if (!chosen.some(x => x.id === c.id)) chosen.push(c);
  }
  return chosen;
}

async function logCardStats(cards, readerAlias) {
  for (const card of cards) {
    const { data: existing } = await supabase
      .from('card_stats')
      .select('draw_count')
      .eq('card_id', card.id)
      .single();

    await supabase.from('card_stats').upsert({
      card_id: card.id,
      card_name: card.name,
      category: card.category,
      reader: readerAlias,
      draw_count: (existing?.draw_count || 0) + 1,
      last_drawn: new Date().toISOString(),
    }, { onConflict: 'card_id' });
  }
}

// Build the system prompt using reader's personality data
function buildSystemPrompt(reader, availableSpreads) {
  const spreadsInfo = {
    'three-card': 'Three-Card Reading (past-present-future or situation-action-outcome)',
    'love': 'Love Reading (2 cards focused on relationships and romance)',
    'celtic cross': 'Celtic Cross Reading (10 cards for comprehensive life guidance)'
  };
  
  const spreadsDescription = availableSpreads
    .map(s => spreadsInfo[s.toLowerCase()] || s)
    .join('\n   - ');
  
  return (reader.SystemInstructions || reader.Persona || 'You are an experienced and intuitive tarot reader.') + 
`

YOUR IDENTITY:
- Name: ${reader.Name}
- Reading Style: ${reader.ReadingStyle || 'Intuitive and empathetic'}
- Voice & Tone: ${reader.VoiceTone || 'Warm and supportive'}
- Specialty: ${reader.Specialty || 'General guidance'}
- Best For: ${reader.BestFor || 'Life guidance and clarity'}

AVAILABLE READING TYPES:
   - ${spreadsDescription}

HOW TO CONDUCT A READING:

1. GREETING & DISCOVERY (if this is the first message):
   - Welcome them warmly in your unique voice
   - Ask what brings them here today / what they'd like guidance on
   - Ask which type of reading they'd prefer
   - You may ask their name or star sign if it feels natural, but it's optional

2. BEFORE DRAWING CARDS:
   Once you know their question and chosen spread type, acknowledge it and say you're pulling cards.
   Then include this EXACT phrase on its own line: "DRAW_CARDS: [spread-type]"
   
   Examples:
   - "DRAW_CARDS: three-card"
   - "DRAW_CARDS: love"
   - "DRAW_CARDS: celtic cross"

3. AFTER CARDS ARE DRAWN:
   The cards will be provided to you. Then:
   - Acknowledge the cards that appeared
   - Interpret each card specifically in the context of their question
   - Connect the cards to their actual situation (not just generic meanings)
   - Use your ${reader.ReadingStyle} approach
   - Maintain your ${reader.VoiceTone} throughout
   - Draw on your expertise in ${reader.Specialty}
   - Offer actionable insights or guidance

4. DEEPENING THE READING:
   - Ask clarifying questions if needed
   - Offer to explore specific cards more deeply
   - Suggest follow-up readings if appropriate

CRITICAL: Stay fully in character as ${reader.Name}. You ARE this tarot reader. Never mention AI, systems, or break the fourth wall.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { reader_alias, message, history = [] } = req.body;
  if (!reader_alias || !message) {
    return res.status(400).json({ reply: 'Missing reader_alias or message.' });
  }

  try {
    // Fetch the reader's complete personality profile
    const { data: reader, error: readerError } = await supabase
      .from('readers')
      .select('*')
      .eq('Alias', reader_alias)
      .single();

    if (readerError || !reader) {
      return res.status(404).json({ reply: 'Reader not found.' });
    }

    // Parse popular spreads if stored as JSON string
    let popularSpreads = ['three-card', 'love', 'celtic cross'];
    if (reader.PopularSpreads) {
      try {
        popularSpreads = typeof reader.PopularSpreads === 'string' 
          ? JSON.parse(reader.PopularSpreads) 
          : reader.PopularSpreads;
      } catch (e) {
        // Keep default if parsing fails
      }
    }

    // Build personalized system prompt
    const systemPrompt = buildSystemPrompt(reader, popularSpreads);

    // Build chat history with reader's personality
    const chatHistory = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    // Use reader's preferred model and temperature
    const model = reader.Model || 'gpt-4o-mini';
    const temperature = reader.Temperature || 0.8;

    const completion = await client.chat.completions.create({
      model,
      temperature,
      messages: chatHistory,
    });

    const reply = completion.choices[0].message.content?.trim() || '✨ The spirits are quiet.';
    
    // Check for explicit card draw request using our marker
    let cards = [];
    let spreadType = null;
    const drawMatch = reply.match(/DRAW_CARDS:\s*(three-card|love|celtic\s*cross)/i);
    
    if (drawMatch) {
      const requestedSpread = drawMatch[1].toLowerCase().replace(/\s+/g, ' ');
      
      if (requestedSpread.includes('three-card') || requestedSpread.includes('three card')) {
        cards = await getThreeCardReading();
        spreadType = 'Three-Card Reading';
      } else if (requestedSpread.includes('love')) {
        cards = await getLoveReading();
        spreadType = 'Love Reading';
      } else if (requestedSpread.includes('celtic')) {
        cards = await getCelticCrossReading();
        spreadType = 'Celtic Cross Reading';
      }

      // If cards were drawn, send them back to the AI for interpretation
      if (cards.length > 0) {
        await logCardStats(cards, reader_alias);
        
        const cardDescriptions = cards.map((c, idx) => 
          `Card ${idx + 1}: ${c.name} (${c.category})\n   Meaning: ${c.meaning}`
        ).join('\n\n');

        const interpretationPrompt = `The cards have been drawn for the ${spreadType}:\n\n${cardDescriptions}\n\nNow provide your interpretation of these cards in the context of the querent's question. Connect each card specifically to their situation and offer meaningful guidance.`;

        // Get AI's interpretation of the actual cards
        const interpretationCompletion = await client.chat.completions.create({
          model,
          temperature,
          messages: [
            ...chatHistory,
            { role: 'assistant', content: reply },
            { role: 'system', content: interpretationPrompt }
          ],
        });

        const interpretation = interpretationCompletion.choices[0].message.content?.trim() || '';
        
        // Format cards for response
        const formattedCards = cards.map(c => ({
          id: c.id,
          name: c.name,
          category: c.category,
          image_url: c.image_url,
          meaning: c.meaning,
        }));

        // Remove the DRAW_CARDS marker from the original reply
        const cleanedReply = reply.replace(/DRAW_CARDS:\s*[^\n]*/gi, '').trim();

        return res.json({ 
          reply: cleanedReply + '\n\n' + interpretation,
          cards: formattedCards,
          spreadType,
          readerName: reader.Name,
          readerEmoji: reader.Emoji
        });
      }
    }
    
    // No cards drawn - just return the reply
    return res.json({ 
      reply, 
      cards: [],
      spreadType: null,
      readerName: reader.Name,
      readerEmoji: reader.Emoji
    });

  } catch (err) {
    console.error('Tarot error:', err);
    return res.status(500).json({ 
      reply: 'Sorry, something went wrong with the reading. The cosmic energies are disrupted.' 
    });
  }
}

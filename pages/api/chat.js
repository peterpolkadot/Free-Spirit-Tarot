
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Optional: import local tarot card data if you store it as JSON
// import cards from '@/data/cards.json';

// If you don’t have a local JSON file, you can define card data directly here for now:
const cards = [
  { name: "The Fool", image_url: "/cards/fool.jpg", meaning: "New beginnings, optimism, faith in the future." },
  { name: "The Magician", image_url: "/cards/magician.jpg", meaning: "Action, power, manifestation." },
  { name: "The High Priestess", image_url: "/cards/high-priestess.jpg", meaning: "Wisdom, intuition, higher powers." },
  // ...add all cards as needed
];

// Helper: draw 3 random unique cards
function getThreeCardReading() {
  const selected = [];
  while (selected.length < 3) {
    const card = cards[Math.floor(Math.random() * cards.length)];
    if (!selected.some(c => c.name === card.name)) selected.push(card);
  }
  return selected;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, readerAlias } = req.body;

  try {
    // Ask OpenAI to respond, with access to a tool
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      max_tokens: 800,
      messages,
      tools: [
        {
          type: 'function',
          function: {
            name: 'getThreeCardReading',
            description: 'Draws three random tarot cards and returns their images and meanings.',
            parameters: { type: 'object', properties: {} }
          }
        }
      ]
    });

    const msg = completion.choices[0].message;

    // If the model calls the function
    if (msg.tool_calls) {
      const cardsDrawn = getThreeCardReading();
      const reply = `Your three cards are:\n\n${cardsDrawn
        .map(c => `**${c.name}** – ${c.meaning}`)
        .join('\n\n')}\n\n![Card 1](${cardsDrawn[0].image_url}) ![Card 2](${cardsDrawn[1].image_url}) ![Card 3](${cardsDrawn[2].image_url})`;

      return res.json({ reply, cards: cardsDrawn });
    }

    // Otherwise normal text reply
    const reply = msg.content?.trim() || '...';
    res.json({ reply });
  } catch (err) {
    console.error('Chat error', err);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
}

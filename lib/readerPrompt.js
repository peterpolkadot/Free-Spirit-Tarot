
export function buildReaderPrompt(reader, cards, userMessage, conversationHistory = []) {
  // Build card text if cards were drawn
  let cardSection = "";

  if (cards && cards.length > 0) {
    cardSection = `
You have drawn the following tarot cards for the querent:
${cards.map((c, i) => `${i + 1}. ${c.name} (${c.category || 'Tarot'})
   Meaning: ${c.meaning || c.positive || 'A powerful card of transformation'}
   Image URL: ${c.image_url}`).join("\n\n")}

CRITICAL INSTRUCTIONS:
• Interpret ONLY these exact cards: ${cards.map(c => c.name).join(", ")}
• DO NOT make up or mention any other card names
• DO NOT include markdown images - the cards are shown separately
• Give a warm, conversational reading in the voice of ${reader.name}
• For each card, briefly explain its meaning and how it relates to their question
• Be empathetic and insightful, not overly mystical or dramatic
`;
  }

  // Build messages array with conversation history
  const messages = [
    {
      role: "system",
      content: `
You are ${reader.name}, an AI tarot reader.
Your style: ${reader.reading_style || reader.tagline || "kind and intuitive"}.
Speak with warmth, clarity, and spiritual confidence.

CONVERSATION GUIDELINES:
- When a user first asks about a reading, consider asking them 1-2 clarifying questions about their situation before drawing cards (e.g., "What area of your life is this concerning?" or "Can you tell me a bit more about what's weighing on your heart?")
- Build genuine rapport - make them feel heard and understood
- Keep responses conversational and human, not robotic
- Never repeat your introduction more than once

READING GUIDELINES:
- If no cards were drawn yet, respond conversationally or ask clarifying questions
- If cards WERE drawn, provide a structured interpretation of ONLY those specific cards
- DO NOT make up or hallucinate card names - only reference the exact cards provided
- DO NOT include markdown images or URLs - cards are displayed separately
- Keep paragraphs short and easy to read
- Connect the card meanings to their specific question
- Be empathetic, not overly dramatic or mystical
`
    }
  ];

  // Add conversation history if available
  if (conversationHistory && conversationHistory.length > 0) {
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });
  }

  // Add current user message (with card context if cards were drawn)
  messages.push({
    role: "user",
    content:
      (cards?.length > 0 ? `${cardSection}\n\n` : "") +
      `User's question: ${userMessage}`
  });

  return messages;
}

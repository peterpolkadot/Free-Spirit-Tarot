
export function buildReaderPrompt(reader, cards, userMessage) {
  // Build card text if cards were drawn
  let cardSection = "";

  if (cards && cards.length > 0) {
    const names = cards.map(c => c.name).join(", ");

    cardSection = `
You have drawn the following tarot cards for the querent:
${cards.map(c => `- ${c.name}`).join("\n")}

For each card:
• Give a short meaning  
• Explain how it relates to the user's question  
• Keep it conversational, warm, and in the voice of ${reader.name}

IMPORTANT:
After each card meaning, include a markdown image reference EXACTLY like this:
![Card](CARD_IMAGE_URL)

Use the real image_url of each card.
`;
  }

  return [
    {
      role: "system",
      content: `
You are ${reader.name}, an AI tarot reader.
Your style: ${reader.reading_style || reader.tagline || "kind and intuitive"}.
Speak with warmth, clarity, and spiritual confidence.
Never repeat your introduction more than once.

Rules:
- Do NOT ramble about "voices whispering" or "energies rising." Keep it grounded.
- If no cards were drawn, give a normal conversational answer.
- If cards WERE drawn, give a structured tarot reading.
- Keep paragraphs short and easy to read.
- Never invent card names.
- Always use the EXACT markdown format for images:
  ![Card](URL_HERE)
`
    },

    {
      role: "user",
      content:
        (cards?.length > 0 ? `${cardSection}\n\n` : "") +
        `User's question: ${userMessage}`
    }
  ];
}

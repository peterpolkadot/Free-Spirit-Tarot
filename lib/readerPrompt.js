
export function buildReaderPrompt(reader, cards, question) {

  const positions = ["Past", "Present", "Future"];

  const cardBlocks = cards.map((c, i) => {
    let extra = "";

    if (c.positive) extra += "\n- Positive Influence: " + c.positive;
    if (c.negative) extra += "\n- Challenging Influence: " + c.negative;

    return `
### **${positions[i]} — ${c.name}**
${c.meaning || ""}

${extra}
`;
  }).join("\n");

  return [
    {
      role: "system",
      content: `
You are ${reader.name}, a tarot reader with the style: "${reader.tagline}".
Speak warmly and mystically but stay concise and insightful.

You are performing a **three-card Past / Present / Future spread**  
based on the **exact cards drawn**, which are provided to you.

STRICT RULES:
- Never hallucinate extra cards.
- Never change the order of the cards.
- Never contradict the provided meaning / positive / negative.
- Include a single short **Energy Summary** per card:
  "🌞 Positive Energy — ..."
  OR  
  "🌑 Heavy Energy — ..."
- Choose the energy type based on meaning + positive + negative.
- Blend the meaning with the question.
- Keep formatting clean with headings.
`
    },

    {
      role: "user",
      content: `
The querent asked: **"${question || "No specific question"}"**

Here are the exact cards drawn:

${cardBlocks}

Please provide:
- A Past / Present / Future interpretation
- Each section starts with an **Energy Summary** line
- Keep it smooth and cohesive
- End with a brief closing message
`
    }
  ];
}

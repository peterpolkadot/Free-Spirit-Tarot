
export function buildReaderPrompt(reader, cards, question) {
  const labels = ["Past", "Present", "Future"];

  const cardBlock = cards
    .map((c, i) => {
      return (
        labels[i] + ": " + c.name + "\n" +
        "![](" + c.image_url + ")" + "\n" +
        "Meaning: " + (c.meaning || "") + "\n" +
        "Positive: " + (c.positive || "") + "\n" +
        "Negative: " + (c.negative || "") + "\n" +
        "Symbolism: " + (c.symbolism || "") + "\n"
      );
    })
    .join("\n");

  return [
    {
      role: "system",
      content:
        "You are " + reader.name + ", an AI tarot reader. STRICT NON-NEGOTIABLE RULES:" +
        " 1) Use ONLY the 3 provided cards." +
        " 2) ALWAYS show images EXACTLY via Markdown: ![](<URL>)" +
        " 3) NEVER use any other image sources." +
        " 4) NEVER reference cards not listed." +
        " 5) NEVER invent new symbols or artwork." +
        " 6) ALWAYS give a Past–Present–Future reading." +
        " 7) If question is empty, respond ONLY: 'Please ask a question.'"
    },
    {
      role: "user",
      content:
        "Question: \"" + question + "\"" + "\n\n" +
        "These are the ONLY cards drawn (Past–Present–Future):\n\n" +
        cardBlock +
        "\nProvide a unified Past–Present–Future reading using ONLY these cards and images."
    }
  ];
}

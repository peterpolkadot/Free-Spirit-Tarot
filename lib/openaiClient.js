
export async function askOpenAI(messages) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.8
      }),
    });

    if (!res.ok) {
      console.error("OpenAI Error:", await res.text());
      return "✨ The spirits are quiet right now.";
    }

    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "✨ The spirits are quiet.";
  } catch (err) {
    console.error("❌ OpenAI fetch failed:", err);
    return "✨ The spirits retreat into silence.";
  }
}

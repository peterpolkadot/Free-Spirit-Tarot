
export async function askOpenAI(messages) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.8,
        messages,
      }),
    });

    if (!res.ok) {
      console.error("OpenAI Error:", await res.text());
      return "✨ The spirits are quiet right now.";
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "✨ The spirits are quiet.";
  } catch (err) {
    console.error("❌ OpenAI fetch failed:", err);
    return "✨ Shadows interfere with the message. Try again.";
  }
}

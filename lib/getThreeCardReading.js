
export async function getThreeCardReading(supabase) {
  const { data, error } = await supabase.from("cards").select("*");

  if (error || !data) {
    console.error("❌ Could not fetch cards:", error);
    throw new Error("Unable to draw tarot cards.");
  }

  const selected = [];
  while (selected.length < 3) {
    const card = data[Math.floor(Math.random() * data.length)];
    if (!selected.some(c => c.id === card.id)) selected.push(card);
  }

  return selected.map(c => ({
    id: c.id,
    name: c.name,
    image_url: c.image_url,
    meaning: c.meaning,
    positive: c.positive,
    negative: c.negative,
    symbolism: c.symbolism
  }));
}

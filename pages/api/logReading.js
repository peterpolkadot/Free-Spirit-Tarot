
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { reader_alias, reader_name, cards, question, response_length } = req.body;

    // Call your Google Apps Script Web App endpoint
    await fetch('https://script.google.com/macros/s/AKfycbxyz123/exec', {
      method: 'POST',
      body: JSON.stringify({
        reader_alias,
        reader_name,
        cards,
        question,
        response_length,
      }),
    });

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('logReading error', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
}

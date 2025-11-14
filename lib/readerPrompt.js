export function buildReaderPrompt(reader, cards, question) {

  const positions = ['Past', 'Present', 'Future'];

  // Create card links for side-by-side display
  const cardLinks = cards.map((c, i) => {
    const slug = c.name.toLowerCase().replace(/\\s+/g, '-');
    return '[![' + c.name + '](' + c.image_url + ')](https://www.fstarot.com/card/' + slug + ')';
  }).join(' ');

  const cardBlocks = cards.map((c, i) => {
    let extra = '';

    if (c.positive) extra += '\n- Positive Influence: ' + c.positive;
    if (c.negative) extra += '\n- Challenging Influence: ' + c.negative;

    return [
      '### **' + positions[i] + ' — ' + c.name + '**',
      (c.meaning || ''),
      '',
      extra,
      ''
    ].join('\n');
  }).join('\n');

  const systemMsg = 
    'You are ' + reader.name + ', a tarot reader with the style: "' + reader.tagline + '".' +
    '\nSpeak warmly and mystically but stay concise and insightful.' +
    '\nYou are performing a three-card Past / Present / Future spread.' +
    '\nSTRICT RULES:' +
    '\n- Never hallucinate extra cards.' +
    '\n- Never change the order.' +
    '\n- Never contradict meanings.' +
    '\n- Start your response with the three card images in one line.' +
    '\n- Include one Energy Summary per card.';

  const userMsg = [
    'The querent asked: **"' + (question || 'No specific question') + '"**',
    '',
    'Here are the exact cards drawn:',
    '',
    cardBlocks,
    '',
    'Please start your response by showing all three cards side by side in one line using this exact format:',
    cardLinks,
    '',
    'Then provide:',
    '- A Past / Present / Future interpretation',
    '- Each section starts with an Energy Summary',
    '- Keep it smooth and cohesive',
    '- End with a brief closing message',
  ].join('\n');

  return [
    { role: 'system', content: systemMsg },
    { role: 'user', content: userMsg }
  ];
}
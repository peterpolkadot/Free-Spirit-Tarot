export function buildReaderPrompt(reader, cards, question) {

  const positions = ['Past', 'Present', 'Future'];

  const cardBlocks = cards.map((c, i) => {
    let extra = '';

    if (c.positive) extra += '\n- Positive Influence: ' + c.positive;
    if (c.negative) extra += '\n- Challenging Influence: ' + c.negative;

    return [
      '### **' + positions[i] + ' — ' + c.name + '**',
      '![' + c.name + '](' + c.image_url + ')',
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
    '\n- Start your response with the three card images using markdown format.' +
    '\n- Include one Energy Summary per card.';

  const userMsg = [
    'The querent asked: **"' + (question || 'No specific question') + '"**',
    '',
    'Here are the exact cards drawn:',
    '',
    cardBlocks,
    '',
    'Please start your response by showing all three cards using markdown image syntax:',
    '![Past Card](' + cards[0].image_url + ')',
    '![Present Card](' + cards[1].image_url + ')',
    '![Future Card](' + cards[2].image_url + ')',
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
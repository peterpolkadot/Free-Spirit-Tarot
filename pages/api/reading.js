
import OpenAI from 'openai';
import { getSupabase } from '../../lib/supabaseClient';

async function logAnalytics(reader_alias, user_id) {
  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    await supabase.from('readings').insert([{ reader_alias, user_id, created_at: now }]);
    const { data: session } = await supabase
      .from('reader_sessions')
      .select('id, reading_count')
      .eq('reader_alias', reader_alias)
      .eq('user_id', user_id)
      .maybeSingle();

    if (session) {
      await supabase
        .from('reader_sessions')
        .update({
          reading_count: session.reading_count + 1,
          last_reading_at: now
        })
        .eq('id', session.id);
    } else {
      await supabase
        .from('reader_sessions')
        .insert([{ reader_alias, user_id, started_at: now, last_reading_at: now, reading_count: 1 }]);
    }

    await supabase.rpc('increment_reader_meta', {
      reader_alias_param: reader_alias,
      user_id_param: user_id
    });
  } catch (err) {
    console.error('⚠️ Analytics logging failed:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { question, readerAlias, userId, spreadType } = req.body;
  if (!question || !readerAlias) return res.status(400).json({ error: 'Missing question or readerAlias' });

  try {
    const supabase = getSupabase();
    const { data: reader } = await supabase.from('readers').select('*').eq('alias', readerAlias).single();
    if (!reader) return res.status(404).json({ error: 'Reader not found' });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const spreadContext = spreadType ? `The querent has requested a ${spreadType} reading.` : 'Provide a general tarot reading.';

    const completion = await openai.chat.completions.create({
      model: reader.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: reader.system_instructions || 'You are a tarot reader providing insightful guidance.' },
        { role: 'user', content: `Question: "${question}"\n\n${spreadContext}\n\nProvide a tarot reading.` }
      ],
      temperature: reader.temperature || 0.8,
      max_tokens: 800
    });

    const reading = completion.choices?.[0]?.message?.content || 'No reading available.';
    await logAnalytics(readerAlias, userId || 'anon');
    res.status(200).json({ reading });
  } catch (error) {
    console.error('Reading API error:', error);
    res.status(500).json({ error: 'Failed to get reading' });
  }
}

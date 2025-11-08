
import { getSupabase } from '../../lib/supabaseClient';
export default async function handler(req, res) {
  try {
    const supabase = getSupabase();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('readings')
      .select('reader_alias, user_id, created_at')
      .gte('created_at', since);
    if (error) throw error;
    const aggregates = {};
    data.forEach(row => {
      const alias = row.reader_alias;
      if (!aggregates[alias]) aggregates[alias] = { reader_alias: alias, readings_24h: 0, users: new Set() };
      aggregates[alias].readings_24h++;
      aggregates[alias].users.add(row.user_id);
    });
    const trending = Object.values(aggregates)
      .map(r => ({ reader_alias: r.reader_alias, readings_24h: r.readings_24h, users_24h: r.users.size }))
      .sort((a, b) => b.readings_24h - a.readings_24h)
      .slice(0, 10);
    res.status(200).json({ trending });
  } catch (err) {
    console.error('Analytics API error:', err);
    res.status(500).json({ error: 'Failed to load analytics.' });
  }
}

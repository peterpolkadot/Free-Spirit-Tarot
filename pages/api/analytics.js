
/**
 * ⚡ Live Analytics API for Tarot Readings
 * Queries readings table for the past 24h activity
 */
import { getSupabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    const supabase = getSupabase();
    const { readerAlias } = req.query;

    // 24-hour window ISO timestamp
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    if (readerAlias) {
      // 🔍 Return stats for a specific reader
      const { data, error } = await supabase
        .from('readings')
        .select('reader_alias, user_id, created_at')
        .eq('reader_alias', readerAlias)
        .gte('created_at', since);

      if (error) throw error;

      const readings_24h = data.length;
      const users_24h = new Set(data.map(r => r.user_id)).size;

      return res.status(200).json({
        stats: { reader_alias: readerAlias, readings_24h, users_24h }
      });
    }

    // 🔥 Trending readers — grouped counts
    const { data, error } = await supabase
      .from('readings')
      .select('reader_alias, user_id, created_at')
      .gte('created_at', since);

    if (error) throw error;

    // Aggregate manually (client-side)
    const aggregates = {};
    data.forEach(row => {
      const alias = row.reader_alias;
      if (!aggregates[alias]) {
        aggregates[alias] = { reader_alias: alias, readings_24h: 0, users: new Set() };
      }
      aggregates[alias].readings_24h++;
      aggregates[alias].users.add(row.user_id);
    });

    // Format + sort
    const trending = Object.values(aggregates)
      .map(r => ({
        reader_alias: r.reader_alias,
        readings_24h: r.readings_24h,
        users_24h: r.users.size
      }))
      .sort((a, b) => b.readings_24h - a.readings_24h)
      .slice(0, 10);

    return res.status(200).json({ trending });
  } catch (err) {
    console.error('Analytics API error:', err);
    return res.status(500).json({ error: 'Failed to load analytics.' });
  }
}

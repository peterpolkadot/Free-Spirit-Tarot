import { createClient } from '@supabase/supabase-js';

// Singleton instance
let supabaseInstance = null;

// Get or create the single Supabase instance
export function getSupabase() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    console.error('⚠️ Missing Supabase credentials:', {
      url,
      keyPresent: !!key,
    });
  }

  supabaseInstance = createClient(url || '', key || '');
  
  return supabaseInstance;
}

export const supabase = getSupabase();
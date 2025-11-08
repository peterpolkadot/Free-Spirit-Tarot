
import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;
export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}
export const supabase = getSupabase();

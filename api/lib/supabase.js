import { createClient } from '@supabase/supabase-js';

let _supabase = null;
let _initialized = false;

export function getSupabase() {
  if (!_initialized) {
    _initialized = true;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (url && key) {
      try {
        _supabase = createClient(url, key);
      } catch (e) {
        console.error('Supabase init error:', e);
      }
    }
  }
  return _supabase;
}

export function isConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

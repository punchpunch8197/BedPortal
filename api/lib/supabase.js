let supabase = null;

export function isConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export async function getSupabase() {
  if (!isConfigured()) {
    return null;
  }

  if (!supabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
    } catch (e) {
      console.error('Supabase init failed:', e);
      return null;
    }
  }

  return supabase;
}

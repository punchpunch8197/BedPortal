let supabase = null;
let isConfigured = false;

try {
  const { createClient } = await import('@supabase/supabase-js');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    isConfigured = true;
  }
} catch (e) {
  console.error('Failed to initialize Supabase:', e);
}

export { supabase, isConfigured };

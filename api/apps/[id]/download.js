import { supabase, isConfigured } from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!isConfigured) {
    return res.status(500).json({ success: false, error: 'Supabase not configured' });
  }

  try {
    const { id } = req.query;

    const { data, error } = await supabase
      .from('apps')
      .select('name, version, file_path')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    if (!data.file_path) {
      return res.status(404).json({ success: false, error: 'No download file available' });
    }

    // Redirect to the file URL
    return res.redirect(302, data.file_path);
  } catch (error) {
    console.error('Error downloading app:', error);
    return res.status(500).json({ success: false, error: 'Failed to download app' });
  }
}

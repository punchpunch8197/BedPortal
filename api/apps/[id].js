import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    return res.status(200).json({
      success: true,
      data: formatApp(data)
    });
  } catch (error) {
    console.error('Error fetching app:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch app' });
  }
}

function formatApp(app) {
  return {
    id: app.id,
    name: app.name,
    category: app.category,
    description: app.description,
    license: app.license,
    version: app.version,
    size: app.size || 'Unknown',
    rating: app.rating || 0,
    reviews: app.reviews || 0,
    osSupport: app.os_support || [],
    icon: app.icon_path,
    screenshots: app.screenshots || [],
    filePath: app.file_path,
    createdAt: app.created_at,
    updatedAt: app.updated_at
  };
}

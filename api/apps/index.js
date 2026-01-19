import { getSupabase, isConfigured } from '../lib/supabase.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isConfigured()) {
    return res.status(500).json({
      success: false,
      error: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
    });
  }

  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

async function handleGet(req, res) {
  try {
    const { q, category, limit = 50, offset = 0 } = req.query;
    const supabase = getSupabase();

    let query = supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    const formattedData = data.map(formatApp);

    return res.status(200).json({
      success: true,
      data: formattedData,
      total: formattedData.length
    });
  } catch (error) {
    console.error('Error fetching apps:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch apps' });
  }
}

async function handlePost(req, res) {
  try {
    const { name, category, description, license, version, osSupport, iconUrl, fileUrl } = req.body;
    const supabase = getSupabase();

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'Name and category are required'
      });
    }

    const { data, error } = await supabase
      .from('apps')
      .insert({
        name,
        category,
        description: description || '',
        license: license || '',
        version: version || '1.0.0',
        os_support: osSupport || [],
        icon_path: iconUrl || null,
        file_path: fileUrl || null,
        screenshots: []
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data: formatApp(data)
    });
  } catch (error) {
    console.error('Error creating app:', error);
    return res.status(500).json({ success: false, error: 'Failed to create app' });
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

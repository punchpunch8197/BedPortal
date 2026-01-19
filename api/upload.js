import { getSupabase, isConfigured } from './lib/supabase.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    if (!isConfigured()) {
      return res.status(400).json({ success: false, error: 'Storage not configured' });
    }

    const supabase = await getSupabase();
    if (!supabase) {
      return res.status(400).json({ success: false, error: 'Storage connection failed' });
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const contentType = req.headers['content-type'];
    const boundary = contentType.split('boundary=')[1];

    if (!boundary) {
      return res.status(400).json({ success: false, error: 'Invalid content type' });
    }

    const parts = buffer.toString('binary').split(`--${boundary}`);
    let fileData = null;
    let fileName = null;
    let fileType = 'icons';

    for (const part of parts) {
      if (part.includes('filename=')) {
        const filenameMatch = part.match(/filename="([^"]+)"/);
        const nameMatch = part.match(/name="([^"]+)"/);

        if (filenameMatch) {
          fileName = filenameMatch[1];
        }
        if (nameMatch) {
          fileType = nameMatch[1] === 'appFile' ? 'files' : 'icons';
        }

        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          const dataStart = headerEnd + 4;
          const dataEnd = part.lastIndexOf('\r\n');
          fileData = Buffer.from(part.slice(dataStart, dataEnd), 'binary');
        }
      }
    }

    if (!fileData || !fileName) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const uniqueName = `${Date.now()}-${fileName}`;
    const filePath = `${fileType}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from('app-files')
      .upload(filePath, fileData, {
        contentType: 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('app-files')
      .getPublicUrl(filePath);

    return res.status(200).json({
      success: true,
      url: urlData.publicUrl,
      path: filePath
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to upload file' });
  }
}

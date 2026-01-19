import { Router } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from '../db/database.js';
import { uploadFields } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Helper to format app data for response
const formatApp = (app) => ({
  id: app.id,
  name: app.name,
  category: app.category,
  description: app.description,
  license: app.license,
  version: app.version,
  size: app.size,
  rating: app.rating,
  reviews: app.reviews,
  osSupport: JSON.parse(app.os_support || '[]'),
  icon: app.icon_path,
  screenshots: JSON.parse(app.screenshots || '[]'),
  filePath: app.file_path,
  createdAt: app.created_at,
  updatedAt: app.updated_at
});

// GET /api/apps - Get all apps with optional search
router.get('/', (req, res) => {
  try {
    const { q, category, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM apps WHERE 1=1';
    const params = [];

    if (q) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const apps = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: apps.map(formatApp),
      total: apps.length
    });
  } catch (error) {
    console.error('Error fetching apps:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch apps' });
  }
});

// GET /api/apps/:id - Get single app by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const app = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);

    if (!app) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    res.json({
      success: true,
      data: formatApp(app)
    });
  } catch (error) {
    console.error('Error fetching app:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch app' });
  }
});

// GET /api/apps/:id/download - Download app file
router.get('/:id/download', (req, res) => {
  try {
    const { id } = req.params;
    const app = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);

    if (!app) {
      return res.status(404).json({ success: false, error: 'App not found' });
    }

    if (!app.file_path) {
      return res.status(404).json({ success: false, error: 'No download file available' });
    }

    // Extract filename from path
    const filename = app.file_path.split('/').pop();
    const filePath = join(__dirname, '..', 'uploads', 'files', filename);

    // Set download headers
    const downloadName = `${app.name.replace(/[^a-zA-Z0-9]/g, '_')}_v${app.version || '1.0.0'}${filename.substring(filename.lastIndexOf('.'))}`;

    res.download(filePath, downloadName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: 'Download failed' });
        }
      }
    });
  } catch (error) {
    console.error('Error downloading app:', error);
    res.status(500).json({ success: false, error: 'Failed to download app' });
  }
});

// POST /api/apps - Create new app
router.post('/', uploadFields, (req, res) => {
  try {
    const { name, category, description, license, version, osSupport } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'Name and category are required'
      });
    }

    // Process uploaded files
    let iconPath = null;
    let screenshotPaths = [];
    let appFilePath = null;

    if (req.files) {
      if (req.files.icon && req.files.icon[0]) {
        iconPath = `/api/uploads/icons/${req.files.icon[0].filename}`;
      }

      if (req.files.screenshots) {
        screenshotPaths = req.files.screenshots.map(
          file => `/api/uploads/screenshots/${file.filename}`
        );
      }

      if (req.files.appFile && req.files.appFile[0]) {
        appFilePath = `/api/uploads/files/${req.files.appFile[0].filename}`;
      }
    }

    // Parse osSupport from string if needed
    let osSupportArray = [];
    if (osSupport) {
      if (typeof osSupport === 'string') {
        try {
          osSupportArray = JSON.parse(osSupport);
        } catch {
          osSupportArray = osSupport.split(',').map(s => s.trim());
        }
      } else if (Array.isArray(osSupport)) {
        osSupportArray = osSupport;
      }
    }

    const result = db.prepare(`
      INSERT INTO apps (name, category, description, license, version, os_support, icon_path, screenshots, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      category,
      description || '',
      license || '',
      version || '1.0.0',
      JSON.stringify(osSupportArray),
      iconPath,
      JSON.stringify(screenshotPaths),
      appFilePath
    );

    const newApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      data: formatApp(newApp)
    });
  } catch (error) {
    console.error('Error creating app:', error);
    res.status(500).json({ success: false, error: 'Failed to create app' });
  }
});

export default router;

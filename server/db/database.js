import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'bedportal.db'));

// Enable foreign keys
db.pragma('journal_mode = WAL');

// Create apps table
db.exec(`
  CREATE TABLE IF NOT EXISTS apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    license TEXT,
    version TEXT DEFAULT '1.0.0',
    size TEXT DEFAULT 'Unknown',
    rating REAL DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    os_support TEXT DEFAULT '[]',
    icon_path TEXT,
    screenshots TEXT DEFAULT '[]',
    file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// No seed data - apps must be created with file uploads

export default db;

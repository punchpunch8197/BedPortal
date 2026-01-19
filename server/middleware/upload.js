import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadsDir = join(__dirname, '..', 'uploads');

// Storage configuration for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'files';

    if (file.fieldname === 'icon') {
      folder = 'icons';
    } else if (file.fieldname === 'screenshots') {
      folder = 'screenshots';
    } else if (file.fieldname === 'appFile') {
      folder = 'files';
    }

    cb(null, join(uploadsDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for image files
const imageFilter = (req, file, cb) => {
  if (file.fieldname === 'icon' || file.fieldname === 'screenshots') {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(extname(file.originalname).toLowerCase());

    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for icon and screenshots'), false);
    }
  } else {
    cb(null, true);
  }
};

// Create upload middleware
const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
    files: 10 // Max 10 files
  }
});

// Upload fields configuration
export const uploadFields = upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'screenshots', maxCount: 5 },
  { name: 'appFile', maxCount: 1 }
]);

export default upload;

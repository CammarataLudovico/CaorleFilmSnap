const multer = require('multer')
const { v4: uuidv4 } = require('uuid');

const fs = require('fs');
const path = require('path');

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

const MIME_TO_EXTENSION = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const MAX_UPLOAD_FILE_MB = parsePositiveInteger(process.env.MAX_UPLOAD_FILE_MB, 10);
const MAX_FILES_PER_REQUEST = parsePositiveInteger(process.env.MAX_FILES_PER_REQUEST, 10);

const uploadDir = path.join(__dirname, '../uploads/pending');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // absolute path
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const uid = uuidv4();
    const normalizedMime = String(file.mimetype || '').toLowerCase();
    const ext = MIME_TO_EXTENSION[normalizedMime] || '.jpg';
    const filename = `caorlefilmfestival-${timestamp}-${uid}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
    const normalizedMime = String(file.mimetype || '').toLowerCase();
    if (Object.hasOwn(MIME_TO_EXTENSION, normalizedMime)) {
        cb(null, true)
        return;
    }

    cb(new Error('Only JPEG, PNG, WebP or GIF images are allowed'))
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_FILE_MB * 1024 * 1024,
    files: MAX_FILES_PER_REQUEST,
    fields: 10,
    parts: MAX_FILES_PER_REQUEST + 10,
    fieldSize: 20 * 1024,
  }
});

module.exports = {
  upload,
  MAX_FILES_PER_REQUEST,
};
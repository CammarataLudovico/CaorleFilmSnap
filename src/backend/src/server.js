const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const uploadRoutes = require('../routes/upload');
const pendingPhotosRoutes = require('../routes/pendingPhotos');
const multer = require('multer')
const fs = require('fs');
const path = require('path');
const i18next = require('i18next')
const i18nextBackend = require('i18next-fs-backend')
const rateLimit = require('express-rate-limit')
const { requireAdmin } = require('../middleware/authMiddleware')
const { normalizeFilename, resolveInDirectory } = require('../utils/filenameSafety')
require('dotenv').config();

i18next.use(i18nextBackend).init({
  fallbackLng: 'en',
  backend: {
    loadPath: path.join(__dirname, '../../locales/{{lng}}/translation.json')
  }
}, () => {
  console.log('i18next backend ready')
}
)

const server = express();
const PORT = Number.parseInt(process.env.PORT, 10) || 3001;
const uploadsRoot = path.join(__dirname, '..', 'uploads');
const pendingDir = path.join(uploadsRoot, 'pending');
const approvedDir = path.join(uploadsRoot, 'approved');

fs.mkdirSync(pendingDir, { recursive: true });
fs.mkdirSync(approvedDir, { recursive: true });

const allowedOrigins = new Set();
const configuredOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173'];

for (const origin of configuredOrigins) {
  if (origin && origin.trim()) {
    allowedOrigins.add(origin.trim());
  }
}

if (allowedOrigins.size === 0) {
  allowedOrigins.add('http://localhost:5173');
}

const defaultApiLimit = Number.parseInt(process.env.RATE_LIMIT_MAX, 10) || 300;
const uploadApiLimit = Number.parseInt(process.env.UPLOAD_RATE_LIMIT_MAX, 10) || 30;
const adminApiLimit = Number.parseInt(process.env.ADMIN_RATE_LIMIT_MAX, 10) || 120;

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: defaultApiLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please retry later.' },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: uploadApiLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Upload rate exceeded. Please retry later.' },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: adminApiLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many admin requests. Please retry later.' },
});

server.disable('x-powered-by');

server.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

server.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key'],
  exposedHeaders: ['Content-Length'],
}));

server.use(express.json({ limit: '64kb' }));

server.use('/api', apiLimiter);
server.use(['/upload', '/api/upload'], uploadLimiter);

server.get('/', (_req, res) => {
    res.send('Hello World');
})

server.use('/', uploadRoutes)
server.use('/api', uploadRoutes);
server.use('/api', pendingPhotosRoutes);

server.use('/uploads/approved', express.static(approvedDir, {
  index: false,
  maxAge: '7d',
  immutable: true,
}));

// API: Approve a photo (move from pending to approved)
server.put('/api/photos/:filename/approve', requireAdmin, adminLimiter, async (req, res) => {
  const filename = normalizeFilename(req.params.filename);
  if (!filename) {
    return res.status(400).json({ message: 'Invalid filename' });
  }

  const pendingPath = resolveInDirectory(pendingDir, filename);
  const publicPath = resolveInDirectory(approvedDir, filename);

  if (!pendingPath || !publicPath) {
    return res.status(400).json({ message: 'Invalid file path' });
  }

  try {
    await fs.promises.rename(pendingPath, publicPath);
    return res.json({ message: 'Photo approved' });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ message: 'Photo not found' });
    }
    console.error('Error approving photo:', err);
    return res.status(500).json({ message: 'Unable to approve photo' });
  }
});

// API: Reject a photo (delete from pending)
server.put('/api/photos/:filename/reject', requireAdmin, adminLimiter, async (req, res) => {
  const filename = normalizeFilename(req.params.filename);
  if (!filename) {
    return res.status(400).json({ message: 'Invalid filename' });
  }

  const pendingPath = resolveInDirectory(pendingDir, filename);
  if (!pendingPath) {
    return res.status(400).json({ message: 'Invalid file path' });
  }

  try {
    await fs.promises.unlink(pendingPath);
    return res.json({ message: 'Photo rejected and deleted' });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ message: 'Photo not found' });
    }
    console.error('Error rejecting photo:', err);
    return res.status(500).json({ message: 'Unable to reject photo' });
  }
});

// API: returns the list of files in /uploads/approved (approved photos)
server.get('/api/photos/approved', async (req, res) => {
  const requestedPage = Number.parseInt(req.query.page, 10);
  const requestedLimit = Number.parseInt(req.query.limit, 10);

  const page = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;
  const limit = Number.isNaN(requestedLimit) ? 9 : Math.min(Math.max(requestedLimit, 1), 30);
  const offset = (page - 1) * limit;

  try {
    const files = await fs.promises.readdir(approvedDir);
    const imageFiles = files.filter((fileName) => /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName));
    const sortedFiles = await Promise.all(
      imageFiles.map(async (fileName) => {
        const stats = await fs.promises.stat(path.join(approvedDir, fileName));
        return {
          fileName,
          modifiedAt: stats.mtimeMs,
        };
      })
    );

    sortedFiles.sort((left, right) => right.modifiedAt - left.modifiedAt);
    const orderedFiles = sortedFiles.map((item) => item.fileName);
    const paginatedFiles = orderedFiles.slice(offset, offset + limit);

    return res.json({
      page,
      limit,
      total: orderedFiles.length,
      totalPages: Math.ceil(orderedFiles.length / limit),
      files: paginatedFiles
    });
  } catch (err) {
    console.error('Error listing approved photos:', err);
    return res.status(500).json({ message: 'Unable to read approved photos' });
  }
});

server.use((req, res) => {
  res.status(404).json({ message: 'Page not found' });
});

server.use((err, req, res, _next) => {
  if (err && err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ message: 'Forbidden origin' });
  }

  console.error('Global error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'Uploaded file is too large' });
    }
    return res.status(400).json({ message: 'Invalid upload request' });
  }

  return res.status(500).json({ message: 'Internal server error' });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

const env = require('./env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const i18next = require('i18next');
const i18nextBackend = require('i18next-fs-backend');
const rateLimit = require('express-rate-limit');
const uploadRoutes = require('../routes/upload');
const pendingPhotosRoutes = require('../routes/pendingPhotos');
const photosRoutes = require('../routes/photos');

i18next.use(i18nextBackend).init({
  fallbackLng: 'en',
  backend: {
    loadPath: path.join(__dirname, '../../locales/{{lng}}/translation.json'),
  },
}, () => {
  console.log('i18next backend ready');
});

const server = express();

const uploadsRoot = path.join(__dirname, '..', 'uploads');
const approvedDir = path.join(uploadsRoot, 'approved');
fs.mkdirSync(path.join(uploadsRoot, 'pending'), { recursive: true });
fs.mkdirSync(approvedDir, { recursive: true });

const allowedOrigins = new Set(
  (env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',') : ['http://localhost:5173'])
    .map((o) => o.trim())
    .filter(Boolean)
);
if (allowedOrigins.size === 0) allowedOrigins.add('http://localhost:5173');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please retry later.' },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.UPLOAD_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Upload rate exceeded. Please retry later.' },
});

// Behind Caddy reverse proxy: trust first hop so express-rate-limit
// keys on the real client IP (X-Forwarded-For) instead of the proxy.
server.set('trust proxy', 1);

server.disable('x-powered-by');

server.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

server.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key'],
    exposedHeaders: ['Content-Length'],
  })
);

server.use(express.json({ limit: '64kb' }));

server.use('/api', apiLimiter);
server.use(['/upload', '/api/upload'], uploadLimiter);

server.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

server.use('/', uploadRoutes);
server.use('/api', pendingPhotosRoutes);
server.use('/api/photos', photosRoutes);

server.use(
  '/uploads/approved',
  express.static(approvedDir, { index: false, maxAge: '7d', immutable: true })
);

server.use((_req, res) => {
  res.status(404).json({ message: 'Page not found' });
});

server.use((err, _req, res, _next) => {
  if (err?.message === 'Origin not allowed by CORS') {
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

const httpServer = server.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});

process.on('SIGTERM', () => httpServer.close(() => process.exit(0)));
process.on('SIGINT', () => httpServer.close(() => process.exit(0)));

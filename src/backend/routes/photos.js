const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { requireAdmin } = require('../middleware/authMiddleware');
const { normalizeFilename, resolveInDirectory } = require('../utils/filenameSafety');

const router = express.Router();

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number.parseInt(process.env.ADMIN_RATE_LIMIT_MAX, 10) || 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many admin requests. Please retry later.' },
});

const uploadsRoot = path.join(__dirname, '..', 'uploads');
const pendingDir = path.join(uploadsRoot, 'pending');
const approvedDir = path.join(uploadsRoot, 'approved');

router.put('/:filename/approve', requireAdmin, adminLimiter, async (req, res) => {
  const filename = normalizeFilename(req.params.filename);
  if (!filename) return res.status(400).json({ message: 'Invalid filename' });

  const pendingPath = resolveInDirectory(pendingDir, filename);
  const publicPath = resolveInDirectory(approvedDir, filename);
  if (!pendingPath || !publicPath) return res.status(400).json({ message: 'Invalid file path' });

  try {
    await fs.promises.rename(pendingPath, publicPath);
    return res.json({ message: 'Photo approved' });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ message: 'Photo not found' });
    console.error('Error approving photo:', err);
    return res.status(500).json({ message: 'Unable to approve photo' });
  }
});

router.put('/:filename/reject', requireAdmin, adminLimiter, async (req, res) => {
  const filename = normalizeFilename(req.params.filename);
  if (!filename) return res.status(400).json({ message: 'Invalid filename' });

  const pendingPath = resolveInDirectory(pendingDir, filename);
  if (!pendingPath) return res.status(400).json({ message: 'Invalid file path' });

  try {
    await fs.promises.unlink(pendingPath);
    return res.json({ message: 'Photo rejected and deleted' });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ message: 'Photo not found' });
    console.error('Error rejecting photo:', err);
    return res.status(500).json({ message: 'Unable to reject photo' });
  }
});

router.get('/approved', async (req, res) => {
  const requestedPage = Number.parseInt(req.query.page, 10);
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const page = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;
  const limit = Number.isNaN(requestedLimit) ? 9 : Math.min(Math.max(requestedLimit, 1), 30);
  const offset = (page - 1) * limit;

  try {
    const files = await fs.promises.readdir(approvedDir);
    const imageFiles = files.filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    const withStats = await Promise.all(
      imageFiles.map(async (f) => {
        const stats = await fs.promises.stat(path.join(approvedDir, f));
        return { fileName: f, modifiedAt: stats.mtimeMs };
      })
    );
    withStats.sort((a, b) => b.modifiedAt - a.modifiedAt);
    const ordered = withStats.map((item) => item.fileName);
    return res.json({
      page,
      limit,
      total: ordered.length,
      totalPages: Math.ceil(ordered.length / limit),
      files: ordered.slice(offset, offset + limit),
    });
  } catch (err) {
    console.error('Error listing approved photos:', err);
    return res.status(500).json({ message: 'Unable to read approved photos' });
  }
});

module.exports = router;

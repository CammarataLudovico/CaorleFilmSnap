const crypto = require('crypto');

function timingSafeEqualString(left, right) {
  const leftBuffer = Buffer.from(String(left), 'utf8');
  const rightBuffer = Buffer.from(String(right), 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getApiKeyFromRequest(req) {
  const headerKey = req.headers['x-admin-key'];

  if (typeof headerKey === 'string' && headerKey.trim()) {
    return headerKey.trim();
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return '';
}

function requireAdmin(req, res, next) {
  const expectedApiKey = process.env.ADMIN_API_KEY;

  if (!expectedApiKey) {
    console.error('ADMIN_API_KEY is not configured.');
    return res.status(503).json({ message: 'Service temporarily unavailable' });
  }

  const providedApiKey = getApiKeyFromRequest(req);
  if (!providedApiKey || !timingSafeEqualString(providedApiKey, expectedApiKey)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return next();
}

module.exports = { requireAdmin };
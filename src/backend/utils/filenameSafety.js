const path = require('path');

const IMAGE_FILENAME_REGEX = /^caorlefilmfestival-\d{13}-[0-9a-f-]{36}\.(jpg|jpeg|png|webp|gif)$/i;

function normalizeFilename(rawFilename) {
  if (typeof rawFilename !== 'string') {
    return null;
  }

  let decodedFilename;
  try {
    decodedFilename = decodeURIComponent(rawFilename).trim();
  } catch {
    return null;
  }

  if (!decodedFilename) {
    return null;
  }

  if (decodedFilename.includes('\0') || decodedFilename.includes('/') || decodedFilename.includes('\\')) {
    return null;
  }

  const baseName = path.basename(decodedFilename);
  if (baseName !== decodedFilename) {
    return null;
  }

  if (!IMAGE_FILENAME_REGEX.test(baseName)) {
    return null;
  }

  return baseName;
}

function resolveInDirectory(baseDirectory, safeFilename) {
  const resolvedBase = path.resolve(baseDirectory);
  const resolvedTarget = path.resolve(resolvedBase, safeFilename);

  if (resolvedTarget === resolvedBase) {
    return null;
  }

  if (!resolvedTarget.startsWith(resolvedBase + path.sep)) {
    return null;
  }

  return resolvedTarget;
}

module.exports = {
  normalizeFilename,
  resolveInDirectory,
};
const vision = require('@google-cloud/vision');
const path = require('path');

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../keys/key.json'),
});

async function moderateImage(filePath) {
  try {
    const [result] = await client.safeSearchDetection(filePath);
    const annotation = result.safeSearchAnnotation;

    const flags = {
      adult: annotation.adult,
      violence: annotation.violence,
      racy: annotation.racy,
      spoof: annotation.spoof,
      medical: annotation.medical,
    };

    const isRejected =
      flags.adult === 'LIKELY' || flags.adult === 'VERY_LIKELY' ||
      flags.violence === 'LIKELY' || flags.violence === 'VERY_LIKELY';

    const isBorderline =
      flags.racy === 'POSSIBLE' || flags.adult === 'POSSIBLE';

    if (isRejected) return { status: 'rejected', flags };
    if (isBorderline) return { status: 'pending_moderator', flags };
    return { status: 'approved', flags };
  } catch (err) {
    console.error('Moderation error:', err);
    return { status: 'error', flags: null };
  }
}

module.exports = { moderateImage };
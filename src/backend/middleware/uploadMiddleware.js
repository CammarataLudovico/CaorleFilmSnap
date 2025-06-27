const multer = require('multer')
const { v4: uuidv4 } = require('uuid');

const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads/pending');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // absolute path
    console.log('📁 Saving file in:', uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const uid = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `caorlefilmfestival-${timestamp}-${uid}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Only images allowed', false))
    }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 4096 * 4096}
});

module.exports = { upload };
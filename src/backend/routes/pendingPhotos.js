const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

// API: returns the list of files in /uploads/pending
router.get('/pending-photos', (req, res) => {
  const dir = path.join(__dirname, '../uploads/pending');
  fs.readdir(dir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading directory', error: err.message });
    }
    // Filter only images (jpg, jpeg, png, webp, gif)
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    res.json({ files: imageFiles });
  });
});

module.exports = router;

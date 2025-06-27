const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/uploadMiddleware');
const { moderateImage } = require('../utils/moderateImage');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

// DB setup
const db = new sqlite3.Database('src/data/photos.db');
db.run(`
    CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        moderation_data TEXT
    )
`);

router.post('/upload', upload.array('file', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No image uploaded." });
    }

    const now = new Date().toISOString();
    const results = [];

    try {
        for (const file of req.files) {
            const pendingPath = path.join(__dirname, '../uploads/pending', file.filename);
            const approvedPath = path.join(__dirname, '../uploads/approved', file.filename);

            // Google Vision call
            const { status, flags } = await moderateImage(pendingPath);

            // If approved → move to /approved folder
            if (status === 'approved') {
                // ensure the folder exists
                fs.mkdirSync(path.dirname(approvedPath), { recursive: true });

                await fs.promises.rename(pendingPath, approvedPath);
            }

            // Save to database
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO photos (filename, status, created_at, moderation_data)
                     VALUES (?, ?, ?, ?)`,
                    [
                        file.filename,
                        status,
                        now,
                        flags ? JSON.stringify(flags) : null
                    ],
                    function (err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            results.push({
                filename: file.filename,
                status,
                moderation: flags
            });
        }

        return res.status(200).json({
            message: 'Files moderated, saved and moved if approved.',
            results
        });

    } catch (err) {
        console.error('Error during upload:', err);
        return res.status(500).json({
            message: "Error during upload or saving",
            error: err.message
        });
    }
});

module.exports = router;
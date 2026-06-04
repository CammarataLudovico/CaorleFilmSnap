const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const { upload, MAX_FILES_PER_REQUEST } = require('../middleware/uploadMiddleware');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

// DB setup
const dataDir = path.join(__dirname, '../../data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'photos.db');
const db = new sqlite3.Database(dbPath);
db.run(`
    CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_filename TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        moderation_data TEXT
    )
`);

router.post('/upload', upload.array('file', MAX_FILES_PER_REQUEST), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No image uploaded." });
    }

    const now = new Date().toISOString();
    const results = [];

    try {
        for (const file of req.files) {
        // Moderation disabled (Google Vision billing off): auto-approve all uploads.
        // Admin removes unwanted photos manually from the /admin page.
        let status = 'approved';
        const flags = null;

        const pendingPath = path.join(__dirname, '../uploads/pending', file.filename);
        const approvedPath = path.join(__dirname, '../uploads/approved', file.filename);
        const originalPath = path.join(__dirname, '../uploads/original', file.filename);

        try {
            // Ensure approved and original directories exist
            fs.mkdirSync(path.dirname(approvedPath), { recursive: true });
            fs.mkdirSync(path.dirname(originalPath), { recursive: true });

            // Save original file
            await fs.promises.copyFile(pendingPath, originalPath);

            // Auto-rotate based on EXIF and save to approved
            await sharp(pendingPath)
                .rotate()
                .resize({ width: 1920, withoutEnlargement: true })
                .jpeg({ quality: 50 })
                .toFile(approvedPath);

            // Remove pending file after processing
            await fs.promises.unlink(pendingPath);
        } catch (fileErr) {
            console.error('Error while processing file:', file.filename, fileErr);
            status = 'pending_moderator';
        }

        // Save photo info to database
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO photos (filename, original_filename, status, created_at, moderation_data)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    file.filename,
                    file.originalname,
                    status,
                    now,
                    flags ? JSON.stringify(flags) : null
                ],
                function (err) {
                    if (err) {
                        console.error('Errore DB:', err);
                        reject(err);
                    } else resolve();
                }
            );
        });

        results.push({
            filename: file.filename,
            status
        });
    }

        return res.status(200).json({
            message: 'Files processed.',
            results
        });

    } catch (err) {
        console.error('Error during upload:', err);
        return res.status(500).json({
            message: 'Upload failed. Please retry later.'
        });
    }
});

module.exports = router;
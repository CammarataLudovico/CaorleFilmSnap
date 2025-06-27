const express = require('express')
const cors = require('cors')
const uploadRoutes = require('../routes/upload');
const pendingPhotosRoutes = require('../routes/pendingPhotos');
const serveIndex = require('serve-index');
const multer = require('multer')
const fs = require('fs');

const server = express();
const PORT = 3001;

server.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
}));

server.use(express.json());

server.get('/', (_req, res) => {
    res.send("Hello World");
})

const path = require('path');

// server.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
server.use('/', uploadRoutes)
server.use('/api', uploadRoutes);
server.use('/api', pendingPhotosRoutes);
// serve the entire uploads folder with file index
server.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')), serveIndex(path.join(__dirname, '..', 'uploads'), {'icons': true})); // gestione intera cartella file

// API: Approve a photo (move from pending to approved)
server.put('/api/photos/:filename/approve', (req, res) => {
  const filename = req.params.filename;
  const pendingPath = path.join(__dirname, '../uploads/pending', filename);
  const publicPath = path.join(__dirname, '../uploads/approved', filename);

  // Move only the image file
  fs.rename(pendingPath, publicPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error moving file', error: err.message });
    }
    res.json({ message: 'Photo approved' });
  });
});

// API: Reject a photo (delete from pending)
server.put('/api/photos/:filename/reject', (req, res) => {
  const filename = req.params.filename;
  const pendingPath = path.join(__dirname, '../uploads/pending', filename);

  fs.unlink(pendingPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting file', error: err.message });
    }
    res.json({ message: 'Photo rejected and deleted' });
  });
});

// API: returns the list of files in /uploads/pending
server.get('/api/pending-photos', (req, res) => {
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

// API: returns the list of files in /uploads/approved (approved photos)
server.get('/api/photos/approved', (req, res) => {
  const dir = path.join(__dirname, '../uploads/approved');
  fs.readdir(dir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading directory', error: err.message });
    }
    // Filter only images (jpg, jpeg, png, webp, gif)
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    res.json({ files: imageFiles });
  });
});

server.use((req, res) => {
  res.status(404).send('Page not found');
});

server.use((err, req, res, next) => {
  console.error('❌ Global error:', err.message);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'Multer error: ' + err.message });
  }
  res.status(500).json({ message: 'Internal server error: ' + err.message });
});

server.listen(PORT, () => {
    console.log('Server listening!')
})
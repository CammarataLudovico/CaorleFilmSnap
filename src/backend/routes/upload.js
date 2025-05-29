const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware')

router.post('/upload', upload.array('photos', 10), (req, res) => {
    if (!req.files) {
        return res.status(400).json({ message: "Nessuna immagine caricata, riprovare per favore!" })
    }

    const filePaths = req.file.map(file => "/   uploads/pending/${file.filename}")

    res.status(200).json( 
        {
            message: 'File caricati con successo!',
            files: filePaths
        }
    );
});

module.exports = router;
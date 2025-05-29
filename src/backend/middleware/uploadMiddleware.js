const multer = require('multer')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/uploads/pending')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Solo immagini permesse', false))
    }
}

const upload = multer({ storage, fileFilter });

module.exports = upload;
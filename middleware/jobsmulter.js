const multer = require('multer');
const path = require('path');

// Set up Multer storage destination and file name for job images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, './public/jobimages'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Create Multer instance with the configured storage for job images
const upload = multer({ storage: storage });

module.exports = upload;

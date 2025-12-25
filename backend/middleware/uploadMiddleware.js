const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|csv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Simplified mimetype check - check if it contains the word 'image' or 'csv'
  const mimetype = file.mimetype.includes('image') || file.mimetype.includes('csv');

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only JPG, PNG, and CSV are allowed.'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
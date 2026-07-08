const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { uploadImage, deleteImage } = require('../controllers/media.controller');

// Memory storage - buffer goes straight to S3, never touches disk
// (important on Render's ephemeral filesystem)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

const router = express.Router();

router.post('/upload', protect, upload.single('image'), uploadImage);
router.delete('/:key', protect, deleteImage);

module.exports = router;

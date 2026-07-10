const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  listArchivePages,
  getArchivePage,
  updateArchivePage,
  addSection,
  updateSection,
  reorderSections,
  deleteSection,
  addSectionImage,
  updateSectionImage,
  deleteSectionImage,
} = require('../controllers/archive.controller');

// Memory storage - buffer goes straight to S3, never touches disk
// (same reasoning as media.routes.js: Render's filesystem is ephemeral)
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

router.use(protect); // Media Gallery archive is an internal admin tool only

router.get('/pages', listArchivePages);
router.get('/pages/:slug', getArchivePage);
router.put('/pages/:slug', updateArchivePage);

router.post('/pages/:slug/sections', addSection);
router.put('/pages/:slug/sections/reorder', reorderSections); // must precede :sectionId route
router.put('/pages/:slug/sections/:sectionId', updateSection);
router.delete('/pages/:slug/sections/:sectionId', deleteSection);

router.post('/pages/:slug/sections/:sectionId/images', upload.single('image'), addSectionImage);
router.put('/pages/:slug/sections/:sectionId/images/:imageId', updateSectionImage);
router.delete('/pages/:slug/sections/:sectionId/images/:imageId', deleteSectionImage);

module.exports = router;

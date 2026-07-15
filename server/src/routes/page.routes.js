const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getPageBySlug,
  getPageForAdmin,
  listPages,
  createPage,
  deletePage,
  addBlock,
  updateBlock,
  reorderBlocks,
  deleteBlock,
  setPageStatus,
} = require('../controllers/page.controller');

const router = express.Router();

// Public - storefront reads published pages only
router.get('/:slug', getPageBySlug);

// Admin - page builder CRUD (all protected)
router.get('/', protect, listPages);
router.post('/', protect, createPage);
router.get('/:slug/admin', protect, getPageForAdmin);
router.put('/:slug/status', protect, setPageStatus);
router.put('/:slug/reorder', protect, reorderBlocks);
router.post('/:slug/blocks', protect, addBlock);
router.put('/:slug/blocks/:blockId', protect, updateBlock);
router.delete('/:slug/blocks/:blockId', protect, deleteBlock);
router.delete('/:slug', protect, deletePage);

module.exports = router;

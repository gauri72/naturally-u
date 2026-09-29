const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getProducts, getProductBySlug, getProductById, createProduct, updateProduct, deleteProduct, restoreProduct,
} = require('../controllers/product.controller');

const router = express.Router();

router.get('/', getProducts);
// Must come before '/:slug' - otherwise "/id/<id>" would be matched as
// getProductBySlug with slug="id".
router.get('/id/:id', protect, getProductById);
router.get('/:slug', getProductBySlug);
router.post('/', protect, createProduct);
router.put('/:id/restore', protect, restoreProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;

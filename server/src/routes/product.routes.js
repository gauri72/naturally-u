const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct,
} = require('../controllers/product.controller');

const router = express.Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;

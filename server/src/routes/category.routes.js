const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getCategories, createCategory, updateCategory, deleteCategory,
} = require('../controllers/category.controller');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;

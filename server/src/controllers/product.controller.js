const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.model');

// @route GET /api/products?tag=bestseller&category=soaps&page=1&limit=12
const getProducts = asyncHandler(async (req, res) => {
  const { tag, category, search, page = 1, limit = 12 } = req.query;
  const filter = { isActive: true };
  if (tag) filter.tags = tag;
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const products = await Product.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('category', 'name slug');

  const total = await Product.countDocuments(filter);
  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  // Soft delete - keeps order history intact
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ message: 'Product deactivated' });
});

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };

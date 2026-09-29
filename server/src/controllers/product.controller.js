const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.model');
const Category = require('../models/Category.model');

// @route GET /api/products?tag=bestseller&category=soaps&page=1&limit=12&status=active|archived|all
// `status` defaults to 'active' (the public storefront's implicit
// behavior); 'archived'/'all' are for admin screens that need to see
// soft-deleted products (e.g. an Archived/Restore tab) - unauthenticated
// callers can technically pass status=archived too since this route has
// no `protect` middleware, but that only exposes the same fields the
// public product list already exposes, just for inactive items.
const getProducts = asyncHandler(async (req, res) => {
  const { tag, category, search, page = 1, limit = 12, status = 'active' } = req.query;
  const filter = {};
  if (status === 'active') filter.isActive = true;
  else if (status === 'archived') filter.isActive = false;
  if (tag) filter.tags = tag;
  if (category) {
    // `category` here is a slug, not the ObjectId the field actually stores -
    // resolve it first so an unmatched/unknown slug returns no results
    // instead of throwing a Mongoose CastError.
    const categoryDoc = await Category.findOne({ slug: category });
    if (!categoryDoc) {
      res.json({ products: [], total: 0, page: Number(page), pages: 0 });
      return;
    }
    filter.category = categoryDoc._id;
  }
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

// @route GET /api/products/id/:id
// Admin lookup by _id (not slug), regardless of active/archived status -
// used to load a product into an edit form from the admin list, where
// the row's _id is already on hand and a slug-based public lookup would
// also 404 for archived products.
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
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

const restoreProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

module.exports = {
  getProducts, getProductBySlug, getProductById, createProduct, updateProduct, deleteProduct, restoreProduct,
};

const asyncHandler = require('express-async-handler');
const Category = require('../models/Category.model');

const getCategories = asyncHandler(async (req, res) => {
  res.json(await Category.find());
});

const createCategory = asyncHandler(async (req, res) => {
  res.status(201).json(await Category.create(req.body));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };

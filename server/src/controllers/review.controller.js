const asyncHandler = require('express-async-handler');
const Review = require('../models/Review.model');
const Product = require('../models/Product.model');

const getReviewsForProduct = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true }).sort('-createdAt');
  res.json(reviews);
});

const createReview = asyncHandler(async (req, res) => {
  const review = await Review.create({ ...req.body, product: req.params.productId });
  res.status(201).json(review);
});

// Admin: approve + recalculate product rating aggregate
const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const stats = await Review.aggregate([
    { $match: { product: review.product, isApproved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length) {
    await Product.findByIdAndUpdate(review.product, {
      ratingAverage: Math.round(stats[0].avg * 10) / 10,
      ratingCount: stats[0].count,
    });
  }

  res.json(review);
});

const listPendingReviews = asyncHandler(async (req, res) => {
  res.json(await Review.find({ isApproved: false }).populate('product', 'name'));
});

module.exports = { getReviewsForProduct, createReview, approveReview, listPendingReviews };

const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getReviewsForProduct, createReview, approveReview, listPendingReviews,
} = require('../controllers/review.controller');

const router = express.Router();

router.get('/product/:productId', getReviewsForProduct);
router.post('/product/:productId', createReview);
router.get('/pending', protect, listPendingReviews);
router.put('/:id/approve', protect, approveReview);

module.exports = router;

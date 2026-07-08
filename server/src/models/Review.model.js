const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // reviewer display name, e.g. "Priya S."
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    verifiedBuyer: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false }, // admin moderation before it goes public
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);

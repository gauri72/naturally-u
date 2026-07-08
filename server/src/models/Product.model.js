const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number }, // for showing strikethrough/sale price
    images: [{ url: String, alt: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: String }], // 'bestseller', 'new', 'gift-set'
    ingredients: [{ type: String }],
    stock: { type: Number, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    isGiftSet: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // soft delete / hide without removing
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);

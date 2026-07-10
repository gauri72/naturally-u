const mongoose = require('mongoose');

const archiveImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    key: { type: String, required: true }, // S3 key, needed for deleteObject
    caption: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: true, timestamps: false }
);

const archiveSectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // 'Hero', 'Almond Sensational face scrub and mask', 'Rucha Naik Joshi'
    order: { type: Number, required: true },
    content: { type: String, default: '' },
    images: [archiveImageSchema],
    // Free-form bag for section-specific fields that don't apply to every
    // page (e.g. products: {price, inStock}) - shape varies by parent slug,
    // same convention as Page.model.js's block `props: Mixed`.
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: true, timestamps: false }
);

const archivePageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }, // home|about|products|testimonials
    title: { type: String, required: true },
    sourceUrl: { type: String, required: true }, // original naturallyu.nl page URL
    sections: [archiveSectionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ArchivePage', archivePageSchema);

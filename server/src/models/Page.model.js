const mongoose = require('mongoose');

/**
 * CMS PAGE BUILDER MODEL
 * ----------------------
 * A Page is an ordered list of "blocks". Each block has:
 *   - blockType: matches a key in the frontend block registry
 *                (client/src/blocks/registry) AND server/src/blocks
 *                validation registry.
 *   - order:     integer, drives render + drag-reorder sequence.
 *   - visible:   toggle without deleting (admin "hide section" switch).
 *   - props:     Mixed/flexible object — shape depends on blockType.
 *                Validated at the controller level against
 *                server/src/blocks/<blockType>.schema.js before save,
 *                NOT at the Mongoose schema level (keeps this model
 *                block-agnostic so adding a new block type never
 *                requires a migration here).
 *
 * Adding a new block type = add its schema/renderer, NOT touch this file.
 */
const blockSchema = new mongoose.Schema(
  {
    blockType: { type: String, required: true }, // e.g. 'hero', 'productGrid', 'testimonial'
    order: { type: Number, required: true },
    visible: { type: Boolean, default: true },
    props: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: true, timestamps: false }
);

const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }, // 'home', 'about', 'gift-sets'
    title: { type: String, required: true },
    metaDescription: { type: String, default: '' },
    blocks: [blockSchema],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', pageSchema);

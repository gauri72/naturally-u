const asyncHandler = require('express-async-handler');
const Product = require('../models/Product.model');
const Page = require('../models/Page.model');

// Case-insensitive literal match (query may contain regex metachars)
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Pull the human-readable text out of a block's props so page content
// (headings, body, item titles, testimonials, image alts) is searchable.
const blockText = (block) => {
  const p = block.props || {};
  const parts = [p.heading, p.body, p.subtext, p.title, p.ctaLabel];
  if (Array.isArray(p.items)) p.items.forEach((it) => parts.push(it.title, it.subtitle));
  if (Array.isArray(p.testimonials)) p.testimonials.forEach((t) => parts.push(t.quote, t.author));
  if (Array.isArray(p.images)) p.images.forEach((im) => parts.push(im.alt));
  return parts.filter(Boolean).join(' ');
};

// Build a short snippet centered on the first match, so results show
// where the term appears rather than a generic page description.
const snippet = (text, re, len = 160) => {
  const idx = text.search(re);
  if (idx === -1) return text.slice(0, len).trim();
  const start = Math.max(0, idx - 50);
  const raw = text.slice(start, start + len).trim();
  return (start > 0 ? '… ' : '') + raw + (start + len < text.length ? ' …' : '');
};

// @desc    Site-wide search across products and CMS pages
// @route   GET /api/search?q=term
// @access  Public
const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    res.json({ query: '', products: [], pages: [] });
    return;
  }

  const re = new RegExp(escapeRegExp(q), 'i');

  // Products: name/description regex (works for partial terms; the text
  // index is optimized for whole words, regex catches substrings too).
  const products = await Product.find({
    isActive: true,
    $or: [{ name: re }, { description: re }, { shortDescription: re }],
  })
    .limit(24)
    .populate('category', 'name slug');

  // Pages: only published storefront pages. Scan block text in memory —
  // the catalog of pages is tiny, so this stays cheap and avoids a fragile
  // Mixed-field Mongo query.
  const publishedPages = await Page.find({ status: 'published' }).select('slug title blocks metaDescription');
  const pages = [];
  for (const page of publishedPages) {
    const haystack = [page.title, page.metaDescription, ...(page.blocks || []).map(blockText)]
      .filter(Boolean)
      .join(' — ');
    if (re.test(haystack)) {
      pages.push({
        slug: page.slug,
        title: page.title,
        snippet: snippet(haystack, re),
      });
    }
  }

  res.json({ query: q, products, pages });
});

module.exports = { search };

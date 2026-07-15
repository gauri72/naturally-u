const asyncHandler = require('express-async-handler');
const Page = require('../models/Page.model');
const blockValidators = require('../blocks');

// @desc    Get published page by slug (public, used by storefront)
// @route   GET /api/pages/:slug
// @access  Public
const getPageBySlug = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug, status: 'published' });
  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }
  // Only send visible blocks, sorted by order
  const blocks = page.blocks
    .filter((b) => b.visible)
    .sort((a, b) => a.order - b.order);

  res.json({ ...page.toObject(), blocks });
});

// @desc    Get full page doc including hidden blocks + draft state (admin)
// @route   GET /api/pages/:slug/admin
// @access  Private
const getPageForAdmin = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }
  const blocks = [...page.blocks].sort((a, b) => a.order - b.order);
  res.json({ ...page.toObject(), blocks });
});

// @desc    List all pages (admin)
// @route   GET /api/pages
// @access  Private
const listPages = asyncHandler(async (req, res) => {
  const pages = await Page.find().select('slug title status updatedAt');
  res.json(pages);
});

// @desc    Create a new page
// @route   POST /api/pages
// @access  Private
const createPage = asyncHandler(async (req, res) => {
  const { slug, title, metaDescription } = req.body;
  const exists = await Page.findOne({ slug });
  if (exists) {
    res.status(400);
    throw new Error('A page with this slug already exists');
  }
  const page = await Page.create({ slug, title, metaDescription, blocks: [] });
  res.status(201).json(page);
});

// @desc    Delete an entire page
// @route   DELETE /api/pages/:slug
// @access  Private
const deletePage = asyncHandler(async (req, res) => {
  // The storefront root renders the 'home' page, so it must always exist.
  if (req.params.slug === 'home') {
    res.status(400);
    throw new Error('The home page cannot be deleted');
  }
  const page = await Page.findOneAndDelete({ slug: req.params.slug });
  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }
  res.json({ message: 'Page deleted', slug: page.slug });
});

// @desc    Add a block to a page
// @route   POST /api/pages/:slug/blocks
// @access  Private
const addBlock = asyncHandler(async (req, res) => {
  const { blockType, props } = req.body;
  const validator = blockValidators[blockType];
  if (!validator) {
    res.status(400);
    throw new Error(`Unknown blockType: ${blockType}`);
  }
  const { error, value } = validator(props);
  if (error) {
    res.status(400);
    throw new Error(`Invalid props for ${blockType}: ${error}`);
  }

  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }

  const nextOrder = page.blocks.length
    ? Math.max(...page.blocks.map((b) => b.order)) + 1
    : 0;

  page.blocks.push({ blockType, props: value, order: nextOrder, visible: true });
  await page.save();
  res.status(201).json(page);
});

// @desc    Update a single block's props or visibility
// @route   PUT /api/pages/:slug/blocks/:blockId
// @access  Private
const updateBlock = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }
  const block = page.blocks.id(req.params.blockId);
  if (!block) {
    res.status(404);
    throw new Error('Block not found');
  }

  if (req.body.props !== undefined) {
    const validator = blockValidators[block.blockType];
    const { error, value } = validator(req.body.props);
    if (error) {
      res.status(400);
      throw new Error(`Invalid props: ${error}`);
    }
    block.props = value;
  }
  if (req.body.visible !== undefined) block.visible = req.body.visible;

  await page.save();
  res.json(page);
});

// @desc    Reorder blocks (drag-and-drop from admin page builder)
// @route   PUT /api/pages/:slug/reorder
// @access  Private
// @body    { order: [blockId1, blockId2, ...] }  <- new order, top to bottom
const reorderBlocks = asyncHandler(async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    res.status(400);
    throw new Error('order must be an array of block IDs');
  }

  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }

  order.forEach((blockId, index) => {
    const block = page.blocks.id(blockId);
    if (block) block.order = index;
  });

  await page.save();
  res.json(page);
});

// @desc    Delete a block
// @route   DELETE /api/pages/:slug/blocks/:blockId
// @access  Private
const deleteBlock = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }
  page.blocks.pull(req.params.blockId);
  await page.save();
  res.json(page);
});

// @desc    Publish / unpublish a page
// @route   PUT /api/pages/:slug/status
// @access  Private
const setPageStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['draft', 'published'].includes(status)) {
    res.status(400);
    throw new Error('status must be draft or published');
  }
  const page = await Page.findOneAndUpdate(
    { slug: req.params.slug },
    { status, publishedAt: status === 'published' ? new Date() : null },
    { new: true }
  );
  if (!page) {
    res.status(404);
    throw new Error('Page not found');
  }
  res.json(page);
});

module.exports = {
  getPageBySlug,
  getPageForAdmin,
  listPages,
  createPage,
  deletePage,
  addBlock,
  updateBlock,
  reorderBlocks,
  deleteBlock,
  setPageStatus,
};

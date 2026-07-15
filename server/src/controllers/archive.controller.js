const asyncHandler = require('express-async-handler');
const ArchivePage = require('../models/ArchivePage.model');
const { uploadBuffer, deleteObject } = require('../utils/s3');

const findPageOr404 = async (slug, res) => {
  const page = await ArchivePage.findOne({ slug });
  if (!page) {
    res.status(404);
    throw new Error('Archive page not found');
  }
  return page;
};

const findSectionOr404 = (page, sectionId, res) => {
  const section = page.sections.id(sectionId);
  if (!section) {
    res.status(404);
    throw new Error('Archive section not found');
  }
  return section;
};

// @desc    List all archive pages (slug/title/sourceUrl/section count)
// @route   GET /api/archive/pages
// @access  Private
const listArchivePages = asyncHandler(async (req, res) => {
  const pages = await ArchivePage.find().select('slug title sourceUrl sections');
  res.json(pages.map((p) => ({
    _id: p._id,
    slug: p.slug,
    title: p.title,
    sourceUrl: p.sourceUrl,
    sectionCount: p.sections.length,
    imageCount: p.sections.reduce((sum, s) => sum + s.images.length, 0),
  })));
});

// @desc    Get one archive page with all sections, sorted by order
// @route   GET /api/archive/pages/:slug
// @access  Private
const getArchivePage = asyncHandler(async (req, res) => {
  const page = await findPageOr404(req.params.slug, res);
  const sections = [...page.sections].sort((a, b) => a.order - b.order);
  res.json({ ...page.toObject(), sections });
});

// @desc    Update an archive page's title/sourceUrl
// @route   PUT /api/archive/pages/:slug
// @access  Private
const updateArchivePage = asyncHandler(async (req, res) => {
  const page = await findPageOr404(req.params.slug, res);
  if (req.body.title !== undefined) page.title = req.body.title;
  if (req.body.sourceUrl !== undefined) page.sourceUrl = req.body.sourceUrl;
  await page.save();
  res.json(page);
});

// @desc    Add a section to an archive page
// @route   POST /api/archive/pages/:slug/sections
// @access  Private
const addSection = asyncHandler(async (req, res) => {
  const page = await findPageOr404(req.params.slug, res);
  const { name, content, meta } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('name is required');
  }
  const nextOrder = page.sections.length
    ? Math.max(...page.sections.map((s) => s.order)) + 1
    : 0;
  page.sections.push({ name, content: content || '', meta: meta || {}, order: nextOrder, images: [] });
  await page.save();
  res.status(201).json(page);
});

// @desc    Update a section's name/content/meta
// @route   PUT /api/archive/pages/:slug/sections/:sectionId
// @access  Private
const updateSection = asyncHandler(async (req, res) => {
  const page = await findPageOr404(req.params.slug, res);
  const section = findSectionOr404(page, req.params.sectionId, res);
  if (req.body.name !== undefined) section.name = req.body.name;
  if (req.body.content !== undefined) section.content = req.body.content;
  if (req.body.meta !== undefined) section.meta = req.body.meta;
  await page.save();
  res.json(page);
});

// @desc    Reorder sections (drag-and-drop)
// @route   PUT /api/archive/pages/:slug/sections/reorder
// @access  Private
// @body    { order: [sectionId1, sectionId2, ...] }  <- new order, top to bottom
const reorderSections = asyncHandler(async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    res.status(400);
    throw new Error('order must be an array of section IDs');
  }
  const page = await findPageOr404(req.params.slug, res);
  order.forEach((sectionId, index) => {
    const section = page.sections.id(sectionId);
    if (section) section.order = index;
  });
  await page.save();
  res.json(page);
});

// @desc    Delete a section
// @route   DELETE /api/archive/pages/:slug/sections/:sectionId
// @access  Private
const deleteSection = asyncHandler(async (req, res) => {
  const page = await findPageOr404(req.params.slug, res);
  page.sections.pull(req.params.sectionId);
  await page.save();
  res.json(page);
});

// @desc    Upload an image into a section
// @route   POST /api/archive/pages/:slug/sections/:sectionId/images
// @access  Private
const addSectionImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file provided');
  }
  const page = await findPageOr404(req.params.slug, res);
  const section = findSectionOr404(page, req.params.sectionId, res);

  const { url, key } = await uploadBuffer(req.file.buffer, {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    prefix: 'archive',
  });

  const nextOrder = section.images.length
    ? Math.max(...section.images.map((img) => img.order)) + 1
    : 0;
  section.images.push({ url, key, caption: req.body.caption || '', order: nextOrder });
  await page.save();
  res.status(201).json(page);
});

// @desc    Update an image's caption/order
// @route   PUT /api/archive/pages/:slug/sections/:sectionId/images/:imageId
// @access  Private
const updateSectionImage = asyncHandler(async (req, res) => {
  const page = await findPageOr404(req.params.slug, res);
  const section = findSectionOr404(page, req.params.sectionId, res);
  const image = section.images.id(req.params.imageId);
  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }
  if (req.body.caption !== undefined) image.caption = req.body.caption;
  if (req.body.order !== undefined) image.order = req.body.order;
  await page.save();
  res.json(page);
});

// @desc    Delete an image (S3 object + array entry)
// @route   DELETE /api/archive/pages/:slug/sections/:sectionId/images/:imageId
// @access  Private
const deleteSectionImage = asyncHandler(async (req, res) => {
  const page = await findPageOr404(req.params.slug, res);
  const section = findSectionOr404(page, req.params.sectionId, res);
  const image = section.images.id(req.params.imageId);
  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }
  // Seeded archive images reference local files bundled with the frontend
  // (key "local:<path>", see seedArchive.js) - nothing to delete in S3.
  if (!image.key.startsWith('local:')) {
    await deleteObject(image.key);
  }
  section.images.pull(req.params.imageId);
  await page.save();
  res.json(page);
});

module.exports = {
  listArchivePages,
  getArchivePage,
  updateArchivePage,
  addSection,
  updateSection,
  reorderSections,
  deleteSection,
  addSectionImage,
  updateSectionImage,
  deleteSectionImage,
};

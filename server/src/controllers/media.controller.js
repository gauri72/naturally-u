const asyncHandler = require('express-async-handler');
const Media = require('../models/Media.model');
const { uploadBuffer, deleteObject } = require('../utils/s3');

// @desc    List uploaded images, newest first
// @route   GET /api/media
// @access  Private
const listMedia = asyncHandler(async (req, res) => {
  const media = await Media.find().sort({ createdAt: -1 });
  res.json(media);
});

// @desc    Upload an image to S3 (used by admin media library / block image pickers)
// @route   POST /api/media/upload
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file provided');
  }

  const { url, key } = await uploadBuffer(req.file.buffer, {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
  });

  const media = await Media.create({
    url,
    key,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.admin._id,
  });

  res.status(201).json(media);
});

// @desc    Delete an uploaded image (S3 object + Media record)
// @route   DELETE /api/media/:id
// @access  Private
// Looked up by record id rather than S3 key: the bucket is shared with other
// content (archive images, other apps' public/ files), so this route can
// only ever delete objects its own upload created.
const deleteImage = asyncHandler(async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) {
    res.status(404);
    throw new Error('Image not found');
  }
  await deleteObject(media.key);
  await media.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = { listMedia, uploadImage, deleteImage };

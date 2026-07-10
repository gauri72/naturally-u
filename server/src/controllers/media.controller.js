const asyncHandler = require('express-async-handler');
const { uploadBuffer, deleteObject } = require('../utils/s3');

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

  res.status(201).json({ url, key });
});

// @desc    Delete an image from S3
// @route   DELETE /api/media/:key
// @access  Private
const deleteImage = asyncHandler(async (req, res) => {
  await deleteObject(req.params.key);
  res.json({ message: 'Deleted' });
});

module.exports = { uploadImage, deleteImage };

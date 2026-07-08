const asyncHandler = require('express-async-handler');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');

const s3 = new S3Client({ region: process.env.AWS_REGION });

// @desc    Upload an image to S3 (used by admin media library / block image pickers)
// @route   POST /api/media/upload
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file provided');
  }

  const ext = path.extname(req.file.originalname);
  const key = `uploads/${crypto.randomUUID()}${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  }));

  const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  res.status(201).json({ url, key });
});

// @desc    Delete an image from S3
// @route   DELETE /api/media/:key
// @access  Private
const deleteImage = asyncHandler(async (req, res) => {
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: req.params.key,
  }));
  res.json({ message: 'Deleted' });
});

module.exports = { uploadImage, deleteImage };

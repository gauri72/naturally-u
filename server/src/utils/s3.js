const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');

const s3 = new S3Client({ region: process.env.AWS_REGION });

// Uploads a buffer to S3 under `${prefix}/${uuid}${ext}` and returns the
// public url + key. Shared by the media library and the archive gallery
// so both keep identical upload behavior without duplicating S3 wiring.
const uploadBuffer = async (buffer, { originalname, mimetype, prefix = 'uploads' }) => {
  const ext = path.extname(originalname);
  const key = `${prefix}/${crypto.randomUUID()}${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));

  const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return { url, key };
};

const deleteObject = async (key) => {
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  }));
};

module.exports = { uploadBuffer, deleteObject };

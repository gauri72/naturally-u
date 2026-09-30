const mongoose = require('mongoose');

// One document per image uploaded through /api/media/upload, so the admin
// Media Library can list and delete past uploads. Archive gallery images
// are tracked on ArchivePage instead and never appear here.
const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    key: { type: String, required: true, unique: true }, // S3 key, needed for deleteObject
    originalName: { type: String, default: '' },
    mimetype: { type: String, default: '' },
    size: { type: Number, default: 0 }, // bytes
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);

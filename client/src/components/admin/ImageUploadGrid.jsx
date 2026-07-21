import { Image, Trash } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import './ImageUploadGrid.css';
import { useLang } from '../../i18n/LanguageContext.jsx';

// Reusable per-section image manager: upload, caption, delete. Each action
// hits its own endpoint directly (upload-and-persist in one request) rather
// than uploading to S3 and hoping a parent "Save" gets clicked later, which
// avoids orphaned S3 objects if the user navigates away mid-edit.
function ImageUploadGrid({ images, onUpload, onCaptionChange, onDelete }) {
  const { t } = useLang();
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await onUpload(file);
      toast.success(t('Image uploaded'));
    } catch {
      toast.error(t('Upload failed'));
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm(t('Delete this image?'))) return;
    try {
      await onDelete(imageId);
      toast.success(t('Image deleted'));
    } catch {
      toast.error(t('Delete failed'));
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {images.length === 0 ? (
        <div className="admin-empty-state">
          <Image size={36} />
          <p>{t('No images yet.')}</p>
        </div>
      ) : (
        <div className="admin-grid image-upload-grid">
          {images.map((img) => (
            <div key={img._id} className="admin-card image-upload-grid__item">
              <img src={img.url} alt={img.caption} className="image-upload-grid__thumb" />
              <input
                type="text"
                value={img.caption}
                placeholder={t('Caption')}
                onChange={(e) => onCaptionChange(img._id, e.target.value)}
              />
              <button
                type="button"
                className="btn btn--sm btn--danger"
                onClick={() => handleDelete(img._id)}
              >
                <Trash size={14} weight="bold" style={{ verticalAlign: '-2px', marginRight: 4 }} />
                {t('Delete')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploadGrid;

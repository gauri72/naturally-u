import { useEffect, useState } from 'react';
import { Image, Trash } from '@phosphor-icons/react';
import { getMedia, uploadImage, deleteImage } from '../../../api/media.api';
import toast from 'react-hot-toast';
import { useLang } from '../../../i18n/LanguageContext.jsx';

// Upload-and-list UI over every image uploaded through /api/media/upload
// (including product/block image pickers) - copy an image's URL to paste
// it into a block, or delete it.
function MediaLibraryPage() {
  const { t } = useLang();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMedia()
      .then((res) => setMedia(res.data))
      .catch(() => toast.error(t('Failed to load images')))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      setMedia((prev) => [res.data, ...prev]);
      toast.success(t('Uploaded'));
    } catch {
      toast.error(t('Upload failed'));
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('Delete this image?'))) return;
    try {
      await deleteImage(id);
      setMedia((prev) => prev.filter((img) => img._id !== id));
      toast.success(t('Image deleted'));
    } catch {
      toast.error(t('Delete failed'));
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>{t('Media Library')}</h1>
        <div className="admin-page-header__actions">
          <input type="file" accept="image/*" onChange={handleUpload} />
        </div>
      </div>
      {loading ? (
        <p>{t('Loading...')}</p>
      ) : media.length === 0 ? (
        <div className="admin-empty-state">
          <Image size={40} />
          <p>{t('No images yet.')}</p>
        </div>
      ) : (
        <div className="admin-grid">
          {media.map((img) => (
            <div key={img._id} className="admin-card">
              <img src={img.url} alt="" style={{ width: '100%', borderRadius: 'var(--radius-sm)', aspectRatio: '1', objectFit: 'cover' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
                <input readOnly value={img.url} onFocus={(e) => e.target.select()} style={{ fontSize: '0.7rem', flex: 1, minWidth: 0 }} />
                <button type="button" className="icon-btn icon-btn--danger" onClick={() => handleDelete(img._id)} title={t('Delete')}>
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaLibraryPage;

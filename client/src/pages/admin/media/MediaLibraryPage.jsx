import { useState } from 'react';
import { Image } from '@phosphor-icons/react';
import { uploadImage } from '../../../api/media.api';
import toast from 'react-hot-toast';
import { useLang } from '../../../i18n/LanguageContext.jsx';

// Minimal upload-and-list UI. For a full library, persist uploaded
// media metadata to a Media collection so past uploads are browsable
// (current scope: upload returns a URL to copy/paste into a block).
function MediaLibraryPage() {
  const { t } = useLang();
  const [uploaded, setUploaded] = useState([]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      setUploaded((prev) => [res.data, ...prev]);
      toast.success(t('Uploaded'));
    } catch {
      toast.error(t('Upload failed'));
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
      {uploaded.length === 0 ? (
        <div className="admin-empty-state">
          <Image size={40} />
          <p>{t('No uploads this session yet.')}</p>
        </div>
      ) : (
        <div className="admin-grid">
          {uploaded.map((img) => (
            <div key={img.key} className="admin-card">
              <img src={img.url} alt="" style={{ width: '100%', borderRadius: 'var(--radius-sm)', aspectRatio: '1', objectFit: 'cover' }} />
              <input readOnly value={img.url} onFocus={(e) => e.target.select()} style={{ marginTop: 'var(--space-sm)', fontSize: '0.7rem', width: '100%' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaLibraryPage;

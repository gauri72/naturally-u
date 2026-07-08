import { useState } from 'react';
import { uploadImage } from '../../../api/media.api';
import toast from 'react-hot-toast';

// Minimal upload-and-list UI. For a full library, persist uploaded
// media metadata to a Media collection so past uploads are browsable
// (current scope: upload returns a URL to copy/paste into a block).
function MediaLibraryPage() {
  const [uploaded, setUploaded] = useState([]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadImage(file);
      setUploaded((prev) => [res.data, ...prev]);
      toast.success('Uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  return (
    <div>
      <h1>Media Library</h1>
      <input type="file" accept="image/*" onChange={handleUpload} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 120px)', gap: '1rem', marginTop: '1rem' }}>
        {uploaded.map((img) => (
          <div key={img.key}>
            <img src={img.url} alt="" style={{ width: '100%' }} />
            <input readOnly value={img.url} onFocus={(e) => e.target.select()} style={{ fontSize: '0.6rem', width: '100%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MediaLibraryPage;

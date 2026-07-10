import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import {
  getArchivePage,
  updateSection,
  addSectionImage,
  updateSectionImage,
  deleteSectionImage,
} from '../../../api/archive.api';
import ImageUploadGrid from '../../../components/admin/ImageUploadGrid';
import './ArchiveSectionEditorPage.css';

function ArchiveSectionEditorPage() {
  const { pageSlug, sectionId } = useParams();
  const [page, setPage] = useState(null);

  const load = () => getArchivePage(pageSlug).then((res) => setPage(res.data));

  useEffect(() => { load(); }, [pageSlug, sectionId]);

  if (!page) return <p>Loading...</p>;

  const section = page.sections.find((s) => s._id === sectionId);
  if (!section) return <p>Section not found.</p>;

  const handleBlurField = async (field, value) => {
    if (section[field] === value) return;
    await updateSection(pageSlug, sectionId, { [field]: value });
    toast.success('Saved');
  };

  const handleMetaChange = async (key, value) => {
    await updateSection(pageSlug, sectionId, { meta: { ...section.meta, [key]: value } });
    load();
  };

  return (
    <div>
      <Link to={`/admin/media-gallery/archive/${pageSlug}`} className="admin-page-header__back">
        <ArrowLeft size={14} weight="bold" /> {page.title}
      </Link>

      <div className="admin-field" style={{ marginBottom: 'var(--space-lg)' }}>
        <label>Section name</label>
        <input
          defaultValue={section.name}
          onBlur={(e) => handleBlurField('name', e.target.value)}
          className="archive-section-editor__name-input"
        />
      </div>

      <div className="admin-field" style={{ marginBottom: 'var(--space-lg)' }}>
        <label>Content</label>
        <textarea
          defaultValue={section.content}
          onBlur={(e) => handleBlurField('content', e.target.value)}
          rows={8}
        />
      </div>

      {pageSlug === 'products' && (
        <div className="archive-section-editor__meta-row">
          <div className="admin-field" style={{ maxWidth: 160 }}>
            <label>Price</label>
            <input
              defaultValue={section.meta?.price || ''}
              onBlur={(e) => handleMetaChange('price', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label>In stock</label>
            <input
              type="checkbox"
              defaultChecked={!!section.meta?.inStock}
              onChange={(e) => handleMetaChange('inStock', e.target.checked)}
              className="archive-section-editor__checkbox"
            />
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: 'var(--space-sm)' }}>Images</h3>
      <ImageUploadGrid
        images={[...section.images].sort((a, b) => a.order - b.order)}
        onUpload={async (file) => {
          await addSectionImage(pageSlug, sectionId, file);
          load();
        }}
        onCaptionChange={(imageId, caption) => {
          updateSectionImage(pageSlug, sectionId, imageId, { caption });
        }}
        onDelete={async (imageId) => {
          await deleteSectionImage(pageSlug, sectionId, imageId);
          load();
        }}
      />
    </div>
  );
}

export default ArchiveSectionEditorPage;

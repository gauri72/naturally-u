import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CaretLeft, CaretRight } from '@phosphor-icons/react';
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
import { useLang } from '../../../i18n/LanguageContext.jsx';

// Labels for known meta keys; anything else gets a prettified key name.
const META_LABELS = {
  price: 'Price',
  inStock: 'In stock',
  sourceUrl: 'Original URL',
  author: 'Author',
  language: 'Language',
  email: 'Email',
  phone: 'Phone',
  ctaLabel: 'CTA label',
  ctaLink: 'CTA link',
  htmlMeta: 'HTML meta tag',
};

const metaLabel = (key) =>
  META_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

function ArchiveSectionEditorPage() {
  const { t } = useLang();
  const { pageSlug, sectionId } = useParams();
  const [page, setPage] = useState(null);

  const load = () => getArchivePage(pageSlug).then((res) => setPage(res.data));

  useEffect(() => { load(); }, [pageSlug, sectionId]);

  if (!page) return <p>{t('Loading...')}</p>;

  const sections = [...page.sections].sort((a, b) => a.order - b.order);
  const index = sections.findIndex((s) => s._id === sectionId);
  const section = sections[index];
  if (!section) return <p>{t('Section not found.')}</p>;

  const prev = index > 0 ? sections[index - 1] : null;
  const next = index < sections.length - 1 ? sections[index + 1] : null;

  const handleBlurField = async (field, value) => {
    if (section[field] === value) return;
    await updateSection(pageSlug, sectionId, { [field]: value });
    toast.success(t('Saved'));
  };

  const handleMetaChange = async (key, value) => {
    await updateSection(pageSlug, sectionId, { meta: { ...section.meta, [key]: value } });
    toast.success(t('Saved'));
    load();
  };

  const metaEntries = Object.entries(section.meta || {});

  return (
    <div>
      <div className="archive-section-editor__topbar">
        <Link to={`/admin/media-gallery/archive/${pageSlug}`} className="admin-page-header__back">
          <ArrowLeft size={14} weight="bold" /> {page.title}
        </Link>
        <div className="archive-section-editor__nav">
          <span className="archive-section-editor__position">
            {t('Section')} {index + 1} / {sections.length}
          </span>
          {prev ? (
            <Link
              to={`/admin/media-gallery/archive/${pageSlug}/sections/${prev._id}`}
              className="icon-btn"
              title={`${t('Previous')}: ${prev.name}`}
            >
              <CaretLeft size={18} weight="bold" />
            </Link>
          ) : (
            <span className="icon-btn is-disabled"><CaretLeft size={18} weight="bold" /></span>
          )}
          {next ? (
            <Link
              to={`/admin/media-gallery/archive/${pageSlug}/sections/${next._id}`}
              className="icon-btn"
              title={`${t('Next')}: ${next.name}`}
            >
              <CaretRight size={18} weight="bold" />
            </Link>
          ) : (
            <span className="icon-btn is-disabled"><CaretRight size={18} weight="bold" /></span>
          )}
        </div>
      </div>

      <div className="admin-field" style={{ marginBottom: 'var(--space-lg)' }}>
        <label>{t('Section name')}</label>
        <input
          key={`name-${sectionId}`}
          defaultValue={section.name}
          onBlur={(e) => handleBlurField('name', e.target.value)}
          className="archive-section-editor__name-input"
        />
      </div>

      <div className="admin-field" style={{ marginBottom: 'var(--space-lg)' }}>
        <label>{t('Content')}</label>
        <textarea
          key={`content-${sectionId}`}
          defaultValue={section.content}
          onBlur={(e) => handleBlurField('content', e.target.value)}
          rows={Math.max(6, Math.min(18, Math.ceil((section.content || '').length / 90)))}
        />
      </div>

      {metaEntries.length > 0 && (
        <>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>{t('Details')}</h3>
          <div className="archive-section-editor__meta-row">
            {metaEntries.map(([key, value]) => (
              <div className="admin-field" key={`${sectionId}-${key}`} style={{ minWidth: 160, maxWidth: 360 }}>
                <label>{t(metaLabel(key))}</label>
                {typeof value === 'boolean' ? (
                  <input
                    type="checkbox"
                    defaultChecked={value}
                    onChange={(e) => handleMetaChange(key, e.target.checked)}
                    className="archive-section-editor__checkbox"
                  />
                ) : (
                  <input
                    defaultValue={value}
                    onBlur={(e) => {
                      if (String(value) !== e.target.value) handleMetaChange(key, e.target.value);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <h3 style={{ marginBottom: 'var(--space-sm)' }}>{t('Images')}</h3>
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

import { Link } from 'react-router-dom';
import { Archive } from '@phosphor-icons/react';
import { useLang } from '../../../i18n/LanguageContext.jsx';

// Landing page for Media Gallery. Today it has one sub-section (Archive);
// adding a sibling later means one more card here + one more <Route>, no
// AdminLayout.jsx sidebar changes needed.
function MediaGalleryHomePage() {
  const { t } = useLang();
  return (
    <div>
      <div className="admin-page-header">
        <h1>{t('Media Gallery')}</h1>
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
        {t('Archived and reusable media for NaturallyU.')}
      </p>
      <div className="admin-grid">
        <Link to="/admin/media-gallery/archive" className="admin-card admin-card--interactive">
          <Archive size={28} color="var(--color-primary)" />
          <h3 style={{ marginTop: 'var(--space-sm)' }}>{t('Archive')}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {t("The legacy naturallyu.nl website's content, preserved by page and section.")}
          </p>
        </Link>
      </div>
    </div>
  );
}

export default MediaGalleryHomePage;

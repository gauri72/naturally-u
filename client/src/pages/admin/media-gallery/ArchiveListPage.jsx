import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  House, User, Package, ChatCircleText, Storefront, Globe, Archive,
  ArrowSquareOut, Rows, Images, FileText,
} from '@phosphor-icons/react';
import { listArchivePages } from '../../../api/archive.api';
import './ArchiveListPage.css';
import { useLang } from '../../../i18n/LanguageContext.jsx';

// Recognizable icon per archived legacy page
const PAGE_ICONS = {
  home: House,
  about: User,
  products: Package,
  testimonials: ChatCircleText,
  shop: Storefront,
  site: Globe,
};

function ArchiveListPage() {
  const { t } = useLang();
  const [pages, setPages] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    listArchivePages().then((res) => setPages(res.data));
  }, []);

  if (!pages) return <p>{t('Loading...')}</p>;

  const totals = pages.reduce(
    (acc, p) => ({ sections: acc.sections + p.sectionCount, images: acc.images + p.imageCount }),
    { sections: 0, images: 0 }
  );

  return (
    <div>
      <div className="admin-page-header">
        <h1>{t('Archive')}</h1>
      </div>
      <p className="archive-list__intro">
        {t('The complete content of the legacy naturallyu.nl website, preserved verbatim page by page — every section of text, every photo, and the site-wide elements (navigation, logo, footer, social links).')}
      </p>

      <div className="archive-list__stats">
        <span className="archive-list__stat">
          <FileText size={16} weight="regular" /> {pages.length} {t('pages')}
        </span>
        <span className="archive-list__stat">
          <Rows size={16} weight="regular" /> {totals.sections} {t('sections')}
        </span>
        <span className="archive-list__stat">
          <Images size={16} weight="regular" /> {totals.images} {t('images')}
        </span>
      </div>

      <div className="admin-grid archive-list__grid">
        {pages.map((p) => {
          const Icon = PAGE_ICONS[p.slug] || Archive;
          return (
            // Whole card navigates on click; the source URL is a real <a>,
            // which is why the card can't itself be a <Link> (nested <a>).
            <div
              key={p._id}
              className="admin-card admin-card--interactive archive-list__card"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/admin/media-gallery/archive/${p.slug}`)}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/admin/media-gallery/archive/${p.slug}`); }}
            >
              <div className="archive-list__card-head">
                <span className="archive-list__card-icon">
                  <Icon size={22} weight="regular" />
                </span>
                <div className="archive-list__card-title">
                  <h3>{p.title}</h3>
                  <code>{p.slug}</code>
                </div>
              </div>
              <div className="archive-list__card-counts">
                <span className="badge badge--neutral">{p.sectionCount} {p.sectionCount === 1 ? t('section') : t('sections')}</span>
                <span className="badge badge--neutral">{p.imageCount} {p.imageCount === 1 ? t('image') : t('images')}</span>
              </div>
              <a
                href={p.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="archive-list__card-source"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowSquareOut size={14} /> {p.sourceUrl.replace('https://www.', '')}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ArchiveListPage;

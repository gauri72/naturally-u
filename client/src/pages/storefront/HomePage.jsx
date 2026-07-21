import { useEffect, useState } from 'react';
import { getPageBySlug } from '../../api/pages.api';
import PageRenderer from '../../blocks/registry/PageRenderer.jsx';
import './HomePage.css';
import { useLang } from '../../i18n/LanguageContext.jsx';

// The homepage is entirely CMS-driven: fetch the 'home' Page document
// (ordered blocks) and hand it to PageRenderer. To change the homepage
// layout, edit it in /admin/pages/home — no code changes needed.
function HomePage() {
  const { t } = useLang();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPageBySlug('home')
      .then((res) => setPage(res.data))
      .catch((err) => {
        console.error('[HomePage] failed to load page:', err);
        setError('Unable to load page content.');
      });
  }, []);

  if (error) return <p className="page-error">{t(error)}</p>;
  if (!page) return <p className="page-loading">{t('Loading…')}</p>;

  // Wrapper applies one consistent vertical rhythm across all home sections
  // (see HomePage.css) regardless of each block's own margins.
  return (
    <div className="home-blocks">
      <PageRenderer blocks={page.blocks} />
    </div>
  );
}

export default HomePage;

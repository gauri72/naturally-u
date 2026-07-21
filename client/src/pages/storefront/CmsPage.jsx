import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '../../api/pages.api';
import PageRenderer from '../../blocks/registry/PageRenderer.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import './HomePage.css';
import { useLang } from '../../i18n/LanguageContext.jsx';

// Generic CMS-driven page: renders any published Page document by its
// slug (e.g. /about-2). Same pattern as HomePage, but the slug comes
// from the URL; unknown/unpublished slugs fall through to the 404 page.
// Registered as the last route before the catch-all in AppRoutes.jsx,
// so all static storefront routes keep precedence.
function CmsPage() {
  const { t } = useLang();
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setPage(null);
    setNotFound(false);
    getPageBySlug(slug)
      .then((res) => setPage(res.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) return <NotFoundPage />;
  if (!page) return <p className="page-loading">{t('Loading…')}</p>;

  return <PageRenderer blocks={page.blocks} />;
}

export default CmsPage;

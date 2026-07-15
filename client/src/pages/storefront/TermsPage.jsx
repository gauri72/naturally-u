import { useEffect, useState } from 'react';
import { getPageBySlug } from '../../api/pages.api';
import PageRenderer from '../../blocks/registry/PageRenderer.jsx';
import './LegalPage.css';

// CMS-driven: fetch the 'terms' Page document (ordered blocks) and hand it
// to PageRenderer. To edit this page's content, use /admin/pages/terms - no
// code changes needed.
function TermsPage() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPageBySlug('terms')
      .then((res) => setPage(res.data))
      .catch((err) => {
        console.error('[TermsPage] failed to load page:', err);
        setError('Unable to load page content.');
      });
  }, []);

  if (error) return <p className="page-error">{error}</p>;
  if (!page) return <p className="page-loading">Loading…</p>;

  return (
    <section className="shop-page legal-page">
      <PageRenderer blocks={page.blocks} />
    </section>
  );
}

export default TermsPage;

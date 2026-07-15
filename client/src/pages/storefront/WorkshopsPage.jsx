import { useEffect, useState } from 'react';
import { getPageBySlug } from '../../api/pages.api';
import PageRenderer from '../../blocks/registry/PageRenderer.jsx';
import './WorkshopsPage.css';

// CMS-driven: fetch the 'workshops' Page document (ordered blocks) and hand
// it to PageRenderer. To edit this page's content, use
// /admin/pages/workshops - no code changes needed.
function WorkshopsPage() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPageBySlug('workshops')
      .then((res) => setPage(res.data))
      .catch((err) => {
        console.error('[WorkshopsPage] failed to load page:', err);
        setError('Unable to load page content.');
      });
  }, []);

  if (error) return <p className="page-error">{error}</p>;
  if (!page) return <p className="page-loading">Loading…</p>;

  return (
    <section className="workshops-page">
      <PageRenderer blocks={page.blocks} />
    </section>
  );
}

export default WorkshopsPage;

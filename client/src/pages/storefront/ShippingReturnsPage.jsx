import { useEffect, useState } from 'react';
import { getPageBySlug } from '../../api/pages.api';
import PageRenderer from '../../blocks/registry/PageRenderer.jsx';
import './ShippingReturnsPage.css';

// CMS-driven: fetch the 'shipping-returns' Page document (ordered blocks)
// and hand it to PageRenderer. To edit this page's content, use
// /admin/pages/shipping-returns - no code changes needed.
function ShippingReturnsPage() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPageBySlug('shipping-returns')
      .then((res) => setPage(res.data))
      .catch((err) => {
        console.error('[ShippingReturnsPage] failed to load page:', err);
        setError('Unable to load page content.');
      });
  }, []);

  if (error) return <p className="page-error">{error}</p>;
  if (!page) return <p className="page-loading">Loading…</p>;

  return (
    <section className="shop-page shipping-returns-page">
      <PageRenderer blocks={page.blocks} />
    </section>
  );
}

export default ShippingReturnsPage;

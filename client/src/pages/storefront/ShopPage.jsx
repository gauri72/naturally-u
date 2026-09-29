import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPageBySlug } from '../../api/pages.api';
import PageRenderer from '../../blocks/registry/PageRenderer.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './ShopPage.css';

// The Sort dropdown is code-driven (writes to the URL). It's passed down
// as extra props to the Products block (sortValue/onSortChange) so that
// block can render it inline, next to its own Heading/Subheading - this
// keeps the page to a single heading, properly aligned with Sort on one
// row, instead of a second coded title living here too.
function ShopPage() {
  const { t } = useLang();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    getPageBySlug('shop')
      .then((res) => setPage(res.data))
      .catch((err) => {
        console.error('[ShopPage] failed to load page:', err);
        setError('Unable to load page content.');
      });
  }, []);

  const handleSortChange = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('sort', value);
    else next.delete('sort');
    setSearchParams(next);
  };

  if (error) return <p className="page-error">{t(error)}</p>;
  if (!page) return <p className="page-loading">{t('Loading…')}</p>;

  const blocksWithSort = page.blocks.map((b) => (
    b.blockType === 'shopProductGrid'
      ? { ...b, props: { ...b.props, sortValue: sort, onSortChange: handleSortChange } }
      : b
  ));

  return (
    <section className="shop-page">
      <PageRenderer blocks={blocksWithSort} />
    </section>
  );
}

export default ShopPage;

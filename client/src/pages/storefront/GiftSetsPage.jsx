import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Gift } from '@phosphor-icons/react';
import { getProducts } from '../../api/products.api';
import { getPageBySlug } from '../../api/pages.api';
import ProductCard from '../../components/product/ProductCard.jsx';
import PageHeroBlock from '../../blocks/PageHeroBlock/PageHeroBlock.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './GiftSetsPage.css';

// Hero copy + empty-state text come from the 'gift-sets' CMS page
// (/admin/pages/gift-sets); the product grid stays fully data-driven.
function GiftSetsPage() {
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts({ tag: 'gift-set' })
      .then((res) => setProducts(res.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getPageBySlug('gift-sets')
      .then((res) => setPage(res.data))
      .catch((err) => {
        console.error('[GiftSetsPage] failed to load page:', err);
        setError('Unable to load page content.');
      });
  }, []);

  if (error) return <p className="page-error">{t(error)}</p>;
  if (!page) return <p className="page-loading">{t('Loading…')}</p>;

  const hero = page.blocks.find((b) => b.blockType === 'pageHero')?.props || {};
  const content = page.blocks.find((b) => b.blockType === 'giftSetsPageContent')?.props || {};

  return (
    <section className="shop-page gift-sets-page">
      <PageHeroBlock variant="gift-sets" heading={hero.heading} subtext={hero.subtext} />

      {loading ? (
        <p className="page-loading">{t('Loading…')}</p>
      ) : products.length === 0 ? (
        <div className="gift-sets-page__empty">
          <Gift size={40} weight="regular" />
          <p>{t(content.emptyText)}</p>
          <Link to="/shop" className="btn btn--primary">{t('Shop All Products')}</Link>
        </div>
      ) : (
        <div className="shop-page__grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </section>
  );
}

export default GiftSetsPage;

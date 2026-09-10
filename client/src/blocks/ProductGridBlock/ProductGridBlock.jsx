import { useEffect, useState } from 'react';
import { Leaf, ArrowRight } from '@phosphor-icons/react';
import { getProducts } from '../../api/products.api';
import ProductCarousel from '../../components/product/ProductCarousel.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import bestSellerOne from '../../assets/images/home/best-seller-one.png';
import bestSellerTwo from '../../assets/images/home/best-seller-two.png';
import bestSellerThree from '../../assets/images/home/best-seller-three.png';
import bestSellerFour from '../../assets/images/home/best-seller-four.png';
import './ProductGridBlock.css';

// Fixed brand photography for the homepage bestsellers, keyed by product
// slug — mirrors HeroBlock/FeatureStripBlock's approach of bundling brand
// creative directly rather than depending on backend-hosted product images.
const localImageBySlug = {
  'turmeric-glow-soap': bestSellerOne,
  'neem-tea-tree-face-balm': bestSellerTwo,
  'oatmeal-honey-soap': bestSellerThree,
  'rosehip-face-oil': bestSellerFour,
};

// Props: { title, source: 'manual'|'tag'|'category', tag?, category?, productIds?, limit? }
// Renders every catalog product in a portrait carousel on the homepage;
// `source`/`tag`/`category`/`limit` are retained for CMS compatibility but
// the carousel shows the full catalog.
function ProductGridBlock({ title, source, tag, category, productIds = [], limit = 4 }) {
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 50 }) // comfortably covers the full catalog
      .then((res) => setProducts(res.data.products))
      .catch((err) => console.error('[ProductGridBlock] fetch failed:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="product-grid-block">
      <div className="product-grid-block__header">
        <h2>
          {t(title)}
          <Leaf size={34} weight="fill" color="var(--color-primary)" />
        </h2>
        <a href="/shop" className="product-grid-block__view-all">
          <span className="product-grid-block__view-all-full">{t('View All Products')}</span>
          <span className="product-grid-block__view-all-short">{t('View all')}</span>
          <ArrowRight size={16} weight="bold" />
        </a>
      </div>
      {loading ? (
        <p>{t('Loading products…')}</p>
      ) : (
        <ProductCarousel
          products={products.map((product) => {
            const localImage = localImageBySlug[product.slug];
            return localImage
              ? { ...product, images: [{ url: localImage, alt: product.name }] }
              : product;
          })}
        />
      )}
    </section>
  );
}

export default ProductGridBlock;

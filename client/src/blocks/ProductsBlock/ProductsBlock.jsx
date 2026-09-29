import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { getProducts } from '../../api/products.api';
import ProductCarousel from '../../components/product/ProductCarousel.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './ProductsBlock.css';

// The Shop page's single "Products" section: an optional heading/
// subheading + product listing, as one movable/hideable block. Unlike
// ProductGridBlock (admin-curated: fixed source/tag/category), this one
// stays reactive to the URL — tag/category/search/sort — so links from
// elsewhere on the site (header nav, search bar) and the Shop page's own
// Sort dropdown keep filtering what's shown here. Every other visual/
// behavioral detail is passed straight through to ProductCarousel, which
// defaults each one to its original hardcoded value.
function ProductsBlock({
  heading,
  subheading,
  sortValue,
  onSortChange,
  addToCartLabel,
  showCategoryBadge,
  currencySymbol,
  priceDecimals,
  autoplayEnabled,
  autoplaySpeed,
  showArrows,
  showDots,
  swipeSensitivity,
  carouselLabel,
  previousButtonLabel,
  nextButtonLabel,
  slidePickerLabel,
}) {
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    const params = { limit: 50 }; // comfortably covers the full catalog so nothing is hidden behind pagination
    if (tag) params.tag = tag;
    if (category) params.category = category;
    if (search) params.search = search;
    getProducts(params)
      .then((res) => setProducts(res.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tag, category, search]);

  const sortedProducts = useMemo(() => {
    if (sort === 'new') {
      return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sort === 'price-asc') return [...products].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...products].sort((a, b) => b.price - a.price);
    return products;
  }, [products, sort]);

  return (
    <div className="products-block">
      <div className="products-block__header">
        <div>
          {heading && <h2 className="products-block__heading">{t(heading)}</h2>}
          {subheading && <p className="products-block__subheading">{t(subheading)}</p>}
        </div>
        {onSortChange && (
          <select
            className="products-block__sort"
            value={sortValue || ''}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="">{t('Sort: Featured')}</option>
            <option value="new">{t('Newest')}</option>
            <option value="price-asc">{t('Price: Low to High')}</option>
            <option value="price-desc">{t('Price: High to Low')}</option>
          </select>
        )}
      </div>
      {loading ? (
        <p className="page-loading">{t('Loading…')}</p>
      ) : sortedProducts.length === 0 ? (
        <div className="products-block__empty">
          <MagnifyingGlass size={40} weight="regular" />
          <p>{t('No products found')}{search ? ` — "${search}"` : ''}.</p>
        </div>
      ) : (
        <ProductCarousel
          products={sortedProducts}
          addToCartLabel={addToCartLabel}
          showCategoryBadge={showCategoryBadge}
          currencySymbol={currencySymbol}
          priceDecimals={priceDecimals}
          autoplayEnabled={autoplayEnabled}
          autoplaySpeed={autoplaySpeed}
          showArrows={showArrows}
          showDots={showDots}
          swipeSensitivity={swipeSensitivity}
          carouselLabel={carouselLabel}
          previousButtonLabel={previousButtonLabel}
          nextButtonLabel={nextButtonLabel}
          slidePickerLabel={slidePickerLabel}
        />
      )}
    </div>
  );
}

export default ProductsBlock;

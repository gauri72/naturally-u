import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { getProducts } from '../../api/products.api';
import ProductCard from '../../components/product/ProductCard.jsx';
import './ShopPage.css';

const TITLES_BY_TAG = {
  bestseller: 'Best Sellers',
};

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
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

  const title = search
    ? `Results for "${search}"`
    : (TITLES_BY_TAG[tag] || (sort === 'new' ? 'New Arrivals' : '')
      || (category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Shop All Products'));

  return (
    <section className="shop-page">
      <div className="shop-page__header">
        <h1>{title}</h1>
        <select
          className="shop-page__sort"
          value={sort}
          onChange={(e) => {
            const next = new URLSearchParams(searchParams);
            if (e.target.value) next.set('sort', e.target.value);
            else next.delete('sort');
            setSearchParams(next);
          }}
        >
          <option value="">Sort: Featured</option>
          <option value="new">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <p className="page-loading">Loading…</p>
      ) : sortedProducts.length === 0 ? (
        <div className="shop-page__empty">
          <MagnifyingGlass size={40} weight="regular" />
          <p>No products found{search ? ` for "${search}"` : ''}.</p>
        </div>
      ) : (
        <div className="shop-page__grid">
          {sortedProducts.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </section>
  );
}

export default ShopPage;

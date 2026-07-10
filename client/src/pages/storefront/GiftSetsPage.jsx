import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Gift } from '@phosphor-icons/react';
import { getProducts } from '../../api/products.api';
import ProductCard from '../../components/product/ProductCard.jsx';
import './GiftSetsPage.css';

function GiftSetsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ tag: 'gift-set' })
      .then((res) => setProducts(res.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="shop-page gift-sets-page">
      <div className="gift-sets-page__hero">
        <h1>Gift Sets</h1>
        <p>Curated handmade sets, thoughtfully packaged — perfect for any occasion.</p>
      </div>

      {loading ? (
        <p className="page-loading">Loading…</p>
      ) : products.length === 0 ? (
        <div className="gift-sets-page__empty">
          <Gift size={40} weight="regular" />
          <p>No gift sets are available right now — check back soon, or browse the full shop.</p>
          <Link to="/shop" className="btn btn--primary">Shop All Products</Link>
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

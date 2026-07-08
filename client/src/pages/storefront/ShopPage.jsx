import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../../api/products.api';
import ProductCard from '../../components/product/ProductCard.jsx';
import './ShopPage.css';

const TITLES_BY_TAG = {
  bestseller: 'Best Sellers',
  new: 'New Arrivals',
};

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag') || '';

  useEffect(() => {
    getProducts(tag ? { tag } : {}).then((res) => setProducts(res.data.products)).catch(console.error);
  }, [tag]);

  return (
    <section className="shop-page">
      <h1>{TITLES_BY_TAG[tag] || 'Shop All Products'}</h1>
      <div className="shop-page__grid">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}

export default ShopPage;

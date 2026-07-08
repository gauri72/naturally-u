import { useEffect, useState } from 'react';
import { getProducts } from '../../api/products.api';
import ProductCard from '../../components/product/ProductCard.jsx';

function GiftSetsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts({ tag: 'gift-set' }).then((res) => setProducts(res.data.products)).catch(console.error);
  }, []);

  return (
    <section className="shop-page">
      <h1>Gift Sets</h1>
      <div className="shop-page__grid">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}

export default GiftSetsPage;

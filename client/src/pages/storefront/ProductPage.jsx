import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProductBySlug } from '../../api/products.api';
import { useCart } from '../../context/CartContext.jsx';
import './ProductPage.css';

function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    getProductBySlug(slug).then((res) => setProduct(res.data)).catch(console.error);
  }, [slug]);

  if (!product) return <p className="page-loading">Loading…</p>;

  return (
    <section className="product-page">
      <img src={product.images?.[0]?.url} alt={product.name} />
      <div>
        <h1>{product.name}</h1>
        <p className="product-page__price">${product.price.toFixed(2)}</p>
        <p>{product.description}</p>
        <button className="btn btn--primary" onClick={() => addItem(product)}>Add to Cart</button>
      </div>
    </section>
  );
}

export default ProductPage;

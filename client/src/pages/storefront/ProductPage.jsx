import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProductBySlug } from '../../api/products.api';
import { useCart } from '../../context/CartContext.jsx';
import './ProductPage.css';

function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    setSelectedImage(0);
    getProductBySlug(slug).then((res) => setProduct(res.data)).catch(console.error);
  }, [slug]);

  if (!product) return <p className="page-loading">Loading…</p>;

  const images = product.images || [];

  return (
    <section className="product-page">
      <div className="product-page__gallery">
        <img className="product-page__main-image" src={images[selectedImage]?.url} alt={images[selectedImage]?.alt || product.name} />
        {images.length > 1 && (
          <div className="product-page__thumbs">
            {images.map((img, i) => (
              <button
                key={img._id || img.url}
                type="button"
                className={`product-page__thumb ${i === selectedImage ? 'is-selected' : ''}`}
                onClick={() => setSelectedImage(i)}
              >
                <img src={img.url} alt={img.alt || product.name} />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <h1>{product.name}</h1>
        {product.shortDescription && <p className="product-page__tagline">{product.shortDescription}</p>}
        <p className="product-page__price">€{product.price.toFixed(2)}</p>
        <p>{product.description}</p>

        {product.ingredients?.length > 0 && (
          <div className="product-page__ingredients">
            <h3>Ingredients</h3>
            <ul>
              {product.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </div>
        )}

        <button className="btn btn--primary" onClick={() => addItem(product)}>Add to Cart</button>
      </div>
    </section>
  );
}

export default ProductPage;

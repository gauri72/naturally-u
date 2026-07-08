import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext.jsx';
import './ProductCard.css';

function Stars({ rating }) {
  const filled = Math.round(rating);
  return (
    <span className="product-card__stars" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={13} weight={i < filled ? 'fill' : 'regular'} />
      ))}
    </span>
  );
}

function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="product-card">
      <Link to={`/shop/${product.slug}`} className="product-card__image">
        <img src={product.images?.[0]?.url} alt={product.images?.[0]?.alt || product.name} />
      </Link>
      <div className="product-card__body">
        <h4>{product.name}</h4>
        <div className="product-card__row">
          <div className="product-card__meta">
            <p className="product-card__price">${product.price.toFixed(2)}</p>
            {product.ratingCount > 0 && (
              <p className="product-card__rating">
                <Stars rating={product.ratingAverage} /> ({product.ratingCount})
              </p>
            )}
          </div>
          <button
            type="button"
            className="product-card__cart-btn"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => addItem(product)}
          >
            <ShoppingBag size={17} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

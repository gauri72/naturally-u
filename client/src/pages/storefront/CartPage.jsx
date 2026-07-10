import { Link } from 'react-router-dom';
import { Minus, Plus, Trash, ShoppingBag } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext.jsx';
import './CartPage.css';

function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <section className="cart-page cart-page--empty">
        <ShoppingBag size={48} weight="regular" />
        <h1>Your cart is empty</h1>
        <p>Looks like you haven&rsquo;t added anything yet.</p>
        <Link to="/shop" className="btn btn--primary">Shop Now</Link>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart-page__layout">
        <div className="cart-page__list">
          {items.map((item) => (
            <div className="cart-page__item" key={item.productId}>
              <img src={item.image} alt={item.name} />
              <div className="cart-page__item-info">
                <h4>{item.name}</h4>
                <p className="cart-page__item-price">€{item.price.toFixed(2)}</p>
              </div>
              <div className="cart-page__qty">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} weight="bold" />
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} weight="bold" />
                </button>
              </div>
              <p className="cart-page__line-total">€{(item.price * item.quantity).toFixed(2)}</p>
              <button
                type="button"
                className="icon-btn icon-btn--danger"
                onClick={() => removeItem(item.productId)}
                aria-label="Remove item"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-page__summary">
          <h3>Order Summary</h3>
          <div className="cart-page__summary-row">
            <span>Subtotal</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          <p className="cart-page__shipping-note">
            Shipping calculated at checkout. See <Link to="/shipping-returns">Shipping &amp; Returns</Link>.
          </p>
          <Link to="/checkout" className="btn btn--primary cart-page__checkout-btn">Checkout</Link>
        </div>
      </div>
    </section>
  );
}

export default CartPage;

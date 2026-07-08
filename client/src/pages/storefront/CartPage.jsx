import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import './CartPage.css';

function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return <p className="page-loading">Your cart is empty. <Link to="/shop">Shop now</Link></p>;
  }

  return (
    <section className="cart-page">
      <h1>Your Cart</h1>
      {items.map((item) => (
        <div className="cart-page__item" key={item.productId}>
          <img src={item.image} alt={item.name} />
          <div>
            <h4>{item.name}</h4>
            <p>${item.price.toFixed(2)}</p>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
            />
            <button onClick={() => removeItem(item.productId)}>Remove</button>
          </div>
        </div>
      ))}
      <p className="cart-page__subtotal">Subtotal: ${subtotal.toFixed(2)}</p>
      <Link to="/checkout" className="btn btn--primary">Checkout</Link>
    </section>
  );
}

export default CartPage;

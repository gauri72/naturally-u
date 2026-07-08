import { useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { validateCart } from '../../api/cart.api';
import { createOrder } from '../../api/orders.api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

// NOTE: Stripe Elements integration goes here. Kept minimal/stubbed
// so the flow (validate -> create order -> payment) is clear without
// pulling in Stripe-specific setup into the scaffold.
function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [form, setForm] = useState({ name: '', email: '', phone: '', line1: '', city: '', state: '', postalCode: '', country: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: validated } = await validateCart(items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
      const order = await createOrder({
        items: validated.items,
        customer: { name: form.name, email: form.email, phone: form.phone },
        shippingAddress: { line1: form.line1, city: form.city, state: form.state, postalCode: form.postalCode, country: form.country },
        subtotal: validated.subtotal,
        total: validated.subtotal, // add shipping/tax calc as needed
      });
      // TODO: redirect to Stripe payment step using order.data._id
      clearCart();
      toast.success('Order placed!');
    } catch (err) {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="checkout-page">
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit}>
        {Object.keys(form).map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={form[field]}
            onChange={handleChange}
            required
          />
        ))}
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Placing order…' : 'Place Order'}
        </button>
      </form>
    </section>
  );
}

export default CheckoutPage;

import { useEffect, useState } from 'react';
import { CreditCard, Truck } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext.jsx';
import { validateCart } from '../../api/cart.api';
import { createOrder } from '../../api/orders.api';
import { getPageBySlug } from '../../api/pages.api';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const CONTACT_FIELDS = [
  { name: 'name', label: 'Full Name' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel' },
];

const ADDRESS_FIELDS = [
  { name: 'line1', label: 'Address' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State / Province' },
  { name: 'postalCode', label: 'Postal Code' },
  { name: 'country', label: 'Country' },
];

// Heading + summary notes come from the 'checkout' CMS page
// (/admin/pages/checkout); the checkout flow itself stays fully functional.
// NOTE: Stripe Elements integration goes here. Kept minimal/stubbed
// so the flow (validate -> create order -> payment) is clear without
// pulling in Stripe-specific setup into the scaffold.
function CheckoutPage() {
  const { items, clearCart, subtotal } = useCart();
  const [form, setForm] = useState({ name: '', email: '', phone: '', line1: '', city: '', state: '', postalCode: '', country: '' });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(null);

  useEffect(() => {
    getPageBySlug('checkout').then((res) => setPage(res.data)).catch(console.error);
  }, []);

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

  if (!page) return <p className="page-loading">Loading…</p>;

  const hero = page.blocks.find((b) => b.blockType === 'pageHero')?.props || {};
  const content = page.blocks.find((b) => b.blockType === 'checkoutPageContent')?.props || {};

  return (
    <section className="checkout-page">
      <h1>{hero.heading}</h1>
      <div className="checkout-page__layout">
        <form className="checkout-page__form" onSubmit={handleSubmit}>
          <h3>Contact</h3>
          <div className="checkout-page__field-grid">
            {CONTACT_FIELDS.map((field) => (
              <label key={field.name} className="checkout-field">
                {field.label}
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                />
              </label>
            ))}
          </div>

          <h3>Shipping Address</h3>
          <div className="checkout-page__field-grid">
            {ADDRESS_FIELDS.map((field) => (
              <label key={field.name} className="checkout-field">
                {field.label}
                <input
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                />
              </label>
            ))}
          </div>

          <button type="submit" className="btn btn--primary checkout-page__submit" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </form>

        <aside className="checkout-page__summary">
          <h3><Truck size={18} weight="regular" /> Order Summary</h3>
          <div className="checkout-page__summary-items">
            {items.map((item) => (
              <div className="checkout-page__summary-item" key={item.productId}>
                <span>{item.name} × {item.quantity}</span>
                <span>€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-page__summary-row">
            <span>Subtotal</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          <p className="checkout-page__shipping-note">{content.shippingNoteText}</p>
          <div className="checkout-page__summary-row checkout-page__summary-row--total">
            <span>Total</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          <p className="checkout-page__payment-note">
            <CreditCard size={16} weight="regular" /> {content.paymentNoteText}
          </p>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;

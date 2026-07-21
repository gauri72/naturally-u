import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, WarningCircle } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext.jsx';
import { createOrder } from '../../api/orders.api';
import { getPageBySlug } from '../../api/pages.api';
import { getPaymentConfig } from '../../api/payments.api';
import StripeProvider from '../../components/checkout/StripeProvider.jsx';
import StripeCardForm from '../../components/checkout/StripeCardForm.jsx';
import MockCardForm from '../../components/checkout/MockCardForm.jsx';
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
// (/admin/pages/checkout). The flow itself is two steps:
//   1. Contact + address form -> POST /api/orders creates a `pending` order
//      server-side (prices/stock re-validated) and a matching Payment
//      Intent (mock or real Stripe depending on PAYMENT_MODE).
//   2. Payment step -> renders StripeCardForm (real Stripe Elements) or
//      MockCardForm depending on what GET /api/payments/config reports, so
//      the exact same UI code path works with or without real Stripe keys.
// On success both paths land on /order-success/:orderId, which re-checks
// payment status server-side rather than trusting the client alone.
function CheckoutPage() {
  const { items, clearCart, subtotal } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', line1: '', city: '', state: '', postalCode: '', country: '' });
  const [page, setPage] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);

  // Step state: 'details' (contact/address form) -> 'payment' (card form)
  const [step, setStep] = useState('details');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderData, setOrderData] = useState(null); // { order, clientSecret, paymentIntentId, paymentMode }
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    getPageBySlug('checkout').then((res) => setPage(res.data)).catch(console.error);
    getPaymentConfig().then((res) => setPaymentConfig(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setCreatingOrder(true);
    try {
      const res = await createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customer: { name: form.name, email: form.email, phone: form.phone },
        shippingAddress: { line1: form.line1, city: form.city, state: form.state, postalCode: form.postalCode, country: form.country },
      });
      setOrderData(res.data);
      setStep('payment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start checkout. Please review your cart and try again.');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate(`/order-success/${orderData.order._id}`);
  };

  if (items.length === 0 && step === 'details') {
    return (
      <section className="checkout-page">
        <p className="page-error">Your cart is empty. Add something before checking out.</p>
      </section>
    );
  }

  if (!page || !paymentConfig) return <p className="page-loading">Loading…</p>;

  const hero = page.blocks.find((b) => b.blockType === 'pageHero')?.props || {};
  const content = page.blocks.find((b) => b.blockType === 'checkoutPageContent')?.props || {};

  return (
    <section className="checkout-page">
      <h1>{hero.heading}</h1>
      <div className="checkout-page__layout">
        {step === 'details' ? (
          <form className="checkout-page__form" onSubmit={handleCreateOrder}>
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

            <button type="submit" className="btn btn--primary checkout-page__submit" disabled={creatingOrder}>
              {creatingOrder ? 'Preparing checkout…' : 'Continue to Payment'}
            </button>
          </form>
        ) : (
          <div className="checkout-page__form checkout-page__form--payment">
            <button
              type="button"
              className="checkout-page__back-link"
              onClick={() => setStep('details')}
            >
              ← Edit contact / shipping details
            </button>

            {paymentError && (
              <p className="payment-form__error">
                <WarningCircle size={16} weight="fill" /> {paymentError}
              </p>
            )}

            {paymentConfig.mode === 'mock' ? (
              <MockCardForm
                paymentIntentId={orderData.paymentIntentId}
                submitting={paymentSubmitting}
                setSubmitting={setPaymentSubmitting}
                onError={setPaymentError}
                onSuccess={handlePaymentSuccess}
              />
            ) : (
              <StripeProvider publishableKey={paymentConfig.publishableKey} clientSecret={orderData.clientSecret}>
                <StripeCardForm
                  returnUrl={`${window.location.origin}/order-success/${orderData.order._id}`}
                  submitting={paymentSubmitting}
                  setSubmitting={setPaymentSubmitting}
                  onError={setPaymentError}
                />
              </StripeProvider>
            )}
          </div>
        )}

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

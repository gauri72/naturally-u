import { useState } from 'react';
import { CreditCard, Info } from '@phosphor-icons/react';
import { mockConfirmPayment } from '../../api/payments.api';
import './PaymentForm.css';

// Mock-mode path (PAYMENT_MODE=mock, no Stripe account needed). Renders a
// card-shaped form so the checkout UX matches the real Stripe path, but
// submits to /api/payments/mock/confirm instead of Stripe. Mirrors Stripe's
// own test-card convention: a number ending in 0002 simulates a decline,
// anything else (e.g. 4242 4242 4242 4242) simulates success.
function MockCardForm({ paymentIntentId, submitting, setSubmitting, onError, onSuccess }) {
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', expiry: '12/34', cvc: '123' });

  const formatCardNumber = (value) =>
    value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    onError(null);
    try {
      const res = await mockConfirmPayment(paymentIntentId, card.number);
      onSuccess(res.data);
    } catch (err) {
      onError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h3>
        <CreditCard size={18} weight="regular" /> Payment
      </h3>
      <p className="payment-form__mock-note">
        <Info size={14} weight="regular" />
        <span className="payment-form__mock-note-text">
          Test mode — no real Stripe account connected. Any card succeeds; a number ending in <code>0002</code> simulates a decline.
        </span>
      </p>

      <label className="payment-form__field">
        Card number
        <input
          type="text"
          inputMode="numeric"
          value={card.number}
          onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
          placeholder="4242 4242 4242 4242"
          required
        />
      </label>
      <div className="payment-form__row">
        <label className="payment-form__field">
          Expiry
          <input
            type="text"
            value={card.expiry}
            onChange={(e) => setCard({ ...card, expiry: e.target.value })}
            placeholder="MM/YY"
            required
          />
        </label>
        <label className="payment-form__field">
          CVC
          <input
            type="text"
            inputMode="numeric"
            value={card.cvc}
            onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder="123"
            required
          />
        </label>
      </div>

      <button type="submit" className="btn btn--primary payment-form__submit" disabled={submitting}>
        {submitting ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
}

export default MockCardForm;

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { CreditCard } from '@phosphor-icons/react';
import './PaymentForm.css';

// Real Stripe path: renders inside an <Elements> provider (see
// StripeProvider.jsx) already scoped to the order's clientSecret.
// stripe.confirmPayment redirects to `returnUrl` on success/failure, so the
// success page re-checks payment status server-side rather than trusting
// the redirect alone (see OrderSuccessPage.jsx).
//
// `billingDetails` (from the contact/shipping step) pre-fills the fields some
// payment methods ask for again - e.g. iDEAL | Wero's "Full name" - so the
// shopper doesn't retype them.
function toStripeBillingDetails(details = {}) {
  const { name, email, phone, line1, city, state, postalCode, country } = details;
  const address = { line1, city, state, postal_code: postalCode };
  // Stripe only accepts ISO country codes ("NL"); a typed "Netherlands" would
  // be rejected, so it's left for the shopper to pick in that case.
  if (/^[a-z]{2}$/i.test(country?.trim() || '')) address.country = country.trim().toUpperCase();
  return { name, email, phone, address };
}

function StripeCardForm({ returnUrl, submitting, setSubmitting, onError, billingDetails }) {
  const stripe = useStripe();
  const elements = useElements();
  const [elementReady, setElementReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    onError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    // confirmPayment only returns if there's an immediate error (e.g.
    // validation) - on success the browser navigates to returnUrl and this
    // code never resumes.
    if (error) {
      onError(error.message || 'Payment failed. Please check your card details and try again.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h3>
        <CreditCard size={18} weight="regular" /> Payment
      </h3>
      <div className="payment-form__element-wrap">
        <PaymentElement
          onReady={() => setElementReady(true)}
          options={{ defaultValues: { billingDetails: toStripeBillingDetails(billingDetails) } }}
        />
      </div>
      <button
        type="submit"
        className="btn btn--primary payment-form__submit"
        disabled={!stripe || !elementReady || submitting}
      >
        {submitting ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
}

export default StripeCardForm;

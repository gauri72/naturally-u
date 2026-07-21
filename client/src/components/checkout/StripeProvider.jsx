import { useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Wraps children in Stripe's <Elements> provider, scoped to this order's
// clientSecret. Only rendered when PAYMENT_MODE is 'test'/'live' (see
// CheckoutPage) - mock mode never loads the Stripe.js SDK at all.
function StripeProvider({ publishableKey, clientSecret, children }) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3FA34D',
        colorBackground: '#FFFFFF',
        colorText: '#2B2B28',
        colorDanger: '#B5433A',
        fontFamily: 'Quicksand, sans-serif',
        borderRadius: '6px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}

export default StripeProvider;

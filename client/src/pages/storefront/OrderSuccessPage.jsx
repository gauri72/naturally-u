import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, HourglassMedium, WarningCircle } from '@phosphor-icons/react';
import { getOrderById } from '../../api/orders.api';
import { getPaymentStatus } from '../../api/payments.api';
import './OrderSuccessPage.css';

// Reached both from the mock-payment path (CheckoutPage navigates here
// directly) and from real Stripe's redirect (return_url points here with
// ?payment_intent=... appended by Stripe). Either way, this page always
// re-checks payment status server-side rather than trusting the redirect
// itself - the webhook is the actual source of truth for real payments, and
// it may land a beat after the redirect, so a brief "processing" state is
// expected and handled below.
function OrderSuccessPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const redirectStatus = searchParams.get('redirect_status'); // Stripe appends this on redirect
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState(null); // 'paid' | 'pending' | 'failed'
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      try {
        const [orderRes, statusRes] = await Promise.all([getOrderById(orderId), getPaymentStatus(orderId)]);
        if (cancelled) return;
        setOrder({ ...orderRes.data, emailSimulated: statusRes.data.emailSimulated });
        setStatus(statusRes.data.paymentStatus);

        // Real-mode webhooks can land a moment after the redirect; poll a
        // few times before settling on "still processing".
        if (statusRes.data.paymentStatus === 'pending' && attempts < 6) {
          attempts += 1;
          setTimeout(poll, 1500);
        }
      } catch (err) {
        if (!cancelled) setError('We could not find that order.');
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [orderId]);

  if (error) {
    return (
      <section className="order-success-page">
        <XCircle size={48} weight="regular" className="order-success-page__icon order-success-page__icon--error" />
        <h1>Order not found</h1>
        <p>{error}</p>
        <Link to="/shop" className="btn btn--primary">Back to Shop</Link>
      </section>
    );
  }

  if (!order || !status) {
    return <p className="page-loading">Loading…</p>;
  }

  if (status === 'failed') {
    return (
      <section className="order-success-page">
        <XCircle size={48} weight="regular" className="order-success-page__icon order-success-page__icon--error" />
        <h1>Payment failed</h1>
        <p>{order.paymentError || 'Your payment could not be completed. Please try again.'}</p>
        <Link to="/checkout" className="btn btn--primary">Try Again</Link>
      </section>
    );
  }

  if (status === 'pending') {
    return (
      <section className="order-success-page">
        <HourglassMedium size={48} weight="regular" className="order-success-page__icon order-success-page__icon--pending" />
        <h1>Confirming your payment…</h1>
        <p>This usually takes just a few seconds. Your order number is <strong>{order.orderNumber}</strong>.</p>
      </section>
    );
  }

  return (
    <section className="order-success-page">
      <CheckCircle size={48} weight="fill" className="order-success-page__icon order-success-page__icon--success" />
      <h1>Thank you for your order!</h1>
      <p className="order-success-page__subtext">
        A confirmation email with your receipt is on its way to <strong>{order.customer?.email}</strong>.
      </p>

      {order.emailSimulated && (
        <p className="order-success-page__email-warning">
          <WarningCircle size={16} weight="fill" />
          Email sending isn't configured yet on this server, so no real email was sent for this order.
          The receipt was generated and saved on the server instead.
        </p>
      )}

      <div className="order-success-page__card">
        <div className="order-success-page__row">
          <span>Confirmation Number</span>
          <span className="order-success-page__order-number">{order.orderNumber}</span>
        </div>
        <div className="order-success-page__items">
          {order.items.map((item) => (
            <div className="order-success-page__item" key={item._id || item.product}>
              <span>{item.name} × {item.quantity}</span>
              <span>€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="order-success-page__row order-success-page__row--total">
          <span>Total Paid</span>
          <span>€{order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="order-success-page__actions">
        <Link to="/shop" className="btn btn--primary">Continue Shopping</Link>
        <Link to={`/track-order?orderId=${order._id}`} className="btn btn--secondary">Track Order</Link>
      </div>
    </section>
  );
}

export default OrderSuccessPage;

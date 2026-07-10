import { useState } from 'react';
import { Package, CheckCircle } from '@phosphor-icons/react';
import { getOrderById } from '../../api/orders.api';
import './TrackOrderPage.css';

const STATUS_LABEL = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const res = await getOrderById(orderId.trim());
      setOrder(res.data);
    } catch {
      setError('No order found with that ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="shop-page track-order-page">
      <div className="track-order-page__card">
        <Package size={36} weight="regular" className="track-order-page__icon" />
        <h1>Track Your Order</h1>
        <p>Enter the order ID from your confirmation email.</p>
        <form onSubmit={handleSubmit} className="track-order-page__form">
          <input
            type="text"
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Searching…' : 'Track'}
          </button>
        </form>

        {error && <p className="track-order-page__error">{error}</p>}

        {order && (
          <div className="track-order-page__result">
            <CheckCircle size={22} weight="fill" />
            <div>
              <p className="track-order-page__status">{STATUS_LABEL[order.orderStatus] || order.orderStatus}</p>
              <p className="track-order-page__meta">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default TrackOrderPage;

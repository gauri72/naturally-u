import { useState } from 'react';
import { getOrderById } from '../../api/orders.api';

function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    try {
      const res = await getOrderById(orderId.trim());
      setOrder(res.data);
    } catch {
      setError('No order found with that ID.');
    }
  };

  return (
    <section className="shop-page">
      <h1>Track Your Order</h1>
      <p>Enter the order ID from your confirmation email.</p>
      <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)' }}>
        <input
          type="text"
          placeholder="Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
        />
        <button type="submit" className="btn btn--primary">Track</button>
      </form>

      {error && <p style={{ marginTop: 'var(--space-lg)' }}>{error}</p>}

      {order && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <p><strong>Status:</strong> {order.orderStatus}</p>
          <p><strong>Placed:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      )}
    </section>
  );
}

export default TrackOrderPage;

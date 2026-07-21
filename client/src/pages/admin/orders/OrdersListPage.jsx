import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { listOrders, updateOrderStatus } from '../../../api/orders.api';
import { refundOrder } from '../../../api/payments.api';
import { useLang } from '../../../i18n/LanguageContext.jsx';

const STATUS_BADGE = {
  processing: 'badge--warning',
  shipped: 'badge--info',
  delivered: 'badge--success',
  cancelled: 'badge--danger',
};

const PAYMENT_BADGE = {
  paid: 'badge--success',
  pending: 'badge--warning',
  failed: 'badge--danger',
  refunded: 'badge--neutral',
};

function OrdersListPage() {
  const { t } = useLang();
  const [orders, setOrders] = useState([]);
  const [refundingId, setRefundingId] = useState(null);

  const load = () => listOrders().then((res) => setOrders(res.data));
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    await updateOrderStatus(id, status);
    load();
  };

  const handleRefund = async (order) => {
    if (!window.confirm(`Refund order ${order.orderNumber} for €${order.total.toFixed(2)}? This also restores stock for its items.`)) {
      return;
    }
    setRefundingId(order._id);
    try {
      await refundOrder(order._id);
      toast.success(`Order ${order.orderNumber} refunded.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Refund failed.');
    } finally {
      setRefundingId(null);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>{t('Orders')}</h1>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('Order #')}</th>
              <th>{t('Customer')}</th>
              <th>{t('Total')}</th>
              <th>Payment</th>
              <th>{t('Status')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.customer?.email}</td>
                <td>€{o.total.toFixed(2)}</td>
                <td>
                  <span className={`badge ${PAYMENT_BADGE[o.paymentStatus] || 'badge--neutral'}`}>
                    {o.paymentStatus}
                  </span>
                  {o.paymentStatus === 'failed' && o.paymentError && (
                    <p style={{ color: 'var(--color-danger, #B5433A)', fontSize: '0.75rem', margin: '4px 0 0' }}>
                      {o.paymentError}
                    </p>
                  )}
                  {o.paymentStatus === 'paid' && o.confirmationEmailSimulated && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', margin: '4px 0 0' }} title="SMTP isn't configured, or was not configured when this order was fulfilled - no real email was sent for this order.">
                      ⚠ email not sent (SMTP unconfigured)
                    </p>
                  )}
                  {o.paymentStatus === 'paid' && !o.confirmationEmailSimulated && o.confirmationEmailSentAt && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', margin: '4px 0 0' }}>
                      ✓ email sent
                    </p>
                  )}
                </td>
                <td>
                  <span className={`badge ${STATUS_BADGE[o.orderStatus] || 'badge--neutral'}`} style={{ marginRight: 'var(--space-sm)' }}>
                    {t(o.orderStatus)}
                  </span>
                  <select value={o.orderStatus} onChange={(e) => handleStatusChange(o._id, e.target.value)}>
                    <option value="processing">{t('Processing')}</option>
                    <option value="shipped">{t('Shipped')}</option>
                    <option value="delivered">{t('Delivered')}</option>
                    <option value="cancelled">{t('Cancelled')}</option>
                  </select>
                </td>
                <td>
                  {o.paymentStatus === 'paid' && (
                    <button
                      type="button"
                      className="btn btn--sm btn--danger"
                      disabled={refundingId === o._id}
                      onClick={() => handleRefund(o)}
                    >
                      {refundingId === o._id ? 'Refunding…' : 'Refund'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="admin-empty-state">
            <p>{t('No orders yet.')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersListPage;

import { useEffect, useState } from 'react';
import { listOrders, updateOrderStatus } from '../../../api/orders.api';
import { useLang } from '../../../i18n/LanguageContext.jsx';

const STATUS_BADGE = {
  processing: 'badge--warning',
  shipped: 'badge--info',
  delivered: 'badge--success',
  cancelled: 'badge--danger',
};

function OrdersListPage() {
  const { t } = useLang();
  const [orders, setOrders] = useState([]);

  const load = () => listOrders().then((res) => setOrders(res.data));
  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    await updateOrderStatus(id, status);
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>{t('Orders')}</h1>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>{t('Order #')}</th><th>{t('Customer')}</th><th>{t('Total')}</th><th>{t('Status')}</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.customer?.email}</td>
                <td>€{o.total.toFixed(2)}</td>
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

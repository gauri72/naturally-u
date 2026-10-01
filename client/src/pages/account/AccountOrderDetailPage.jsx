import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle } from '@phosphor-icons/react';
import { getMyOrder } from '../../api/customer.api';
import { useLang } from '../../i18n/LanguageContext.jsx';
import { OrderStatus, euro, formatDate, useReorder } from './accountShared.jsx';

const STEPS = ['processing', 'shipped', 'delivered'];

function AccountOrderDetailPage() {
  const { t, lang } = useLang();
  const { id } = useParams();
  const { reorder, busyId } = useReorder();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getMyOrder(id).then((res) => setOrder(res.data)).catch(() => setError(true));
  }, [id]);

  const back = (
    <Link to="/account/orders" className="account-back"><ArrowLeft size={16} weight="bold" /> {t('My orders')}</Link>
  );

  if (error) return <>{back}<p className="account-muted">{t('We couldn’t find that order.')}</p></>;
  if (!order) return <p className="page-loading">{t('Loading…')}</p>;

  const addr = order.shippingAddress || {};
  const stepIndex = STEPS.indexOf(order.orderStatus);
  const showTimeline = stepIndex >= 0 && order.paymentStatus !== 'refunded';

  return (
    <>
      {back}
      <div className="account-detail-head">
        <div>
          <h1 className="account-title">{order.orderNumber}</h1>
          <p className="account-muted">{t('Placed on')} {formatDate(order.createdAt, lang)}</p>
        </div>
        <OrderStatus order={order} />
      </div>

      {showTimeline && (
        <ol className="account-timeline">
          {STEPS.map((step, i) => (
            <li key={step} className={i <= stepIndex ? 'is-done' : ''}>
              {i <= stepIndex ? <CheckCircle size={20} weight="fill" /> : <Circle size={20} />}
              {t({ processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' }[step])}
            </li>
          ))}
        </ol>
      )}

      <div className="account-panel">
        <h2>{t('Items')}</h2>
        <ul className="account-detail-items">
          {order.items.map((item) => (
            <li key={item._id || item.product}>
              {item.image && <img src={item.image} alt="" />}
              <span className="account-detail-items__name">{t(item.name)}<small>{euro(item.price)} × {item.quantity}</small></span>
              <strong>{euro(item.price * item.quantity)}</strong>
            </li>
          ))}
        </ul>
        <dl className="account-totals">
          <dt>{t('Subtotal')}</dt><dd>{euro(order.subtotal)}</dd>
          <dt>{t('Shipping')}</dt><dd>{order.shippingCost ? euro(order.shippingCost) : t('Free')}</dd>
          <dt className="account-totals__grand">{t('Total')}</dt><dd className="account-totals__grand">{euro(order.total)}</dd>
        </dl>
        <button type="button" className="btn btn--primary account-reorder" onClick={() => reorder(order._id)} disabled={busyId === order._id}>
          {busyId === order._id ? t('Adding…') : t('Buy again')}
        </button>
      </div>

      <div className="account-panel">
        <h2>{t('Shipping address')}</h2>
        <address className="account-address">
          {order.customer?.name}<br />
          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
          {[addr.postalCode, addr.city].filter(Boolean).join(' ')}<br />
          {[addr.state, addr.country].filter(Boolean).join(', ')}
        </address>
      </div>
    </>
  );
}

export default AccountOrderDetailPage;

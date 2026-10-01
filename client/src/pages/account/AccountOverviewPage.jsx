import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, ArrowRight, ShoppingBag } from '@phosphor-icons/react';
import { getMyOrders } from '../../api/customer.api';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import { OrderStatus, VerifyEmailBanner, euro, formatDate, useReorder } from './accountShared.jsx';

function AccountOverviewPage() {
  const { t, lang } = useLang();
  const { customer } = useCustomer();
  const { reorder, busyId } = useReorder();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    getMyOrders().then((res) => setOrders(res.data)).catch(() => setOrders([]));
  }, [customer.emailVerified]);

  const address = customer.address || {};
  const hasAddress = !!(address.line1 && address.city);
  const totalSpent = (orders || []).filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);

  return (
    <>
      <h1 className="account-title">{t('Hi')} {customer.name.split(' ')[0]}!</h1>
      <VerifyEmailBanner customer={customer} />

      <div className="account-stats">
        <div className="account-stat"><span>{orders ? orders.length : '–'}</span>{t('Orders')}</div>
        <div className="account-stat"><span>{orders ? euro(totalSpent) : '–'}</span>{t('Total spent')}</div>
        <div className="account-stat"><span>{formatDate(customer.createdAt, lang)}</span>{t('Member since')}</div>
      </div>

      <div className="account-panel">
        <div className="account-panel__head">
          <h2><Package size={20} /> {t('Recent orders')}</h2>
          {orders?.length > 0 && <Link to="/account/orders" className="account-link">{t('View all')} <ArrowRight size={14} /></Link>}
        </div>
        {!orders && <p className="page-loading">{t('Loading…')}</p>}
        {orders?.length === 0 && (
          <div className="account-empty">
            <ShoppingBag size={36} />
            <p>{t('You haven’t placed any orders yet.')}</p>
            <Link to="/shop" className="btn btn--primary">{t('Start shopping')}</Link>
          </div>
        )}
        {orders?.slice(0, 3).map((order) => (
          <div key={order._id} className="account-order-row">
            <Link to={`/account/orders/${order._id}`} className="account-order-row__main">
              <strong>{order.orderNumber}</strong>
              <small>{formatDate(order.createdAt, lang)} · {order.items.length} {order.items.length === 1 ? t('item') : t('items')}</small>
            </Link>
            <OrderStatus order={order} />
            <span className="account-order-row__total">{euro(order.total)}</span>
            <button type="button" className="btn btn--secondary account-reorder" onClick={() => reorder(order._id)} disabled={busyId === order._id}>
              {t('Buy again')}
            </button>
          </div>
        ))}
      </div>

      <div className="account-panel">
        <div className="account-panel__head">
          <h2><MapPin size={20} /> {t('Saved address')}</h2>
          <Link to="/account/profile" className="account-link">{hasAddress ? t('Edit') : t('Add address')}</Link>
        </div>
        {hasAddress ? (
          <address className="account-address">
            {customer.name}<br />
            {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
            {[address.postalCode, address.city].filter(Boolean).join(' ')}<br />
            {[address.state, address.country].filter(Boolean).join(', ')}
          </address>
        ) : (
          <p className="account-muted">{t('Save your address to check out faster next time.')}</p>
        )}
      </div>
    </>
  );
}

export default AccountOverviewPage;

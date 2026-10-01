import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from '@phosphor-icons/react';
import { getMyOrders } from '../../api/customer.api';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import { OrderStatus, VerifyEmailBanner, euro, formatDate, useReorder } from './accountShared.jsx';

function AccountOrdersPage() {
  const { t, lang } = useLang();
  const { customer } = useCustomer();
  const { reorder, busyId } = useReorder();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    getMyOrders().then((res) => setOrders(res.data)).catch(() => setOrders([]));
  }, []);

  return (
    <>
      <h1 className="account-title">{t('My orders')}</h1>
      <VerifyEmailBanner customer={customer} />
      {!orders && <p className="page-loading">{t('Loading…')}</p>}
      {orders?.length === 0 && (
        <div className="account-panel account-empty">
          <ShoppingBag size={36} />
          <p>{t('You haven’t placed any orders yet.')}</p>
          <Link to="/shop" className="btn btn--primary">{t('Start shopping')}</Link>
        </div>
      )}
      <div className="account-order-cards">
        {orders?.map((order) => (
          <article key={order._id} className="account-order-card">
            <header className="account-order-card__head">
              <div>
                <strong>{order.orderNumber}</strong>
                <small>{formatDate(order.createdAt, lang)}</small>
              </div>
              <OrderStatus order={order} />
            </header>
            <ul className="account-order-card__items">
              {order.items.map((item) => (
                <li key={item._id || item.product}>
                  {item.image && <img src={item.image} alt="" />}
                  <span>{t(item.name)}</span>
                  <small>× {item.quantity}</small>
                </li>
              ))}
            </ul>
            <footer className="account-order-card__foot">
              <span className="account-order-card__total">{t('Total')} <strong>{euro(order.total)}</strong></span>
              <div className="account-order-card__actions">
                <Link to={`/account/orders/${order._id}`} className="account-link">{t('View details')}</Link>
                <button type="button" className="btn btn--primary account-reorder" onClick={() => reorder(order._id)} disabled={busyId === order._id}>
                  {busyId === order._id ? t('Adding…') : t('Buy again')}
                </button>
              </div>
            </footer>
          </article>
        ))}
      </div>
    </>
  );
}

export default AccountOrdersPage;

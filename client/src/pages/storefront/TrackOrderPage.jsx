import { useEffect, useState } from 'react';
import { CheckCircle } from '@phosphor-icons/react';
import { getOrderById } from '../../api/orders.api';
import { getPageBySlug } from '../../api/pages.api';
import PageHeroBlock from '../../blocks/PageHeroBlock/PageHeroBlock.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './TrackOrderPage.css';

const STATUS_LABEL = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Heading/intro copy comes from the 'track-order' CMS page
// (/admin/pages/track-order); the order lookup itself stays fully functional.
function TrackOrderPage() {
  const { t } = useLang();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(null);

  useEffect(() => {
    getPageBySlug('track-order').then((res) => setPage(res.data)).catch(console.error);
  }, []);

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

  if (!page) return <p className="page-loading">{t('Loading…')}</p>;

  const hero = page.blocks.find((b) => b.blockType === 'pageHero')?.props || {};

  return (
    <section className="shop-page track-order-page">
      <div className="track-order-page__card">
        <PageHeroBlock variant="track-order" icon="package" heading={hero.heading} subtext={hero.subtext} />
        <form onSubmit={handleSubmit} className="track-order-page__form">
          <input
            type="text"
            placeholder={t('Order ID')}
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? t('Searching…') : t('Track')}
          </button>
        </form>

        {error && <p className="track-order-page__error">{t(error)}</p>}

        {order && (
          <div className="track-order-page__result">
            <CheckCircle size={22} weight="fill" />
            <div>
              <p className="track-order-page__status">{t(STATUS_LABEL[order.orderStatus] || order.orderStatus)}</p>
              <p className="track-order-page__meta">{t('Placed')} {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default TrackOrderPage;

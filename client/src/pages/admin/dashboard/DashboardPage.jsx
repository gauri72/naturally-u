import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Receipt, Warning, SquaresFour, Images, Archive, GearSix } from '@phosphor-icons/react';
import { getProducts } from '../../../api/products.api';
import { listOrders } from '../../../api/orders.api';
import { useLang } from '../../../i18n/LanguageContext.jsx';

function DashboardPage() {
  const { t } = useLang();
  const [productCount, setProductCount] = useState(null);
  const [orderCount, setOrderCount] = useState(null);
  const [needsAttentionCount, setNeedsAttentionCount] = useState(null);

  useEffect(() => {
    getProducts({ limit: 1 })
      .then((res) => setProductCount(res.data.total))
      .catch(() => setProductCount(null));

    listOrders()
      .then((res) => {
        setOrderCount(res.data.length);
        setNeedsAttentionCount(res.data.filter((o) => o.orderStatus === 'processing').length);
      })
      .catch(() => {
        setOrderCount(null);
        setNeedsAttentionCount(null);
      });
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h1>{t('Dashboard')}</h1>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 'var(--space-xl)' }}>
        <Link to="/admin/products" className="admin-card admin-card--interactive" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <Package size={32} color="var(--color-primary)" />
          <div>
            <h2 style={{ fontSize: '1.75rem' }}>{productCount ?? '—'}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('Products')}</p>
          </div>
        </Link>
        <Link to="/admin/orders" className="admin-card admin-card--interactive" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <Receipt size={32} color="var(--color-primary)" />
          <div>
            <h2 style={{ fontSize: '1.75rem' }}>{orderCount ?? '—'}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('Orders')}</p>
          </div>
        </Link>
        <Link to="/admin/orders" className="admin-card admin-card--interactive" style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <Warning size={32} color="var(--color-accent-dark)" />
          <div>
            <h2 style={{ fontSize: '1.75rem' }}>{needsAttentionCount ?? '—'}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('Needs Attention')}</p>
          </div>
        </Link>
      </div>

      <h3 style={{ marginBottom: 'var(--space-md)' }}>{t('Manage')}</h3>
      <div className="admin-grid">
        <Link to="/admin/pages" className="admin-card admin-card--interactive">
          <SquaresFour size={28} color="var(--color-primary)" />
          <h3 style={{ marginTop: 'var(--space-sm)' }}>{t('Pages')}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t("Build & edit any page's blocks.")}</p>
        </Link>
        <Link to="/admin/media" className="admin-card admin-card--interactive">
          <Images size={28} color="var(--color-primary)" />
          <h3 style={{ marginTop: 'var(--space-sm)' }}>{t('Media Library')}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('Upload and copy image URLs.')}</p>
        </Link>
        <Link to="/admin/media-gallery" className="admin-card admin-card--interactive">
          <Archive size={28} color="var(--color-primary)" />
          <h3 style={{ marginTop: 'var(--space-sm)' }}>{t('Media Gallery')}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('Archived legacy site content.')}</p>
        </Link>
        <Link to="/admin/settings" className="admin-card admin-card--interactive">
          <GearSix size={28} color="var(--color-primary)" />
          <h3 style={{ marginTop: 'var(--space-sm)' }}>{t('Site Settings')}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('Site name and footer text.')}</p>
        </Link>
      </div>
    </div>
  );
}

export default DashboardPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnvelopeSimple } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { getReorderItems, resendVerification } from '../../api/customer.api';
import { useCart } from '../../context/CartContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';

export const formatDate = (iso, lang) =>
  new Date(iso).toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export const euro = (n) => `€${Number(n || 0).toFixed(2)}`;

const STATUS_LABELS = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export function OrderStatus({ order }) {
  const { t } = useLang();
  const key = order.paymentStatus === 'refunded' ? 'refunded' : order.orderStatus;
  return <span className={`account-status account-status--${key}`}>{t(STATUS_LABELS[key] || key)}</span>;
}

// "Buy again": adds every still-available item from a past order to the
// cart at today's price (addItem caps each at current stock), then opens
// the cart. Sold-out or discontinued items are skipped and named.
export function useReorder() {
  const { t } = useLang();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);

  const reorder = async (orderId) => {
    setBusyId(orderId);
    try {
      const { data } = await getReorderItems(orderId);
      const added = data.filter((line) => line.available);
      const skipped = data.filter((line) => !line.available);
      added.forEach((line) => addItem(line.product, line.quantity));
      if (skipped.length) {
        toast(`${t('Not available right now:')} ${skipped.map((l) => t(l.name)).join(', ')}`, { icon: 'ℹ️', duration: 6000 });
      }
      if (added.length) {
        toast.success(t('Added to your cart'));
        navigate('/cart');
      } else {
        toast.error(t('None of these products are available right now.'));
      }
    } catch {
      toast.error(t('Something went wrong. Please try again.'));
    } finally {
      setBusyId(null);
    }
  };

  return { reorder, busyId };
}

export function VerifyEmailBanner({ customer }) {
  const { t } = useLang();
  const [sending, setSending] = useState(false);
  if (customer.emailVerified) return null;

  const resend = async () => {
    setSending(true);
    try {
      await resendVerification();
      toast.success(t('Confirmation email sent.'));
    } catch (err) {
      toast.error(t(err.response?.data?.message || 'Something went wrong. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="account-banner">
      <EnvelopeSimple size={22} />
      <p>
        <strong>{t('Please confirm your email.')}</strong>{' '}
        {t('We sent a link to')} {customer.email}. {t('Once confirmed, orders you placed earlier as a guest will appear here.')}
      </p>
      <button type="button" className="btn btn--secondary account-banner__btn" onClick={resend} disabled={sending}>
        {sending ? t('Sending…') : t('Resend email')}
      </button>
    </div>
  );
}

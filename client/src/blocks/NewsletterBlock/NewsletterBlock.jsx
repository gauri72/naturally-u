import { useState } from 'react';
import toast from 'react-hot-toast';
import { Leaf } from '@phosphor-icons/react';
import axiosClient from '../../api/axiosClient';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './NewsletterBlock.css';

// Props: { heading, subtext, ctaLabel }
function NewsletterBlock({ heading, subtext, ctaLabel = 'Join Us' }) {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosClient.post('/newsletter/subscribe', { email });
      toast.success(t('You are subscribed!'));
      setEmail('');
    } catch {
      toast.error(t('Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="newsletter-block">
      <div className="newsletter-block__card">
        <Leaf size={38} weight="regular" className="newsletter-block__icon" />
        <div className="newsletter-block__text">
          <h3>{t(heading)}</h3>
          <p>{t(subtext)}</p>
        </div>
        <form onSubmit={handleSubmit} className="newsletter-block__form">
          <input
            type="email"
            required
            placeholder={t('Enter your email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? '…' : t(ctaLabel)}
          </button>
        </form>
      </div>
    </section>
  );
}

export default NewsletterBlock;

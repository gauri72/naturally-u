import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeSimple } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../../api/customer.api';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './Account.css';

function ForgotPasswordPage() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(t(err.response?.data?.message || 'Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="account-auth">
      <div className="account-card">
        {sent ? (
          <>
            <EnvelopeSimple size={40} className="account-card__icon" />
            <h1>{t('Check your inbox')}</h1>
            <p className="account-card__intro">
              {t('If an account exists for that email, we’ve sent a link to reset your password. It expires in 1 hour.')}
            </p>
            <Link to="/account/login" className="btn btn--primary account-form__submit">{t('Back to sign in')}</Link>
          </>
        ) : (
          <>
            <h1>{t('Forgot your password?')}</h1>
            <p className="account-card__intro">{t('Enter your email and we’ll send you a link to choose a new one.')}</p>
            <form className="account-form" onSubmit={handleSubmit}>
              <label className="account-field">
                {t('Email')}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </label>
              <button type="submit" className="btn btn--primary account-form__submit" disabled={submitting}>
                {submitting ? t('Please wait…') : t('Send reset link')}
              </button>
            </form>
            <p className="account-card__switch">
              <Link to="/account/login" className="account-link">{t('Back to sign in')}</Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default ForgotPasswordPage;

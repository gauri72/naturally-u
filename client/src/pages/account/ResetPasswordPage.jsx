import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './Account.css';

// Landing page for the emailed reset link (/account/reset-password?token=...).
// A successful reset also signs the customer in.
function ResetPasswordPage() {
  const { t } = useLang();
  const { resetPassword } = useCustomer();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error(t('The passwords don’t match.'));
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ token, password });
      toast.success(t('Your password has been changed.'));
      navigate('/account', { replace: true });
    } catch (err) {
      toast.error(t(err.response?.data?.message || 'Something went wrong. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="account-auth">
      <div className="account-card">
        <h1>{t('Choose a new password')}</h1>
        {!token ? (
          <p className="account-card__intro">
            {t('This reset link is incomplete.')}{' '}
            <Link to="/account/forgot-password" className="account-link">{t('Request a new one')}</Link>
          </p>
        ) : (
          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-field">
              {t('New password')}
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
              <small>{t('At least 8 characters.')}</small>
            </label>
            <label className="account-field">
              {t('Confirm new password')}
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" minLength={8} required />
            </label>
            <button type="submit" className="btn btn--primary account-form__submit" disabled={submitting}>
              {submitting ? t('Please wait…') : t('Save new password')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default ResetPasswordPage;

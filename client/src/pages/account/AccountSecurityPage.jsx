import { useState } from 'react';
import { GoogleLogo, CheckCircle } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';

function AccountSecurityPage() {
  const { t } = useLang();
  const { customer, changePassword } = useCustomer();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      toast.error(t('The passwords don’t match.'));
      return;
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success(t('Password updated. Other devices have been signed out.'));
    } catch (err) {
      toast.error(t(err.response?.data?.message || 'Something went wrong. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="account-title">{t('Password & sign-in')}</h1>

      <form className="account-panel account-form" onSubmit={handleSubmit}>
        <h2>{customer.hasPassword ? t('Change password') : t('Set a password')}</h2>
        {!customer.hasPassword && (
          <p className="account-muted">{t('You sign in with Google. Add a password to also sign in with your email.')}</p>
        )}
        {customer.hasPassword && (
          <label className="account-field">
            {t('Current password')}
            <input type="password" name="currentPassword" value={form.currentPassword} onChange={onChange} autoComplete="current-password" required />
          </label>
        )}
        <label className="account-field">
          {t('New password')}
          <input type="password" name="newPassword" value={form.newPassword} onChange={onChange} autoComplete="new-password" minLength={8} required />
          <small>{t('At least 8 characters.')}</small>
        </label>
        <label className="account-field">
          {t('Confirm new password')}
          <input type="password" name="confirm" value={form.confirm} onChange={onChange} autoComplete="new-password" minLength={8} required />
        </label>
        <button type="submit" className="btn btn--primary account-form__submit account-form__submit--inline" disabled={saving}>
          {saving ? t('Saving…') : t('Save password')}
        </button>
      </form>

      <div className="account-panel">
        <h2>{t('Sign-in methods')}</h2>
        <ul className="account-methods">
          <li>
            <CheckCircle size={20} weight={customer.hasPassword ? 'fill' : 'regular'} className={customer.hasPassword ? 'is-on' : ''} />
            {t('Email and password')} — {customer.hasPassword ? t('on') : t('not set')}
          </li>
          <li>
            <GoogleLogo size={20} className={customer.hasGoogle ? 'is-on' : ''} />
            {t('Google')} — {customer.hasGoogle ? t('connected') : t('not connected')}
          </li>
        </ul>
      </div>
    </>
  );
}

export default AccountSecurityPage;

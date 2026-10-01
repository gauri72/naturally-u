import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import GoogleSignInButton from '../../components/account/GoogleSignInButton.jsx';
import './Account.css';

// Only same-site paths, so ?next= can't bounce people to another website.
export const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/account');

// Sign in (/account/login) and Create account (/account/register) share
// one card; `mode` picks which form is shown. ?next=/checkout returns the
// shopper to where they were.
function AuthPage({ mode }) {
  const { t } = useLang();
  const { customer, loading, login, register, loginWithGoogle } = useCustomer();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === 'register';

  if (!loading && customer) return <Navigate to={next} replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const fail = (err) => toast.error(t(err.response?.data?.message || 'Something went wrong. Please try again.'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(form);
        toast.success(t('Welcome! Check your inbox to confirm your email.'));
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate(next, { replace: true });
    } catch (err) {
      fail(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async (credential) => {
    try {
      await loginWithGoogle(credential);
      navigate(next, { replace: true });
    } catch (err) {
      fail(err);
    }
  };

  const switchTo = `${isRegister ? '/account/login' : '/account/register'}${searchParams.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`;

  return (
    <section className="account-auth">
      <div className="account-card">
        <h1>{isRegister ? t('Create your account') : t('Welcome back')}</h1>
        <p className="account-card__intro">
          {isRegister
            ? t('Track your orders, check out faster and buy your favourites again.')
            : t('Sign in to see your orders and check out faster.')}
        </p>

        <GoogleSignInButton onCredential={handleGoogle} />

        <form className="account-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="account-field">
              {t('Full name')}
              <input name="name" value={form.name} onChange={onChange} autoComplete="name" required />
            </label>
          )}
          <label className="account-field">
            {t('Email')}
            <input type="email" name="email" value={form.email} onChange={onChange} autoComplete="email" required />
          </label>
          <label className="account-field">
            <span className="account-field__row">
              {t('Password')}
              {!isRegister && <Link to="/account/forgot-password" className="account-link">{t('Forgot password?')}</Link>}
            </span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 8 : undefined}
              required
            />
            {isRegister && <small>{t('At least 8 characters.')}</small>}
          </label>
          <button type="submit" className="btn btn--primary account-form__submit" disabled={submitting}>
            {submitting ? t('Please wait…') : isRegister ? t('Create account') : t('Sign in')}
          </button>
        </form>

        <p className="account-card__switch">
          {isRegister ? t('Already have an account?') : t('New to NaturallyU?')}{' '}
          <Link to={switchTo} className="account-link">{isRegister ? t('Sign in') : t('Create an account')}</Link>
        </p>
      </div>
    </section>
  );
}

export default AuthPage;

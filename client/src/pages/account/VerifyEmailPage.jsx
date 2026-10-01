import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { verifyEmail } from '../../api/customer.api';
import { useCustomer } from '../../context/CustomerContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './Account.css';

// Landing page for the emailed confirmation link. Works whether or not the
// customer is signed in on this device.
function VerifyEmailPage() {
  const { t } = useLang();
  const { customer, refresh } = useCustomer();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({ status: 'loading' });
  const ran = useRef(false); // StrictMode runs effects twice; the token is single-use

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    verifyEmail(searchParams.get('token') || '')
      .then(() => {
        setState({ status: 'ok' });
        refresh();
      })
      .catch((err) => setState({ status: 'error', message: err.response?.data?.message }));
  }, [searchParams, refresh]);

  return (
    <section className="account-auth">
      <div className="account-card account-card--center">
        {state.status === 'loading' && <p className="page-loading">{t('Confirming your email…')}</p>}
        {state.status === 'ok' && (
          <>
            <CheckCircle size={48} weight="fill" className="account-card__icon" />
            <h1>{t('Email confirmed')}</h1>
            <p className="account-card__intro">{t('Thanks! Any earlier orders placed with this email now appear in your account.')}</p>
            <Link to={customer ? '/account/orders' : '/account/login?next=/account/orders'} className="btn btn--primary account-form__submit">
              {customer ? t('View my orders') : t('Sign in')}
            </Link>
          </>
        )}
        {state.status === 'error' && (
          <>
            <XCircle size={48} className="account-card__icon account-card__icon--error" />
            <h1>{t('Link not valid')}</h1>
            <p className="account-card__intro">{t(state.message || 'This confirmation link is invalid or has expired.')}</p>
            <Link to="/account" className="btn btn--primary account-form__submit">{t('Go to my account')}</Link>
          </>
        )}
      </div>
    </section>
  );
}

export default VerifyEmailPage;

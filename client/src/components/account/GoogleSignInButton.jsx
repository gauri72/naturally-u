import { useEffect, useRef, useState } from 'react';
import { getCustomerConfig } from '../../api/customer.api';
import { useLang } from '../../i18n/LanguageContext.jsx';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
let gsiPromise = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = GSI_SRC;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => { gsiPromise = null; reject(new Error('Google script failed to load')); };
      document.head.appendChild(s);
    });
  }
  return gsiPromise;
}

// "Continue with Google" via Google Identity Services. The client ID comes
// from the API (GOOGLE_CLIENT_ID on the server), so it can be switched on
// without rebuilding the site; until then this renders nothing. Google
// hands back a signed ID token, which the server verifies.
function GoogleSignInButton({ onCredential }) {
  const { lang, t } = useLang();
  const ref = useRef(null);
  const [clientId, setClientId] = useState(null);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  useEffect(() => {
    getCustomerConfig().then((res) => setClientId(res.data.googleClientId)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => callbackRef.current(credential),
        });
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: Math.min(ref.current.offsetWidth || 320, 400),
          locale: lang,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [clientId, lang]);

  if (!clientId) return null;
  return (
    <>
      <div className="account-google" ref={ref} />
      <p className="account-divider"><span>{t('or')}</span></p>
    </>
  );
}

export default GoogleSignInButton;

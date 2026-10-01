import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { ArrowClockwise, WifiSlash, X } from '@phosphor-icons/react';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './PwaStatus.css';

// Re-check for a new deploy hourly, so an installed app left open for days
// still learns about updates.
const UPDATE_CHECK_MS = 60 * 60 * 1000;

// Registers the service worker and shows two small banners:
//  - "New version available" - we never reload on our own (registerType
//    'prompt' in vite.config.js) so a customer mid-checkout isn't disrupted.
//  - "You're offline" - saved pages still browse, but checkout needs a
//    connection.
function PwaStatus() {
  const { t } = useLang();
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (!registration) return;
      setInterval(() => {
        if (navigator.onLine) registration.update();
      }, UPDATE_CHECK_MS);
    },
  });

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!needRefresh && !offline) return null;

  return (
    <div className="pwa-status" role="status" aria-live="polite">
      {offline && (
        <div className="pwa-status__bar pwa-status__bar--offline">
          <WifiSlash size={18} />
          <span>{t('You’re offline. Saved pages still work, but checkout needs a connection.')}</span>
        </div>
      )}
      {needRefresh && (
        <div className="pwa-status__bar">
          <span>{t('A new version of NaturallyU is available.')}</span>
          <button type="button" className="pwa-status__refresh" onClick={() => updateServiceWorker(true)}>
            <ArrowClockwise size={16} /> {t('Refresh')}
          </button>
          <button type="button" className="pwa-status__close" onClick={() => setNeedRefresh(false)} aria-label={t('Dismiss')}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default PwaStatus;

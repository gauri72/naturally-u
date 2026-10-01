import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './BackButton.css';

// "← Back" for storefront sub-pages (product, search results). Returns to
// whichever page the shopper came from - Home, Shop, Search, Gift Sets.
// When the page was opened directly (shared link, Google, new tab) there
// is no in-site history - react-router marks that first entry with key
// 'default' - so navigate(-1) would leave the site; go to `fallback`.
function BackButton({ fallback = '/', className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const hasHistory = location.key !== 'default';

  return (
    <button
      type="button"
      className={`back-button ${className}`.trim()}
      onClick={() => (hasHistory ? navigate(-1) : navigate(fallback))}
    >
      <ArrowLeft size={16} weight="bold" /> {t('Back')}
    </button>
  );
}

export default BackButton;

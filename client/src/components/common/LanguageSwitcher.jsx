import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from '@phosphor-icons/react';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './LanguageSwitcher.css';

// Fixed floating language toggle, bottom-right of every storefront page.
// Tapping the globe opens a small popover with the available languages;
// picking one switches the whole site instantly (see LanguageContext).
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
];

function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const handleEsc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const choose = (code) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div className="lang-switcher" ref={rootRef}>
      {open && (
        <div className="lang-switcher__menu" role="menu" aria-label="Select language">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitemradio"
              aria-checked={l.code === lang}
              className={`lang-switcher__option ${l.code === lang ? 'is-active' : ''}`}
              onClick={() => choose(l.code)}
            >
              <span className="lang-switcher__flag" aria-hidden="true">{l.flag}</span>
              <span className="lang-switcher__label">{l.label}</span>
              {l.code === lang && <Check size={15} weight="bold" className="lang-switcher__check" />}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={`lang-switcher__toggle ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Change language (current: ${current.label})`}
        title="Change language / Taal wijzigen"
      >
        <Globe size={22} weight="regular" />
        <span className="lang-switcher__toggle-code">{current.code.toUpperCase()}</span>
      </button>
    </div>
  );
}

export default LanguageSwitcher;

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import nl from './nl.js';

// ─────────────────────────────────────────────────────────────────────
//  Language / translation context
// ─────────────────────────────────────────────────────────────────────
// The storefront is bilingual (English default, Dutch). Rather than
// key every string with an invented id, translation is done by SOURCE
// STRING: components pass the exact English text they'd otherwise render
// — hardcoded UI chrome OR content coming from the CMS/API — to t(), and
// t() returns the Dutch equivalent from ./nl.js when the active language
// is 'nl'. Missing entries fall back to the original English, so the site
// never shows a blank or a raw key.
//
// The choice is persisted to localStorage and reflected on <html lang>.

const DICTIONARIES = { nl };
const SUPPORTED = ['en', 'nl'];
const STORAGE_KEY = 'nu_lang';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (text) => text,
});

function getInitialLang() {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;
  return 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  }, [lang]);

  const setLang = useCallback((next) => {
    if (SUPPORTED.includes(next)) setLangState(next);
  }, []);

  // t(text): returns the translation of the English source `text` for the
  // active language, or `text` unchanged when English/untranslated. Safe
  // to call with undefined/null (e.g. optional CMS props) — returns it as-is.
  const t = useCallback((text) => {
    if (lang === 'en' || text == null) return text;
    const dict = DICTIONARIES[lang];
    if (!dict) return text;
    return Object.prototype.hasOwnProperty.call(dict, text) ? dict[text] : text;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}

export { SUPPORTED };

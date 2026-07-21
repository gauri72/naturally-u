import { Link } from 'react-router-dom';
import '../../pages/storefront/AboutMakerPage.css';
import '../../pages/storefront/WorkshopsPage.css';
import { useLang } from '../../i18n/LanguageContext.jsx';

const WRAP_CLASS = { 'about-maker': 'about-maker__cta', workshops: 'workshops-page__cta' };

// Props: { variant('about-maker'|'workshops'), heading?, body?, buttons: [{label, link, style}] }
// A heading/body + one or more buttons, reused for the About page's closing
// CTA (2 buttons, no heading) and the Workshops page's booking CTA
// (heading+body+1 button).
function CtaRowBlock({ variant = 'about-maker', heading, body, buttons = [] }) {
  const { t } = useLang();
  return (
    <div className={WRAP_CLASS[variant] || WRAP_CLASS['about-maker']}>
      {heading && <h2>{t(heading)}</h2>}
      {body && <p>{t(body)}</p>}
      {buttons.map((btn, i) => (
        <Link key={btn.link || i} to={btn.link} className={`btn btn--${btn.style || 'primary'}`}>
          {t(btn.label)}
        </Link>
      ))}
    </div>
  );
}

export default CtaRowBlock;

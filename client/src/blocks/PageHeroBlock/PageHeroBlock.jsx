import { Link } from 'react-router-dom';
import { Sparkle, Leaf, Package, ShoppingBag } from '@phosphor-icons/react';
import { useLang } from '../../i18n/LanguageContext.jsx';
import '../../pages/storefront/WorkshopsPage.css';
import '../../pages/storefront/AboutMakerPage.css';
import '../../pages/storefront/ContactPage.css';
import '../../pages/storefront/GiftSetsPage.css';
import '../../pages/storefront/LegalPage.css';
import '../../pages/storefront/TrackOrderPage.css';

const ICONS = { package: Package, 'shopping-bag': ShoppingBag };

// Props: { variant, icon?, eyebrow?, heading, subtext?, ctaLabel?, ctaLink? }
// Simple heading(+subtext) hero, reused across several interior pages.
// `variant` selects which page's existing wrapper markup/CSS to reproduce;
// pages whose hero is a bare <h1> (FAQ, Shipping & Returns, Checkout, Cart)
// fall through to the default case.
function PageHeroBlock({ variant = 'plain', icon, eyebrow, heading, subtext, ctaLabel, ctaLink }) {
  const { t } = useLang();
  const Icon = icon && ICONS[icon];
  const cta = ctaLabel && ctaLink
    ? <Link to={ctaLink} className="btn btn--primary">{t(ctaLabel)}</Link>
    : null;

  if (variant === 'about-maker') {
    return (
      <div className="about-maker__hero">
        <span className="about-maker__eyebrow">
          <Sparkle size={16} weight="fill" /> {t(eyebrow)}
        </span>
        <h1>{t(heading)}</h1>
        <Leaf size={26} weight="regular" className="about-maker__hero-divider" aria-hidden="true" />
      </div>
    );
  }

  if (variant === 'workshops') {
    return (
      <div className="workshops-page__hero">
        <h1>{t(heading)}</h1>
        {subtext && <p>{t(subtext)}</p>}
      </div>
    );
  }

  if (variant === 'contact') {
    return (
      <div className="contact-page__hero">
        <h1>{t(heading)}</h1>
        {subtext && <p>{t(subtext)}</p>}
      </div>
    );
  }

  if (variant === 'gift-sets') {
    return (
      <div className="gift-sets-page__hero">
        <h1>{t(heading)}</h1>
        {subtext && <p>{t(subtext)}</p>}
      </div>
    );
  }

  if (variant === 'legal') {
    return (
      <>
        <h1>{t(heading)}</h1>
        {subtext && <p className="legal-page__updated">{t(subtext)}</p>}
      </>
    );
  }

  if (variant === 'track-order') {
    return (
      <>
        {Icon && <Icon size={36} weight="regular" className="track-order-page__icon" />}
        <h1>{t(heading)}</h1>
        {subtext && <p>{t(subtext)}</p>}
      </>
    );
  }

  if (variant === 'cart-empty') {
    return (
      <>
        {Icon && <Icon size={48} weight="regular" />}
        <h1>{t(heading)}</h1>
        {subtext && <p>{t(subtext)}</p>}
        {cta}
      </>
    );
  }

  // 'faq' | 'shipping-returns' | 'checkout' | 'cart' | plain - bare heading
  return <h1>{t(heading)}</h1>;
}

export default PageHeroBlock;

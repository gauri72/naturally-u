import { Link } from 'react-router-dom';
import { Plant, HandHeart, Rabbit, Leaf } from '@phosphor-icons/react';
import { useLang } from '../../i18n/LanguageContext.jsx';
import desktopHeroImg from '../../assets/images/home/desktop-hero-background.png';
import mobileHeroImg from '../../assets/images/home/mobile-hero-background.png';
import './HeroBlock.css';

function BadgeGradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hero-badge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3FA34D" />
          <stop offset="100%" stopColor="#D4A017" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const badgeIconProps = { size: 36, weight: 'regular', color: 'url(#hero-badge-gradient)' };

const trustBadges = [
  { label: 'Natural\nIngredients', Icon: (props) => <Plant {...badgeIconProps} {...props} /> },
  { label: 'Handmade in\nSmall Batches', Icon: (props) => <HandHeart {...badgeIconProps} {...props} /> },
  { label: 'Cruelty\nFree', Icon: (props) => <Rabbit {...badgeIconProps} {...props} /> },
  { label: 'Eco Friendly\nPackaging', Icon: (props) => <Leaf {...badgeIconProps} {...props} /> },
];

/**
 * Props (validated server-side by server/src/blocks/hero.schema.js):
 *   heading: string
 *   subtext: string
 *   ctaButtons: [{ label, link, style: 'primary' | 'secondary' }]
 *
 * The hero artwork itself (desktop/mobile background) is fixed brand
 * creative, not CMS-editable — bundled directly rather than sourced
 * from the `image` prop.
 */
function HeroBlock({ heading, subtext, ctaButtons = [] }) {
  const { t } = useLang();
  return (
    <section className="hero-block">
      <BadgeGradientDefs />

      <div
        className="hero-block__bg hero-block__bg--desktop"
        style={{ backgroundImage: `url(${desktopHeroImg})` }}
        aria-hidden="true"
      />

      <div className="hero-block__inner">
        <div className="hero-block__content">
          <div
            className="hero-block__photo"
            style={{ '--hero-mobile-bg': `url(${mobileHeroImg})` }}
          >
            <h1>{t(heading)}</h1>

            {subtext && (
              <p className="hero-block__subtext">
                {t(subtext).split('\n').map((line, i) => (
                  <span className="hero-block__subtext-line" key={i}>
                    {line}
                  </span>
                ))}
              </p>
            )}

            <div className="hero-block__ctas">
              {ctaButtons.map((btn) => (
                <Link
                  key={btn.label}
                  to={btn.link}
                  className={`btn btn--${btn.style || 'primary'}`}
                >
                  {t(btn.label)}
                </Link>
              ))}
            </div>
          </div>

          <div className="hero-block__badges">
            {trustBadges.map(({ label, Icon }) => (
              <div className="hero-block__badge" key={label}>
                <span className="hero-block__badge-icon">
                  <Icon />
                </span>
                <span className="hero-block__badge-label">
                  {t(label).split('\n').map((line, i) => (
                    <span className="hero-block__badge-label-line" key={i}>
                      {line}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBlock;

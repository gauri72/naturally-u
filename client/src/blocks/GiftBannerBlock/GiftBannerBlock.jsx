import { Link } from 'react-router-dom';
import { Leaf } from '@phosphor-icons/react';
import desktopGiftImg from '../../assets/images/home/desktop-explore-gift-sets-image.png';
import mobileGiftImg from '../../assets/images/home/mobile-explore-gift-sets-image.png';
import './GiftBannerBlock.css';

// Props: { heading, subtext, image, ctaLabel, ctaLink }
// The gift-box photography is fixed brand creative (same approach as
// Hero/FeatureStrip/ProductGrid) — bundled directly rather than sourced
// from the `image` prop. `heading` supports a '\n' line break.
function GiftBannerBlock({ heading, subtext, ctaLabel, ctaLink }) {
  return (
    <section className="gift-banner-block">
      <div className="gift-banner-block__image-wrap">
        <img
          src={desktopGiftImg}
          alt={heading}
          className="gift-banner-block__image gift-banner-block__image--desktop"
        />
        <img
          src={mobileGiftImg}
          alt={heading}
          className="gift-banner-block__image gift-banner-block__image--mobile"
        />
      </div>

      <div className="gift-banner-block__content">
        <div className="gift-banner-block__text">
          <h2>
            {heading}
            <Leaf
              size={34}
              weight="regular"
              color="var(--color-primary)"
              className="gift-banner-block__icon gift-banner-block__icon--heading"
            />
          </h2>

          {subtext && <p className="gift-banner-block__subtext">{subtext}</p>}
        </div>

        <div className="gift-banner-block__actions">
          {ctaLabel && (
            <Link to={ctaLink} className="btn gift-banner-block__cta">
              {ctaLabel}
            </Link>
          )}
          <Leaf
            size={22}
            weight="regular"
            color="var(--color-primary)"
            className="gift-banner-block__icon gift-banner-block__icon--actions"
          />
        </div>
      </div>
    </section>
  );
}

export default GiftBannerBlock;

import { Link } from 'react-router-dom';
import { SealCheck, HandHeart, Leaf } from '@phosphor-icons/react';
import '../../pages/storefront/AboutMakerPage.css';

const EYEBROW_ICONS = { sealcheck: SealCheck, handheart: HandHeart };

// Props: { eyebrowIcon, eyebrowText, heading?, body, image, imageAlt, reverse?, ctaLabel?, ctaLink? }
// Image+text feature section, reused 3x on the About the Maker page
// (Meet Deepti / Rooted in yoga / Soap-Making Workshops).
function AboutFeatureBlock({ eyebrowIcon, eyebrowText, heading, body, image, imageAlt, reverse, ctaLabel, ctaLink }) {
  const EyebrowIcon = EYEBROW_ICONS[eyebrowIcon] || SealCheck;
  const paragraphs = body ? body.split(/\n{2,}/) : [];
  const cta = ctaLabel && ctaLink
    ? <Link to={ctaLink} className="btn btn--secondary">{ctaLabel}</Link>
    : null;

  return (
    <div className={`about-maker__feature ${reverse ? 'about-maker__feature--reverse' : ''}`}>
      <div className="about-maker__feature-text">
        {eyebrowText && (
          <span className="about-maker__eyebrow">
            <EyebrowIcon size={16} weight="fill" /> {eyebrowText}
          </span>
        )}
        {heading && <h2>{heading}</h2>}
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        {cta}
      </div>
      <div className="about-maker__feature-image-wrap">
        <img src={image} alt={imageAlt || ''} className="about-maker__feature-image" />
        <Leaf size={36} weight="regular" className="about-maker__feature-badge" aria-hidden="true" />
      </div>
    </div>
  );
}

export default AboutFeatureBlock;

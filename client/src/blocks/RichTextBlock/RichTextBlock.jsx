import { Link } from 'react-router-dom';
import { Leaf, Sparkle, SealCheck, Info } from '@phosphor-icons/react';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './RichTextBlock.css';

// Props: { heading, body, image, imageAlt, ctaLabel, ctaLink, variant }
// General-purpose prose section for CMS pages. `body` is plain text: blank
// lines separate paragraphs, single '\n' line breaks render via pre-line.
// `image` is optional and CMS-sourced.
//
// `variant` selects an on-theme presentation (used by the home page's
// migrated sections); omitting it renders the plain default used by
// interior CMS pages like /about-2:
//   feature       - elevated intro with framed image + CTA (Nature's Superfoods)
//   story         - centered narrative with script eyebrow + leaf divider
//   section-title - decorative centered heading with flanking rules
//   pledge        - YES/NO promise card with a tone badge + leaf accent
//   disclaimer    - subtle bordered fine-print note with an info icon
function RichTextBlock({ heading, body, image, imageAlt, ctaLabel, ctaLink, variant = 'default' }) {
  const { t } = useLang();
  if (!heading && !body) return null;
  const paragraphs = body ? t(body).split(/\n{2,}/) : [];
  const cta = ctaLabel && ctaLink ? (
    <Link to={ctaLink} className="btn btn--primary rich-text-block__cta">{t(ctaLabel)}</Link>
  ) : null;

  if (variant === 'pledge') {
    const tone = /\bYES\b/i.test(heading || '') ? 'yes' : /\bNO\b/i.test(heading || '') ? 'no' : null;
    return (
      <section className={`rich-text-block rich-text-block--pledge rich-text-block--pledge-${tone || 'neutral'}`}>
        <div className="rich-text-block__pledge-card">
          {tone && <span className={`rich-text-block__pledge-badge rich-text-block__pledge-badge--${tone}`}>{t(tone.toUpperCase())}</span>}
          <div className="rich-text-block__pledge-body">
            {heading && <h3>{t(heading)}</h3>}
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <Leaf size={26} weight="regular" className="rich-text-block__pledge-leaf" aria-hidden="true" />
        </div>
      </section>
    );
  }

  if (variant === 'section-title') {
    return (
      <section className="rich-text-block rich-text-block--section-title">
        <span className="rich-text-block__rule" aria-hidden="true" />
        <div className="rich-text-block__section-title-text">
          <Leaf size={22} weight="regular" aria-hidden="true" />
          {heading && <h2>{t(heading)}</h2>}
        </div>
        <span className="rich-text-block__rule" aria-hidden="true" />
      </section>
    );
  }

  if (variant === 'disclaimer') {
    return (
      <section className="rich-text-block rich-text-block--disclaimer">
        <div className="rich-text-block__disclaimer-card">
          <Info size={22} weight="regular" className="rich-text-block__disclaimer-icon" aria-hidden="true" />
          <div>
            {heading && <h4>{t(heading)}</h4>}
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'story') {
    return (
      <section className="rich-text-block rich-text-block--story">
        <span className="rich-text-block__eyebrow" aria-hidden="true">
          <Sparkle size={16} weight="fill" /> {t('Our roots')}
        </span>
        {heading && <h2>{t(heading)}</h2>}
        <Leaf size={26} weight="regular" className="rich-text-block__story-divider" aria-hidden="true" />
        <div className="rich-text-block__story-body">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        {cta}
      </section>
    );
  }

  if (variant === 'feature') {
    return (
      <section className={`rich-text-block rich-text-block--feature ${image ? 'rich-text-block--feature-with-image' : ''}`}>
        <div className="rich-text-block__feature-text">
          <span className="rich-text-block__eyebrow" aria-hidden="true">
            <SealCheck size={16} weight="fill" /> {t('Pure & natural')}
          </span>
          {heading && <h2>{t(heading)}</h2>}
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          {cta}
        </div>
        {image && (
          <div className="rich-text-block__feature-image-wrap">
            <img src={image} alt={imageAlt || heading || ''} className="rich-text-block__feature-image" />
            <Leaf size={40} weight="regular" className="rich-text-block__feature-badge" aria-hidden="true" />
          </div>
        )}
      </section>
    );
  }

  // default — plain prose (interior CMS pages)
  return (
    <section className={`rich-text-block ${image ? 'rich-text-block--with-image' : ''}`}>
      <div className="rich-text-block__text">
        {heading && <h2>{t(heading)}</h2>}
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        {cta}
      </div>
      {image && (
        <div className="rich-text-block__image-wrap">
          <img src={image} alt={imageAlt || heading || ''} className="rich-text-block__image" />
        </div>
      )}
    </section>
  );
}

export default RichTextBlock;

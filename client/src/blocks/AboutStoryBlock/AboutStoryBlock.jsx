import { Link } from 'react-router-dom';
import { Leaf, Sparkle } from '@phosphor-icons/react';
import '../../pages/storefront/AboutMakerPage.css';

// Props: { variant('plain'|'whats-next'|'vision'), eyebrow?, heading, body, ctaLabel?, ctaLink? }
// Centered narrative section, reused for the About the Maker page's "born" /
// "how-made" / "what's next" / "vision" sections.
function AboutStoryBlock({ variant = 'plain', eyebrow, heading, body, ctaLabel, ctaLink }) {
  const paragraphs = body ? body.split(/\n{2,}/) : [];
  const cta = ctaLabel && ctaLink
    ? <Link to={ctaLink} className="btn btn--primary about-maker__story-cta">{ctaLabel}</Link>
    : null;

  if (variant === 'vision') {
    return (
      <div className="about-maker__vision">
        {eyebrow && (
          <span className="about-maker__eyebrow about-maker__eyebrow--light">
            <Sparkle size={16} weight="fill" /> {eyebrow}
          </span>
        )}
        {heading && <h2>{heading}</h2>}
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    );
  }

  return (
    <div className={`about-maker__story ${variant === 'whats-next' ? 'about-maker__story--whats-next' : ''}`}>
      {heading && <h2>{heading}</h2>}
      <Leaf size={22} weight="regular" className="about-maker__story-divider" aria-hidden="true" />
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      {cta}
    </div>
  );
}

export default AboutStoryBlock;

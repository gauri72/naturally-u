import { useEffect, useState } from 'react';
import { Leaf } from '@phosphor-icons/react';
import { useLang } from '../../i18n/LanguageContext.jsx';
import fallbackPhoto from '../../assets/images/home/testimonials-image.png';
import './TestimonialBlock.css';

const AUTOPLAY_MS = 4000;

// Props: { testimonials: [{ quote, author, image }] }
// Each review shows its own `image` (CMS-sourced); the bundled photo is
// only a fallback when a review has none. The card is a fixed height so
// paging between reviews of different lengths keeps a consistent size —
// longer quotes scroll within the content area instead of resizing it.
// `quote` supports '\n' line breaks (rendered via white-space: pre-line).
// Author/quote text should use proper typographic apostrophes (’)
// rather than straight quotes ('), matching the reference design.
function TestimonialBlock({ testimonials = [] }) {
  const { t: tr } = useLang();
  const [index, setIndex] = useState(0);

  // Auto-advance every 4s. Keyed on `index` so the timer resets after each
  // change (auto or manual dot click), giving a full interval each time.
  useEffect(() => {
    if (testimonials.length <= 1) return undefined;
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % testimonials.length),
      AUTOPLAY_MS
    );
    return () => clearTimeout(id);
  }, [index, testimonials.length]);

  if (testimonials.length === 0) return null;
  const t = testimonials[index];

  return (
    <section className="testimonial-block">
      <div className="testimonial-block__card">
        <div className="testimonial-block__content">
          <span className="testimonial-block__quote-mark" aria-hidden="true">“</span>
          <div className="testimonial-block__text-group">
            <blockquote>“{tr(t.quote)}”</blockquote>
            <p className="testimonial-block__author">— {t.author}</p>
          </div>
          {testimonials.length > 1 && (
            <div className="testimonial-block__dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={i === index ? 'active' : ''}
                  onClick={() => setIndex(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="testimonial-block__image-wrap">
          <img src={t.image || fallbackPhoto} alt={t.author} className="testimonial-block__image" />
        </div>
        <Leaf weight="regular" className="testimonial-block__leaf-icon" aria-hidden="true" />
      </div>
    </section>
  );
}

export default TestimonialBlock;

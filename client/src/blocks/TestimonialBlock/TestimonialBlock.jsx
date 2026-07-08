import { useState } from 'react';
import { Leaf } from '@phosphor-icons/react';
import testimonialPhoto from '../../assets/images/home/testimonials-image.png';
import './TestimonialBlock.css';

// Props: { testimonials: [{ quote, author, image }] }
// The portrait itself is fixed brand creative (same approach as
// Hero/GiftBanner) — bundled directly rather than sourced from the
// `image` prop. `quote` supports '\n' line breaks (rendered via
// white-space: pre-line), same convention as Hero/GiftBanner text.
// Author/quote text should use proper typographic apostrophes (’)
// rather than straight quotes ('), matching the reference design.
function TestimonialBlock({ testimonials = [] }) {
  const [index, setIndex] = useState(0);
  if (testimonials.length === 0) return null;
  const t = testimonials[index];

  return (
    <section className="testimonial-block">
      <div className="testimonial-block__card">
        <div className="testimonial-block__content">
          <span className="testimonial-block__quote-mark" aria-hidden="true">“</span>
          <div className="testimonial-block__text-group">
            <blockquote>“{t.quote}”</blockquote>
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
          <img src={testimonialPhoto} alt={t.author} className="testimonial-block__image" />
        </div>
        <Leaf weight="regular" className="testimonial-block__leaf-icon" aria-hidden="true" />
      </div>
    </section>
  );
}

export default TestimonialBlock;

import { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import '../../pages/storefront/FaqPage.css';

// Props: { items: [{question, answer}] }
// Question/answer accordion list on the FAQ page.
function FaqAccordionBlock({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-page__list">
      {items.map((faq, i) => (
        <div key={faq.question} className="faq-page__item">
          <button
            type="button"
            className="faq-page__question"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            {faq.question}
            <CaretDown weight="bold" className={`faq-page__caret ${openIndex === i ? 'is-open' : ''}`} />
          </button>
          <div className={`faq-page__answer ${openIndex === i ? 'is-open' : ''}`}>
            <p>{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FaqAccordionBlock;

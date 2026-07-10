import { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import './FaqPage.css';

const faqs = [
  {
    question: 'What are your products made of?',
    answer: 'Every bar is handmade in small batches using natural oils, butters, and botanicals — no synthetic detergents or artificial fillers.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Orders are handcrafted to order, so please allow a few extra days for production before your package ships.',
  },
  {
    question: 'What does shipping cost?',
    answer: 'Shipping ranges from €6.75–€12.95 depending on your region, and orders over €50–€100 (region-dependent) ship free.',
  },
  {
    question: 'Can I return a product?',
    answer: 'Yes — returns are accepted within 30 days of delivery. See our Shipping & Returns page for the full policy.',
  },
  {
    question: 'Are your products tested on skin before selling?',
    answer: 'We recommend a patch test before first use of any product, since everyone\'s skin reacts a little differently to natural ingredients.',
  },
  {
    question: 'Do you offer workshops?',
    answer: 'Yes — we run signature soap-making workshops for groups and birthday parties. Visit our Workshops page to get in touch.',
  },
];

function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="shop-page faq-page">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-page__list">
        {faqs.map((faq, i) => (
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
    </section>
  );
}

export default FaqPage;

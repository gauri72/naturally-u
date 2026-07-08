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
    question: 'Can I return a product?',
    answer: 'See our Shipping & Returns page for the full policy.',
  },
];

function FaqPage() {
  return (
    <section className="shop-page">
      <h1>Frequently Asked Questions</h1>
      {faqs.map((faq) => (
        <div key={faq.question} style={{ marginTop: 'var(--space-lg)' }}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
    </section>
  );
}

export default FaqPage;

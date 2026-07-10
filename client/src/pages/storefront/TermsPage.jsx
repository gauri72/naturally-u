import { Link } from 'react-router-dom';
import './LegalPage.css';

function TermsPage() {
  return (
    <section className="shop-page legal-page">
      <h1>Terms &amp; Conditions</h1>
      <p className="legal-page__updated">Last updated: 2026</p>

      <div className="legal-page__section">
        <h3>Orders &amp; Payment</h3>
        <p>
          By placing an order with NaturallyU, you agree to pay the listed price plus any
          applicable shipping. Orders are handcrafted to order and may take a few extra days
          to prepare before shipping.
        </p>
      </div>

      <div className="legal-page__section">
        <h3>Shipping &amp; Returns</h3>
        <p>
          See our <Link to="/shipping-returns">Shipping &amp; Returns</Link> page for shipping
          costs, timelines, and our 30-day return policy.
        </p>
      </div>

      <div className="legal-page__section">
        <h3>Product Disclaimer</h3>
        <p>
          Our products are not prescription products, but rather timeless beauty secrets drawn
          from nature. A patch test is recommended before first use of any product.
        </p>
      </div>

      <div className="legal-page__section">
        <h3>Governing Law</h3>
        <p>These terms are governed by the laws of the jurisdiction in which NaturallyU operates.</p>
      </div>

      <div className="legal-page__section">
        <h3>Contact</h3>
        <p>Questions about these terms? Reach out via our Contact page.</p>
      </div>
    </section>
  );
}

export default TermsPage;

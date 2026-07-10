import './LegalPage.css';

function PrivacyPolicyPage() {
  return (
    <section className="shop-page legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-page__updated">Last updated: 2026</p>

      <div className="legal-page__section">
        <h3>Information We Collect</h3>
        <p>
          When you place an order or contact us, we collect the information needed to fulfill
          it — your name, email, shipping address, and phone number. We don't collect anything
          beyond what's needed to process your order and get in touch with you.
        </p>
      </div>

      <div className="legal-page__section">
        <h3>How We Use It</h3>
        <p>
          Your information is used to process and ship your order, respond to questions, and — if
          you've opted in — send occasional updates about new products or offers. We never sell
          your data to third parties.
        </p>
      </div>

      <div className="legal-page__section">
        <h3>Cookies</h3>
        <p>
          We use minimal cookies/local storage to keep your shopping cart working between visits.
          We don't use third-party tracking or advertising cookies.
        </p>
      </div>

      <div className="legal-page__section">
        <h3>Third-Party Services</h3>
        <p>
          Payments are processed by a secure third-party payment provider — we never see or store
          your full card details.
        </p>
      </div>

      <div className="legal-page__section">
        <h3>Your Rights</h3>
        <p>
          You can ask us to access, correct, or delete your personal information at any time — just
          get in touch.
        </p>
      </div>

      <div className="legal-page__section">
        <h3>Contact</h3>
        <p>Questions about this policy? Reach out via our Contact page.</p>
      </div>
    </section>
  );
}

export default PrivacyPolicyPage;

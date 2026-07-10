import { Link } from 'react-router-dom';
import { HandHeart, UsersThree, Cake } from '@phosphor-icons/react';
import './WorkshopsPage.css';

function WorkshopsPage() {
  return (
    <section className="workshops-page">
      <div className="workshops-page__hero">
        <h1>Workshops</h1>
        <p>Signature soap-making workshops, hosted by NaturallyU — for groups and birthday parties.</p>
      </div>

      <div className="workshops-page__grid">
        <div className="workshops-page__card">
          <HandHeart size={32} weight="regular" />
          <h3>Hands-On &amp; Guided</h3>
          <p>Learn the same natural, chemical-free soap-making process behind every NaturallyU bar, guided start to finish.</p>
        </div>
        <div className="workshops-page__card">
          <UsersThree size={32} weight="regular" />
          <h3>Perfect for Groups</h3>
          <p>A hands-on activity for friends, teams, or anyone curious about handmade skincare.</p>
        </div>
        <div className="workshops-page__card">
          <Cake size={32} weight="regular" />
          <h3>Birthday Parties</h3>
          <p>A memorable, take-home-something-you-made alternative to a typical party activity.</p>
        </div>
      </div>

      <div className="workshops-page__cta">
        <h2>Interested in booking a workshop?</h2>
        <p>Get in touch and we'll help you plan the details — group size, timing, and location.</p>
        <Link to="/contact" className="btn btn--primary">Get in Touch</Link>
      </div>
    </section>
  );
}

export default WorkshopsPage;

import { Link } from 'react-router-dom';
import { Leaf, HandHeart, Sparkle } from '@phosphor-icons/react';
import './AboutMakerPage.css';

function AboutMakerPage() {
  return (
    <section className="about-maker">
      <div className="about-maker__hero">
        <Leaf size={40} weight="regular" className="about-maker__hero-icon" />
        <h1>About the Maker</h1>
        <p className="about-maker__pullquote">
          "With NaturallyU, explore Mother Earth's precious gifts of beauty."
        </p>
      </div>

      <div className="about-maker__section">
        <h2>Meet Deepti</h2>
        <p>
          Deepti is a trained Ayurveda practitioner specializing in skincare and wellness. She
          describes Ayurveda as a remedial science from ancient India that explores the therapeutic
          and medicinal properties of local fauna and flora — a tradition she brings into every
          product she makes. Alongside her Ayurvedic training, Deepti is also trained in yoga
          practice, and she sees inner wellness as the foundation of her work.
        </p>
      </div>

      <div className="about-maker__section">
        <h2>How NaturallyU Was Born</h2>
        <p>
          It started with a soap-making activity in 2017 that sparked an idea. Deepti partnered
          with a friend in 2018 to create hand-crafted, chemical-free products, and later became
          sole owner of NaturallyU — turning a spark of curiosity into a small business built
          entirely around natural ingredients.
        </p>
      </div>

      <div className="about-maker__section">
        <h2>How the Products Are Made</h2>
        <p>
          Every product starts with vegetable oils, clays, herb-infused oils, and essential oils,
          prepared in Deepti's own kitchen under strict hygiene standards. Nothing sits on a shelf
          for long — everything is made fresh, to order.
        </p>
      </div>

      <div className="about-maker__values">
        <div className="about-maker__value">
          <HandHeart size={32} weight="regular" />
          <h3>Ayurveda-Rooted</h3>
          <p>Every formula draws on traditional Indian wellness practices.</p>
        </div>
        <div className="about-maker__value">
          <Leaf size={32} weight="regular" />
          <h3>Zero Chemicals</h3>
          <p>No synthetic fragrance, no artificial additives — ever.</p>
        </div>
        <div className="about-maker__value">
          <Sparkle size={32} weight="regular" />
          <h3>Made Fresh</h3>
          <p>Small batches, made to order, never left to sit on a shelf.</p>
        </div>
      </div>

      <div className="about-maker__section">
        <h2>The Vision</h2>
        <p>
          The vision behind NaturallyU is to bring Ayurvedic traditions to Holland, blending
          Indian wisdom with European sensibilities — zero-chemical formulations, packaged in
          eco-friendly, recyclable materials.
        </p>
      </div>

      <div className="about-maker__cta">
        <Link to="/shop" className="btn btn--primary">Explore the Products</Link>
        <Link to="/workshops" className="btn btn--secondary">See Our Workshops</Link>
      </div>
    </section>
  );
}

export default AboutMakerPage;

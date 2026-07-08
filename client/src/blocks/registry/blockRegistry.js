import AnnouncementBarBlock from '../AnnouncementBarBlock/AnnouncementBarBlock.jsx';
import HeroBlock from '../HeroBlock/HeroBlock.jsx';
import FeatureStripBlock from '../FeatureStripBlock/FeatureStripBlock.jsx';
import ProductGridBlock from '../ProductGridBlock/ProductGridBlock.jsx';
import GiftBannerBlock from '../GiftBannerBlock/GiftBannerBlock.jsx';
import ValuePropsBlock from '../ValuePropsBlock/ValuePropsBlock.jsx';
import TestimonialBlock from '../TestimonialBlock/TestimonialBlock.jsx';
import NewsletterBlock from '../NewsletterBlock/NewsletterBlock.jsx';
import FooterBlock from '../FooterBlock/FooterBlock.jsx';

/**
 * BLOCK REGISTRY
 * --------------
 * Single source of truth mapping a page's stored `blockType` string
 * (see server/src/models/Page.model.js) to the React component that
 * renders it. PageRenderer.jsx loops over a page's blocks and looks
 * each one up here.
 *
 * TO ADD A NEW BLOCK TYPE:
 *   1. Create client/src/blocks/<Name>Block/<Name>Block.jsx + .css
 *   2. Create server/src/blocks/<name>.schema.js (props validation)
 *   3. Register both here and in server/src/blocks/index.js
 *   4. Add an entry to blockMeta below so the admin "Add Block" menu
 *      shows a friendly label and default props.
 */
export const blockRegistry = {
  announcementBar: AnnouncementBarBlock,
  hero: HeroBlock,
  featureStrip: FeatureStripBlock,
  productGrid: ProductGridBlock,
  giftBanner: GiftBannerBlock,
  valueProps: ValuePropsBlock,
  testimonial: TestimonialBlock,
  newsletter: NewsletterBlock,
  footer: FooterBlock,
};

// Metadata used only by the admin "Add Block" picker
export const blockMeta = {
  announcementBar: { label: 'Announcement Bar', defaultProps: { messages: ['New announcement'] } },
  hero: { label: 'Hero Section', defaultProps: { heading: 'New Hero Heading', subtext: '', image: '/assets/hero-placeholder.jpg', ctaButtons: [] } },
  featureStrip: { label: 'Feature Strip', defaultProps: { items: [] } },
  productGrid: { label: 'Product Grid', defaultProps: { title: 'Featured Products', source: 'manual' } },
  giftBanner: { label: 'Gift / Promo Banner', defaultProps: { heading: 'New Banner', subtext: '', image: '/assets/gift-placeholder.jpg', ctaLabel: '', ctaLink: '/' } },
  valueProps: { label: 'Value Props Row', defaultProps: { items: [] } },
  testimonial: { label: 'Testimonial', defaultProps: { testimonials: [] } },
  newsletter: { label: 'Newsletter Signup', defaultProps: { heading: 'Join Us' } },
  footer: { label: 'Footer', defaultProps: {} },
};

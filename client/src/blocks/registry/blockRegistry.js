import AnnouncementBarBlock from '../AnnouncementBarBlock/AnnouncementBarBlock.jsx';
import HeroBlock from '../HeroBlock/HeroBlock.jsx';
import FeatureStripBlock from '../FeatureStripBlock/FeatureStripBlock.jsx';
import ProductGridBlock from '../ProductGridBlock/ProductGridBlock.jsx';
import GiftBannerBlock from '../GiftBannerBlock/GiftBannerBlock.jsx';
import ValuePropsBlock from '../ValuePropsBlock/ValuePropsBlock.jsx';
import TestimonialBlock from '../TestimonialBlock/TestimonialBlock.jsx';
import NewsletterBlock from '../NewsletterBlock/NewsletterBlock.jsx';
import FooterBlock from '../FooterBlock/FooterBlock.jsx';
import RichTextBlock from '../RichTextBlock/RichTextBlock.jsx';
import ImageGalleryBlock from '../ImageGalleryBlock/ImageGalleryBlock.jsx';
import PageHeroBlock from '../PageHeroBlock/PageHeroBlock.jsx';
import LegalSectionBlock from '../LegalSectionBlock/LegalSectionBlock.jsx';
import AboutFeatureBlock from '../AboutFeatureBlock/AboutFeatureBlock.jsx';
import AboutStoryBlock from '../AboutStoryBlock/AboutStoryBlock.jsx';
import IconCardsBlock from '../IconCardsBlock/IconCardsBlock.jsx';
import AboutContactBlock from '../AboutContactBlock/AboutContactBlock.jsx';
import CtaRowBlock from '../CtaRowBlock/CtaRowBlock.jsx';
import FaqAccordionBlock from '../FaqAccordionBlock/FaqAccordionBlock.jsx';

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
  richText: RichTextBlock,
  imageGallery: ImageGalleryBlock,
  pageHero: PageHeroBlock,
  legalSection: LegalSectionBlock,
  aboutFeature: AboutFeatureBlock,
  aboutStory: AboutStoryBlock,
  iconCards: IconCardsBlock,
  aboutContact: AboutContactBlock,
  ctaRow: CtaRowBlock,
  faqAccordion: FaqAccordionBlock,
  // Note: shopPageContent/productPageContent/searchPageContent/
  // cartPageContent/checkoutPageContent/contactPageContent/
  // giftSetsPageContent are intentionally NOT registered here - they hold
  // static strings read directly by their page component (Contact, Gift
  // Sets, Shop, Product, Cart, Checkout, Search), not rendered as a visual
  // section. PageRenderer already tolerates unknown blockTypes by design
  // (see its own comment), so they render nothing in admin Preview.
};

// Metadata used by the admin page builder: `label` names the block in the
// block list and "Add Block" picker; `defaultProps` seed a newly added
// block. Entries with `hidden: true` are page-specific content holders
// (read directly by their page component, not rendered by PageRenderer) -
// they still get a friendly label in the block list, but are excluded from
// the "Add Block" menu since adding them to other pages does nothing.
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
  richText: { label: 'Rich Text Section', defaultProps: { heading: 'New Section', body: '' } },
  imageGallery: { label: 'Image Gallery', defaultProps: { images: [] } },
  pageHero: { label: 'Page Hero', defaultProps: { variant: 'plain', heading: 'New Heading', subtext: '' } },
  legalSection: { label: 'Legal Section', defaultProps: { heading: 'New Section', body: '' } },
  aboutFeature: { label: 'About: Feature Section', defaultProps: { eyebrowIcon: 'sealcheck', eyebrowText: '', heading: 'New Feature', body: '', image: '' } },
  aboutStory: { label: 'About: Story Section', defaultProps: { variant: 'plain', heading: 'New Section', body: '' } },
  iconCards: { label: 'Icon Cards Grid', defaultProps: { variant: 'workshops', items: [] } },
  aboutContact: { label: 'About: Contact Section', defaultProps: { heading: 'Want to know more? Write to us!', address: '', email: '', phone: '' } },
  ctaRow: { label: 'CTA Row', defaultProps: { variant: 'about-maker', buttons: [] } },
  faqAccordion: { label: 'FAQ Accordion', defaultProps: { items: [] } },
  shopPageContent: { label: 'Shop Page Text', hidden: true, defaultProps: {} },
  productPageContent: { label: 'Product Page Text', hidden: true, defaultProps: {} },
  searchPageContent: { label: 'Search Page Text', hidden: true, defaultProps: {} },
  cartPageContent: { label: 'Cart Page Text', hidden: true, defaultProps: {} },
  checkoutPageContent: { label: 'Checkout Page Text', hidden: true, defaultProps: {} },
  contactPageContent: { label: 'Contact Details', hidden: true, defaultProps: {} },
  giftSetsPageContent: { label: 'Gift Sets Page Text', hidden: true, defaultProps: {} },
};

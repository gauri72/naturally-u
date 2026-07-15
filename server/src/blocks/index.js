const hero = require('./hero.schema');
const announcementBar = require('./announcementBar.schema');
const featureStrip = require('./featureStrip.schema');
const productGrid = require('./productGrid.schema');
const giftBanner = require('./giftBanner.schema');
const valueProps = require('./valueProps.schema');
const testimonial = require('./testimonial.schema');
const newsletter = require('./newsletter.schema');
const richText = require('./richText.schema');
const imageGallery = require('./imageGallery.schema');
const pageHero = require('./pageHero.schema');
const legalSection = require('./legalSection.schema');
const aboutFeature = require('./aboutFeature.schema');
const aboutStory = require('./aboutStory.schema');
const iconCards = require('./iconCards.schema');
const aboutContact = require('./aboutContact.schema');
const ctaRow = require('./ctaRow.schema');
const faqAccordion = require('./faqAccordion.schema');
const genericContent = require('./genericContent.schema');

// Central lookup: blockType string -> validator function
module.exports = {
  hero,
  announcementBar,
  featureStrip,
  productGrid,
  giftBanner,
  valueProps,
  testimonial,
  newsletter,
  richText,
  imageGallery,
  pageHero,
  legalSection,
  aboutFeature,
  aboutStory,
  iconCards,
  aboutContact,
  ctaRow,
  faqAccordion,
  // genericContent is shared by several page-specific "content" blocktypes
  // that hold static copy read directly by their page component (not
  // rendered via PageRenderer) - see MIGRATION_REPORT.md / plan notes.
  shopPageContent: genericContent,
  productPageContent: genericContent,
  searchPageContent: genericContent,
  cartPageContent: genericContent,
  checkoutPageContent: genericContent,
  contactPageContent: genericContent,
  giftSetsPageContent: genericContent,
};

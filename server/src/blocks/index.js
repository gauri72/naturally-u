const hero = require('./hero.schema');
const announcementBar = require('./announcementBar.schema');
const featureStrip = require('./featureStrip.schema');
const productGrid = require('./productGrid.schema');
const giftBanner = require('./giftBanner.schema');
const valueProps = require('./valueProps.schema');
const testimonial = require('./testimonial.schema');
const newsletter = require('./newsletter.schema');

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
};

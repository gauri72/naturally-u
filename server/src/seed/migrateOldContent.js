/**
 * Migrates the live content of NaturallyU's old Wix site (naturallyu.nl)
 * into this site's data layer. See MIGRATION_REPORT.md at the repo root
 * for the full old-URL -> new-destination mapping.
 *
 *  - Site-wide contact/social/logo      -> Settings singleton
 *  - Product names + descriptions       -> Product documents (verbatim
 *    old-site text; upserted by slug from data/oldSiteProducts.json)
 *  - Old home page sections             -> extra blocks on the 'home' Page
 *  - Old testimonials page (/blog)      -> the home page's testimonial block
 *  - Old about page (/about-2)          -> new 'about-2' Page (richText blocks)
 *
 * Images were downloaded once from Wix's CDN into client/public/media/
 * (plus the product photos already in client/public/assets/products/) and
 * are referenced here by root-relative URL — no network access needed.
 *
 * Idempotent and safe to re-run:
 *  - blocks owned by this migration carry a `_migrationId` marker in
 *    their props and are updated in place on re-run, never duplicated;
 *  - blocks it does not own are never deleted or reordered relative to
 *    each other;
 *  - products/settings updates always $set the same deterministic values.
 *
 * Run with: npm run migrate:content
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Page = require('../models/Page.model');
const Product = require('../models/Product.model');
const Settings = require('../models/Settings.model');
const blockValidators = require('../blocks');
const logger = require('../utils/logger');
const oldProducts = require('./data/oldSiteProducts.json');

const DISCLAIMER =
  'Disclaimer: These are not prescription products with 100% medical results. Rather, they are timeless beauty secrets extracted from nature’s best resources which are known to work for most people with varied skin types. NaturallyU makes no medical claim of any skin treatment. While we guarantee ZERO use of chemicals and artificial colour or fragrance, a patch-test is recommended for every product.';

// ---------------------------------------------------------------------------
// Old home page (https://www.naturallyu.nl) — sections in original order.
// Text is verbatim; the intro h4 is split into heading + body at the
// sentence boundary. Old CTA target /products is rewritten to /shop.
// ---------------------------------------------------------------------------
const homeMigratedBlocks = [
  {
    blockType: 'richText',
    props: {
      _migrationId: 'home-old-hero',
      variant: 'feature',
      heading: 'Nature’s Superfoods for your precious Skin & Hair!',
      body:
        'NaturallyU is a handmade soaps and cosmetics business with a mind-blowing collection of skin and hair care products made from all-natural ingredients and ZERO chemicals or artificial flavours (No Paraben or SLS). We can also make our products custom-made according to your preferences, fresh and local!',
      image: '/media/home-hero-soaps.jpg',
      imageAlt: 'soap1.jpg',
      ctaLabel: 'EXPLORE OUR STUNNING LINE OF PRODUCTS!',
      ctaLink: '/shop',
    },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'home-our-story',
      variant: 'story',
      heading: 'Our Story',
      body:
        'We started in 2018 with the purpose of bringing timeless Indian beauty secrets and techniques to European homes in a hassle-free format. With time, NaturallyU has expanded its line of products to include ancient beauty secrets from Europe so that we can offer the BEST of nature’s precious gifts to our customers.',
    },
  },
  {
    blockType: 'imageGallery',
    props: {
      _migrationId: 'home-gallery',
      variant: 'story',
      // The old home "Our Story" strip carried 3 photos; enriched here to a
      // 6-image collage using the founder/workshop photos from the old
      // /about-2 page (all authentic old-site imagery — see MIGRATION_REPORT.md).
      images: [
        { url: '/media/home-gallery-1.jpg', alt: '' },
        { url: '/media/home-gallery-2.jpg', alt: '' },
        { url: '/media/home-gallery-3.jpg', alt: '' },
        { url: '/media/about-deepti.jpg', alt: 'Deepti, founder of NaturallyU' },
        { url: '/media/about-deepti-yoga.jpg', alt: 'Deepti practising yoga' },
        { url: '/media/about-workshop.jpg', alt: 'A NaturallyU soap-making workshop' },
      ],
    },
  },
  {
    blockType: 'richText',
    props: { _migrationId: 'home-yes-nos-heading', variant: 'section-title', heading: 'OUR YES’s & NO’s' },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'home-no-mass-production',
      variant: 'pledge',
      heading: 'We say NO to MASS PRODUCTION!',
      body:
        'In line with our sustainability goal, we create only when there is a demand. Mass production involves the bulk purchase of raw materials, the use of chemicals, and huge storage spaces. Since we create ONLY when there is a direct demand from YOU, our customer, there is no question of storing products for months before they reach you. All our products are freshly hand-crafted specially for you.',
    },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'home-yes-self-love',
      variant: 'pledge',
      heading: 'We say YES to SELF-LOVE!',
      body:
        'With the advent of cold, winter months, your skin longs for some extra Tender. Loving. Care. If you have always wondered about ancient Indian wisdom and beauty practices but did not know how to adopt them, YOU are in luck! Deepti, NaturallyU’s founder and creator of these products is a trained Ayurveda practitioner and combines her training with her extensive knowledge of herbs and oils. Bring a little tradition into your homes and make bath time an absolute bliss…',
    },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'home-no-animal-testing',
      variant: 'pledge',
      heading: 'We say NO to ANIMAL TESTING!',
      body:
        'We believe in cruelty-free trade. Our products are made from all-natural ingredients, and we do recommend a patch-test. We DO NOT test our products on animals.',
    },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'home-yes-sustainable-gifting',
      variant: 'pledge',
      heading: 'We say YES TO SUSTAINABLE GIFTING!',
      body:
        'With the holiday season around the corner, try showing your favourite people that you truly care! They can be your friends, family, your partners, or even your task force at work who help you run the business as usual throughout the year… Our SUPER-LUXURIOUS pre-curated beauty boxes reach your loved ones wrapped in eco-friendly packaging and make them feel special and valued each time they use it. That’s a WIN for you too!',
    },
  },
];

const homeDisclaimerBlock = {
  blockType: 'richText',
  props: { _migrationId: 'home-disclaimer', variant: 'disclaimer', body: DISCLAIMER },
};

const HOME_META_DESCRIPTION =
  'NaturallyU handmade soap and cosmetics are carefully prepared using only natural ingredients,and essential oils like coca butter, coconut oil and Shea butter.We make vegan soap as well and we do not use palm oil.';

// ---------------------------------------------------------------------------
// Old testimonials page (https://www.naturallyu.nl/blog, nav label
// "Testimonials") -> the home page's existing testimonial block.
// Quotes and author names are verbatim. Each review carries one of the old
// testimonials page's photos as its card image (consistent sizing in the
// TestimonialBlock carousel — see MIGRATION_REPORT.md).
// ---------------------------------------------------------------------------
const migratedTestimonials = [
  {
    quote:
      'When I came in the NL , I was searching for good hair oil. Due to the change in water, my hair was thinning. Then I came across *NaturallyU* hair oil and my life changed as well my hair!!\n\nSince then I am using only this hair oil, my hair got healthier and the growth also increased!! Truly happy with it... I would definitely recommend it to everyone. Being outside of India and still getting such amazing herbal hair oil is a blessing! Thanks NaturallyU!!',
    author: 'Rucha Naik Joshi',
    image: '/media/testimonials-photo.jpg',
  },
  {
    quote: 'Ik ben super tevreden over de producten en de service. Bedankt!',
    author: 'X MJ',
    image: '/media/testimonials-branch.png',
  },
  {
    quote: 'Produits artisanaux d excellente qualite. Tres contente des produits recus.',
    author: 'Isabelle - Pays Bas',
    image: '/media/testimonials-orange-flower.jpg',
  },
  {
    quote:
      "NaturallyU's Castille body bath really works for me. After pregnancy my skin has become too sensitive. So I am very scared to try any products with fragrance or chemicals. This one is fragrance free and is gentle on my face. My skin feels good and smooth. It cleanses my face without drying out. This has also helped to calm down my rosacea.I use this for my son as well. Very glad I came across this product and is my favorite now.",
    author: 'Samruddhi Kadam Sharma',
    image: '/media/testimonials-herb-infused-oils.jpg',
  },
  {
    quote:
      'I tried the Neem soap for a start and loved it. Since then I have tried different varieties of NaturallyU soaps. The remarkable thing about these soaps is that they are gentle and smooth on your skin and yet give a very good cleaning effect - leaving your skin clean but yet very soft to touch. The lather is rich and balanced and the aroma reflects the purity of ingredients, unlike the artificially fragranced soaps. I am impressed by the quality, have continued using it now for more than a year, and still love it.',
    author: 'Zia Rizvi',
    image: '/media/testimonials-homemade-skin-care.jpg',
  },
  {
    quote:
      'The hair oil by Naturally U has been a saviour for me for the past few years.. i have been constantly battling with severe hair loss which was also leading to mild balding along with my hair texture getting worse day by day. As recommended to me by one of my acquaintances, when i tried this oil it was no less than a miracle oil. Not only was my hair fall problem addressed but it helped in hair growth and revitalized the hair texture too. I definitely recommend this product as it has good a mixture of all the essentials required for good hair.',
    author: 'Sreedevi Mahadevan',
    image: '/media/testimonials-natural-herbs.jpg',
  },
];

// ---------------------------------------------------------------------------
// Old about page (https://www.naturallyu.nl/about-2) -> 'about-2' Page.
// Reachable publicly at /about-2 via the generic CMS page route
// (client CmsPage.jsx). These use the default richText variant (plain
// prose); only the home page's migrated sections use styled variants.
// The structural /about-the-maker page carries the designed retelling.
// ---------------------------------------------------------------------------
const aboutBlocks = [
  {
    blockType: 'richText',
    props: {
      _migrationId: 'about-intro',
      heading: 'With NaturallyU, explore Mother Earth’s precious gifts of beauty!',
      body:
        'Hello! I am Deepti, a trained Ayurveda practitioner for skin, hair, and body care and well-being. Ayurveda is a remedial science from ancient India which explores the therapeutic and medicinal properties of the local fauna and flora. For centuries, before the arrival of modern western medicine in India, people trusted Ayurveda as their only source of treatment.\n\n' +
        "My grandfather was an Ayurvedic healer who lived in Ujjain, a pilgrim city situated in Madhya Pradesh, Central India. He would cure people with nothing but his extensive knowledge of Ayurveda and medicinal herbs. My grandmother would make all the medicines in her own kitchen. As a child, I spent a lot of time at my grandparents' home. Hence, most of my childhood memories are with them…my love for natural herbs comes from those evening memories when I spent hours observing my grandparents serving long queues of sick people free of charge, concocting magic potions in their laboratory, their home kitchen! I was drawn unknowingly into the process and that fascination stayed with me…",
      image: '/media/about-deepti.jpg',
      imageAlt: 'IMG_4204.jpg',
    },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'about-yoga',
      body:
        'I am also a trained yoga practitioner, and inner well-being is an essential part of my life. Yoga connects me to the universe in a way that I feel one with the existence. I try to bring out the same element of purity and bliss in my products so that they connect the users to the existence around them!',
      image: '/media/about-deepti-yoga.jpg',
      imageAlt: '20200614_205526_edited_edited_edited.jpg',
    },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'about-born',
      heading: 'How was NaturallyU born?',
      body:
        'In the winter of 2017, a fun soap-making activity with a friend led me to accidentally create a soap that turned out to be way beyond my expectations and was a super hit! Flashbacks and memories from my childhood soon took over and drove me to explore starting a venture to make beautiful soaps and cosmetics products using natural herbs. In 2018, a dear friend and I officially started NaturallyU, turning soap recipes into all-natural, chemical-free, hand-crafted products. She chose her own path eventually and I am now the sole owner and creator at NaturallyU!',
    },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'about-how-products-made',
      heading: 'How do I make my products?',
      body:
        'I draw my inspiration from my childhood memories, and I make magical concoctions in my own kitchen. Albeit, maintaining all the hygiene standards, using separate containers and jars for this purpose. I work with vegetable oils, clay, herb-infused oils, essential oils, and natural herbs from all over the world to create all my products. You can rest assured that your product has not been sitting in a storage box for months before it reaches you and that it was crafted especially for you. We also accommodate individual preferences of ingredients based on specific skin requirements wherever possible!',
    },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'about-vision',
      heading: 'NaturallyU’s vision',
      body:
        'Everybody desires healthy and glowing skin and luscious, beautiful hair… no matter where you come from, no matter what your background. At NaturallyU, I graciously receive the blessings of Mother Earth and bring to you ancient Indian remedies in the form of soaps, creams, hair oils and more. And while sharing the Indian tradition I also make use of European traditions and culture in my products. I am a firm believer in the Indian idea of Vasudhaiva kutumbakam (the whole world is our family), therefore Inclusion is of massive value to me, and I would like to reach out to everybody who wants to make use of these ancient and timeless beauty secrets.\n\n' +
        'My purpose is to bring the Indian traditional wisdom of Ayurveda to Holland while keeping in mind the sensibilities of the European clientele. The products are freshly made to order so that they maintain their quality, texture, and delicate fragrance. Unlike store bought soaps, these boutique hand crafted soaps are made with ZERO chemicals to ensure that the nature’s goodness reaches our clients in the purest possible form. We walk together towards creating a more sustainable planet and ensure this not just by our eco-friendly products but also with our eco-friendly/ recyclable packaging.',
    },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'about-whats-next',
      heading: 'What’s Next???',
      body:
        'Wait no more! Explore our stunning line of products and make them yours today OR gift them to your loved ones and show them how much you care. Happy Holidays!',
    },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'about-workshops',
      heading: 'Soap-Making Workshops',
      body:
        "Looking for a fun way to spend time with your girlfriends? Or searching for fun recreational activities for your children's next birthday party? Try our signature soap-making workshops! Immerse yourself in the fine aroma of essential oils and have to yourselves a few zen hours. As a bonus, you get to create something special. Call Today for bookings!",
      image: '/media/about-workshop.jpg',
      imageAlt: 'Workshop_edited.jpg',
    },
  },
  {
    blockType: 'richText',
    props: {
      _migrationId: 'about-contact',
      heading: 'Want to know more? Write to us!',
      body: 'NaturallyU, Denhaag,\nNetherlands\n\nE-Mail: naturallyu@gmail.com\nTel: 31-613492300',
    },
  },
  {
    blockType: 'richText',
    props: { _migrationId: 'about-disclaimer', body: DISCLAIMER },
  },
];

const ABOUT_META_DESCRIPTION =
  'Our handmade soap and cosmetics are carefully prepared using only natural ingredients,and essential oils like coca butter, coconut oil and Shea butter.We make vegan soap as well and we do not use palm oil.';

// ---------------------------------------------------------------------------

const validateBlocks = (blocks, pageName) => {
  for (const block of blocks) {
    const validator = blockValidators[block.blockType];
    if (!validator) throw new Error(`${pageName}: no validator for blockType "${block.blockType}"`);
    const { error } = validator(block.props);
    if (error) throw new Error(`${pageName} / ${block.blockType}: ${error}`);
  }
};

const migrationId = (block) => block.props && block.props._migrationId;

// Upsert migration-owned blocks into a page without touching the relative
// order of blocks it does not own. `insertAfterTypes` picks the anchor the
// main group is placed after (first type in the list that exists wins).
const upsertHomeBlocks = (page) => {
  // Update owned blocks in place (keeps _id), collect the new ones
  const byMigrationId = new Map();
  for (const block of page.blocks) {
    if (migrationId(block)) byMigrationId.set(migrationId(block), block);
  }
  const applyManifest = (manifestBlock) => {
    const existing = byMigrationId.get(manifestBlock.props._migrationId);
    if (existing) {
      existing.blockType = manifestBlock.blockType;
      existing.props = manifestBlock.props;
      existing.visible = existing.visible !== false;
      return existing;
    }
    return manifestBlock; // plain object; Mongoose casts on assignment
  };

  const mainGroup = homeMigratedBlocks.map(applyManifest);
  // Disclaimer sits at the very end of the page, after the designed sections.
  const tailGroup = [homeDisclaimerBlock].map(applyManifest);

  // Everything this migration does not own, in current order
  const foreign = [...page.blocks]
    .sort((a, b) => a.order - b.order)
    .filter((b) => !migrationId(b));

  // Anchor: after the bestsellers productGrid (falls back to featureStrip,
  // then hero, then the start of the page)
  let anchorIdx = -1;
  for (const type of ['productGrid', 'featureStrip', 'hero']) {
    anchorIdx = foreign.findLastIndex((b) => b.blockType === type);
    if (anchorIdx !== -1) break;
  }

  const finalSequence = [
    ...foreign.slice(0, anchorIdx + 1),
    ...mainGroup,
    ...foreign.slice(anchorIdx + 1),
    ...tailGroup,
  ];
  finalSequence.forEach((block, i) => {
    block.order = i + 1;
  });
  page.blocks = finalSequence;
};

const run = async () => {
  await connectDB();

  // --- 1. Settings: site-wide contact, social links, logo -----------------
  const settings = await Settings.findOne();
  if (!settings) {
    logger.error('No Settings document found — run `npm run seed` first.');
    process.exit(1);
  }
  settings.logoUrl = '/media/logo.jpg';
  settings.footer.connect.email = 'NaturallyUIndia@gmail.com';
  settings.footer.connect.phone = '31-613492300';
  settings.footer.connect.social = [
    { platform: 'facebook', url: 'https://www.facebook.com/naturallyu.nl' },
    { platform: 'instagram', url: 'https://www.instagram.com/naturallyu2018' },
  ];
  await settings.save();
  logger.info('Settings updated: logo, contact email/phone, social links.');

  // --- 2. Products: verbatim old-site names + descriptions ----------------
  for (const old of oldProducts) {
    const update = { name: old.name };
    if (old.description) update.description = old.description;
    const res = await Product.updateOne({ slug: old.slug }, { $set: update });
    if (res.matchedCount === 0) {
      logger.warn(`Product not found for slug "${old.slug}" — skipped (no document created).`);
    }
  }
  logger.info(`Products updated with verbatim old-site text (${oldProducts.length} slugs processed).`);

  // --- 3. Home page: old home sections + testimonials ---------------------
  validateBlocks([...homeMigratedBlocks, homeDisclaimerBlock], 'home');
  const home = await Page.findOne({ slug: 'home' });
  if (!home) {
    logger.error("No 'home' page found — run `npm run seed` first.");
    process.exit(1);
  }
  upsertHomeBlocks(home);

  const testimonialBlock = home.blocks.find(
    (b) => b.blockType === 'testimonial' && !migrationId(b)
  );
  if (testimonialBlock) {
    testimonialBlock.props = { ...testimonialBlock.props, testimonials: migratedTestimonials };
    home.markModified('blocks');
  } else {
    logger.warn('No testimonial block on home page — old testimonials not placed.');
  }

  home.metaDescription = HOME_META_DESCRIPTION;
  home.markModified('blocks');
  await home.save();
  logger.info(`Home page updated: ${homeMigratedBlocks.length + 1} migrated blocks + ${migratedTestimonials.length} testimonials.`);

  // --- 4. About page: full old about-2 content -----------------------------
  validateBlocks(aboutBlocks, 'about-2');
  let about = await Page.findOne({ slug: 'about-2' });
  if (!about) {
    about = new Page({ slug: 'about-2', title: 'About', status: 'published', publishedAt: new Date() });
  }
  about.title = 'About';
  about.metaDescription = ABOUT_META_DESCRIPTION;
  about.blocks = aboutBlocks.map((b, i) => ({ ...b, order: i + 1, visible: true }));
  if (about.status !== 'published') {
    about.status = 'published';
    about.publishedAt = new Date();
  }
  await about.save();
  logger.info(`About page (about-2) upserted with ${aboutBlocks.length} blocks.`);

  await mongoose.connection.close();
  logger.info('Old-site content migration complete.');
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Migration failed: ${err.message}`);
  process.exit(1);
});

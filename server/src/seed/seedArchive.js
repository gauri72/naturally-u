/**
 * Seeds the Media Gallery > Archive with the COMPLETE, VERBATIM content of
 * NaturallyU's old Wix site (naturallyu.nl), which has been retired. One
 * ArchivePage per legacy page - home, about (/about-2), testimonials
 * (/blog), products (grid + every product page's full description), shop,
 * and the site-wide elements (nav, logo, footer, social, disclaimer).
 *
 * Text is verbatim from the old site (same verified sources as
 * migrateOldContent.js and data/oldSiteProducts.json - see
 * MIGRATION_REPORT.md for the full inventory). Archivist annotations that
 * are NOT original site copy are written in parentheses.
 *
 * Images reference the local full-resolution copies already downloaded from
 * Wix's CDN into client/public/media/ and client/public/assets/products/,
 * so the archive displays without S3 (the voice-nl-media bucket has Block
 * Public Access enabled, so S3 URLs 403 - see MIGRATION_REPORT.md item 11).
 * Their `key` is prefixed "local:" - archive.controller.js skips the S3
 * delete for those. This supersedes the original Wix-fetch + S3-upload
 * version of this script; it is now network-free (Mongo only).
 *
 * Idempotent and safe to re-run: pages are upserted by slug and their
 * sections are rebuilt wholesale from this manifest.
 *
 * Run with: npm run seed:archive
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const ArchivePage = require('../models/ArchivePage.model');
const logger = require('../utils/logger');
const oldProducts = require('./data/oldSiteProducts.json');

const localImage = (path, caption) => ({ url: path, key: `local:${path}`, caption });

const DISCLAIMER =
  'Disclaimer: These are not prescription products with 100% medical results. Rather, they are timeless beauty secrets extracted from nature’s best resources which are known to work for most people with varied skin types. NaturallyU makes no medical claim of any skin treatment. While we guarantee ZERO use of chemicals and artificial colour or fragrance, a patch-test is recommended for every product.';

// ---------------------------------------------------------------------------
// Old product catalog: price/stock as shown on the old grid, description
// verbatim from each /product-page/<slug> (oldSiteProducts.json), photos from
// the already-archived local copies. Order matches the old /products grid.
// ---------------------------------------------------------------------------
const productCatalog = [
  { slug: 'almond-sensational-face-scrub-and-mask', price: '€20.00', inStock: true, photos: ['almond-sensational-face-scrub-and-mask-1.jpg'] },
  { slug: 'himalayan-foot-soak', price: '€13.50', inStock: true, photos: ['himalayan-foot-soak-1.jpg', 'himalayan-foot-soak-2.jpg', 'himalayan-foot-soak-3.jpg'] },
  { slug: 'ayurveda-in-a-pot-face-cream', price: '€15.00', inStock: true, photos: ['ayurveda-in-a-pot-face-cream-1.jpg', 'ayurveda-in-a-pot-face-cream-2.jpg', 'ayurveda-in-a-pot-face-cream-3.jpg'] },
  { slug: 'goat-milk-rose-soap', price: '€7.75', inStock: true, photos: ['goat-milk-rose-soap-1.jpg', 'goat-milk-rose-soap-2.jpg'] },
  { slug: 'towel', price: '€7.50', inStock: true, photos: ['towel-1.jpg', 'towel-2.jpg', 'towel-3.jpg'] },
  { slug: 'soap-keeping-box', price: '€5.00', inStock: true, photos: ['soap-keeping-box-1.jpeg', 'soap-keeping-box-2.jpg'] },
  { slug: 'strawberry-lip-balm', price: '€5.00', inStock: false, photos: ['strawberry-lip-balm-1.jpeg'] },
  { slug: 'loofah', price: '€5.00', inStock: true, photos: ['loofah-1.jpeg'] },
  { slug: 'minty-lip-balm', price: '€5.00', inStock: false, photos: ['minty-lip-balm-1.jpeg'] },
  { slug: 'hair-oil', price: '€17.50', inStock: true, photos: ['hair-oil-1.jpg', 'hair-oil-2.jpg', 'hair-oil-3.jpg'] },
  { slug: 'uptan', price: '€7.75', inStock: false, photos: ['uptan-1.jpg', 'uptan-2.jpg'] },
  { slug: 'lotion-bar', price: '€15.00', inStock: true, photos: ['lotion-bar-1.jpeg', 'lotion-bar-2.jpg'] },
  { slug: 'tulsi-soap', price: '€7.75', inStock: true, photos: ['tulsi-soap-1.jpeg', 'tulsi-soap-2.jpg', 'tulsi-soap-3.jpg'] },
];

const HAIR_OIL_VIDEO_NOTE =
  '(Archivist note: the old product page also carried a 720×1280 video — Wix media 17944492874041207.mp4, poster frame id 720cf4_60907efd012249fc8562440a548094faf002 — which was not preserved; see MIGRATION_REPORT.md item 7.)';

const productSections = productCatalog.map((p) => {
  const old = oldProducts.find((o) => o.slug === p.slug);
  let content = old?.description || '(The old site listed no description for this product.)';
  if (p.slug === 'hair-oil') content += `\n\n${HAIR_OIL_VIDEO_NOTE}`;
  return {
    name: old?.name || p.slug,
    content,
    meta: { price: p.price, inStock: p.inStock, sourceUrl: `https://www.naturallyu.nl/product-page/${p.slug}` },
    images: p.photos.map((file, i) => localImage(`/assets/products/${file}`, `Product photo ${i + 1}`)),
  };
});

// ---------------------------------------------------------------------------

const manifest = [
  {
    slug: 'home',
    title: 'Home',
    sourceUrl: 'https://www.naturallyu.nl',
    sections: [
      {
        name: 'Hero',
        content:
          'Nature’s Superfoods for your precious Skin & Hair!\n\n' +
          'NaturallyU is a handmade soaps and cosmetics business with a mind-blowing collection of skin and hair care products made from all-natural ingredients and ZERO chemicals or artificial flavours (No Paraben or SLS). We can also make our products custom-made according to your preferences, fresh and local!\n\n' +
          'CTA button: "EXPLORE OUR STUNNING LINE OF PRODUCTS!" → /products',
        meta: { ctaLabel: 'EXPLORE OUR STUNNING LINE OF PRODUCTS!', ctaLink: '/products' },
        images: [localImage('/media/home-hero-soaps.jpg', 'Hero banner (soap1.jpg)')],
      },
      {
        name: 'Our Story',
        content:
          'We started in 2018 with the purpose of bringing timeless Indian beauty secrets and techniques to European homes in a hassle-free format. With time, NaturallyU has expanded its line of products to include ancient beauty secrets from Europe so that we can offer the BEST of nature’s precious gifts to our customers.',
        images: [],
      },
      {
        name: 'Photo Gallery',
        content: '(Three-photo strip displayed alongside the Our Story section.)',
        images: [
          localImage('/media/home-gallery-1.jpg', 'Gallery photo 1'),
          localImage('/media/home-gallery-2.jpg', 'Gallery photo 2'),
          localImage('/media/home-gallery-3.jpg', 'Gallery photo 3'),
        ],
      },
      {
        name: 'OUR YES’s & NO’s',
        content: '(Heading displayed above the four YES & NO pledges below.)',
        images: [],
      },
      {
        name: 'We say NO to MASS PRODUCTION!',
        content:
          'In line with our sustainability goal, we create only when there is a demand. Mass production involves the bulk purchase of raw materials, the use of chemicals, and huge storage spaces. Since we create ONLY when there is a direct demand from YOU, our customer, there is no question of storing products for months before they reach you. All our products are freshly hand-crafted specially for you.',
        images: [],
      },
      {
        name: 'We say YES to SELF-LOVE!',
        content:
          'With the advent of cold, winter months, your skin longs for some extra Tender. Loving. Care. If you have always wondered about ancient Indian wisdom and beauty practices but did not know how to adopt them, YOU are in luck! Deepti, NaturallyU’s founder and creator of these products is a trained Ayurveda practitioner and combines her training with her extensive knowledge of herbs and oils. Bring a little tradition into your homes and make bath time an absolute bliss…',
        images: [],
      },
      {
        name: 'We say NO to ANIMAL TESTING!',
        content:
          'We believe in cruelty-free trade. Our products are made from all-natural ingredients, and we do recommend a patch-test. We DO NOT test our products on animals.',
        images: [],
      },
      {
        name: 'We say YES TO SUSTAINABLE GIFTING!',
        content:
          'With the holiday season around the corner, try showing your favourite people that you truly care! They can be your friends, family, your partners, or even your task force at work who help you run the business as usual throughout the year… Our SUPER-LUXURIOUS pre-curated beauty boxes reach your loved ones wrapped in eco-friendly packaging and make them feel special and valued each time they use it. That’s a WIN for you too!',
        images: [],
      },
      { name: 'Disclaimer', content: DISCLAIMER, images: [] },
      {
        name: 'Meta Description',
        content:
          'NaturallyU handmade soap and cosmetics are carefully prepared using only natural ingredients,and essential oils like coca butter, coconut oil and Shea butter.We make vegan soap as well and we do not use palm oil.',
        meta: { htmlMeta: true },
        images: [],
      },
    ],
  },

  {
    slug: 'about',
    title: 'About',
    sourceUrl: 'https://www.naturallyu.nl/about-2',
    sections: [
      {
        name: 'Introduction & Founder’s Story',
        content:
          'With NaturallyU, explore Mother Earth’s precious gifts of beauty!\n\n' +
          'Hello! I am Deepti, a trained Ayurveda practitioner for skin, hair, and body care and well-being. Ayurveda is a remedial science from ancient India which explores the therapeutic and medicinal properties of the local fauna and flora. For centuries, before the arrival of modern western medicine in India, people trusted Ayurveda as their only source of treatment.\n\n' +
          "My grandfather was an Ayurvedic healer who lived in Ujjain, a pilgrim city situated in Madhya Pradesh, Central India. He would cure people with nothing but his extensive knowledge of Ayurveda and medicinal herbs. My grandmother would make all the medicines in her own kitchen. As a child, I spent a lot of time at my grandparents' home. Hence, most of my childhood memories are with them…my love for natural herbs comes from those evening memories when I spent hours observing my grandparents serving long queues of sick people free of charge, concocting magic potions in their laboratory, their home kitchen! I was drawn unknowingly into the process and that fascination stayed with me…",
        images: [localImage('/media/about-deepti.jpg', 'Founder photo (IMG_4204.jpg)')],
      },
      {
        name: 'Rooted in Yoga',
        content:
          'I am also a trained yoga practitioner, and inner well-being is an essential part of my life. Yoga connects me to the universe in a way that I feel one with the existence. I try to bring out the same element of purity and bliss in my products so that they connect the users to the existence around them!',
        images: [localImage('/media/about-deepti-yoga.jpg', 'Second founder photo (20200614_205526_edited_edited_edited.jpg)')],
      },
      {
        name: 'How was NaturallyU born?',
        content:
          'In the winter of 2017, a fun soap-making activity with a friend led me to accidentally create a soap that turned out to be way beyond my expectations and was a super hit! Flashbacks and memories from my childhood soon took over and drove me to explore starting a venture to make beautiful soaps and cosmetics products using natural herbs. In 2018, a dear friend and I officially started NaturallyU, turning soap recipes into all-natural, chemical-free, hand-crafted products. She chose her own path eventually and I am now the sole owner and creator at NaturallyU!',
        images: [],
      },
      {
        name: 'How do I make my products?',
        content:
          'I draw my inspiration from my childhood memories, and I make magical concoctions in my own kitchen. Albeit, maintaining all the hygiene standards, using separate containers and jars for this purpose. I work with vegetable oils, clay, herb-infused oils, essential oils, and natural herbs from all over the world to create all my products. You can rest assured that your product has not been sitting in a storage box for months before it reaches you and that it was crafted especially for you. We also accommodate individual preferences of ingredients based on specific skin requirements wherever possible!',
        images: [],
      },
      {
        name: 'NaturallyU’s vision',
        content:
          'Everybody desires healthy and glowing skin and luscious, beautiful hair… no matter where you come from, no matter what your background. At NaturallyU, I graciously receive the blessings of Mother Earth and bring to you ancient Indian remedies in the form of soaps, creams, hair oils and more. And while sharing the Indian tradition I also make use of European traditions and culture in my products. I am a firm believer in the Indian idea of Vasudhaiva kutumbakam (the whole world is our family), therefore Inclusion is of massive value to me, and I would like to reach out to everybody who wants to make use of these ancient and timeless beauty secrets.\n\n' +
          'My purpose is to bring the Indian traditional wisdom of Ayurveda to Holland while keeping in mind the sensibilities of the European clientele. The products are freshly made to order so that they maintain their quality, texture, and delicate fragrance. Unlike store bought soaps, these boutique hand crafted soaps are made with ZERO chemicals to ensure that the nature’s goodness reaches our clients in the purest possible form. We walk together towards creating a more sustainable planet and ensure this not just by our eco-friendly products but also with our eco-friendly/ recyclable packaging.',
        images: [],
      },
      {
        name: 'What’s Next???',
        content:
          'Wait no more! Explore our stunning line of products and make them yours today OR gift them to your loved ones and show them how much you care. Happy Holidays!',
        images: [],
      },
      {
        name: 'Soap-Making Workshops',
        content:
          "Looking for a fun way to spend time with your girlfriends? Or searching for fun recreational activities for your children's next birthday party? Try our signature soap-making workshops! Immerse yourself in the fine aroma of essential oils and have to yourselves a few zen hours. As a bonus, you get to create something special. Call Today for bookings!",
        images: [localImage('/media/about-workshop.jpg', 'Workshop photo (Workshop_edited.jpg)')],
      },
      {
        name: 'Want to know more? Write to us!',
        content:
          'NaturallyU, Denhaag,\nNetherlands\n\nE-Mail: naturallyu@gmail.com\nTel: 31-613492300\n\n' +
          '(A contact form on the page collected First Name, Last Name, Email, and Message.)',
        meta: { email: 'naturallyu@gmail.com', phone: '31-613492300' },
        images: [],
      },
      { name: 'Disclaimer', content: DISCLAIMER, images: [] },
      {
        name: 'Meta Description',
        content:
          'Our handmade soap and cosmetics are carefully prepared using only natural ingredients,and essential oils like coca butter, coconut oil and Shea butter.We make vegan soap as well and we do not use palm oil.',
        meta: { htmlMeta: true },
        images: [],
      },
    ],
  },

  {
    slug: 'testimonials',
    title: 'Testimonials',
    sourceUrl: 'https://www.naturallyu.nl/blog',
    sections: [
      {
        name: 'About This Page',
        content:
          '(The old site served this page at /blog, but the navigation labeled it "Testimonials". It held the six customer reviews below plus seven decorative stock photos; the blog RSS feed confirmed zero real blog posts.)',
        images: [],
      },
      {
        name: 'Rucha Naik Joshi',
        content:
          'When I came in the NL , I was searching for good hair oil. Due to the change in water, my hair was thinning. Then I came across *NaturallyU* hair oil and my life changed as well my hair!!\n\nSince then I am using only this hair oil, my hair got healthier and the growth also increased!! Truly happy with it... I would definitely recommend it to everyone. Being outside of India and still getting such amazing herbal hair oil is a blessing! Thanks NaturallyU!!',
        meta: { author: 'Rucha Naik Joshi' },
        images: [localImage('/media/testimonials-photo.jpg', 'Testimonials page photo')],
      },
      {
        name: 'X MJ',
        content: 'Ik ben super tevreden over de producten en de service. Bedankt!',
        meta: { author: 'X MJ', language: 'Dutch' },
        images: [localImage('/media/testimonials-branch.png', 'Branch (stock photo)')],
      },
      {
        name: 'Isabelle - Pays Bas',
        content: 'Produits artisanaux d excellente qualite. Tres contente des produits recus.',
        meta: { author: 'Isabelle - Pays Bas', language: 'French' },
        images: [localImage('/media/testimonials-orange-flower.jpg', 'Orange Flower (stock photo)')],
      },
      {
        name: 'Samruddhi Kadam Sharma',
        content:
          "NaturallyU's Castille body bath really works for me. After pregnancy my skin has become too sensitive. So I am very scared to try any products with fragrance or chemicals. This one is fragrance free and is gentle on my face. My skin feels good and smooth. It cleanses my face without drying out. This has also helped to calm down my rosacea.I use this for my son as well. Very glad I came across this product and is my favorite now.",
        meta: { author: 'Samruddhi Kadam Sharma' },
        images: [localImage('/media/testimonials-herb-infused-oils.jpg', 'Herb Infused Oils (stock photo)')],
      },
      {
        name: 'Zia Rizvi',
        content:
          'I tried the Neem soap for a start and loved it. Since then I have tried different varieties of NaturallyU soaps. The remarkable thing about these soaps is that they are gentle and smooth on your skin and yet give a very good cleaning effect - leaving your skin clean but yet very soft to touch. The lather is rich and balanced and the aroma reflects the purity of ingredients, unlike the artificially fragranced soaps. I am impressed by the quality, have continued using it now for more than a year, and still love it.',
        meta: { author: 'Zia Rizvi' },
        images: [localImage('/media/testimonials-homemade-skin-care.jpg', 'Homemade Skin Care (stock photo)')],
      },
      {
        name: 'Sreedevi Mahadevan',
        content:
          'The hair oil by Naturally U has been a saviour for me for the past few years.. i have been constantly battling with severe hair loss which was also leading to mild balding along with my hair texture getting worse day by day. As recommended to me by one of my acquaintances, when i tried this oil it was no less than a miracle oil. Not only was my hair fall problem addressed but it helped in hair growth and revitalized the hair texture too. I definitely recommend this product as it has good a mixture of all the essentials required for good hair.',
        meta: { author: 'Sreedevi Mahadevan' },
        images: [localImage('/media/testimonials-natural-herbs.jpg', 'Natural Herbs (stock photo)')],
      },
      {
        name: 'Decorative Photos',
        content: '(The seventh decorative stock photo from the page; the other six are attached to the reviews above, one each.)',
        images: [localImage('/media/testimonials-decor-1.jpg', 'Untitled stock photo')],
      },
    ],
  },

  {
    slug: 'products',
    title: 'Products',
    sourceUrl: 'https://www.naturallyu.nl/products',
    sections: productSections,
  },

  {
    slug: 'shop',
    title: 'Shop',
    sourceUrl: 'https://www.naturallyu.nl/shop',
    sections: [
      {
        name: 'Product Grid',
        content:
          '(A paginated grid of the same 13 products as the /products page, with no unique copy of its own. Reached from the old navigation under More → Shop.)',
        images: [],
      },
      {
        name: 'Cart',
        content:
          '(The old site also had a functional Wix store cart page — cart-page — with no content of its own to preserve.)',
        images: [],
      },
    ],
  },

  {
    slug: 'site',
    title: 'Site-Wide Elements',
    sourceUrl: 'https://www.naturallyu.nl',
    sections: [
      {
        name: 'Navigation',
        content:
          'Home → /\nAbout → /about-2\nProducts → /products\nTestimonials → /blog\nMore → Shop (/shop)',
        images: [],
      },
      {
        name: 'Logo',
        content: '(Site logo displayed in the old header; original Wix filename "logo_jpg (1)_edited.jpg".)',
        images: [localImage('/media/logo.jpg', 'Site logo (logo_jpg (1)_edited.jpg)')],
      },
      {
        name: 'Footer',
        content:
          'Contact email: NaturallyUIndia@gmail.com\n\n©2021 by NaturallyU. Proudly created with Wix.com',
        meta: { email: 'NaturallyUIndia@gmail.com' },
        images: [],
      },
      {
        name: 'Social Links',
        content:
          'Facebook: https://www.facebook.com/naturallyu.nl\nInstagram: https://www.instagram.com/naturallyu2018',
        images: [],
      },
      {
        name: 'Per-Page Disclaimer',
        content: `${DISCLAIMER}\n\n(This paragraph appeared on every page of the old site.)`,
        images: [],
      },
      {
        name: 'Languages',
        content:
          '(Dutch ?lang=nl variants existed for every page via Wix multilingual. Per the confirmed migration decision, only the English content was preserved.)',
        images: [],
      },
    ],
  },
];

const run = async () => {
  await connectDB();

  for (const pageData of manifest) {
    let page = await ArchivePage.findOne({ slug: pageData.slug });
    if (!page) {
      page = new ArchivePage({ slug: pageData.slug });
      logger.info(`Creating archive page: ${pageData.title}`);
    }
    page.title = pageData.title;
    page.sourceUrl = pageData.sourceUrl;
    page.sections = pageData.sections.map((s, i) => ({
      name: s.name,
      content: s.content || '',
      meta: s.meta || {},
      images: (s.images || []).map((img, j) => ({ ...img, order: j })),
      order: i,
    }));
    await page.save();
    const imageCount = page.sections.reduce((sum, s) => sum + s.images.length, 0);
    logger.info(`Archive page "${pageData.title}": ${page.sections.length} sections, ${imageCount} images.`);
  }

  await mongoose.connection.close();
  logger.info(`Archive seeding complete: ${manifest.length} pages.`);
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Archive seed failed: ${err.message}`);
  process.exit(1);
});

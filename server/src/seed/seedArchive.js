/**
 * Seeds the Media Gallery > Archive with the real content of NaturallyU's
 * old Wix site (naturallyu.nl), which is being retired. For each legacy
 * page (home/about/products/testimonials) this creates an ArchivePage with
 * one section per real content block, downloads that section's real photo(s)
 * from Wix's CDN, and re-uploads them into this project's own S3 bucket so
 * the archive is self-contained.
 *
 * Kept separate from the main seed.js: this script makes ~15-20 outbound
 * fetches to a third-party CDN plus that many S3 uploads, which is slow and
 * can fail on network flakiness - the default `npm run seed` must stay fast
 * and network-free (besides Mongo) for routine/CI use.
 *
 * Safe to re-run: pages are upserted by slug, sections are skipped if a
 * section with the same name already exists on that page.
 *
 * Run with: npm run seed:archive
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const ArchivePage = require('../models/ArchivePage.model');
const { uploadBuffer } = require('../utils/s3');
const logger = require('../utils/logger');

// Wix serves resized/optimized thumbnails by default
// (".../v1/fill/w_147,h_110,.../file.jpg"); truncating at "/v1/" yields the
// original full-resolution file.
const toFullResWixUrl = (url) => url.split('/v1/')[0];

const manifest = [
  {
    slug: 'home',
    title: 'Home',
    sourceUrl: 'https://www.naturallyu.nl',
    sections: [
      {
        name: 'Hero',
        content:
          "Nature's Superfoods for your precious Skin & Hair!\n\n" +
          'Handmade soaps and cosmetics made with all-natural ingredients and ZERO chemicals or artificial flavours (No Paraben or SLS). Custom options available.\n\n' +
          'CTA button: "EXPLORE OUR STUNNING LINE OF PRODUCTS!"',
        images: [{ wixUrl: 'https://static.wixstatic.com/media/a9d23c_4602c5f6a3cc48fcbc5a8fbc42fbff55~mv2.jpg', caption: 'Hero banner (soap1.jpg)' }],
      },
      {
        name: 'Our Story',
        content:
          'NaturallyU was founded in 2018 to bring Indian beauty traditions to European consumers, later expanding to include European heritage techniques as well.',
        images: [],
      },
      {
        name: "Our Yes's & No's",
        content:
          'NO to mass production - fresh, on-demand crafting rather than stockpiled inventory.\n' +
          "YES to self-love - founder Deepti's Ayurveda credentials and product philosophy.\n" +
          'NO to animal testing - a firm cruelty-free commitment.\n' +
          'YES to sustainable gifting - eco-friendly, reusable luxury gift boxes.',
        images: [],
      },
      {
        name: 'Disclaimer',
        content:
          'NaturallyU products are not prescription products. They are traditional beauty solutions, and no medical claim is made about their effects.',
        images: [],
      },
      {
        name: 'Footer',
        content: 'Contact email and copyright notice, with social links to Facebook and Instagram.',
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
        name: "Introduction & Founder's Story",
        content:
          '"With NaturallyU, explore Mother Earth\'s precious gifts of beauty!" Founder Deepti is a trained Ayurveda practitioner specializing in skincare and wellness. ' +
          'She explains Ayurveda as a remedial science from ancient India that explores the therapeutic and medicinal properties of local fauna and flora. ' +
          'She shares childhood memories of her grandfather, an Ayurvedic healer in Ujjain, and her grandmother, describing how she watched them create natural remedies and treat patients without charge.',
        images: [{ wixUrl: 'https://static.wixstatic.com/media/720cf4_16d5f93ed93e4bdc9d428dcdb368b3f2~mv2.jpg', caption: 'Founder photo (IMG_4204.jpg)' }],
      },
      {
        name: 'Professional Background',
        content: 'Deepti is also trained in yoga practice, and emphasizes that inner wellness shapes her work philosophy.',
        images: [],
      },
      {
        name: 'How was NaturallyU born?',
        content:
          'A 2017 soap-making activity sparked the idea for the business. Deepti partnered with a friend in 2018 to create hand-crafted, chemical-free products, and later became sole owner of NaturallyU.',
        images: [],
      },
      {
        name: 'How do I make my products?',
        content:
          "Products are made with vegetable oils, clays, herb-infused oils, and essential oils, prepared in Deepti's own kitchen while maintaining strict hygiene standards. Everything is made fresh, to order.",
        images: [{ wixUrl: 'https://static.wixstatic.com/media/720cf4_c1858cd68e0940c4a59e8652bf00a77d~mv2.jpg', caption: 'Production process (20200614_205526.jpg)' }],
      },
      {
        name: 'Vision',
        content:
          'The vision is to bring Ayurvedic traditions to Holland, blending Indian wisdom with European sensibilities - zero-chemical formulations, packaged in eco-friendly, recyclable materials.',
        images: [],
      },
      {
        name: 'Workshops',
        content: 'NaturallyU runs signature soap-making workshops for groups and birthday parties.',
        images: [{ wixUrl: 'https://static.wixstatic.com/media/a9d23c_ae310c264b094ba1a098e22e1590b00b~mv2.jpg', caption: 'Workshop photo' }],
      },
      {
        name: 'Contact Information',
        content:
          'Located in Den Haag, Netherlands. Contact via email and phone, plus Facebook/Instagram social links. ' +
          'A contact form on the page collects First Name, Last Name, Email, and Message.',
        images: [],
      },
      {
        name: 'Disclaimer',
        content: 'Products are not prescription products, but rather "timeless beauty secrets." Patch-testing is recommended before use.',
        images: [],
      },
    ],
  },
  {
    slug: 'products',
    title: 'Products',
    sourceUrl: 'https://www.naturallyu.nl/products',
    sections: [
      { name: 'Almond Sensational face scrub and mask', price: '€20.00', inStock: true, wixUrl: 'https://static.wixstatic.com/media/720cf4_7701d4a776254462aa8e4e5806f3bdde~mv2.jpg' },
      { name: 'Himalayan Foot Soak', price: '€13.50', inStock: true, wixUrl: 'https://static.wixstatic.com/media/a9d23c_94ba6a9757f2445cb52f541bcfc2dbee~mv2.jpg' },
      { name: 'Ayurveda in a pot face cream', price: '€15.00', inStock: true, wixUrl: 'https://static.wixstatic.com/media/720cf4_479c5d992aae43b4874378fe916984f4~mv2.jpg' },
      { name: 'Goat Milk Rose Soap', price: '€7.75', inStock: true, wixUrl: 'https://static.wixstatic.com/media/a9d23c_126b1ecb25084d7b89ea728d511ed8b8~mv2.jpg' },
      { name: 'Bamboo face towel', price: '€7.50', inStock: true, wixUrl: 'https://static.wixstatic.com/media/720cf4_06cb06a58ec24e21a7b69c595f2a3d0a~mv2.jpg' },
      { name: 'Coconut shell carved soap dish', price: '€5.00', inStock: true, wixUrl: 'https://static.wixstatic.com/media/720cf4_e1e4848acd9f4dc0915d4b2358d67317~mv2.jpeg' },
      { name: 'Strawberry Lip Balm', price: '€5.00', inStock: false, wixUrl: 'https://static.wixstatic.com/media/d4dc1f_c69d556159f1494a9aac98cd97734faa~mv2.jpeg' },
      { name: 'Loofah', price: '€5.00', inStock: true, wixUrl: 'https://static.wixstatic.com/media/d4dc1f_8d9f217ca49d4c589423010aa44a8c44~mv2.jpeg' },
      { name: 'Minty Lip balm', price: '€5.00', inStock: false, wixUrl: 'https://static.wixstatic.com/media/d4dc1f_65d42e28a19741909e1af880259c7723~mv2.jpeg' },
      { name: 'Tribal Indian Hair Oil', price: '€17.50', inStock: true, wixUrl: 'https://static.wixstatic.com/media/720cf4_c56bb26d10c34835853b609be9d16a91~mv2.jpg' },
      { name: 'Uptan Soap', price: '€7.75', inStock: false, wixUrl: 'https://static.wixstatic.com/media/a9d23c_4d3c6b73fe5c46b59cefa10a38d13871~mv2.jpg' },
      { name: 'Lotion bar', price: '€15.00', inStock: true, wixUrl: 'https://static.wixstatic.com/media/d4dc1f_777cba1dda7d424b98f02dc239b0a834~mv2.jpeg' },
      { name: 'Neem and Tulsi Soap', price: '€7.75', inStock: true, wixUrl: 'https://static.wixstatic.com/media/720cf4_f39a218b004b400c935bea675649ecba~mv2.jpeg' },
    ].map((p) => ({
      name: p.name,
      content: `Price: ${p.price}. Status: ${p.inStock ? 'In Stock' : 'Out of Stock'}.`,
      meta: { price: p.price, inStock: p.inStock },
      images: [{ wixUrl: p.wixUrl, caption: p.name }],
    })),
  },
  {
    slug: 'testimonials',
    title: 'Testimonials',
    sourceUrl: 'https://www.naturallyu.nl/blog',
    sections: [
      {
        name: 'Rucha Naik Joshi',
        content:
          'Hair oil testimonial describing how the product helped with thinning hair caused by a change in water. "My hair got healthier and the growth also increased!!" - recommends it to others.',
        images: [],
      },
      {
        name: 'X MJ',
        content: 'Ik ben super tevreden over de producten en de service. Bedankt! (Dutch: "I am super satisfied with the products and the service. Thanks!")',
        images: [],
      },
      {
        name: 'Isabelle (Pays Bas)',
        content: 'French-language review praising the artisanal quality of the products received.',
        images: [],
      },
      {
        name: 'Samruddhi Kadam Sharma',
        content:
          'Review of the Castille body bath, highlighting its fragrance-free formula that helped with post-pregnancy sensitive skin and rosacea symptoms.',
        images: [],
      },
      {
        name: 'Zia Rizvi',
        content: 'Review of the neem soap, noting it provides "gentle and smooth" cleansing with a "rich and balanced" lather while keeping skin soft.',
        images: [],
      },
      {
        name: 'Sreedevi Mahadevan',
        content:
          'Describes the hair oil as transformative for severe hair loss and balding, crediting it with addressing her "hair fall problem" and improving hair texture.',
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
      page = await ArchivePage.create({
        slug: pageData.slug,
        title: pageData.title,
        sourceUrl: pageData.sourceUrl,
        sections: [],
      });
      logger.info(`Created archive page: ${pageData.title}`);
    }

    let order = page.sections.length ? Math.max(...page.sections.map((s) => s.order)) + 1 : 0;

    for (const sectionData of pageData.sections) {
      if (page.sections.some((s) => s.name === sectionData.name)) {
        logger.info(`  Section "${sectionData.name}" already exists, skipping.`);
        continue;
      }

      const images = [];
      for (const imgData of sectionData.images || []) {
        try {
          const fullResUrl = toFullResWixUrl(imgData.wixUrl);
          const response = await fetch(fullResUrl);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const buffer = Buffer.from(await response.arrayBuffer());
          const originalname = fullResUrl.split('/').pop();
          const mimetype = response.headers.get('content-type') || 'image/jpeg';

          const { url, key } = await uploadBuffer(buffer, { originalname, mimetype, prefix: 'archive' });
          images.push({ url, key, caption: imgData.caption || '', order: images.length });
          logger.info(`  Uploaded image for "${sectionData.name}"`);
        } catch (err) {
          logger.error(`  Failed to import image for "${sectionData.name}": ${err.message}`);
        }
      }

      page.sections.push({
        name: sectionData.name,
        content: sectionData.content,
        meta: sectionData.meta || {},
        images,
        order: order++,
      });
      logger.info(`  Added section: ${sectionData.name}`);
    }

    await page.save();
  }

  await mongoose.connection.close();
  logger.info('Archive seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Archive seed failed: ${err.message}`);
  process.exit(1);
});

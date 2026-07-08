/**
 * Seeds:
 *  - one Admin user (from env, so credentials aren't hardcoded in git)
 *  - the 'home' Page with blocks matching the reference design
 *    (announcement bar, hero, feature strip, bestsellers grid,
 *    gift banner, value props, testimonial, newsletter)
 *  - a default Settings document
 *
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Admin = require('../models/Admin.model');
const Page = require('../models/Page.model');
const Product = require('../models/Product.model');
const Settings = require('../models/Settings.model');
const logger = require('../utils/logger');

const bestsellerProducts = [
  {
    name: 'Turmeric Glow Soap',
    slug: 'turmeric-glow-soap',
    description: 'A brightening handmade soap infused with turmeric to gently exfoliate and even skin tone.',
    shortDescription: 'Brightening turmeric soap bar for radiant, even-toned skin.',
    price: 8.5,
    images: [{ url: '/assets/products/turmeric-glow-soap.jpg', alt: 'Turmeric Glow Soap' }],
    tags: ['bestseller', 'soap'],
    ratingAverage: 4.5,
    ratingCount: 126,
    stock: 50,
  },
  {
    name: 'Neem & Tea Tree Face Balm',
    slug: 'neem-tea-tree-face-balm',
    description: 'A soothing face balm blending neem and tea tree oil to calm blemish-prone skin.',
    shortDescription: 'Calming neem & tea tree balm for blemish-prone skin.',
    price: 16.0,
    images: [{ url: '/assets/products/neem-tea-tree-face-balm.jpg', alt: 'Neem & Tea Tree Face Balm' }],
    tags: ['bestseller', 'skincare'],
    ratingAverage: 4.9,
    ratingCount: 98,
    stock: 40,
  },
  {
    name: 'Oatmeal & Honey Soap',
    slug: 'oatmeal-honey-soap',
    description: 'A gentle, moisturizing soap bar with oatmeal and honey to soothe sensitive skin.',
    shortDescription: 'Gentle oatmeal & honey soap for sensitive skin.',
    price: 8.5,
    images: [{ url: '/assets/products/oatmeal-honey-soap.jpg', alt: 'Oatmeal & Honey Soap' }],
    tags: ['bestseller', 'soap'],
    ratingAverage: 4.6,
    ratingCount: 112,
    stock: 60,
  },
  {
    name: 'Rosehip Face Oil',
    slug: 'rosehip-face-oil',
    description: 'A nourishing, cold-pressed rosehip face oil that restores radiance and softness.',
    shortDescription: 'Nourishing cold-pressed rosehip oil for radiant skin.',
    price: 18.0,
    images: [{ url: '/assets/products/rosehip-face-oil.jpg', alt: 'Rosehip Face Oil' }],
    tags: ['bestseller', 'skincare'],
    ratingAverage: 4.9,
    ratingCount: 75,
    stock: 35,
  },
];

const homeBlocks = [
  {
    blockType: 'hero',
    order: 1,
    props: {
      heading: 'Handmade care\nfrom nature, for you.',
      subtext: 'Pure ingredients. Gentle on skin.\nMade with love. ♥',
      image: '/assets/hero-soaps.jpg',
      ctaButtons: [
        { label: 'Shop Handmade Care', link: '/shop', style: 'primary' },
        { label: 'Explore Gift Sets', link: '/gift-sets', style: 'secondary' },
      ],
    },
  },
  {
    blockType: 'featureStrip',
    order: 2,
    props: {
      items: [
        { title: 'Pure & Safe', subtitle: 'No harsh chemicals, just nature.' },
        { title: 'Made with Love', subtitle: 'Thoughtfully handcrafted in small batches.' },
        { title: 'Sustainable', subtitle: 'Eco-friendly packaging and mindful choices.' },
        { title: 'For Every Skin', subtitle: 'Gentle care for you and your loved ones.' },
      ],
    },
  },
  {
    blockType: 'productGrid',
    order: 3,
    props: { title: 'Bestsellers', source: 'tag', tag: 'bestseller', limit: 4 },
  },
  {
    blockType: 'giftBanner',
    order: 4,
    props: {
      heading: 'Thoughtful by nature.\nPerfect for every occasion.',
      subtext: 'Curated gift sets with handcrafted\ngoodness and beautiful packaging.',
      image: '/assets/gift-box.jpg',
      ctaLabel: 'Explore Gift Sets',
      ctaLink: '/gift-sets',
    },
  },
  {
    blockType: 'valueProps',
    order: 5,
    props: {
      items: [
        { title: 'Natural Ingredients', subtitle: 'Carefully sourced from nature.' },
        { title: 'Handcrafted', subtitle: 'Made in small batches with love and care.' },
        { title: 'Real Results', subtitle: 'Gentle, effective & trusted by many.' },
        { title: 'Global Love', subtitle: 'Loved by customers around the world.' },
      ],
    },
  },
  {
    blockType: 'testimonial',
    order: 6,
    props: {
      testimonials: [
        {
          quote: "The best soap I've ever used! My skin feels so soft and the ingredients are so pure.",
          author: 'Priya S., Verified Buyer',
          image: '/assets/testimonial-priya.jpg',
        },
      ],
    },
  },
  {
    blockType: 'newsletter',
    order: 7,
    props: {
      heading: 'Start Your Natural Routine',
      subtext: 'Join our community for tips, offers & natural living inspiration.',
      ctaLabel: 'Join Us',
    },
  },
];

const run = async () => {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    logger.error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env before seeding.');
    process.exit(1);
  }

  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await Admin.create({ name: 'Site Admin', email: adminEmail, password: adminPassword });
    logger.info(`Admin created: ${adminEmail}`);
  } else {
    logger.info('Admin already exists, skipping.');
  }

  const existingHome = await Page.findOne({ slug: 'home' });
  if (!existingHome) {
    await Page.create({
      slug: 'home',
      title: 'Home',
      metaDescription: 'Naturally You — handmade soaps and skin care.',
      status: 'published',
      publishedAt: new Date(),
      blocks: homeBlocks,
    });
    logger.info('Home page seeded with blocks.');
  } else {
    logger.info('Home page already exists, skipping.');
  }

  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({});
    logger.info('Default settings created.');
  } else {
    // Backfill footer/nav content on a settings doc that was created before
    // these fields had defaults (e.g. via the earlier bare `Settings.create({})`).
    let changed = false;
    if (!existingSettings.navLinks?.length) {
      existingSettings.navLinks = [
        { label: 'Shop', path: '/shop' },
        { label: 'Gift Sets', path: '/gift-sets' },
      ];
      changed = true;
    }
    if (!existingSettings.footer.shopLinks?.length) {
      existingSettings.footer.shopLinks = [
        { label: 'Shop All', path: '/shop' },
        { label: 'Best Sellers', path: '/shop?tag=bestseller' },
        { label: 'New Arrivals', path: '/shop?tag=new' },
        { label: 'Gift Sets', path: '/gift-sets' },
      ];
      changed = true;
    }
    if (!existingSettings.footer.customerCareLinks?.length) {
      existingSettings.footer.customerCareLinks = [
        { label: 'Contact Us', path: 'mailto:hello@naturallyu.com' },
        { label: 'FAQ', path: '/faq' },
        { label: 'Shipping & Returns', path: '/shipping-returns' },
        { label: 'Track Your Order', path: '/track-order' },
      ];
      changed = true;
    }
    if (!existingSettings.footer.connect?.email) {
      existingSettings.footer.connect.email = 'hello@naturallyu.com';
      changed = true;
    }
    if (!existingSettings.footer.connect?.phone) {
      existingSettings.footer.connect.phone = '+1 (555) 010-0143';
      changed = true;
    }
    if (!existingSettings.footer.connect?.social?.length) {
      existingSettings.footer.connect.social = [
        { platform: 'facebook', url: 'https://facebook.com/naturallyu' },
        { platform: 'instagram', url: 'https://instagram.com/naturallyu' },
        { platform: 'pinterest', url: 'https://pinterest.com/naturallyu' },
      ];
      changed = true;
    }
    if (changed) {
      await existingSettings.save();
      logger.info('Backfilled missing footer content on existing settings.');
    } else {
      logger.info('Settings already populated, skipping.');
    }
  }

  for (const product of bestsellerProducts) {
    await Product.updateOne({ slug: product.slug }, { $set: product }, { upsert: true });
  }
  logger.info('Bestseller products seeded.');

  await mongoose.connection.close();
  logger.info('Seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});

/**
 * Makes every remaining storefront page CMS-compatible: creates/updates a
 * `Page` document (status: published) for each route below, with blocks
 * that reproduce - verbatim - the copy that used to be hardcoded in each
 * page's JSX. See the "Make every storefront page CMS-compatible" plan for
 * the full rendering-mode design (Mode A: fully block-driven pages like
 * About the Maker/Workshops/FAQ/Shipping & Returns/Privacy/Terms; Mode B:
 * hybrid pages like Contact/Gift Sets/Shop/Product/Cart/Checkout/Track
 * Order/Search, where only the static copy moves into a block and the
 * functional code is untouched).
 *
 * Idempotent and safe to re-run: each page is upserted by slug and its
 * `blocks` array is replaced wholesale with the manifest below (no
 * incremental merge needed, since these pages did not exist before this
 * script).
 *
 * Run with: npm run seed:storefront-pages
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Page = require('../models/Page.model');
const blockValidators = require('../blocks');
const logger = require('../utils/logger');

const PRODUCT_DISCLAIMER =
  'Disclaimer: These are not prescription products with 100% medical results. Rather, they are timeless beauty secrets extracted from nature’s best resources which are known to work for most people with varied skin types. NaturallyU makes no medical claim of any skin treatment. While we guarantee ZERO use of chemicals and artificial colour or fragrance, a patch-test is recommended for every product.';

// ---------------------------------------------------------------------------
// Each entry: { slug, title, metaDescription?, blocks: [{ blockType, props }] }
// `order`/`visible` are filled in below when saving.
// ---------------------------------------------------------------------------
const pages = [
  {
    slug: 'about-the-maker',
    title: 'About the Maker',
    blocks: [
      {
        blockType: 'pageHero',
        props: {
          variant: 'about-maker',
          eyebrow: 'Meet the maker',
          heading: 'With NaturallyU, explore Mother Earth’s precious gifts of beauty!',
        },
      },
      {
        blockType: 'aboutFeature',
        props: {
          eyebrowIcon: 'sealcheck',
          eyebrowText: 'Ayurveda practitioner',
          heading: 'Meet Deepti',
          body:
            'Hello! I am Deepti, a trained Ayurveda practitioner for skin, hair, and body care and well-being. Ayurveda is a remedial science from ancient India which explores the therapeutic and medicinal properties of the local fauna and flora. For centuries, before the arrival of modern western medicine in India, people trusted Ayurveda as their only source of treatment.\n\n' +
            'My grandfather was an Ayurvedic healer who lived in Ujjain, a pilgrim city situated in Madhya Pradesh, Central India. He would cure people with nothing but his extensive knowledge of Ayurveda and medicinal herbs. My grandmother would make all the medicines in her own kitchen. As a child, I spent a lot of time at my grandparents’ home. Hence, most of my childhood memories are with them…my love for natural herbs comes from those evening memories when I spent hours observing my grandparents serving long queues of sick people free of charge, concocting magic potions in their laboratory, their home kitchen! I was drawn unknowingly into the process and that fascination stayed with me…',
          image: '/media/about-deepti.jpg',
          imageAlt: 'Deepti, founder of NaturallyU',
          reverse: false,
        },
      },
      {
        blockType: 'aboutFeature',
        props: {
          eyebrowIcon: 'handheart',
          eyebrowText: 'Rooted in yoga',
          body:
            'I am also a trained yoga practitioner, and inner well-being is an essential part of my life. Yoga connects me to the universe in a way that I feel one with the existence. I try to bring out the same element of purity and bliss in my products so that they connect the users to the existence around them!',
          image: '/media/about-deepti-yoga.jpg',
          imageAlt: 'Deepti practising yoga',
          reverse: true,
        },
      },
      {
        blockType: 'aboutStory',
        props: {
          variant: 'plain',
          heading: 'How was NaturallyU born?',
          body:
            'In the winter of 2017, a fun soap-making activity with a friend led me to accidentally create a soap that turned out to be way beyond my expectations and was a super hit! Flashbacks and memories from my childhood soon took over and drove me to explore starting a venture to make beautiful soaps and cosmetics products using natural herbs. In 2018, a dear friend and I officially started NaturallyU, turning soap recipes into all-natural, chemical-free, hand-crafted products. She chose her own path eventually and I am now the sole owner and creator at NaturallyU!',
        },
      },
      {
        blockType: 'aboutStory',
        props: {
          variant: 'plain',
          heading: 'How do I make my products?',
          body:
            'I draw my inspiration from my childhood memories, and I make magical concoctions in my own kitchen. Albeit, maintaining all the hygiene standards, using separate containers and jars for this purpose. I work with vegetable oils, clay, herb-infused oils, essential oils, and natural herbs from all over the world to create all my products. You can rest assured that your product has not been sitting in a storage box for months before it reaches you and that it was crafted especially for you. We also accommodate individual preferences of ingredients based on specific skin requirements wherever possible!',
        },
      },
      {
        blockType: 'aboutStory',
        props: {
          variant: 'vision',
          eyebrow: 'Our vision',
          heading: 'NaturallyU’s vision',
          body:
            'Everybody desires healthy and glowing skin and luscious, beautiful hair… no matter where you come from, no matter what your background. At NaturallyU, I graciously receive the blessings of Mother Earth and bring to you ancient Indian remedies in the form of soaps, creams, hair oils and more. And while sharing the Indian tradition I also make use of European traditions and culture in my products. I am a firm believer in the Indian idea of Vasudhaiva kutumbakam (the whole world is our family), therefore Inclusion is of massive value to me, and I would like to reach out to everybody who wants to make use of these ancient and timeless beauty secrets.\n\n' +
            'My purpose is to bring the Indian traditional wisdom of Ayurveda to Holland while keeping in mind the sensibilities of the European clientele. The products are freshly made to order so that they maintain their quality, texture, and delicate fragrance. Unlike store bought soaps, these boutique hand crafted soaps are made with ZERO chemicals to ensure that the nature’s goodness reaches our clients in the purest possible form. We walk together towards creating a more sustainable planet and ensure this not just by our eco-friendly products but also with our eco-friendly/recyclable packaging.',
        },
      },
      {
        blockType: 'aboutStory',
        props: {
          variant: 'whats-next',
          heading: 'What’s Next???',
          body:
            'Wait no more! Explore our stunning line of products and make them yours today OR gift them to your loved ones and show them how much you care. Happy Holidays!',
          ctaLabel: 'Explore the Products',
          ctaLink: '/shop',
        },
      },
      {
        blockType: 'aboutFeature',
        props: {
          eyebrowIcon: 'handheart',
          eyebrowText: 'Hands-on & guided',
          heading: 'Soap-Making Workshops',
          body:
            "Looking for a fun way to spend time with your girlfriends? Or searching for fun recreational activities for your children's next birthday party? Try our signature soap-making workshops! Immerse yourself in the fine aroma of essential oils and have to yourselves a few zen hours. As a bonus, you get to create something special. Call Today for bookings!",
          image: '/media/about-workshop.jpg',
          imageAlt: 'A NaturallyU soap-making workshop',
          reverse: true,
          ctaLabel: 'See Our Workshops',
          ctaLink: '/workshops',
        },
      },
      {
        blockType: 'iconCards',
        props: {
          variant: 'about-values',
          items: [
            { icon: 'handheart', title: 'Ayurveda-Rooted', text: 'Every formula draws on traditional Indian wellness practices.' },
            { icon: 'leaf', title: 'Zero Chemicals', text: 'No synthetic fragrance, no artificial additives — ever.' },
            { icon: 'sparkle', title: 'Made Fresh', text: 'Small batches, made to order, never left to sit on a shelf.' },
          ],
        },
      },
      {
        blockType: 'aboutContact',
        props: {
          heading: 'Want to know more? Write to us!',
          address: 'NaturallyU, Denhaag, Netherlands',
          email: 'naturallyu@gmail.com',
          phone: '31-613492300',
        },
      },
      {
        blockType: 'ctaRow',
        props: {
          variant: 'about-maker',
          buttons: [
            { label: 'Explore the Products', link: '/shop', style: 'primary' },
            { label: 'Get in Touch', link: '/contact', style: 'secondary' },
          ],
        },
      },
    ],
  },

  {
    slug: 'workshops',
    title: 'Workshops',
    blocks: [
      {
        blockType: 'pageHero',
        props: {
          variant: 'workshops',
          heading: 'Workshops',
          subtext: 'Signature soap-making workshops, hosted by NaturallyU — for groups and birthday parties.',
        },
      },
      {
        blockType: 'iconCards',
        props: {
          variant: 'workshops',
          items: [
            { icon: 'handheart', title: 'Hands-On & Guided', text: 'Learn the same natural, chemical-free soap-making process behind every NaturallyU bar, guided start to finish.' },
            { icon: 'usersthree', title: 'Perfect for Groups', text: 'A hands-on activity for friends, teams, or anyone curious about handmade skincare.' },
            { icon: 'cake', title: 'Birthday Parties', text: 'A memorable, take-home-something-you-made alternative to a typical party activity.' },
          ],
        },
      },
      {
        blockType: 'ctaRow',
        props: {
          variant: 'workshops',
          heading: 'Interested in booking a workshop?',
          body: "Get in touch and we'll help you plan the details — group size, timing, and location.",
          buttons: [{ label: 'Get in Touch', link: '/contact', style: 'primary' }],
        },
      },
    ],
  },

  {
    slug: 'faq',
    title: 'FAQ',
    blocks: [
      { blockType: 'pageHero', props: { variant: 'faq', heading: 'Frequently Asked Questions' } },
      {
        blockType: 'faqAccordion',
        props: {
          items: [
            { question: 'What are your products made of?', answer: 'Every bar is handmade in small batches using natural oils, butters, and botanicals — no synthetic detergents or artificial fillers.' },
            { question: 'How long does shipping take?', answer: 'Orders are handcrafted to order, so please allow a few extra days for production before your package ships.' },
            { question: 'What does shipping cost?', answer: 'Shipping ranges from €6.75–€12.95 depending on your region, and orders over €50–€100 (region-dependent) ship free.' },
            { question: 'Can I return a product?', answer: 'Yes — returns are accepted within 30 days of delivery. See our Shipping & Returns page for the full policy.' },
            { question: 'Are your products tested on skin before selling?', answer: "We recommend a patch test before first use of any product, since everyone's skin reacts a little differently to natural ingredients." },
            { question: 'Do you offer workshops?', answer: 'Yes — we run signature soap-making workshops for groups and birthday parties. Visit our Workshops page to get in touch.' },
          ],
        },
      },
    ],
  },

  {
    slug: 'shipping-returns',
    title: 'Shipping & Returns',
    blocks: [
      { blockType: 'pageHero', props: { variant: 'shipping-returns', heading: 'Shipping & Returns' } },
      {
        blockType: 'iconCards',
        props: {
          variant: 'shipping-returns',
          items: [
            {
              icon: 'truck',
              title: 'Shipping',
              text: 'We ship worldwide. Orders are handcrafted to order, so please allow a few extra days for production before your package ships. Shipping costs range from €6.75 to €12.95 depending on your region, and orders over €50–€100 (region-dependent) ship free.',
            },
            {
              icon: 'arrowuupleft',
              title: 'Returns',
              text: "If something arrives damaged or isn't right, contact us and we'll make it right. Returns are accepted within 30 days of delivery.",
            },
          ],
        },
      },
    ],
  },

  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    blocks: [
      { blockType: 'pageHero', props: { variant: 'legal', heading: 'Privacy Policy', subtext: 'Last updated: 2026' } },
      {
        blockType: 'legalSection',
        props: {
          heading: 'Information We Collect',
          body: "When you place an order or contact us, we collect the information needed to fulfill it — your name, email, shipping address, and phone number. We don't collect anything beyond what's needed to process your order and get in touch with you.",
        },
      },
      {
        blockType: 'legalSection',
        props: {
          heading: 'How We Use It',
          body: "Your information is used to process and ship your order, respond to questions, and — if you've opted in — send occasional updates about new products or offers. We never sell your data to third parties.",
        },
      },
      {
        blockType: 'legalSection',
        props: {
          heading: 'Cookies',
          body: "We use minimal cookies/local storage to keep your shopping cart working between visits. We don't use third-party tracking or advertising cookies.",
        },
      },
      {
        blockType: 'legalSection',
        props: {
          heading: 'Third-Party Services',
          body: 'Payments are processed by a secure third-party payment provider — we never see or store your full card details.',
        },
      },
      {
        blockType: 'legalSection',
        props: {
          heading: 'Your Rights',
          body: 'You can ask us to access, correct, or delete your personal information at any time — just get in touch.',
        },
      },
      {
        blockType: 'legalSection',
        props: { heading: 'Contact', body: 'Questions about this policy? Reach out via our Contact page.' },
      },
    ],
  },

  {
    slug: 'terms',
    title: 'Terms & Conditions',
    blocks: [
      { blockType: 'pageHero', props: { variant: 'legal', heading: 'Terms & Conditions', subtext: 'Last updated: 2026' } },
      {
        blockType: 'legalSection',
        props: {
          heading: 'Orders & Payment',
          body: 'By placing an order with NaturallyU, you agree to pay the listed price plus any applicable shipping. Orders are handcrafted to order and may take a few extra days to prepare before shipping.',
        },
      },
      {
        blockType: 'legalSection',
        props: {
          heading: 'Shipping & Returns',
          body: 'See our [Shipping & Returns](/shipping-returns) page for shipping costs, timelines, and our 30-day return policy.',
        },
      },
      {
        blockType: 'legalSection',
        props: {
          heading: 'Product Disclaimer',
          body: 'Our products are not prescription products, but rather timeless beauty secrets drawn from nature. A patch test is recommended before first use of any product.',
        },
      },
      {
        blockType: 'legalSection',
        props: {
          heading: 'Governing Law',
          body: 'These terms are governed by the laws of the jurisdiction in which NaturallyU operates.',
        },
      },
      {
        blockType: 'legalSection',
        props: { heading: 'Contact', body: 'Questions about these terms? Reach out via our Contact page.' },
      },
    ],
  },

  {
    slug: 'contact',
    title: 'Contact',
    blocks: [
      {
        blockType: 'pageHero',
        props: {
          variant: 'contact',
          heading: 'Contact Us',
          subtext: "Questions about a product, a workshop, or an order? We'd love to hear from you.",
        },
      },
      {
        blockType: 'contactPageContent',
        props: { email: 'hello@naturallyu.com', phone: '+1 555 123-4567', location: 'Den Haag, Netherlands' },
      },
    ],
  },

  {
    slug: 'gift-sets',
    title: 'Gift Sets',
    blocks: [
      {
        blockType: 'pageHero',
        props: {
          variant: 'gift-sets',
          heading: 'Gift Sets',
          subtext: 'Curated handmade sets, thoughtfully packaged — perfect for any occasion.',
        },
      },
      {
        blockType: 'giftSetsPageContent',
        props: { emptyText: 'No gift sets are available right now — check back soon, or browse the full shop.' },
      },
    ],
  },

  {
    slug: 'shop',
    title: 'Shop',
    blocks: [
      { blockType: 'shopPageContent', props: { taxNote: 'Sales tax included on all products.' } },
    ],
  },

  {
    slug: 'product-template',
    title: 'Product Page (shared template)',
    blocks: [
      {
        blockType: 'productPageContent',
        props: {
          eyebrow: 'Handmade, natural & chemical-free',
          madeText: 'Handcrafted in small batches, to order',
          freeFromText: 'Parabens, SLS, artificial colour and synthetic fragrance',
          shippingBlurb:
            'We ship worldwide. Orders are handcrafted to order, so please allow a few extra days for production before your package ships. Shipping costs range from €6.75–€12.95 depending on your region, and orders over €50–€100 (region-dependent) ship free.',
          returnsBlurb:
            "If something arrives damaged or isn't right, contact us and we'll make it right. Returns are accepted within 30 days of delivery.",
          disclaimerText: PRODUCT_DISCLAIMER,
          usageByTag: [
            { tag: 'soap', text: 'Lather with warm water and massage gently onto skin. Rinse thoroughly. Keep the bar in a dry, drained soap dish between uses to help it last longer.' },
            { tag: 'skincare', text: 'Apply a small amount to clean, dry skin. As with any natural product, we recommend a patch test on a small area before first use.' },
            { tag: 'haircare', text: 'Massage into the scalp and through the lengths of dry or damp hair. Leave in for at least 30 minutes (or overnight) before washing out.' },
            { tag: 'accessory', text: 'Rinse before first use. Air-dry fully between uses to keep it fresh.' },
          ],
          defaultUsage: 'As with any natural, handmade product, we recommend a patch test on a small area of skin before first use.',
        },
      },
    ],
  },

  {
    slug: 'cart',
    title: 'Cart',
    blocks: [
      { blockType: 'pageHero', props: { variant: 'cart', heading: 'Your Cart' } },
      {
        blockType: 'cartPageContent',
        props: {
          emptyHeading: 'Your cart is empty',
          emptySubtext: "Looks like you haven't added anything yet.",
          emptyCtaLabel: 'Shop Now',
          shippingNoteText: 'Shipping calculated at checkout. See [Shipping & Returns](/shipping-returns).',
        },
      },
    ],
  },

  {
    slug: 'checkout',
    title: 'Checkout',
    blocks: [
      { blockType: 'pageHero', props: { variant: 'checkout', heading: 'Checkout' } },
      {
        blockType: 'checkoutPageContent',
        props: {
          shippingNoteText: 'Shipping calculated after order review.',
          paymentNoteText: 'Payment is collected securely on the next step.',
        },
      },
    ],
  },

  {
    slug: 'track-order',
    title: 'Track Order',
    blocks: [
      {
        blockType: 'pageHero',
        props: {
          variant: 'track-order',
          icon: 'package',
          heading: 'Track Your Order',
          subtext: 'Enter the order ID from your confirmation email.',
        },
      },
    ],
  },

  {
    slug: 'search',
    title: 'Search',
    blocks: [
      {
        blockType: 'searchPageContent',
        props: {
          eyebrow: 'Search results',
          emptyPromptText: 'Type something to search the site.',
          browseAllLabel: 'Browse all products',
        },
      },
    ],
  },
];

const validateBlocks = (blocks, pageName) => {
  for (const block of blocks) {
    const validator = blockValidators[block.blockType];
    if (!validator) throw new Error(`${pageName}: no validator for blockType "${block.blockType}"`);
    const { error } = validator(block.props);
    if (error) throw new Error(`${pageName} / ${block.blockType}: ${error}`);
  }
};

const run = async () => {
  await connectDB();

  for (const manifest of pages) {
    validateBlocks(manifest.blocks, manifest.slug);

    let page = await Page.findOne({ slug: manifest.slug });
    if (!page) {
      page = new Page({ slug: manifest.slug, title: manifest.title, status: 'published', publishedAt: new Date() });
    }
    page.title = manifest.title;
    if (manifest.metaDescription) page.metaDescription = manifest.metaDescription;
    page.blocks = manifest.blocks.map((b, i) => ({ blockType: b.blockType, props: b.props, order: i + 1, visible: true }));
    if (page.status !== 'published') {
      page.status = 'published';
      page.publishedAt = new Date();
    }
    await page.save();
    logger.info(`Page "${manifest.slug}" upserted with ${manifest.blocks.length} blocks.`);
  }

  await mongoose.connection.close();
  logger.info(`Storefront pages seeded: ${pages.length} pages.`);
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Seeding storefront pages failed: ${err.message}`);
  process.exit(1);
});

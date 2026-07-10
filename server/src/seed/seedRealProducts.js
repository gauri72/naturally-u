/**
 * Seeds the live storefront with NaturallyU's real product line, migrated
 * from the company's old Wix site (naturallyu.nl) before it's retired.
 * Downloads each product's real photos from Wix's CDN into
 * client/public/assets/products/ (served directly by Vite - no S3/AWS
 * credentials needed, matching the existing local-path convention already
 * used by the placeholder products in seed.js) and upserts real Product
 * documents with real names/prices/descriptions/ingredients.
 *
 * Also deactivates the 4 fictional placeholder products seed.js creates
 * (isActive: false, soft delete) so the shop only sells what NaturallyU
 * actually sells, and re-tags 4 of the real products as 'bestseller' so
 * the homepage's tag-driven bestsellers block doesn't go empty.
 *
 * Safe to re-run: products are upserted by slug, images are skipped if
 * the destination file already exists.
 *
 * Run with: npm run seed:products
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product.model');
const logger = require('../utils/logger');

const IMAGES_DIR = path.join(__dirname, '../../../client/public/assets/products');

const toFullResWixUrl = (url) => url.split('/v1/')[0];

const PLACEHOLDER_SLUGS = [
  'turmeric-glow-soap',
  'neem-tea-tree-face-balm',
  'oatmeal-honey-soap',
  'rosehip-face-oil',
];

const manifest = [
  {
    slug: 'almond-sensational-face-scrub-and-mask',
    name: 'Almond Sensational Face Scrub and Mask',
    shortDescription: 'A dual-purpose almond and clay scrub for deep cleansing and a brighter complexion.',
    description:
      'A gentle two-in-one scrub and mask built on a base of ground almond meal and white clay for spa-style '
      + 'exfoliation. Cucumber extract and aloe vera help calm and hydrate while the clay works to even out skin '
      + 'tone and reduce puffiness around the eyes. Take a small amount and massage onto a wet face; a patch test '
      + 'is recommended before first use.',
    price: 20.0,
    ingredients: ['Almond Meal', 'White Clay', 'Glycerin', 'Cucumber Extract', 'Aloe Vera', 'Calendula Oil', 'Lavender Essential Oil', 'Vitamin E Oil'],
    tags: ['skincare', 'bestseller'],
    stock: 40,
    images: ['https://static.wixstatic.com/media/720cf4_7701d4a776254462aa8e4e5806f3bdde~mv2.jpg'],
  },
  {
    slug: 'ayurveda-in-a-pot-face-cream',
    name: 'Ayurveda in a Pot Face Cream',
    shortDescription: 'A sandalwood and turmeric face cream drawing on Ayurvedic skincare tradition.',
    description:
      'This face cream blends sandalwood, turmeric, and Kumkumadi essential oil - ingredients long used in Indian '
      + 'wellness practice - into a lightweight daily moisturizer aimed at acne-prone skin. Made without synthetic '
      + 'fragrance or chemical additives, and packaged with the environment in mind. Suitable for all skin types; '
      + 'a patch test is recommended before first use.',
    price: 15.0,
    ingredients: ['Aqua', 'Almond Oil', 'Cucumis Sativus', 'Geranium Rose Essential Oil', 'Sorbitan Olivate', 'Shea Butter', 'Sweet Cocos Nucifera', 'Sandalwood Essential Oil', 'Turmeric Infused Oil', 'Vitamin E'],
    tags: ['skincare', 'bestseller'],
    stock: 35,
    images: [
      'https://static.wixstatic.com/media/720cf4_479c5d992aae43b4874378fe916984f4~mv2.jpg',
      'https://static.wixstatic.com/media/720cf4_2662e7e4fbd248e2baa94f78b5dfba76~mv2.jpg',
      'https://static.wixstatic.com/media/720cf4_2b49621f50a2410594356f92976b3d1d~mv2.jpg',
    ],
  },
  {
    slug: 'goat-milk-rose-soap',
    name: 'Goat Milk Rose Soap',
    shortDescription: 'A creamy goat milk and rose soap bar for soft, hydrated skin.',
    description:
      'Inspired by traditional European milkmaid skincare, this bar combines goat milk sourced from local Dutch '
      + 'farms with rose essence. The milk gently exfoliates while helping the skin hold onto its natural '
      + 'elasticity, leaving it soft and supple rather than stripped. Formulated for dry to normal skin; keep the '
      + 'bar in a dry rack between uses and avoid eye contact.',
    price: 7.75,
    ingredients: ['Cocos Nucifera (Coconut) Oil', 'Goat Milk', 'Helianthus Annuus (Sunflower) Oil', 'Olea Europaea (Olive) Oil', 'Persea Gratissima (Avocado) Oil', 'Prunus Dulcis (Almond) Oil', 'Rose Essential Oil', 'Sodium Hydroxide'],
    tags: ['soap'],
    stock: 45,
    images: [
      'https://static.wixstatic.com/media/a9d23c_126b1ecb25084d7b89ea728d511ed8b8~mv2.jpg',
      'https://static.wixstatic.com/media/a9d23c_8029b1ca862145039bc5e3eb17d82ad8~mv2.jpg',
    ],
  },
  {
    slug: 'hair-oil',
    name: 'Tribal Indian Hair Oil',
    shortDescription: 'A traditional Ayurvedic hair oil blend of 13 medicinal herbs to support scalp health and growth.',
    description:
      'Built on an old Ayurvedic recipe, this oil combines 13 medicinal herbs from India into a blend aimed at '
      + 'reducing hair fall and dandruff while supporting the scalp. With regular use it is intended to leave hair '
      + 'thicker and glossier over time. Made without added chemicals, with noticeably less synthetic fragrance '
      + 'than most commercial hair oils.',
    price: 17.5,
    ingredients: [],
    tags: ['haircare', 'bestseller'],
    stock: 30,
    images: [
      'https://static.wixstatic.com/media/720cf4_c56bb26d10c34835853b609be9d16a91~mv2.jpg',
      'https://static.wixstatic.com/media/a9d23c_fd818ea294ec4ed08aa77c8009a5719a~mv2.jpg',
      'https://static.wixstatic.com/media/a9d23c_b1251896d1ca477e9ae476eda1da1f3d~mv2.jpg',
    ],
  },
  {
    slug: 'himalayan-foot-soak',
    name: 'Himalayan Foot Soak',
    shortDescription: 'A relaxing salt soak blending Himalayan pink salt, Dead Sea salt, and Epsom salt.',
    description:
      'A blend of Epsom salt, Dead Sea salt, and Himalayan pink salt designed to soothe tired, achy feet after a '
      + 'long day. Eucalyptus and lemongrass essential oils add a light, calming scent meant to help ease you '
      + 'toward a restful night. Suitable for all skin types; avoid eye contact and rinse with water if it occurs.',
    price: 13.5,
    ingredients: ['Dead Sea Salt', 'Epsom Salt', 'Himalayan Pink Salt', 'Eucalyptus Essential Oil', 'Lemongrass Essential Oil'],
    tags: ['skincare'],
    stock: 40,
    images: [
      'https://static.wixstatic.com/media/a9d23c_94ba6a9757f2445cb52f541bcfc2dbee~mv2.jpg',
      'https://static.wixstatic.com/media/720cf4_67a1bc072c094971a578a02acc028373~mv2.jpg',
      'https://static.wixstatic.com/media/720cf4_eee683739c534964b2ae9c0245ac486e~mv2.jpg',
    ],
  },
  {
    slug: 'loofah',
    name: 'Loofah',
    shortDescription: 'A 100% natural, sun-dried loofah sponge for gentle exfoliation.',
    description:
      'Grown from the loofah plant - a relative of the cucumber and zucchini - and left to dry naturally in the '
      + 'sun, this sponge is entirely plant fiber with nothing added. Used a few times a week in the shower, it '
      + 'gently sloughs away dead skin cells for a smoother, softer feel.',
    price: 5.0,
    ingredients: [],
    tags: ['accessory'],
    stock: 60,
    images: ['https://static.wixstatic.com/media/d4dc1f_8d9f217ca49d4c589423010aa44a8c44~mv2.jpeg'],
  },
  {
    slug: 'lotion-bar',
    name: 'Lotion Bar',
    shortDescription: 'A solid lotion bar of mango, shea, and cocoa butter for dry winter skin.',
    description:
      'A solid, melt-on-contact lotion bar built from three butters - mango, shea, and cocoa - chosen to stand up '
      + 'to winter dryness and help soften the look of stretch marks. Comes in a small recyclable tin that travels '
      + 'well. Formulated for normal to dry skin; a patch test is recommended before first use.',
    price: 15.0,
    ingredients: ['Beeswax', 'Mango Butter', 'Shea Butter', 'Cocoa Butter', 'Rice Bran Oil', 'Almond Oil', 'Geranium Rose Essential Oil'],
    tags: ['skincare'],
    stock: 25,
    images: [
      'https://static.wixstatic.com/media/d4dc1f_777cba1dda7d424b98f02dc239b0a834~mv2.jpeg',
      'https://static.wixstatic.com/media/a9d23c_bc8faf6c7ab74c5d982ad236b9d22bbc~mv2.jpg',
    ],
  },
  {
    slug: 'minty-lip-balm',
    name: 'Minty Lip Balm',
    shortDescription: 'A peppermint-fresh lip balm for all-day moisture.',
    description:
      'The smallest product in the NaturallyU lineup, this balm is built around shea butter and beeswax for '
      + 'long-lasting moisture, finished with a cooling hit of peppermint essential oil. Comes in a small '
      + 'recyclable tin. A patch test is recommended before first use.',
    price: 5.0,
    ingredients: ['Beeswax', 'Shea Butter', 'Coconut Oil', 'Castor Oil', 'Almond Oil', 'Peppermint Essential Oil', 'Vitamin E Oil'],
    tags: ['skincare'],
    stock: 0,
    images: ['https://static.wixstatic.com/media/d4dc1f_65d42e28a19741909e1af880259c7723~mv2.jpeg'],
  },
  {
    slug: 'soap-keeping-box',
    name: 'Coconut Shell Carved Soap Dish',
    shortDescription: 'A hand-carved coconut shell dish for keeping soap bars dry between uses.',
    description:
      'A soap dish hand-carved from coconut shell, designed to let water drain away so bars last longer between '
      + 'uses. A small, sustainable accessory piece to pair with any of the handmade soap bars.',
    price: 5.0,
    ingredients: [],
    tags: ['accessory'],
    stock: 30,
    images: [
      'https://static.wixstatic.com/media/720cf4_e1e4848acd9f4dc0915d4b2358d67317~mv2.jpeg',
      'https://static.wixstatic.com/media/720cf4_df79748a05eb470a85e301f8254d720c~mv2.jpg',
    ],
  },
  {
    slug: 'strawberry-lip-balm',
    name: 'Strawberry Lip Balm',
    shortDescription: 'A strawberry-scented lip balm for soft, healthy lips.',
    description:
      'A moisturizing lip balm built on shea butter and beeswax, finished with a light strawberry scent. Comes in '
      + 'a small recyclable tin. A patch test is recommended before first use.',
    price: 5.0,
    ingredients: ['Beeswax', 'Shea Butter', 'Almond Oil', 'Coconut Oil', 'Castor Oil', 'Strawberry Flavour Oil', 'Vitamin E Oil', 'Mica', 'Titanium Dioxide', 'Iron Oxide'],
    tags: ['skincare'],
    stock: 0,
    images: ['https://static.wixstatic.com/media/d4dc1f_c69d556159f1494a9aac98cd97734faa~mv2.jpeg'],
  },
  {
    slug: 'towel',
    name: 'Bamboo Face Towel',
    shortDescription: 'A soft bamboo terry face towel, gentle enough for sensitive skin.',
    description:
      'A 72 x 33cm bamboo terry towel kept just for the face, since a dedicated towel avoids the bacteria buildup '
      + 'that comes from sharing one towel across face and body. Soft enough for sensitive skin - swap it out '
      + 'every couple of days to keep it fresh.',
    price: 7.5,
    ingredients: [],
    tags: ['accessory'],
    stock: 30,
    images: [
      'https://static.wixstatic.com/media/720cf4_06cb06a58ec24e21a7b69c595f2a3d0a~mv2.jpg',
      'https://static.wixstatic.com/media/720cf4_e00e70ee772a49b6b50ecc911ee90b23~mv2.jpg',
      'https://static.wixstatic.com/media/720cf4_002e855043814794a6eaa367dfea1690~mv2.jpg',
    ],
  },
  {
    slug: 'tulsi-soap',
    name: 'Neem and Tulsi Soap',
    shortDescription: 'A green clay soap with neem and tulsi for problem-prone skin.',
    description:
      'A handcrafted bar built around neem and tulsi (holy basil) - two herbs long used in Indian skincare for '
      + 'their cleansing, antiseptic qualities - paired with green clay and tea tree essential oil. Formulated '
      + 'with acne-prone and sensitive skin in mind. Keep the bar in a dry rack between uses and avoid eye contact.',
    price: 7.75,
    ingredients: ['Green Clay', 'Indigo Powder', 'Matcha Powder', 'Neem Tulsi Powder', 'Cocos Nucifera (Coconut) Oil', 'Helianthus Annuus (Sunflower) Oil', 'Azadirachta Indica (Neem) Seed Oil', 'Aloe Vera Butter', 'Prunus Dulcis (Almond) Oil', 'Ocimum Basilicum (Basil) Essential Oil', 'Jasmine Essential Oil'],
    tags: ['soap', 'bestseller'],
    stock: 45,
    images: [
      'https://static.wixstatic.com/media/720cf4_f39a218b004b400c935bea675649ecba~mv2.jpeg',
      'https://static.wixstatic.com/media/a9d23c_7f1c1fdca2aa49a39cfbccb3ba24c7c2~mv2.jpg',
      'https://static.wixstatic.com/media/720cf4_f2415cedcf88454f86de576bc8ae815d~mv2.jpg',
    ],
  },
  {
    slug: 'uptan',
    name: 'Uptan Soap',
    shortDescription: 'A gram flour and turmeric soap based on the traditional Indian uptan ritual.',
    description:
      'This bar turns the traditional Indian uptan ritual - a turmeric paste used before weddings and '
      + 'celebrations - into an everyday soap. Gram flour lightly exfoliates while turmeric, sandalwood, and rose '
      + 'petals work to cleanse and hydrate. Keep the bar in a dry rack between uses and avoid eye contact.',
    price: 7.75,
    ingredients: ['Olive Oil', 'Coconut Oil', 'Sunflower Seed Oil', 'Avocado Oil', 'Castor Oil', 'Sandalwood Oil', 'Turmeric Root Powder', 'Rose Petals', 'Mung Bean (Vigna Radiata)'],
    tags: ['soap'],
    stock: 0,
    images: [
      'https://static.wixstatic.com/media/a9d23c_4d3c6b73fe5c46b59cefa10a38d13871~mv2.jpg',
      'https://static.wixstatic.com/media/720cf4_954b5862a5a54dd28952d3a2cff3d65a~mv2.jpg',
    ],
  },
];

const run = async () => {
  await connectDB();

  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  for (const item of manifest) {
    const images = [];
    for (let i = 0; i < item.images.length; i += 1) {
      const wixUrl = item.images[i];
      try {
        const fullResUrl = toFullResWixUrl(wixUrl);
        const ext = path.extname(fullResUrl).split('?')[0] || '.jpg';
        const filename = `${item.slug}-${i + 1}${ext}`;
        const destPath = path.join(IMAGES_DIR, filename);

        if (!fs.existsSync(destPath)) {
          const response = await fetch(fullResUrl);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const buffer = Buffer.from(await response.arrayBuffer());
          fs.writeFileSync(destPath, buffer);
        }

        images.push({ url: `/assets/products/${filename}`, alt: item.name });
      } catch (err) {
        logger.error(`  Failed to download image ${i + 1} for "${item.name}": ${err.message}`);
      }
    }

    await Product.updateOne(
      { slug: item.slug },
      {
        $set: {
          name: item.name,
          shortDescription: item.shortDescription,
          description: item.description,
          price: item.price,
          ingredients: item.ingredients,
          tags: item.tags,
          stock: item.stock,
          images,
          isActive: true,
        },
      },
      { upsert: true }
    );
    logger.info(`Upserted product: ${item.name} (${images.length} image(s))`);
  }

  const { modifiedCount } = await Product.updateMany(
    { slug: { $in: PLACEHOLDER_SLUGS } },
    { $set: { isActive: false } }
  );
  logger.info(`Deactivated ${modifiedCount} placeholder product(s).`);

  await mongoose.connection.close();
  logger.info('Real product seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Product seed failed: ${err.message}`);
  process.exit(1);
});

const mongoose = require('mongoose');

// Singleton document: global, non-page-specific CMS-editable content
// (nav links, footer, announcement bar, social links, theme tokens).
const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Naturally You' },
    logoUrl: { type: String },
    announcementBar: {
      enabled: { type: Boolean, default: true },
      messages: {
        type: [String],
        default: [
          'Free shipping on orders over €75',
          'Handcrafted in small batches with love',
          '15% OFF your first order — NATURALLY15',
        ],
      },
    },
    navLinks: [{ label: String, path: String }],
    footer: {
      shopLinks: {
        type: [{ label: String, path: String }],
        default: [
          { label: 'All Products', path: '/shop' },
          { label: 'Soaps', path: '/shop?category=soaps' },
          { label: 'Skincare', path: '/shop?category=skincare' },
          { label: 'Gift Sets', path: '/gift-sets' },
          { label: 'New Arrivals', path: '/shop?sort=new' },
        ],
      },
      customerCareLinks: {
        type: [{ label: String, path: String }],
        default: [
          { label: 'FAQ', path: '/faq' },
          { label: 'Shipping & Returns', path: '/shipping-returns' },
          { label: 'Privacy Policy', path: '/privacy-policy' },
          { label: 'Terms & Conditions', path: '/terms' },
        ],
      },
      connect: {
        email: { type: String, default: 'hello@naturallyou.com' },
        phone: { type: String, default: '+1 555 123-4567' },
        social: {
          type: [{ platform: String, url: String }],
          default: [
            { platform: 'facebook', url: 'https://facebook.com/naturallyou' },
            { platform: 'instagram', url: 'https://instagram.com/naturallyou' },
            { platform: 'pinterest', url: 'https://pinterest.com/naturallyou' },
          ],
        },
      },
      copyrightText: { type: String, default: '© 2026 Naturally You. All rights reserved.' },
    },
    theme: {
      primaryColor: { type: String, default: '#3FA34D' },
      accentColor: { type: String, default: '#F7E54D' },
      backgroundColor: { type: String, default: '#FFF7E6' },
      textColor: { type: String, default: '#8A6E51' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);

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
          'Free shipping on orders over $75',
          'Handcrafted in small batches with love',
          '15% OFF your first order — NATURALLY15',
        ],
      },
    },
    navLinks: {
      type: [{ label: String, path: String }],
      default: [
        { label: 'Shop', path: '/shop' },
        { label: 'Gift Sets', path: '/gift-sets' },
      ],
    },
    footer: {
      shopLinks: {
        type: [{ label: String, path: String }],
        default: [
          { label: 'Shop All', path: '/shop' },
          { label: 'Gift Sets', path: '/gift-sets' },
        ],
      },
      customerCareLinks: {
        type: [{ label: String, path: String }],
        default: [{ label: 'Contact Us', path: 'mailto:hello@naturallyu.com' }],
      },
      connect: {
        email: { type: String, default: 'hello@naturallyu.com' },
        phone: String,
        social: [{ platform: String, url: String }],
      },
      copyrightText: { type: String, default: '© 2024 Naturally You. All rights reserved.' },
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

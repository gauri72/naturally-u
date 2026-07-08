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
          { label: 'Best Sellers', path: '/shop?tag=bestseller' },
          { label: 'New Arrivals', path: '/shop?tag=new' },
          { label: 'Gift Sets', path: '/gift-sets' },
        ],
      },
      customerCareLinks: {
        type: [{ label: String, path: String }],
        default: [
          { label: 'Contact Us', path: 'mailto:hello@naturallyu.com' },
          { label: 'FAQ', path: '/faq' },
          { label: 'Shipping & Returns', path: '/shipping-returns' },
          { label: 'Track Your Order', path: '/track-order' },
        ],
      },
      connect: {
        email: { type: String, default: 'hello@naturallyu.com' },
        // Placeholder contact/social details so the footer isn't blank pre-launch —
        // 555 is the standard non-dialable placeholder area code; social URLs use
        // the brand handle as a guess and should be swapped for real accounts in
        // Admin > Site Settings.
        phone: { type: String, default: '+1 (555) 010-0143' },
        social: {
          type: [{ platform: String, url: String }],
          default: [
            { platform: 'facebook', url: 'https://facebook.com/naturallyu' },
            { platform: 'instagram', url: 'https://instagram.com/naturallyu' },
            { platform: 'pinterest', url: 'https://pinterest.com/naturallyu' },
          ],
        },
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

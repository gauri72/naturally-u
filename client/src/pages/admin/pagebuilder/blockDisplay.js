import {
  Megaphone,
  ImageSquare,
  Rows,
  SquaresFour,
  Gift,
  Medal,
  ChatCircleText,
  EnvelopeSimple,
  Layout,
  Article,
  Images,
  TextT,
  FileText,
  IdentificationCard,
  BookOpen,
  Cards,
  AddressBook,
  CursorClick,
  Question,
  Storefront,
  Package,
  MagnifyingGlass,
  ShoppingCart,
  CreditCard,
  Phone,
  Cube,
} from '@phosphor-icons/react';
import { blockMeta } from '../../../blocks/registry/blockRegistry';

/**
 * Admin-only display helpers for the page builder: a recognizable icon per
 * blockType and a one-line, content-derived summary so that several blocks
 * of the same type (e.g. six Legal Sections) are distinguishable in the
 * block list without opening each one.
 */

export const blockIcons = {
  announcementBar: Megaphone,
  hero: ImageSquare,
  featureStrip: Rows,
  productGrid: SquaresFour,
  giftBanner: Gift,
  valueProps: Medal,
  testimonial: ChatCircleText,
  newsletter: EnvelopeSimple,
  footer: Layout,
  richText: Article,
  imageGallery: Images,
  pageHero: TextT,
  legalSection: FileText,
  aboutFeature: IdentificationCard,
  aboutStory: BookOpen,
  iconCards: Cards,
  aboutContact: AddressBook,
  ctaRow: CursorClick,
  faqAccordion: Question,
  shopPageContent: Storefront,
  productPageContent: Package,
  searchPageContent: MagnifyingGlass,
  cartPageContent: ShoppingCart,
  checkoutPageContent: CreditCard,
  contactPageContent: Phone,
  giftSetsPageContent: Gift,
};

export const blockIcon = (blockType) => blockIcons[blockType] || Cube;

// camelCase -> "Camel Case" for blockTypes without a blockMeta entry
const prettify = (str) =>
  str.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

export const blockLabel = (blockType) =>
  blockMeta[blockType]?.label || prettify(blockType);

const truncate = (str, max = 90) => {
  const clean = String(str).replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
};

const joinTitles = (arr, key) =>
  (arr || []).map((item) => item?.[key]).filter(Boolean).join(' · ');

// Keys that never make a useful summary on their own
const SKIP_KEYS = new Set(['variant', 'icon', 'style', 'image', 'imageAlt', 'eyebrowIcon', 'ctaLink', 'link', 'tag', 'source']);

export function blockSummary(block) {
  const p = block.props || {};

  switch (block.blockType) {
    case 'announcementBar':
      return truncate((p.messages || []).join(' · '));
    case 'productGrid': {
      const source = p.source === 'tag' ? `tag: ${p.tag}` : p.source === 'category' ? `category: ${p.category}` : 'manual picks';
      return truncate([p.title, source].filter(Boolean).join(' — '));
    }
    case 'imageGallery':
      return `${(p.images || []).length} image${(p.images || []).length === 1 ? '' : 's'}`;
    case 'testimonial':
      return `${(p.testimonials || []).length} review${(p.testimonials || []).length === 1 ? '' : 's'}`;
    case 'faqAccordion':
      return `${(p.items || []).length} question${(p.items || []).length === 1 ? '' : 's'}`;
    case 'iconCards':
    case 'valueProps':
    case 'featureStrip':
      return truncate(joinTitles(p.items, 'title'));
    case 'ctaRow':
      return truncate(p.heading || joinTitles(p.buttons, 'label'));
    case 'aboutContact':
      return truncate([p.address, p.email, p.phone].filter(Boolean).join(' · '));
    case 'footer':
      return 'Site-wide footer';
    default:
      break;
  }

  // Generic: prefer a headline-ish prop, else the first meaningful string
  const preferred = p.heading || p.title || p.question || p.eyebrowText || p.eyebrow;
  if (preferred) return truncate(preferred);

  for (const [key, value] of Object.entries(p)) {
    if (key.startsWith('_') || SKIP_KEYS.has(key)) continue;
    if (typeof value === 'string' && value.trim()) return truncate(value);
  }
  return '';
}

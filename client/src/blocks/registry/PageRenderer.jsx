import { blockRegistry } from './blockRegistry';
import './PageRenderer.css';

/**
 * Renders a page's blocks in order using the block registry.
 * Used by every storefront page that's CMS-driven (Home, About, etc).
 * Unknown block types render nothing but log a warning — this keeps
 * one bad/stale block from crashing the whole page.
 *
 * Special case: a `testimonial` immediately followed by a `newsletter`
 * (both visible) renders as a single two-column row instead of two
 * stacked full-width sections — matches the paired layout in the
 * home page design reference. See PageRenderer.css.
 */
function PageRenderer({ blocks = [] }) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  const elements = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const block = sorted[i];
    if (!block.visible) continue;

    const next = sorted[i + 1];
    if (block.blockType === 'testimonial' && next?.blockType === 'newsletter' && next.visible) {
      const TestimonialBlock = blockRegistry.testimonial;
      const NewsletterBlock = blockRegistry.newsletter;
      elements.push(
        <div className="testimonial-newsletter-row" key={block._id}>
          <TestimonialBlock {...block.props} />
          <NewsletterBlock {...next.props} />
        </div>
      );
      i += 1;
      continue;
    }

    const BlockComponent = blockRegistry[block.blockType];
    if (!BlockComponent) {
      console.warn(`[PageRenderer] Unknown blockType "${block.blockType}" - skipping.`);
      continue;
    }
    elements.push(<BlockComponent key={block._id} {...block.props} />);
  }

  return <>{elements}</>;
}

export default PageRenderer;

import { blockRegistry } from './blockRegistry';
import './PageRenderer.css';

/**
 * Renders a page's blocks in order using the block registry.
 * Used by every storefront page that's CMS-driven (Home, About, etc).
 * Unknown block types render nothing but log a warning — this keeps
 * one bad/stale block from crashing the whole page.
 *
 * Blocks render as full-width sections in `order`; a testimonial followed
 * by a newsletter therefore stacks (testimonial on top, newsletter below).
 */
function PageRenderer({ blocks = [] }) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  const elements = [];

  for (const block of sorted) {
    if (!block.visible) continue;
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

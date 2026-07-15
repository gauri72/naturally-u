import { Link } from 'react-router-dom';

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

// Splits a string on `[label](url)` markers and renders any found as an
// inline <Link> - a tiny escape hatch for CMS copy that needs to embed a
// single in-page navigation link (e.g. "See Shipping & Returns."). Not a
// general markdown engine.
function renderInlineLinks(text) {
  if (!text) return text;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    nodes.push(<Link key={key++} to={match[2]}>{match[1]}</Link>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length ? nodes : text;
}

export default renderInlineLinks;

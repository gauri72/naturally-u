import { useState } from 'react';
import { Leaf, X } from '@phosphor-icons/react';
import './AnnouncementBarBlock.css';

// Props: { messages: string[] } - sitewide top bar, sourced from Settings.
// Desktop shows all messages pipe-separated; mobile drops the middle
// message and wraps the rest onto a second line (matches reference design).
function AnnouncementBarBlock({ messages = [] }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || messages.length === 0) return null;

  const nodes = [];
  messages.forEach((message, index) => {
    nodes.push(
      <span key={`item-${index}`} className="announcement-bar__item" data-index={index}>
        {index === 0 && (
          <span className="announcement-bar__icon" aria-hidden="true">
            <Leaf size={14} weight="fill" />
          </span>
        )}
        {message}
      </span>
    );
    if (index < messages.length - 1) {
      nodes.push(
        <span key={`sep-${index}`} className="announcement-bar__sep" data-sep-index={index} aria-hidden="true">
          |
        </span>
      );
    }
  });

  return (
    <div className="announcement-bar">
      <div className="announcement-bar__messages">{nodes}</div>
      <button
        className="announcement-bar__close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
}

export default AnnouncementBarBlock;

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// SPA navigation preserves scroll position by default; this resets to
// the top of the page on every route change, matching normal browser
// navigation behavior.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Info, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { useLang } from '../../i18n/LanguageContext.jsx';
import CartQuantityControl from './CartQuantityControl.jsx';
import './ProductCarousel.css';

// Filmstrip carousel for the shop page — several product cards with a
// square (1:1) photo visible at once, each with a category badge on the image and the
// name / description / price / cart / info below it. Advances one card
// every `autoplaySpeed`; pauses on hover, on keyboard focus inside
// it, and while the tab is hidden. Supports arrow buttons, dot
// navigation, and touch swipe. All content/behavior beyond the raw
// `products` data is prop-driven so it can be admin-edited from the Shop
// page's "Products" block (client/src/blocks/ProductsBlock) —
// every prop defaults to this component's original hardcoded value, so
// any other caller (e.g. Home's ProductGridBlock) is unaffected.
function ProductCarousel({
  products = [],
  addToCartLabel = 'Add to cart',
  showCategoryBadge = true,
  currencySymbol = '€',
  priceDecimals = 2,
  autoplayEnabled = true,
  autoplaySpeed = 7000,
  showArrows = true,
  showDots = true,
  swipeSensitivity = 45,
  carouselLabel = 'Products',
  previousButtonLabel = 'Previous products',
  nextButtonLabel = 'Next products',
  slidePickerLabel = 'Choose slide to display',
}) {
  const { t } = useLang();
  const count = products.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [metrics, setMetrics] = useState({
    perView: 1,
    step: 0,
    maxScroll: 0,
    ready: false,
  });
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const trackRef = useRef(null);
  const rootRef = useRef(null);
  const viewportRef = useRef(null);

  const { perView, step, maxScroll, ready } = metrics;
  const maxIndex = Math.max(0, count - perView);
  const pageCount = maxIndex + 1;
  const hasControls = ready && count > perView;

  // --- Measurement -----------------------------------------------------------
  // One card's width + the flex gap gives the px to translate per step;
  // how many whole cards fit gives the number of resting pages.
  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const slide = track?.firstElementChild;
      if (!track || !slide) return;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const slideWidth = slide.getBoundingClientRect().width;
      if (!slideWidth) return;
      const viewport = track.parentElement.clientWidth;
      const perViewNext = Math.max(
        1,
        Math.floor((viewport + gap) / (slideWidth + gap)),
      );
      // Distance from the start of the last page to the true end of the
      // track — lets the final page sit flush instead of leaving a sliver.
      const maxScroll = Math.max(0, track.scrollWidth - viewport);
      setMetrics({
        perView: perViewNext,
        step: slideWidth + gap,
        maxScroll,
        ready: true,
      });
    };

    measure();

    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onResize);

    // Re-measure once fonts/images settle, in case the first pass was early.
    const settle = setTimeout(measure, 250);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [count]);

  // Keep the index in range when the viewport shrinks / grows.
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  // --- Navigation ----------------------------------------------------------
  const goTo = useCallback(
    (target) => {
      setIndex(() => {
        if (target < 0) return maxIndex;
        if (target > maxIndex) return 0;
        return target;
      });
    },
    [maxIndex],
  );
  const next = useCallback(() => setIndex((i) => (i >= maxIndex ? 0 : i + 1)), [maxIndex]);
  const prev = useCallback(() => setIndex((i) => (i <= 0 ? maxIndex : i - 1)), [maxIndex]);

  // --- Autoplay ----------------------------------------------------------
  useEffect(() => {
    if (!autoplayEnabled || !hasControls || paused || dragging) return undefined;
    const id = setTimeout(next, autoplaySpeed);
    return () => clearTimeout(id);
  }, [autoplayEnabled, autoplaySpeed, hasControls, paused, dragging, index, next]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // --- Keyboard ----------------------------------------------------------
  const onKeyDown = (e) => {
    if (!hasControls) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  };

  // --- Pointer / touch swipe ---------------------------------------------
  const dragStart = useRef(null);
  // Set when a touch drag moved sideways, so the click the browser may fire
  // on lift doesn't open the product photo the swipe started on.
  const justSwiped = useRef(false);
  const onPointerDown = (e) => {
    justSwiped.current = false;
    if (!hasControls || e.pointerType === 'mouse') return; // let the mouse click links/buttons
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };
  const onPointerMove = (e) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) < Math.abs(dy)) return; // vertical scroll, ignore
    setDragPx(dx);
  };
  const endDrag = () => {
    if (!dragStart.current) return;
    const dx = dragPx;
    justSwiped.current = Math.abs(dx) > 8;
    dragStart.current = null;
    setDragPx(0);
    setDragging(false);
    if (dx <= -swipeSensitivity) next();
    else if (dx >= swipeSensitivity) prev();
  };

  // --- Render ----------------------------------------------------------
  const slides = useMemo(
    () =>
      products.map((product) => ({
        product,
        badge: product.tags?.[0],
        // Full description - the square photo leaves room for it below.
        blurb: t(product.description || product.shortDescription || ''),
      })),
    [products, t],
  );

  if (count === 0) return null;

  // Clamp so the last page ends flush with the viewport rather than
  // scrolling a partial card's worth of empty space into view.
  const baseOffset = -Math.min(index * step, maxScroll);
  const trackStyle = {
    transform: `translateX(${baseOffset + dragPx}px)`,
    transition: dragging ? 'none' : undefined,
  };

  return (
    <div
      className="product-carousel"
      ref={rootRef}
      role="region"
      aria-roledescription={t('carousel')}
      aria-label={t(carouselLabel)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget)) setPaused(false);
      }}
      onKeyDown={onKeyDown}
    >
      <div
        className="product-carousel__viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-live={hasControls && !paused ? 'off' : 'polite'}
        aria-atomic="false"
      >
        <div
          className="product-carousel__track"
          ref={trackRef}
          style={trackStyle}
        >
          {slides.map(({ product, badge, blurb }, i) => {
            const visible = i >= index && i < index + perView;
            return (
              <article
                className="product-carousel__slide"
                key={product._id}
                role="group"
                aria-roledescription={t('slide')}
                aria-label={`${i + 1} / ${count}`}
                aria-hidden={!visible}
                {...(!visible ? { inert: '' } : {})}
              >
                {/* The photo opens the product page. Out of the tab order:
                    the name link below already offers the same destination
                    to keyboard and screen-reader users. */}
                <Link
                  to={`/shop/${product.slug}`}
                  className="product-carousel__media"
                  tabIndex={-1}
                  aria-hidden="true"
                  draggable="false"
                  onClick={(e) => {
                    if (justSwiped.current) {
                      e.preventDefault();
                      justSwiped.current = false;
                    }
                  }}
                >
                  <img
                    className="product-carousel__img-backdrop"
                    src={product.images?.[0]?.url}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    draggable="false"
                  />
                  <img
                    className="product-carousel__img"
                    src={product.images?.[0]?.url}
                    alt={product.images?.[0]?.alt || t(product.name)}
                    loading="lazy"
                    draggable="false"
                  />
                </Link>

                <div className="product-carousel__panel">
                  {showCategoryBadge && badge && (
                    <span className="product-carousel__badge">{t(badge)}</span>
                  )}
                  <h3 className="product-carousel__name">
                    <Link to={`/shop/${product.slug}`}>{t(product.name)}</Link>
                  </h3>
                  <p className="product-carousel__desc">{blurb}</p>
                  <div className="product-carousel__footer">
                    <span className="product-carousel__price">
                      {currencySymbol}{product.price.toFixed(priceDecimals)}
                    </span>
                    <div className="product-carousel__actions">
                      <CartQuantityControl
                        product={product}
                        size="md"
                        className="product-carousel__cart"
                        ariaLabel={`${t(addToCartLabel)} — ${t(product.name)}`}
                      >
                        <ShoppingCart size={16} weight="bold" />
                        <span>{t(addToCartLabel)}</span>
                      </CartQuantityControl>
                      <Link
                        to={`/shop/${product.slug}`}
                        className="product-carousel__info"
                        aria-label={`${t('Product details')} — ${t(product.name)}`}
                      >
                        <Info size={17} weight="bold" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {hasControls && showArrows && (
        <>
          <button
            type="button"
            className="product-carousel__arrow product-carousel__arrow--prev"
            onClick={prev}
            aria-label={t(previousButtonLabel)}
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <button
            type="button"
            className="product-carousel__arrow product-carousel__arrow--next"
            onClick={next}
            aria-label={t(nextButtonLabel)}
          >
            <CaretRight size={20} weight="bold" />
          </button>
        </>
      )}

      {hasControls && showDots && (
        <div className="product-carousel__dots" role="group" aria-label={t(slidePickerLabel)}>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`product-carousel__dot${i === index ? ' is-active' : ''}`}
              aria-label={`${t('Go to slide')} ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => goTo(i)}
            >
              <span
                className="product-carousel__dot-fill"
                style={{
                  animationDuration: `${autoplaySpeed}ms`,
                  animationPlayState:
                    autoplayEnabled && i === index && !paused && !dragging ? 'running' : 'paused',
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductCarousel;

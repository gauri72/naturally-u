import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash, ShoppingBag } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext.jsx';
import { getPageBySlug } from '../../api/pages.api';
import PageHeroBlock from '../../blocks/PageHeroBlock/PageHeroBlock.jsx';
import renderInlineLinks from '../../utils/renderInlineLinks.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './CartPage.css';

// Headings, empty-state copy and the shipping note come from the 'cart' CMS
// page (/admin/pages/cart); cart state/actions stay fully functional.
function CartPage() {
  const { t } = useLang();
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [page, setPage] = useState(null);

  useEffect(() => {
    getPageBySlug('cart').then((res) => setPage(res.data)).catch(console.error);
  }, []);

  if (!page) return <p className="page-loading">{t('Loading…')}</p>;

  const hero = page.blocks.find((b) => b.blockType === 'pageHero')?.props || {};
  const content = page.blocks.find((b) => b.blockType === 'cartPageContent')?.props || {};

  if (items.length === 0) {
    return (
      <section className="cart-page cart-page--empty">
        <PageHeroBlock
          variant="cart-empty"
          icon="shopping-bag"
          heading={content.emptyHeading}
          subtext={content.emptySubtext}
          ctaLabel={content.emptyCtaLabel}
          ctaLink="/shop"
        />
      </section>
    );
  }

  return (
    <section className="cart-page">
      <h1>{t(hero.heading)}</h1>
      <div className="cart-page__layout">
        <div className="cart-page__list">
          {items.map((item) => (
            <div className="cart-page__item" key={item.productId}>
              <img src={item.image} alt={item.name} />
              <div className="cart-page__item-info">
                <h4>{t(item.name)}</h4>
                <p className="cart-page__item-price">€{item.price.toFixed(2)}</p>
              </div>
              <div className="cart-page__qty">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} weight="bold" />
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.stock != null && item.quantity >= item.stock}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} weight="bold" />
                </button>
              </div>
              <p className="cart-page__line-total">€{(item.price * item.quantity).toFixed(2)}</p>
              <button
                type="button"
                className="icon-btn icon-btn--danger"
                onClick={() => removeItem(item.productId)}
                aria-label="Remove item"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-page__summary">
          <h3>{t('Order Summary')}</h3>
          <div className="cart-page__summary-row">
            <span>{t('Subtotal')}</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          <p className="cart-page__shipping-note">{renderInlineLinks(t(content.shippingNoteText))}</p>
          <Link to="/checkout" className="btn btn--primary cart-page__checkout-btn">{t('Checkout')}</Link>
        </div>
      </div>
    </section>
  );
}

export default CartPage;

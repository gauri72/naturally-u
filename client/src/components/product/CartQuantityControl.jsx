import { Minus, Plus } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext.jsx';
import { useLang } from '../../i18n/LanguageContext.jsx';
import './CartQuantityControl.css';

// Add-to-cart button that turns into an inline "− qty +" stepper once the
// product is in the cart, so shoppers see and adjust the quantity right on
// the product instead of only via the header cart badge. Stepping below 1
// removes the line and the original button comes back.
//
// `className`/`children`/`ariaLabel` describe the original add button, so
// each caller keeps its own look; `size` picks the matching stepper size
// ('sm' product card, 'md' carousel, 'lg' product page).
function CartQuantityControl({ product, size = 'sm', className, ariaLabel, disabled, children }) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const { t } = useLang();
  const line = items.find((i) => i.productId === product._id);
  const outOfStock = product.stock != null && product.stock <= 0;

  // A disabled cart button looked identical to a working one, so sold-out
  // products seemed to "not add". Say so instead. The product page ('lg')
  // keeps its own full-width "Out of Stock" button.
  if (!line && outOfStock && size !== 'lg') {
    return <span className={`cart-qty-soldout cart-qty-soldout--${size}`}>{t('Sold out')}</span>;
  }

  if (!line) {
    return (
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        onClick={() => addItem(product)}
        disabled={disabled || outOfStock}
      >
        {children}
      </button>
    );
  }

  // Prefer the product's live stock over the snapshot saved on the cart
  // line, which can be stale if the item sold down since it was added.
  const stock = product.stock ?? line.stock;
  const atMax = stock != null && line.quantity >= stock;
  const decrease = () => {
    if (line.quantity <= 1) removeItem(product._id);
    else updateQuantity(product._id, line.quantity - 1);
  };

  return (
    <div className={`cart-qty cart-qty--${size}`} role="group" aria-label={`${t('Quantity in cart')} — ${t(product.name)}`}>
      <button
        type="button"
        className="cart-qty__btn"
        onClick={decrease}
        aria-label={line.quantity <= 1 ? t('Remove from cart') : t('Decrease quantity')}
      >
        <Minus size={size === 'lg' ? 18 : 14} weight="bold" />
      </button>
      <span className="cart-qty__value" aria-live="polite">
        {line.quantity}
        {size === 'lg' && <span className="cart-qty__label"> {t('in cart')}</span>}
      </span>
      <button
        type="button"
        className="cart-qty__btn"
        onClick={() => addItem(product)}
        disabled={atMax}
        aria-label={t('Increase quantity')}
      >
        <Plus size={size === 'lg' ? 18 : 14} weight="bold" />
      </button>
    </div>
  );
}

export default CartQuantityControl;
